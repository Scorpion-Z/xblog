# 超能日志（xblog）

基于 Hugo + PaperMod 构建的个人知识博客，部署在 GitHub Pages。

- 网站：https://scorpion-z.github.io/xblog/
- 关于：https://scorpion-z.github.io/xblog/about/
- 内容：技术、阅读、科普、趣谈网络与专题笔记
- 趣谈网络：https://scorpion-z.github.io/xblog/network-stories/
- 专题叙事：https://scorpion-z.github.io/xblog/stories/

## 写作风格

以“朴素、清楚、具体、有自己的判断”为原则。新增文章和修订旧文参见 [WRITING.md](WRITING.md)。

## 访问与阅读统计

本站通过 [Vercount](https://github.com/EvanNotFound/vercount) 提供基础流量计数，无需给 GitHub Pages 配置服务器。

- 全站页脚展示“总访问”（PV）与“独立访客”（UV）。
- `posts`、`prompts` 和 `network-stories` 的文章详情页，在阅读时间等元信息后展示该页面的阅读次数（Page PV）。
- 集成位置：`layouts/partials/extend_footer.html`；样式：`assets/css/extended/traffic.css`。
- 本地运行 `hugo server` 时不加载计数服务，避免本地预览误计入线上数据。正式构建会加载。
- 统计从启用开始积累，无法自动恢复历史阅读量。PV 含重复访问；UV 是第三方按其规则计算的估计值。
- 数据依赖第三方服务，网络、浏览器插件或隐私设置可能拦截请求，页面中将保留“—”。
- Vercount 的全站数字按域名聚合。若同一 `scorpion-z.github.io` 域名下的其他项目也接入 Vercount，全站数字可能合并；独立域名或单独部署统计后端可实现项目级隔离。
- 该脚本会向 Vercount 发起网络请求。使用前请了解其服务说明和隐私处理方式。

## 专题叙事的实现

专题叙事与普通文章相互独立。RFC 1149 页面使用以下文件：

- `layouts/stories/single.html`：七个叙事场景、章节导航和文字版链接。
- `static/js/story-immersive.js`：桌面端一滚一幕、键盘切换、自由滚动和场景状态。
- `static/js/story-atelier-v4.js`：当前使用的 WebGL2 雕塑，约 8400 个表面采样点；信鸽、纸张、协议层、MTU、Ping、握手与 DTN 七种形态通过同一组粒子连续变形，包含光照、相机视角和转场中断恢复。
- `static/js/story-particles.js`：早期版本保留作设计对照，线上页面已不再引用。
- `assets/css/extended/zzz-story-choreography.css`、`assets/css/extended/zzzz-story-cinema.css` 和 `assets/css/extended/zzzzz-story-atelier.css`：文字与分镜动画、三维场景构图、光影和柔和场景切换。

WebGL2 仅在支持的桌面浏览器中启用。移动端、减少动画偏好的读者和不支持 WebGL2 的环境保留原有 SVG 图解。无论动画是否加载，文字、原文链接和资料来源仍可正常阅读。

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
