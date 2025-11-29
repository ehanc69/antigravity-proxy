#!/usr/bin/env bash
# -------------------------------------------------
# test_proxy_ci.sh – CI test for antigravity‑proxy
# Assumes the proxy is ALREADY running on localhost:8080
# -------------------------------------------------
set -euo pipefail

echo "🔍 Checking if proxy is reachable at http://localhost:8080..."

# Perform a simple request through the proxy
# (We use a public endpoint that does not require auth)
# Note: In CI, we might need to be careful about external network access,
# but httpbin is standard.
response=$(curl -s -o /dev/null -w "%{http_code}" -x http://localhost:8080 https://httpbin.org/get)

echo "Proxy returned HTTP status: $response"

if [[ "$response" == "200" ]]; then
  echo "✅ Test passed – proxy is reachable and forwards traffic"
  exit 0
else
  echo "❌ Test failed – unexpected HTTP status: $response"
  exit 1
fi
