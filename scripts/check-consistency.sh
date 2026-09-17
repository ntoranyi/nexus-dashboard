#!/usr/bin/env bash
# Vérifie les invariants documentés dans CLAUDE.md avant chaque commit/PR :
# - index.html et landing.html doivent rester identiques
# - la grille tarifaire (27€/67€/147€) doit être cohérente dans les 4 fichiers HTML
# - le mapping Stripe (montants en centimes) doit correspondre à la même grille
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0

echo "== index.html vs landing.html =="
if ! diff -q index.html landing.html > /dev/null 2>&1; then
  echo "❌ index.html et landing.html ont divergé (voir CLAUDE.md : ils doivent rester identiques)."
  diff index.html landing.html || true
  fail=1
else
  echo "✅ identiques"
fi

echo "== Cohérence des tarifs (27€ / 67€ / 147€) =="
for file in landing.html index.html dashboard.html Onboarding.html; do
  for price in "27€" "67€" "147€"; do
    if ! grep -q -- "$price" "$file"; then
      echo "❌ '$price' introuvable dans $file"
      fail=1
    fi
  done
done
if [ "$fail" -eq 0 ]; then echo "✅ tarifs cohérents dans les 4 fichiers"; fi

echo "== Mapping Stripe webhook (api/stripe-webhook.js) =="
for cents in 2700 6700 14700; do
  if ! grep -q -- "$cents" api/stripe-webhook.js; then
    echo "❌ montant $cents absent de PLAN_BY_AMOUNT dans api/stripe-webhook.js"
    fail=1
  fi
done

exit $fail
