#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/switch-theme.sh current
  ./scripts/switch-theme.sh list
  ./scripts/switch-theme.sh blowfish
  ./scripts/switch-theme.sh papermod

Switches hugo.toml to one of the installed theme configs in config/themes/.
USAGE
}

current_theme() {
  awk -F"'" '/^theme = / { print $2; exit }' hugo.toml
}

theme="${1:-}"
case "$theme" in
  current)
    current_theme
    exit 0
    ;;
  list)
    printf 'blowfish\npapermod\n'
    exit 0
    ;;
  blowfish)
    config="config/themes/blowfish.toml"
    submodule="themes/blowfish"
    ;;
  papermod)
    config="config/themes/papermod.toml"
    submodule="themes/PaperMod"
    ;;
  *)
    usage
    exit 2
    ;;
esac

if [[ ! -f "$config" ]]; then
  echo "Missing theme config: $config" >&2
  exit 1
fi

if [[ ! -f "$submodule/theme.toml" ]]; then
  git submodule update --init --recursive "$submodule"
fi
cp "$config" hugo.toml
hugo --gc --minify

printf 'Switched Hugo theme to %s.\n' "$(current_theme)"
