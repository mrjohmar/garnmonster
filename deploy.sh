#!/usr/bin/env bash
# Deployar Garnmönster-webbappen till Vercel (produktion).
#
# Projektet är länkat i repo-roten (.vercel/project.json, projekt "web").
# Autentisering: kör antingen `vercel login` en gång, eller sätt VERCEL_TOKEN.
#
#   ./deploy.sh
#   VERCEL_TOKEN=xxxx ./deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "==> Bygger webbappen…"
npm run build:web

TOKEN_ARGS=()
if [ -n "${VERCEL_TOKEN:-}" ]; then
  TOKEN_ARGS=(--token "$VERCEL_TOKEN")
fi

echo "==> Deployar till Vercel (produktion)…"
npx vercel deploy --prod --yes "${TOKEN_ARGS[@]}"

echo "==> Klart."
