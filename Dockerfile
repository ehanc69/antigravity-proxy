# Dockerfile for antigravity-proxy (CI‑friendly)
# ---------------------------------------------------
# Base image: slim Python with system tools
FROM python:3.11-slim

# Install system dependencies (ca‑certificates for HTTPS)
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the entire repository into the image
COPY . /app

# Create a virtual environment and install Python deps (including mitmproxy)
RUN python -m venv /app/.venv && \
    . /app/.venv/bin/activate && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir mitmproxy

# Expose the default proxy port (can be overridden at runtime)
EXPOSE 8080

# Default command runs mitmproxy with the addon
CMD ["/app/.venv/bin/mitmproxy", "-s", "mitmproxy-addon.py", "--listen-port", "8080"]
