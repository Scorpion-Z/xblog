# xblog
日常收集

## 切换主题

当前仓库内置两个 Hugo 主题配置：

```bash
./scripts/switch-theme.sh list
./scripts/switch-theme.sh current
./scripts/switch-theme.sh blowfish
./scripts/switch-theme.sh papermod
```

脚本会把对应配置写入 `hugo.toml`，初始化对应主题 submodule，并执行 `hugo --gc --minify` 验证构建。
