---
title: "worse_query：一次 iOS 应用沙盒逃逸是怎样发生的"
date: 2026-11-11T10:30:00+08:00
draft: false
categories: ["技术", "科普"]
tags: ["iOS", "worse_query", "应用沙盒", "系统安全", "漏洞分析", "App Group"]
summary: "worse_query 利用 App Group 容器路径解析与沙盒授权之间的缺陷，使应用有机会访问其他应用的数据。本文结合公开源码说明原理、影响范围和仍待确认的问题。"
showToc: true
TocOpen: true
---

2026年11月，安全研究人员公开了一个名为 `worse_query` 的 iOS 沙盒逃逸概念验证程序。项目说明将影响范围列为 iOS 26.0 至 26.7.2，以及 iOS 27.2。随后出现的文件管理器和系统配置工具，又把这项技术用于实际的文件访问和设备设置修改。

对普通用户来说，最需要关心的问题是：一个已经安装在手机上的应用，能否越过自己的数据目录，查看其他应用保存的文件？

`worse_query` 的公开实现表明，在特定系统版本与授权条件下，这件事有可能发生。理解其严重程度，需要先弄清楚 iOS 平时如何隔离应用数据，以及这个漏洞究竟突破了哪一层限制。

## 应用为什么不能随意读取彼此的数据

iOS 为第三方应用设置了沙盒（App Sandbox）。每个应用拥有自己的数据容器，通常包括 `Documents`、`Library`、`tmp` 等目录。即使另一个应用知道容器的绝对路径，也无法仅凭路径名获得访问权限。

例如，应用 A 的数据可能位于：

```text
/var/mobile/Containers/Data/Application/<UUID>/
    Documents/
    Library/
    tmp/
```

这里的 `<UUID>` 由系统分配。应用 A 能正常读写自己的容器。应用 B 想访问相同目录，则需要符合系统的权限规则。

苹果还提供 App Group 机制，允许持有相同授权的相关应用或扩展共享一个容器。典型场景是主应用和桌面小组件交换数据。App Group 本身属于正常的系统功能，它的共享范围由授权限定。

另一项机制是 Sandbox Extension。某些操作需要让进程临时访问通常不属于自己沙盒的路径，系统可以提供相应的访问令牌。进程使用令牌后，得到令牌限定的访问能力。

这几个机制分别解决不同的问题：

- 应用沙盒限定默认访问范围。
- App Group 为具备相应授权的应用提供共享数据空间。
- Sandbox Extension 在特定条件下扩展进程可访问的路径。

`worse_query` 涉及后两者的组合。

## worse_query 如何越过容器边界

公开源码位于 [forcequitOS/worse_query](https://github.com/forcequitOS/worse_query)。项目作者将其定义为沙盒逃逸 PoC，并明确说明它不能用于越狱。

它的主要思路是：应用先获得自己有权访问的 App Group 容器，再利用符号链接改变容器中某个路径实际指向的位置，最后请求系统容器管理服务为该路径提供访问授权。

符号链接（Symbolic Link）可以理解为文件系统中的路径指针。访问链接所在路径时，操作系统可能继续解析它所指向的目标。假设一个应用对 `A/Library/Caches` 有合法访问权限，但该路径被替换为指向目录 B 的符号链接，路径的表面位置与最终落点就发生了分离。

从 [核心源码 worse_query.m](https://github.com/forcequitOS/worse_query/blob/main/worse_query/worse_query.m) 可以归纳出以下过程：

1. 应用取得自己拥有授权的 App Group 容器路径。
2. 将容器中的 `Library/Caches` 替换为指向目标目录的符号链接。
3. 通过 `libsystem_containermanager.dylib` 中的私有接口构造容器查询。
4. 查询指定 App Group 容器类别与 `Library/Caches` 部分，请求由 `containermanagerd` 处理。
5. 如果服务接受查询并返回 Sandbox Extension Token，进程消费令牌后，就可能取得目标路径的访问能力。
6. 程序恢复自身缓存目录，并保留取得的访问句柄，供后续文件操作使用。

源码中，`container_query_set_class(query, 7)` 表示 App Group 类别，`container_query_operation_set_part` 对应的值 `3` 表示 `Library/Caches`。这些细节说明利用点集中在容器查询和路径授权流程。

问题在于，系统授权服务如果依据已经解析到容器外部的路径生成令牌，就可能把原本属于 App Group 的合法授权扩展到其他目录。

从安全设计看，这属于路径解析结果与授权边界未得到充分约束的问题。它也体现了“混淆代理”（Confused Deputy）风险：权限较高的系统服务在处理请求时，可能替权限较低的进程完成超出预期的授权。

需要说明，公开源码并没有证明攻击者获得了内核控制权，也没有显示其伪造系统代码签名。这里利用的是授权逻辑和文件路径处理方式。

## 找到目标目录也是一个问题

应用容器的路径通常包含随机标识符。即使已经有了越界访问的可能，攻击程序仍需要定位其他应用的数据目录。

项目另一个文件 [pathleak.m](https://github.com/forcequitOS/worse_query/blob/main/worse_query/pathleak.m) 处理的就是路径发现问题。

它通过 `fsgetpath()`，尝试从文件系统的 inode 编号反向获得路径，再筛选符合目标目录前缀的结果。inode 可以理解为文件系统识别文件或目录的一种内部编号。

这样的枚举方法能够减少直接猜测随机 UUID 的工作量，但仍然可能消耗较长时间，且依赖文件系统和系统版本的实际行为。

路径发现与沙盒逃逸是两个独立环节。前者帮助定位文件，后者决定有没有权限访问它们。

## 能访问什么，仍有哪些限制

作者的项目说明列出了若干可访问的目录范围，包括：

| 目录类别 | 示例 |
| --- | --- |
| 第三方应用容器 | `/var/mobile/Containers/Data/Application/*` |
| 应用扩展容器 | `/var/mobile/Containers/Data/PluginKitPlugin/*` |
| 内部服务容器 | `/var/mobile/Containers/Data/InternalDaemon/*` |
| App Group 共享容器 | `/var/mobile/Containers/Shared/AppGroup/*` |
| 部分系统容器 | iOS 27 上的部分 `System` 与 `SystemGroup` 路径 |

这里的“可访问”必须结合实际权限理解。突破应用沙盒，并不自动消除文件的所有权、Unix 权限位和其他保护机制。有些目录可能只能列出名称，不能打开其内部文件；不同系统版本的表现也存在差异。

数据本身是否另行加密，同样决定实际后果。例如，某个应用如果在普通文件中明文保存会话信息、私钥或敏感文档，越权读取就可能带来严重风险。若关键秘密保存在 Keychain，或私钥由 Secure Enclave 保护，则还有独立的安全边界。公开的 `worse_query` PoC 没有证明能够直接导出 Secure Enclave 中不可导出的密钥，也不能据此认定任何账户密码都可以被读取。

另一项限制是攻击前提。公开利用程序需要在设备上执行应用代码，并使用具备授权的 App Group。现有证据不能支持“用户打开一个普通网页就会自动触发该利用”的说法。App Store 应用能否以同样方式利用这一缺陷，也不能仅凭 PoC 判断。

## 从概念验证到实际工具

`worse_query` 的影响可以从两个衍生项目看得更清楚。

[WQ Files](https://github.com/kolbicz/WQFiles) 是一个利用该技术访问应用数据的文件管理工具。项目介绍了应用文件查看、备份、缓存清理和部分文件编辑能力。开发者同时说明，一些由 `root` 所有的系统目录受到文件权限限制，实际操作能力有边界。

[GestaltX](https://github.com/huamidev/GestaltX) 则面向 MobileGestalt 配置修改。MobileGestalt 涉及设备能力、区域特征和部分功能标志。项目说明其 iOS 27.x 设备端访问依赖 `worse_query`，且需要正确配置 App Group 授权。更改配置标志后，功能是否真正生效，还受到硬件、系统和苹果服务等条件影响。

这些工具说明，同一个底层漏洞可以被用于不同用途。开源项目采用漏洞技术，不能单凭这一点认定项目包含恶意程序。实际安装风险还取决于源码、构建产物、签名、分发渠道和应用运行时行为。

## 哪些版本受到影响，苹果是否已经修复

版本问题需要把不同来源分开看。

| 来源 | 截至 2026 年 11 月 11 日的公开信息 |
| --- | --- |
| `worse_query` 原始项目 | 声明适用于 iOS 26.0 至 26.7.2，以及 iOS 27.2 |
| [Erosion](https://github.com/jailbreakdotparty/Erosion) 衍生项目 | 声称支持部分 iOS 26 版本、iOS 27.0 至 27.2.1，以及 iOS 27.3 beta 1 |
| 苹果 iOS 27.2.1 安全公告 | 2026 年 11 月 9 日发布，未明确列出 `worse_query` 的修复项目 |

Erosion 的“支持”属于该项目开发者的兼容性声明。它可以作为参考，不能替代苹果的安全公告或独立的逐版本验证。

苹果已经发布 [iOS 27.2.1 的安全更新说明](https://support.apple.com/en-us/149715)，其中列出了多项安全修复，但没有明确将某个修复条目对应到 `worse_query`。公告里关于其他组件的“应用可能访问敏感数据”问题，也不能在缺乏证据时直接等同于这一漏洞。

截至本文核查时间，尚未找到苹果公开确认的 `worse_query` 专属 CVE 编号和完整修复范围。因此，不能简单断言 iOS 27.2.1 已彻底解决问题，也不能把尚未测试的所有后续版本一概认定为易受攻击。

至于真实攻击事件，公开的技术演示和安全警告只能证明存在可被利用的风险，无法据此统计实际受害人数或认定已经发生大规模数据盗窃。

## 用户需要做什么

对普通 iPhone 用户，优先考虑以下措施：

- 安装苹果提供的最新正式安全更新。即使某次更新尚未确认修复该漏洞，也可能修复其他已公开的问题。
- 谨慎安装来源不明的 IPA、企业签名应用和重新打包的系统工具。安装来源与开发者可信度非常重要。
- 对需要访问系统配置或跨应用数据的工具，了解其用途、授权要求和发布渠道。使用前备份重要数据，尽量在非主要设备上测试。
- 如果怀疑安装过恶意程序，及时检查重要账户的登录活动和会话状态。卸载程序无法撤回已经被复制的数据。
- 对存放钱包私钥、助记词或其他高价值秘密的设备，避免把未经审查的系统修改工具作为日常软件使用。

`worse_query` 值得关注的地方，是一个拥有合法 App Group 权限的应用，可能借助系统容器管理服务获得超出自身容器范围的文件访问能力。

这提醒我们，操作系统的安全性不仅依赖沙盒规则是否存在，也依赖每一次路径解析、权限检查和授权令牌签发是否保持一致。一个中间环节的边界检查出现缺口，就足以削弱应用间的数据隔离。

## 参考资料

1. forcequitOS，[worse_query 原始项目与说明](https://github.com/forcequitOS/worse_query)
2. forcequitOS，[worse_query.m 核心源码](https://github.com/forcequitOS/worse_query/blob/main/worse_query/worse_query.m)
3. forcequitOS，[pathleak.m 路径发现源码](https://github.com/forcequitOS/worse_query/blob/main/worse_query/pathleak.m)
4. forcequitOS，[bad_query 早期项目](https://github.com/forcequitOS/bad_query)
5. Apple，[About the security content of iOS 27.2.1 and iPadOS 27.2.1](https://support.apple.com/en-us/149715)
6. kolbicz，[WQ Files](https://github.com/kolbicz/WQFiles)
7. huamidev，[GestaltX](https://github.com/huamidev/GestaltX)
8. jailbreakdotparty，[Erosion](https://github.com/jailbreakdotparty/Erosion)

*说明：本文依据 2026 年 11 月 11 日前公开的项目源码、项目文档和苹果安全公告整理。涉及版本支持与修复状态的信息可能随更新而变化。*
