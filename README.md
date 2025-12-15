# Antigravity Proxy

> **STATUS: Work In Progress - NOT WORKING**

A MITM proxy experiment to intercept Google Antigravity IDE API calls and use your own Gemini API token.

## Current Status

**This project does not work with the current version of Antigravity.**

### Why It Doesn't Work

1. **Antigravity doesn't use the public Gemini endpoint** (`generativelanguage.googleapis.com`)
   
2. **It uses an internal Google endpoint:**
   ```
   https://daily-cloudcode-pa.sandbox.googleapis.com/v1internal:streamGenerateContent?alt=sse
   ```

3. **The connection flow is more complex** - there's a handshake followed by a socket-based/TLS flow, so a basic proxy setup won't reliably intercept the traffic.

### What Was Attempted

- MITM proxy with mitmproxy
- HTTP_PROXY/HTTPS_PROXY environment variables
- DNS-level interception via /etc/hosts
- Binary patching of the language server

None of these approaches successfully intercept and modify the API requests.

## Repository Contents

This repo contains the experimental code and documentation from the investigation:

- `mitmproxy-addon.py` - The proxy addon (works for standard googleapis.com, not Antigravity's internal endpoint)
- `docs/` - Documentation from the investigation
- `scripts/` - Helper scripts

## Contributing

PRs welcome if someone wants to investigate further. Key areas to explore:

1. How does Antigravity establish the connection to `daily-cloudcode-pa.sandbox.googleapis.com`?
2. Is there certificate pinning involved?
3. Can the binary be patched to use a different endpoint?

## Related Issues

- [Issue #1: Working or WIP?](https://github.com/elad12390/antigravity-proxy/issues/1)

## License

MIT License - see [LICENSE](LICENSE)

## Disclaimer

This project is for educational and research purposes only. Ensure compliance with:
- [Google's Terms of Service](https://policies.google.com/terms)
- [Gemini API Terms](https://ai.google.dev/gemini-api/terms)
