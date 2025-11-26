"""
MITM Proxy addon for intercepting Google Antigravity API calls
and replacing the API key with your own.

Usage:
    mitmproxy -s mitmproxy-addon.py

    Then launch Antigravity with:
    HTTP_PROXY=http://localhost:8080 \
    HTTPS_PROXY=http://localhost:8080 \
    /Applications/Antigravity.app/Contents/MacOS/Antigravity
"""

import os
import re
import socketserver
import threading
from http import server

from dotenv import load_dotenv
from google.cloud import secretmanager
from mitmproxy import http  # type: ignore

# Load environment variables
load_dotenv()

# Your Gemini API key
# Attempt to load Gemini API key from GCP Secret Manager if GCP_PROJECT_ID is set
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
if GCP_PROJECT_ID:
    def get_secret(secret_name: str) -> str:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{GCP_PROJECT_ID}/secrets/{secret_name}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    YOUR_API_KEY = get_secret("gemini-api-key")
else:
    YOUR_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE")

# Statistics
stats = {
    "requests_intercepted": 0,
    "keys_replaced": 0,
}

# Prometheus metrics server
class MetricsHandler(server.BaseHTTPRequestHandler):
    def do_get(self):
        if self.path == "/metrics":
            metric_output = (
                f"antigravity_requests_intercepted {stats['requests_intercepted']}\\n"
                f"antigravity_keys_replaced {stats['keys_replaced']}\\n"
            )
            self.send_response(200)  # OK
            self.send_header("Content-Type", "text/plain; version=0.4")
            self.end_headers()
            self.wfile.write(metric_output.encode())
        else:
            self.send_response(404)
            self.end_headers()
    # Compatibility alias for BaseHTTPRequestHandler expectations
    do_GET = do_get

def start_metrics_server(port=9090):
    httpd = socketserver.TCPServer(("0.0.0.0", port), MetricsHandler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    print(f"📊 Prometheus metrics server listening on http://0.0.0.0:{port}/metrics")



class AntigravityInterceptor:
    def __init__(self):
        print("\n" + "=" * 60)
        print("🚀 Antigravity Proxy - MITM Interceptor")
        print("=" * 60)
        print(f"🔑 Using API Key: {YOUR_API_KEY[:15]}***")
        print("🎯 Target: generativelanguage.googleapis.com")
        print("=" * 60 + "\n")
        # Start metrics server when interceptor is instantiated
        start_metrics_server()


    def request(self, flow: http.HTTPFlow) -> None:
        """Intercept and modify requests"""

        # Only intercept Gemini API requests
        if "generativelanguage.googleapis.com" not in flow.request.pretty_host:
            return

        stats["requests_intercepted"] += 1

        print(f"\n📥 INCOMING REQUEST #{stats['requests_intercepted']}")
        print(f"   Method: {flow.request.method}")
        print(f"   URL: {flow.request.url}")

        # Extract original key
        original_key = None

        # Replace API key in header
        if "x-goog-api-key" in flow.request.headers:
            original_key = flow.request.headers["x-goog-api-key"]
            flow.request.headers["x-goog-api-key"] = YOUR_API_KEY
            stats["keys_replaced"] += 1
            print("   🔄 Replaced key in header")
            print(f"      Old: {original_key[:15]}***")
            print(f"      New: {YOUR_API_KEY[:15]}***")

        # Replace API key in query parameter
        if "key=" in flow.request.url:
            match = re.search(r"key=([^&]+)", flow.request.url)
            if match:
                if not original_key:
                    original_key = match.group(1)
                flow.request.url = re.sub(
                    r"key=[^&]+", f"key={YOUR_API_KEY}", flow.request.url
                )
                stats["keys_replaced"] += 1
                print("   🔄 Replaced key in URL")
                print(f"      Old: {original_key[:15]}***")
                print(f"      New: {YOUR_API_KEY[:15]}***")

        # Log request body preview (first 200 chars)
        if flow.request.content:
            try:
                body_preview = flow.request.content.decode("utf-8")[:200]
                print(f"   📄 Body preview: {body_preview}...")
            except Exception as e:
                print(f"   📄 Body: <binary data> ({e})")

    def response(self, flow: http.HTTPFlow) -> None:
        """Log responses"""

        # Only log Gemini API responses
        if "generativelanguage.googleapis.com" not in flow.request.pretty_host:
            return

        status_icon = "✅" if flow.response.status_code == 200 else "❌"
        print(f"\n{status_icon} RESPONSE")
        print(f"   Status: {flow.response.status_code}")

        if flow.response.status_code != 200:
            print("   ⚠️  Non-200 response!")
            try:
                error_preview = flow.response.content.decode("utf-8")[:300]
                print(f"   Error: {error_preview}")
            except Exception as e:
                print(f"   Error parsing response body: {e}")

        # Print statistics
        print(
            f"\n📊 Stats: {stats['requests_intercepted']} requests, {stats['keys_replaced']} keys replaced"
        )
        print("=" * 60)


# Create addon instance
addons = [AntigravityInterceptor()]
