# 储能原理实验室

本专题位于博客的 `/energy-lab/`。目前只维护一套正式课程，其他页面均属于配套学习资源。

| 页面 | 功能 | 维护文件 |
| --- | --- | --- |
| `index.html` | 正式课程，8模块、24节，包含学习进度、知识测验和授课提示 | `curriculum.js`、`figures.js`、`studio.js`、`studio.css` |
| `labs.html` | 11种虚拟实验的统一入口 | `labs.js`、`labhub.js`、`labhub.css` |
| `handbook.html` | 16个知识专题、24项公式、51个术语，支持全文筛选 | `handbook.js`、`handbook.css` |
| `workbook.html` | 8道计算题及推导 | `workbook.js`、`workbook.css` |
| `course.html` | 兼容历史链接，自动跳转新入口 | 静态跳转页，不再维护原课程 |

原先21章内容已提取为知识手册中的16个技术专题，旧版互动部分由实验中心和现有课堂练习替代。原文件及历史版本可以从GitHub提交记录恢复，无须重新提供平行的“原版课程”。

## 内容维护原则

1. 新增教学内容应优先更新 `curriculum.js`，继续采用问题、原理、图解、公式、案例和测验的教学结构。
2. 新实验更新 `labs.js`，并在 `labhub.js` 中配置入口和对应课程；避免另外建立一套独立实验网站。
3. 专业词汇和扩展资料统一维护在 `handbook.html`，主课程直接链接知识手册，不再维护第二份不同定义的弹窗词典。
4. `course.html` 保持向后兼容，已被收藏的旧章节锚点应尽量正确跳转。
5. 课程中的模拟数据都应标明教学假设、计量边界及其与真实测试的差异。

## 发布检查

GitHub Actions在Hugo构建前执行：

```sh
node scripts/check-energy-lab.mjs
```

此检查核对课程结构、24道测验、11个实验入口、知识手册的专题及术语数量、导航与内部文件引用，以及主要计算关系。构建通过后由GitHub Pages发布。
