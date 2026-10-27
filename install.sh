#!/usr/bin/env bash
# OpenRubberDocks - Linux / macOS / VPS Launcher for Interactive Installer & Updater
# License: GNU Affero General Public License v3.0 (AGPL-3.0-only)
#
# Usage:
#   ./install.sh            -> Interactive Setup / Update / CORS Wizard
#   ./install.sh --update   -> One-command automated update from 'main' (preserves .env & colors.ts)
#   ./install.sh update     -> Alias for --update
#   ./install.sh --cors     -> Fast interactive CORS / allowed domains configurator
#   ./install.sh cors       -> Alias for --cors
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is required but not installed or not in PATH."
    echo "Please install Node.js (v20+ recommended) before running this script."
    exit 1
fi

node "$SCRIPT_DIR/install.mjs" "$@"
