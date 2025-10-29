#!/usr/bin/env bash
set -euo pipefail

BUCKET="s3://admin.centrebienetre.ca"            # ex: s3://admin.centrebienetre.ca
CF_DISTRIBUTION_ID="E10C67I8K34Q3E"           # ex: E2ABCDEF12345

echo "🧱 Build Vite…"
npm run build

echo "🧹 Nettoyage S3 (optionnel, prudent) : suppression des fichiers orphelins"
# Si tu veux garder d'anciens assets, commente --delete
aws s3 sync ./dist "$BUCKET" --delete --dryrun
read -p "Confirmer sync destructive? (y/N) " yn
[[ "${yn:-N}" == "y" || "${yn:-N}" == "Y" ]] || { echo "Annulé"; exit 1; }

echo "📦 Upload des assets fingerprintés (long cache, immutable)…"
aws s3 sync ./dist "$BUCKET" \
  --exclude "index.html" --exclude "404.html" \
  --cache-control "public, max-age=31536000, immutable"

echo "📄 Upload des HTML (no-cache)…"
aws s3 cp ./dist/index.html "$BUCKET/index.html" \
  --cache-control "no-store, max-age=0, must-revalidate"
if [ -f ./dist/404.html ]; then
  aws s3 cp ./dist/404.html "$BUCKET/404.html" \
    --cache-control "no-store, max-age=0, must-revalidate"
fi

# echo "🧊 Invalidation CloudFront…"
# aws cloudfront create-invalidation --distribution-id "$CF_DISTRIBUTION_ID" --paths "/*"

echo "✅ Deploy terminé."