---
title: "RFC 2324：如果咖啡机回答 418，我是一个茶壶"
date: 2026-11-14T15:58:00+08:00
draft: false
categories: ["趣谈网络", "计算机网络"]
tags: ["RFC 2324", "HTCPCP", "HTTP", "418", "HTTP 状态码", "TCP/IP", "RFC 7168"]
summary: "1998 年，有人认真制定了一份用网络煮咖啡的 RFC：BREW 开煮，WHEN 停奶，418 表示我是茶壶。借这杯咖啡，理解 HTTP 请求、状态码与协议扩展。"
description: "从 RFC 2324 的咖啡壶协议讲起，解释 HTTP 请求与响应、方法、首部、状态码、TCP/IP 分层，以及 418 I'm a teapot 的来历。"
showToc: true
TocOpen: true
---

想象一个画面。早上你打开电脑，给办公室的智能咖啡机发送一条网络请求：

~~~http
BREW /pot-1 HTCPCP/1.0
~~~

服务器很快回复：

~~~http
HTCPCP/1.0 418 I'm a teapot
~~~

意思是：**我是一个茶壶。**

许多程序员都见过 HTTP 418，却未必读过它的出处。1998 年 4 月 1 日，Larry Masinter 发表了一份正式编号的互联网技术文档，叫做 **RFC 2324：《Hyper Text Coffee Pot Control Protocol》**，简称 **HTCPCP**。

它的目标很明确：让咖啡壶支持网络控制。开发者可以发送开始、停止、加配料等命令，咖啡壶则按照 HTTP 的请求与响应风格进行处理。

文档的发布日期已经透露了不少信息。可作者的写法又严谨得出奇，连报文方法、MIME 类型、缓存、防火墙和拒绝服务攻击都没有放过。

![RFC 2324：互联网正在认真地煮咖啡](/xblog/images/network-stories/rfc2324-cover.svg)

*图1：联网咖啡壶与著名的 418 状态码。原创插画。*

## 一份写得很认真的愚人节 RFC

RFC 是 Request for Comments 的简称。许多互联网协议通过 RFC 发布，也有讨论架构、历史和实验的 RFC，偶尔还会出现这类带有节日幽默的文档。

获得 RFC 编号，不代表自动成为互联网正式标准。RFC 2324 的类别是 **Informational**，原文明确说明没有定义互联网标准。

作者开篇给出了一段貌似严肃的需求分析：越来越多家庭设备连接到互联网，人们希望在早上起床时，咖啡已经准备好。

这个需求听起来很现代。如今各类智能家电都能通过手机预约操作。只不过在 1998 年，作者已经把“网络控制咖啡壶”包装成了一套专门的应用层协议。

更有意思的是，RFC 2324 还提到了历史上真实存在的联网饮料机和剑桥大学咖啡壶监控项目。荒诞方案背后，有一部分现实技术背景。

## 咖啡机如何加入 TCP/IP 世界？

我们先复习一下 HTTP。

浏览器访问一个页面时，可以发出类似这样的请求：

~~~http
GET /index.html HTTP/1.1
Host: example.com
Accept: text/html
~~~

服务器返回：

~~~http
HTTP/1.1 200 OK
Content-Type: text/html

<html>...</html>
~~~

一条 HTTP 消息包含若干重要组成部分：

| 部分 | 主要作用 | 例子 |
| --- | --- | --- |
| 方法 | 描述希望执行的操作 | GET、POST |
| 目标 | 指定要操作的资源 | /index.html |
| 首部 | 提供附加说明 | Content-Type |
| 消息体 | 携带实际内容 | HTML 或 JSON |
| 状态码 | 表示处理结果 | 200、404、500 |

HTTP 工作在应用层。常见的 HTTP/1.1 通信会使用 TCP 运输字节流，HTTPS 还会增加 TLS；HTTP/3 通常在 UDP 上运行 QUIC。

RFC 2324 采用的设计思路很直接：利用 HTTP 已有的应用层消息形式，再扩展几条适合咖啡壶的命令。

![HTCPCP 在 TCP/IP 分层中的位置](/xblog/images/network-stories/rfc2324-stack.svg)

*图2：HTCPCP 借用 HTTP 风格的应用层消息。要控制真实咖啡壶，还需要具体的设备驱动与安全机制。原创图解。*

从技术上看，咖啡壶接到命令后，必须由设备程序决定如何驱动水泵、电热元件、阀门和传感器。

**HTTP 可以传达“开始煮咖啡”，真正把水加热的仍然是咖啡机。** 协议本身不会凭空变出咖啡豆。

## 新增方法 BREW：可以让服务器开煮了

普通 HTTP 有 GET、POST、PUT、DELETE 等方法。RFC 2324 新增了最符合场景的一条：

**`BREW`，意思是冲泡。**

例如：

~~~http
BREW /pot-1 HTCPCP/1.0
Host: coffee.example
Content-Type: message/coffeepot
Content-Length: 5

start
~~~

上面是一条帮助理解协议的示意请求，表示对第一只咖啡壶执行开始冲泡操作。

![HTCPCP 的请求结构](/xblog/images/network-stories/rfc2324-request.svg)

*图3：请求行、请求首部以及消息体的分工。原创图解。*

这里有几个细节：

- `BREW` 是方法。
- `/pot-1` 是被控制的咖啡壶资源。
- `HTCPCP/1.0` 是文档中的协议版本标识。
- `message/coffeepot` 用于标识咖啡壶命令消息。
- 消息体 `start` 表示开始，`stop` 表示停止。

文档第 2.1.1 节还规定，咖啡壶服务器要把 `BREW` 和 `POST` 视为等效。不过作者又开了个玩笑：用 POST 触发咖啡壶动作的做法已经过时，因此最好使用专门的 BREW。

以后程序员就能理直气壮地告诉同事：“我这个接口不用 POST，我用 BREW。”

### 原文还藏着一个技术小矛盾

细看 RFC 2324 会发现，第 2.1.1 节提到的 Content-Type 是 `application/coffee-pot-command`，第 4 节却写明请求实体类型必须是 `message/coffeepot`。

这两种写法并不一致。上面的示例采用第 4 节的定义。

这在技术学习上很值得留意。实现协议时，单看某个段落可能会遗漏规范内部的不一致。尤其涉及字段类型、长度和编码方式时，应当仔细核对全文和实际互操作行为。

## GET、PROPFIND 和 WHEN：咖啡壶还有其他要求

RFC 2324 借用或增加了几个有趣的方法。

![HTCPCP 的四个方法](/xblog/images/network-stories/rfc2324-methods.svg)

*图4：BREW、GET、PROPFIND 和 WHEN 的作用。原创图解。*

**GET：获取咖啡相关资源。**

普通 HTTP 的 GET 用于取得目标资源的表示。可咖啡壶指向的是一种物理资源。网页可以通过网络返回，热咖啡却没办法直接塞进以太网帧里。

**PROPFIND：查看咖啡属性。**

这是借用 WebDAV 的方法，用于获取资源的属性。假如一杯咖啡也算数据，那么相关的元数据理应有地方可以查询。温度、浓度等可以作为后续系统设计中的想象例子，原文没有逐项定义这些属性。

**WHEN：牛奶够了，停。**

这是整份 RFC 最有生活气息的设计。

别人往你的咖啡里倒牛奶时，通常会等待你说“够了”。作者干脆为此定义了 `WHEN` 方法。

这件小事碰巧触及一个严肃的工程问题：如果设备持续执行动作，那么停止指令的传输延迟、重复发送以及设备侧的安全保护都非常重要。

比如网络卡顿 10 秒，牛奶一直倒个不停。到了这时，问题可能已经超出 HTTP 排障的范畴。

## 通过请求头点单，咖啡还可以加配料

既然可以控制咖啡壶，那么加不加奶、加什么糖浆，似乎也应该交给客户端选择。

RFC 2324 为此设计了 `Accept-Additions` 首部：

~~~http
Accept-Additions: Whole-milk, Vanilla
~~~

它可以表达希望加入全脂牛奶和香草糖浆。

原文还列出了奶油、脱脂奶、巧克力糖浆以及某些酒类配料。

如果咖啡壶无法满足这些条件，可以返回：

~~~http
HTCPCP/1.0 406 Not Acceptable
~~~

这相当于咖啡机说：“你的要求我收到了，但这个配方目前做不了。”

普通 HTTP 中的 Accept 首部一般用来表示客户端可接受的响应媒体类型。这里的 `Accept-Additions` 则是 RFC 2324 特别设计的扩展首部，目的是把内容协商的思想用到实际配料选择上。

作者对无咖啡因咖啡似乎毫无兴趣，原文直接省略了这类选项，还反问了一句：有什么意义？

## 418：一个茶壶拒绝煮咖啡

现在进入全文最出名的部分。

RFC 2324 第 2.3.2 节规定，向茶壶发送煮咖啡的请求时，应当返回 **418 I'm a teapot**。

![咖啡壶协议中的响应状态码](/xblog/images/network-stories/rfc2324-status.svg)

*图5：200、406 和 418 分别表示不同的处理结果。原创图解。*

我们把它与一些常见的 HTTP 状态码放在一起：

| 状态码 | 含义 |
| --- | --- |
| 200 | 请求成功 |
| 400 | 请求存在问题 |
| 404 | 资源不存在 |
| 406 | 服务器无法提供符合要求的表示；在 HTCPCP 中用于配料问题 |
| 418 | RFC 2324 的茶壶笑话 |
| 500 | 服务端内部错误 |
| 503 | 服务暂时不可用 |

乍看之下，418 与其他 4xx 状态码并没有什么区别。数字也很规整，仿佛天生就应该出现在网络抓包里。

真正耐人寻味的，是它后来的命运。

### 418 到今天还是一个玩笑吗？

2022 年发布的正式 HTTP 语义标准 [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-418-unused) 把这个编号列为：

**418 (Unused)**

这表示 418 当前保留、未赋予新的正式 HTTP 业务语义。规范明确指出，RFC 2324 对 HTTP 的滥用方式进行了幽默讽刺，而 418 这个玩笑传播太广，使这个编号不适合再随意分配给其他用途。

因此需要分清：

1. RFC 2324 将 418 描述为茶壶拒绝煮咖啡。
2. RFC 9110 在 HTTP 状态码体系中保留了 418。
3. 418 当前没有成为一个通用、正式的 HTTP 业务错误定义。
4. 网站返回 418，可能是开发者自行设置的幽默提示或拒绝请求策略。

**一个愚人节玩笑，最后在严肃的互联网标准里占了一个号码。**

## 咖啡的 URL，居然还有中文版

我们日常使用的 HTTP URL 大多以 `http://` 或 `https://` 开头。

RFC 2324 还为咖啡定义了独立的 URI 方案：

~~~text
coffee://coffee.example/pot-1
~~~

作者考虑到了国际化，列出多个语言中的“咖啡”名称。中文“咖啡”也有对应的 UTF-8 百分号编码：

~~~text
%E5%92%96%E5%95%A1://coffee.example/pot-1
~~~

![coffee URI 的示意对比](/xblog/images/network-stories/rfc2324-uri.svg)

*图6：URI 方案标识资源的处理方式；RFC 2324 的 coffee 方案属于幽默性设计。原创图解。*

这里要注意，**RFC 写出某个 URI 方案，不代表主流浏览器就自动支持它。** 真正使用一个自定义方案，还需要对应的解析、处理程序和安全约束。

这也解释了为什么在软件开发中，使用现有的 HTTPS URL 与定义一个全新的协议方案，实施成本会有显著差别。

## 安全和运维：咖啡壶也要防 DoS？

RFC 2324 的运维章节也写得很有意思。

作者先从“防火墙”这个词下手。现代电咖啡壶通常没有明火，按字面理解似乎不需要防火墙。但文档接着又提出，既然 HTTP 可以穿过许多网络防火墙，咖啡壶也应当能够利用 80 端口通信。

这个玩笑很适合网络工程师阅读。

在真实环境中，通过 HTTP 传输控制命令，不会自动获得访问权限和安全保障。防火墙、反向代理、API 网关和 WAF 都可能限制未知方法，设备侧也必须实施认证、授权与操作限制。

安全章节还开了一个拒绝咖啡服务的玩笑。假如有人不停地给联网咖啡机下发冲泡命令，机器资源耗尽，其他人就喝不到咖啡了。

换成物联网术语，这涉及：

- 远程设备的访问控制。
- 请求频率限制和资源保护。
- 重复命令的幂等性及异常处理。
- 设备状态新鲜度与缓存更新。
- 网络失联时的本地安全策略。

原文还特别讨论了 NTP 时间同步和监控画面缓存，因为联网设备的状态会实时变化。

显示“水箱已满”的页面如果缓存了几个小时，下一杯咖啡或许只能由用户自己补水。

## 自己动手：本机运行一个会说 418 的咖啡服务器

了解完原理，可以写个小程序体验一下。

下面只用 Python 标准库实现一个**教学用模拟器**。它支持 BREW、POST、WHEN 和 GET，能够返回 200、406、418 等响应。

它不连接任何实体咖啡壶，也没有实现完整 HTCPCP。运行地址限定为本机的 127.0.0.1。

保存为 `coffee_server.py`：

~~~python
from http.server import BaseHTTPRequestHandler, HTTPServer

brewing = False

class CoffeeServer(BaseHTTPRequestHandler):
    def reply(self, code, message):
        data = message.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_BREW(self):
        global brewing

        if self.path == "/teapot":
            return self.reply(418, "I'm a teapot")

        if self.headers.get("Accept-Additions"):
            return self.reply(406, "Additions unavailable")

        length = int(self.headers.get("Content-Length", "0"))
        command = self.rfile.read(length).decode().strip()

        if command == "start":
            brewing = True
            return self.reply(200, "Brewing started")
        if command == "stop":
            brewing = False
            return self.reply(200, "Brewing stopped")

        return self.reply(400, "Use start or stop")

    do_POST = do_BREW

    def do_GET(self):
        self.reply(200, "brewing" if brewing else "idle")

    def do_WHEN(self):
        self.reply(200, "Milk pouring stopped")

HTTPServer(("127.0.0.1", 8000), CoffeeServer).serve_forever()
~~~

启动服务：

~~~bash
python3 coffee_server.py
~~~

另外打开一个终端，执行：

~~~bash
# 开始冲泡
curl -i -X BREW http://127.0.0.1:8000/pot-1 \
  -H 'Content-Type: message/coffeepot' \
  --data 'start'

# 查看状态
curl -i http://127.0.0.1:8000/pot-1

# 要求一只茶壶煮咖啡
curl -i -X BREW http://127.0.0.1:8000/teapot \
  --data 'start'

# 牛奶够了
curl -i -X WHEN http://127.0.0.1:8000/pot-1
~~~

第三条命令会返回类似：

~~~http
HTTP/1.0 418 I'm a Teapot
Content-Type: text/plain; charset=utf-8

I'm a teapot
~~~

由于 Python 标准库的简易 HTTP 服务端默认使用 HTTP/1.0 响应，这里显示 `HTTP/1.0`，与 RFC 2324 的 `HTCPCP/1.0` 标识不同。这只是为了演示自定义方法与状态码。

整个实验传达了一个很实用的知识点：**HTTP 方法可以扩展，服务端可以处理自定义方法名。** 但实际部署时，客户端、代理、网关及安全策略都要支持这些扩展，否则容易发生互操作问题。

## 2014 年的补丁：茶壶终于可以泡茶了

到了 2014 年 4 月 1 日，Ian Nazar 又发布了 [RFC 7168](https://www.rfc-editor.org/rfc/rfc7168.html)，为原有的咖啡壶协议增加泡茶能力。

理由非常充分：原来规定茶壶不能煮咖啡，可茶壶总得有办法煮茶。

新协议引入 `message/teapot` 媒体类型，支持不同种类的茶，比如大吉岭、伯爵茶和薄荷茶，还允许服务器返回可供选择的品种。

文档甚至讨论：糖加得太多，可能导致请求超过传输层报文段允许的大小，引起分片等处理问题，延误冲茶。

这类玩笑依旧充满工程味道。

![HTCPCP 发展时间线](/xblog/images/network-stories/rfc2324-timeline.svg)

*图7：1998 年的咖啡协议，2014 年的茶扩展，2022 年 418 在 HTTP 正式规范中被保留。原创图解。*

RFC 7168 还区分了茶壶不提供咖啡的两种情况：如果只是暂时没有咖啡，可以返回 503；如果它本来就是只能泡茶的茶壶，可以返回 418。

因此，挑选状态码时需要考虑客户端下一步会怎么做。一个状态表示“以后也许能恢复”，另一个可能更适合表达设备能力上的长期限制。

## 这份文档值得认真读的地方

RFC 2324 明显是个玩笑，但它提供了一个很好的学习入口。

通过一只咖啡壶，我们可以把应用层协议中几个基础问题连起来：

- 请求方法如何表达意图。
- URI 怎样标识目标资源。
- 首部与消息体如何分工。
- 状态码怎样影响客户端行为。
- 自定义协议与现有 HTTP 生态怎样相处。
- 设备控制为什么需要额外考虑授权、重试、时延和本地安全机制。

还有一个值得记住的事实：**RFC 2324 原本讽刺了随意扩展 HTTP 的做法，418 却因为流传太广，被后来的 HTTP 规范保留下来。**

前一篇 [RFC 1149：当互联网开始用信鸽送 IP 包](../rfc1149-pigeon-ip/) 介绍了极端的底层传输介质。这一篇则把焦点转向应用层，看看 HTTP 可以被扩展到怎样出人意料的地方。

如果下一次遇到一台回复 418 的服务器，或许可以先别急着重试。

它已经很明确地告诉你了。

**我是一个茶壶。**

## 参考资料

1. [RFC 2324：Hyper Text Coffee Pot Control Protocol](https://www.rfc-editor.org/rfc/rfc2324.html)，Larry Masinter，1998 年 4 月 1 日。
2. [RFC 7168：HTCPCP for Tea Efflux Appliances](https://www.rfc-editor.org/rfc/rfc7168.html)，Ian Nazar，2014 年 4 月 1 日。
3. [RFC 9110：HTTP Semantics，第 15.5.19 节](https://www.rfc-editor.org/rfc/rfc9110.html#name-418-unused)，2022 年 6 月。
4. [MDN：418 I'm a teapot](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/418)。
5. [RFC 2325：Coffee Pot MIB](https://www.rfc-editor.org/rfc/rfc2325.html)，与 RFC 2324 同日发布的另一份趣味技术文档。

*本文所有技术图解均为原创绘制。Python 示例仅供本地教学，未连接真实硬件。*
