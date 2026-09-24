#!/usr/bin/env bash
# One-command deploy for the diqualia-chatbot Worker.
#
#   npm run deploy:all              # chatbot only
#   npm run deploy:all -- --site    # chatbot, then the website (diqualia-web)
#
# Safe to re-run: every step checks what already exists.
#   1. Cloudflare login check
#   2. Vectorize index `diqualia-kb` + metadata indexes (created only if missing)
#   3. Remote D1 migrations (only unapplied ones run)
#   4. Typecheck + tests
#   5. wrangler deploy (creates the Worker on first run)
#   6. Optional: website deploy (it binds to this Worker, so it goes second)
set -euo pipefail

cd "$(dirname "$0")/.."

INDEX="diqualia-kb"
DIMENSIONS=1024
METRIC="cosine"
METADATA_INDEXES=("visibility" "status")
DATABASE="diqualia-db"

DEPLOY_SITE=false
for arg in "$@"; do
  case "$arg" in
    --site) DEPLOY_SITE=true ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

step() { printf '\n\033[1m▶ %s\033[0m\n' "$1"; }

step "Checking Cloudflare login"
if ! npx wrangler whoami >/dev/null 2>&1; then
  echo "Not logged in. Run: npx wrangler login" >&2
  exit 1
fi

step "Vectorize index: $INDEX"
if npx wrangler vectorize get "$INDEX" --json >/dev/null 2>&1; then
  echo "exists"
else
  npx wrangler vectorize create "$INDEX" --dimensions="$DIMENSIONS" --metric="$METRIC"
fi

step "Vectorize metadata indexes"
existing="$(npx wrangler vectorize list-metadata-index "$INDEX" --json 2>/dev/null || echo '[]')"
for prop in "${METADATA_INDEXES[@]}"; do
  if grep -q "\"propertyName\": *\"$prop\"" <<<"$existing"; then
    echo "$prop: exists"
  else
    npx wrangler vectorize create-metadata-index "$INDEX" --property-name="$prop" --type=string
  fi
done

step "D1 migrations (remote)"
npx wrangler d1 migrations apply "$DATABASE" --remote

step "Typecheck + tests"
npm run typecheck
npm test

step "Deploying diqualia-chatbot"
npx wrangler deploy

if [ "$DEPLOY_SITE" = true ]; then
  step "Deploying website (diqualia-web)"
  (cd ../.. && npm run deploy)
fi

step "Done"
echo "Watch the first sync (within ~1 minute):  npx wrangler tail diqualia-chatbot"
echo "Vector count:                             npx wrangler vectorize info $INDEX"
