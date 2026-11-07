# 超能日志（xblog）

基于 Hugo + PaperMod 构建的个人知识博客，部署在 GitHub Pages。

- 网站：https://scorpion-z.github.io/xblog/
- 关于：https://scorpion-z.github.io/xblog/about/
- 内容：技术、阅读、科普与专题笔记

## 写作风格

以“朴素、清楚、具体、有自己的判断”为原则。新增文章和修订旧文参见 [WRITING.md](WRITING.md)。

## 访问与阅读统计

本站通过 [Vercount](https://github.com/EvanNotFound/vercount) 提供基础流量计数，无需给 GitHub Pages 配置服务器。

- 全站页脚展示“总访问”（PV）与“独立访客”（UV）。
- `posts` 和 `prompts` 的文章详情页，在阅读时间等元信息后展示该页面的阅读次数（Page PV）。
- 集成位置：`layouts/partials/extend_footer.html`；样式：`assets/css/extended/traffic.css`。
- 本地运行 `hugo server` 时不加载计数服务，避免本地预览误计入线上数据。正式构建会加载。
- 统计从启用开始积累，无法自动恢复历史阅读量。PV 含重复访问；UV 是第三方按其规则计算的估计值。
- 数据依赖第三方服务，网络、浏览器插件或隐私设置可能拦截请求，页面中将保留“—”。
- Vercount 的全站数字按域名聚合。若同一 `scorpion-z.github.io` 域名下的其他项目也接入 Vercount，全站数字可能合并；独立域名或单独部署统计后端可实现项目级隔离。
- 该脚本会向 Vercount 发起网络请求。使用前请了解其服务说明和隐私处理方式。

## 本地构建

```bash
git submodule update --init --recursive
hugo server
hugo --gc --minify
```

## 切换主题

当前仓库内置两个 Hugo 主题配置：

```bash
./scripts/switch-theme.sh list
./scripts/switch-theme.sh current
./scripts/switch-theme.sh blowfish
./scripts/switch-theme.sh papermod
```

切换脚本会更新 `hugo.toml`、初始化主题 submodule，并执行构建验证。
