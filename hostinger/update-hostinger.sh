#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGE="$ROOT/hostinger/public_html"
DIST="$ROOT/hostinger"

cd "$PACKAGE"
rm -f "$DIST/maiaballoons-hostinger-flat.zip"
zip -qr "$DIST/maiaballoons-hostinger-flat.zip" .

printf 'Pacote atualizado: %s\n' "$DIST/maiaballoons-hostinger-flat.zip"
printf 'Extraia o conteudo diretamente em public_html, sem criar public_html/public_html.\n'
