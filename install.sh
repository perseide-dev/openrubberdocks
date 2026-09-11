#!/usr/bin/env bash
# OpenRubberDocks - Linux & VPS Launcher for Interactive Installer
set -e

# Ensure node is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is required but not installed or not in PATH."
    echo "Please install Node.js (v18+) before running this installer."
    exit 1
fi

node install.mjs "$@"
