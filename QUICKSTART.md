# Quick Start Guide

Get up and running with Antigravity Proxy in 5 minutes.

## Prerequisites

- macOS
- Node.js 18+ ([Install](https://nodejs.org))
- Google Gemini API Key ([Get one](https://aistudio.google.com/apikey))

## 5-Minute Setup

### 1. Install Dependencies (1 min)

```bash
cd ~/dev/personal/antigravity-proxy
npm install
```

### 2. Configure API Key (1 min)

```bash
# Copy example config
cp .env.example .env

# Edit and add your API key
nano .env
```

Replace `your_api_key_here` with your actual Gemini API key:
```bash
GEMINI_API_KEY=AIzaSyABC123...
```

Save and exit (Ctrl+X, then Y, then Enter).

### 3. Start Proxy (1 min)

```bash
npm start
```

You should see:
```
🚀 Antigravity Proxy Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Proxy listening on: http://localhost:8080
🔑 Using API Key: AIzaSyABC123***
✨ Waiting for requests from Antigravity...
```

### 4. Launch Antigravity (1 min)

Open a **new terminal** and run:

```bash
cd ~/dev/personal/antigravity-proxy
npm run launch
```

Or manually:
```bash
./scripts/launch-antigravity.sh
```

### 5. Test It (1 min)

In Antigravity, ask the AI assistant to do something:
```
"Write a function to calculate fibonacci numbers"
```

Check your proxy terminal - you should see:
```
📥 INCOMING REQUEST
🔄 REPLACING API KEY
✅ RESPONSE Status: 200
```

## That's It!

You're now using your own API key with Antigravity.

## Next Steps

- [Full Setup Guide](./SETUP.md) - Detailed configuration
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues
- [API Documentation](./docs/API_ENDPOINTS.md) - Endpoint details
- [Architecture](./docs/ARCHITECTURE.md) - How it works

## Common Commands

```bash
# Start proxy
npm start

# Start with auto-reload (for development)
npm run dev

# Test the proxy
npm test

# Launch Antigravity with proxy
npm run launch

# View logs
tail -f logs/combined.log
```

## Stopping

Press `Ctrl+C` in the proxy terminal to stop the server.

## Troubleshooting Quick Fixes

### "API key not configured"
```bash
# Make sure you edited .env, not .env.example
cat .env | grep GEMINI_API_KEY
```

### "Port already in use"
```bash
# Kill process on port 8080
kill -9 $(lsof -ti:8080)
```

### "Antigravity not found"
```bash
# Check if installed
ls -la /Applications/Antigravity.app

# If different location, set in .env
echo 'ANTIGRAVITY_PATH=/your/path/to/Antigravity' >> .env
```

### Proxy not intercepting
```bash
# Make sure you launched with the script
./scripts/launch-antigravity.sh

# Don't launch Antigravity directly from Applications folder
```

## Pro Tips

1. **Two terminals**: Keep proxy running in one terminal, use another for commands
2. **Watch logs**: Open third terminal with `tail -f logs/combined.log`
3. **Debug mode**: Set `LOG_LEVEL=debug` in `.env` for verbose output
4. **Test first**: Run `npm test` before using with Antigravity

## Getting Help

- **Logs**: Check `logs/error.log` for errors
- **Docs**: Read [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- **Config**: Verify `.env` settings
- **Test**: Run `npm test` to isolate issues

## What's Happening?

1. **Proxy server** runs on localhost:8080
2. **Antigravity** is configured to use this proxy
3. **Requests** to Google's API are intercepted
4. **API key** is replaced with yours
5. **Responses** are returned to Antigravity

Simple as that!
