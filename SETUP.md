# Setup Guide

Complete setup guide for Antigravity Proxy on macOS.

## Prerequisites

- **macOS** 12.0 or later
- **Node.js** 18.0 or later
- **npm** (comes with Node.js)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))

## Installation Steps

### 1. Check Node.js Installation

```bash
node --version  # Should be 18.0 or higher
npm --version
```

If not installed, install via:
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org
```

### 2. Clone/Navigate to Project

```bash
cd ~/dev/personal/antigravity-proxy
```

### 3. Install Dependencies

```bash
npm install
```

This will install:
- `http-proxy` - HTTP/HTTPS proxy server
- `dotenv` - Environment variable management
- `winston` - Logging framework
- `chalk` - Colored console output
- `nodemon` - Auto-reload during development

### 4. Configure Environment

```bash
# Copy example configuration
cp .env.example .env

# Edit configuration
nano .env  # or use your preferred editor
```

Set your Gemini API key:
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**Get your API key:**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the key and paste it in `.env`

### 5. Verify Installation

```bash
# Check that config loads correctly
node -e "import('./src/config.js').then(c => console.log('✓ Config loaded'))"
```

## First Run

### 1. Start the Proxy Server

```bash
npm start
```

You should see:
```
🚀 Antigravity Proxy Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Proxy listening on: http://localhost:8080
🔑 Using API Key: AIzaSyABC123***
🎯 Target: https://generativelanguage.googleapis.com
📊 Log Level: info
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Waiting for requests from Antigravity...
```

### 2. Test the Proxy (Optional)

In a **new terminal**:
```bash
cd ~/dev/personal/antigravity-proxy
npm test
```

This sends a test request through the proxy to verify it's working.

### 3. Launch Antigravity

In a **new terminal**:
```bash
cd ~/dev/personal/antigravity-proxy
npm run launch
```

Or use the script directly:
```bash
./scripts/launch-antigravity.sh
```

## Verifying It Works

1. **Check Proxy Logs**: You should see requests in the proxy terminal
2. **Test in Antigravity**: Ask the AI assistant to do something
3. **Verify API Key**: Look for "🔄 REPLACING API KEY" in logs

Example log output:
```
📥 INCOMING REQUEST
  method: 'POST'
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
  originalKey: 'AIzaSyABC123***'

🔄 REPLACING API KEY
  oldKey: 'AIzaSyABC123***'
  newKey: 'AIzaSyDEF456***'

✅ RESPONSE
  statusCode: 200
  duration: '1234ms'
  success: true
```

## Directory Structure After Setup

```
antigravity-proxy/
├── node_modules/           # Installed dependencies
├── logs/                   # Log files (created on first run)
│   ├── combined.log       # All logs
│   └── error.log          # Error logs only
├── src/                   # Source code
├── scripts/               # Utility scripts
├── .env                   # Your configuration (not in git)
├── .env.example          # Template
└── package.json          # Project configuration
```

## Configuration Options

Edit `.env` to customize:

### GEMINI_API_KEY (Required)
Your Google Gemini API key
```bash
GEMINI_API_KEY=AIzaSyABC123...
```

### PROXY_PORT (Optional, default: 8080)
Port for the proxy server
```bash
PROXY_PORT=8080
```

### LOG_LEVEL (Optional, default: info)
Logging verbosity: `debug`, `info`, `warn`, `error`
```bash
LOG_LEVEL=info
```

### ANTIGRAVITY_PATH (Optional)
Path to Antigravity executable
```bash
ANTIGRAVITY_PATH=/Applications/Antigravity.app/Contents/MacOS/Antigravity
```

### TARGET_API_URL (Optional)
Google Gemini API base URL (shouldn't need to change)
```bash
TARGET_API_URL=https://generativelanguage.googleapis.com
```

## Development Mode

For development with auto-reload:
```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when you modify source files.

## Troubleshooting

### "Configuration Error: GEMINI_API_KEY is not configured"
- Make sure you created `.env` file (copy from `.env.example`)
- Set `GEMINI_API_KEY` to your actual API key (not "your_api_key_here")

### "Antigravity not found"
- Verify Antigravity is installed
- Check path with: `ls -la /Applications/Antigravity.app/Contents/MacOS/Antigravity`
- Set correct path in `.env`: `ANTIGRAVITY_PATH=/path/to/antigravity`

### "EADDRINUSE: address already in use"
- Port 8080 is already in use
- Change `PROXY_PORT` in `.env` to a different port (e.g., 8081)
- Or stop the process using port 8080

### Proxy not intercepting requests
- Verify proxy is running (`npm start`)
- Check environment variables are set when launching Antigravity
- Review logs for errors

### Certificate/SSL errors
- The proxy uses `NODE_TLS_REJECT_UNAUTHORIZED=0` to bypass SSL verification
- This is normal for local development but should not be used in production

## Next Steps

See [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for more help with common issues.
