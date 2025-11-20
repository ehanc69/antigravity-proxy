# Antigravity Proxy - Corrected README

## 🔴 IMPORTANT: Current Status

After analyzing the actual behavior and the error logs from Antigravity, I discovered that the Node.js implementation **does not fully work** for HTTPS content inspection.

### What I Built (Node.js Version)

✅ **What Works:**
- HTTP proxy server
- HTTPS CONNECT tunneling
- Multi-domain proxying
- Request logging
- Configuration management

❌ **What Doesn't Work:**
- **Inspecting HTTPS content** (API keys, headers, body)
- **Replacing API keys in encrypted traffic**
- **Actually modifying Gemini API requests**

### Why It Doesn't Work

When Antigravity makes HTTPS requests:

```
1. Antigravity → CONNECT to generativelanguage.googleapis.com:443
2. Proxy → Establishes TCP tunnel
3. Antigravity ↔ Google → TLS handshake (encrypted)
4. All traffic flows through tunnel ENCRYPTED
                 ↑
           Proxy can't see inside!
```

The proxy only sees the tunnel setup, not the actual encrypted traffic flowing through it.

## ✅ Working Solution: mitmproxy

I've created a working solution using `mitmproxy` (the industry standard for API interception).

### Setup (15 minutes)

```bash
# 1. Install mitmproxy
brew install mitmproxy

# 2. Install Python dependency
pip3 install python-dotenv

# 3. Generate and install certificate
mitmproxy  # Press 'q' to quit
open ~/.mitmproxy/mitmproxy-ca-cert.pem
# In Keychain: Trust → "Always Trust"

# 4. Configure API key
cd ~/dev/personal/antigravity-proxy
cp .env.example .env
# Edit .env and add GEMINI_API_KEY

# 5. Start proxy
mitmproxy -s mitmproxy-addon.py --listen-port 8080

# 6. Launch Antigravity (new terminal)
HTTP_PROXY=http://localhost:8080 \
HTTPS_PROXY=http://localhost:8080 \
/Applications/Antigravity.app/Contents/MacOS/Antigravity
```

**See [MITMPROXY_SETUP.md](./MITMPROXY_SETUP.md) for detailed instructions.**

## 📁 Project Files

### Working Files (Use These)
- `mitmproxy-addon.py` - **Working Python addon for mitmproxy**
- `MITMPROXY_SETUP.md` - **Complete setup guide**
- `.env.example` - Configuration template
- `scripts/launch-antigravity.sh` - Launch script

### Reference/Learning Files (Don't Use for Actual Proxying)
- `src/` - Node.js proxy (educational, doesn't work for HTTPS inspection)
- `docs/` - Architecture documentation
- `package.json` - Node.js dependencies

## 🎯 Quick Start (Working Solution)

```bash
# Install
brew install mitmproxy
pip3 install python-dotenv

# Setup certificate
mitmproxy # then quit
open ~/.mitmproxy/mitmproxy-ca-cert.pem
# Keychain: Trust as "Always Trust"

# Configure
cp .env.example .env
# Edit .env: GEMINI_API_KEY=your_key

# Run
mitmproxy -s mitmproxy-addon.py --listen-port 8080

# Launch Antigravity (new terminal)
HTTP_PROXY=http://localhost:8080 HTTPS_PROXY=http://localhost:8080 /Applications/Antigravity.app/Contents/MacOS/Antigravity
```

## 📚 Documentation

- **[MITMPROXY_SETUP.md](./MITMPROXY_SETUP.md)** - Complete working solution ⭐
- [IMPORTANT_NOTES.md](./IMPORTANT_NOTES.md) - Why Node.js doesn't work
- [docs/VSCODE_SETUP.md](./docs/VSCODE_SETUP.md) - VS Code configuration

## ❓ Why Build Both?

1. **Node.js version** - Good for understanding proxy concepts and HTTP mechanics
2. **mitmproxy** - Actually works for HTTPS interception

The Node.js implementation is educational and demonstrates:
- HTTP proxy architecture
- Request/response handling
- Logging systems
- Configuration management

But for **actually intercepting Antigravity's API calls**, use mitmproxy.

## 🔧 Technical Comparison

| Aspect | Node.js Proxy | mitmproxy |
|--------|--------------|-----------|
| HTTP Requests | ✅ Works | ✅ Works |
| HTTPS CONNECT | ✅ Works | ✅ Works |
| HTTPS Content Inspection | ❌ **No** | ✅ **Yes** |
| API Key Replacement | ❌ **No** | ✅ **Yes** |
| Certificate Management | ❌ Manual | ✅ Automatic |
| Setup Complexity | Simple | Moderate |
| **Actually Works?** | ❌ **No** | ✅ **Yes** |

## 💡 What I Learned

This project taught me:
1. Simple HTTP proxies can't inspect HTTPS content
2. HTTPS CONNECT creates encrypted tunnels the proxy can't see inside
3. True MITM requires certificate generation and installation
4. mitmproxy is the standard tool for a reason
5. Sometimes you need to use the right tool instead of reinventing it

## 🎓 Learning Value

The Node.js implementation is still valuable for:
- Understanding how proxies work
- Learning HTTP/HTTPS protocols
- Seeing CONNECT tunneling in action
- Code organization and logging patterns
- Configuration management

But for production use: **Use mitmproxy**.

## 🚀 Next Steps

1. Read [MITMPROXY_SETUP.md](./MITMPROXY_SETUP.md)
2. Install mitmproxy and certificate
3. Run `mitmproxy -s mitmproxy-addon.py`
4. Launch Antigravity with proxy settings
5. Verify API key replacement in logs

## 🤝 Contributing

This is a personal research project. The working solution (mitmproxy) is complete and functional.

## 📄 License

MIT License - See LICENSE file

## ⚠️ Disclaimer

This tool is for educational purposes and personal development only. Ensure compliance with:
- Google's Terms of Service
- Gemini API usage policies
- Your organization's security policies

---

**TL;DR:** Use the mitmproxy solution (see MITMPROXY_SETUP.md). The Node.js proxy is educational but doesn't actually work for HTTPS content inspection.
