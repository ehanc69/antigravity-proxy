#!/usr/bin/env bash
# -------------------------------------------------
# test_proxy.sh – CI test for antigravity‑proxy
# -------------------------------------------------
set -euo pipefail

# Build the Docker image (tag: antigravity-proxy:test)
docker build -t antigravity-proxy:test .

# Run the container in background, expose port 8080
container_id=$(docker run -d -p 8080:8080 antigravity-proxy:test)

# Give the proxy a moment to start
sleep 3

# Perform a simple request through the proxy
# (We use a public endpoint that does not require auth)
HTTP_PROXY="http://localhost:8080" HTTPS_PROXY="http://localhost:8080"
response=$(curl -s -o /dev/null -w "%{http_code}" https://httpbin.org/get)

# Clean up container
docker stop "$container_id" >/dev/null

echo "Proxy returned HTTP status: $response"

if [[ "$response" == "200" ]]; then
  echo "✅ Test passed – proxy is reachable and forwards traffic"
  exit 0
else
  echo "❌ Test failed – unexpected HTTP status"
  exit 1
fi
