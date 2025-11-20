# Visual Guide

Visual diagrams and flowcharts for understanding the Antigravity Proxy.

## Project Structure

```
antigravity-proxy/
│
├── 📄 Documentation (Read These First!)
│   ├── README.md              ← Start here
│   ├── QUICKSTART.md          ← 5-minute setup
│   ├── SETUP.md               ← Detailed install
│   ├── PROJECT_SUMMARY.md     ← What was built
│   └── VISUAL_GUIDE.md        ← This file
│
├── 📁 docs/                   Detailed Documentation
│   ├── API_ENDPOINTS.md       ← Gemini API reference
│   ├── ARCHITECTURE.md        ← How it works
│   ├── SECURITY.md            ← Security info
│   └── TROUBLESHOOTING.md     ← Fix problems
│
├── 💻 src/                    Source Code
│   ├── server.js              ← Main proxy server
│   ├── interceptor.js         ← API key replacement
│   ├── logger.js              ← Logging system
│   ├── config.js              ← Configuration
│   └── test.js                ← Test script
│
├── 🛠️ scripts/                Utility Scripts
│   └── launch-antigravity.sh  ← Launch with proxy
│
├── ⚙️ Configuration
│   ├── .env.example           ← Template
│   ├── .env                   ← Your config (create this!)
│   ├── .gitignore             ← Git rules
│   └── package.json           ← Dependencies
│
└── 📝 Legal
    └── LICENSE                ← MIT License
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER                            │
│                                                             │
│  ┌──────────────────┐                                      │
│  │  Antigravity IDE │                                      │
│  │                  │                                      │
│  │  - Code editor   │                                      │
│  │  - AI assistant  │                                      │
│  │  - Chat          │                                      │
│  └────────┬─────────┘                                      │
│           │                                                 │
│           │ 1. Send API Request                            │
│           │    Headers:                                     │
│           │    x-goog-api-key: THEIR_KEY                   │
│           ↓                                                 │
│  ┌──────────────────┐                                      │
│  │   Proxy Server   │                                      │
│  │  (localhost:8080)│                                      │
│  │                  │                                      │
│  │  ┌────────────┐  │                                      │
│  │  │Interceptor │  │ 2. Detect Gemini API request        │
│  │  │            │  │ 3. Extract original key             │
│  │  │            │  │ 4. Replace with YOUR_KEY            │
│  │  └────────────┘  │                                      │
│  │                  │                                      │
│  │  ┌────────────┐  │                                      │
│  │  │   Logger   │  │ 5. Log the replacement              │
│  │  └────────────┘  │                                      │
│  └────────┬─────────┘                                      │
│           │                                                 │
│           │ 6. Forward Modified Request                    │
│           │    Headers:                                     │
│           │    x-goog-api-key: YOUR_KEY                    │
└───────────┼─────────────────────────────────────────────────┘
            ↓
            ↓ INTERNET
            ↓
┌───────────┼─────────────────────────────────────────────────┐
│           ↓                    GOOGLE CLOUD                 │
│  ┌──────────────────┐                                      │
│  │  Gemini API      │                                      │
│  │                  │                                      │
│  │  - Processes req │                                      │
│  │  - Generates AI  │                                      │
│  │  - Bills YOUR_KEY│                                      │
│  └────────┬─────────┘                                      │
│           │                                                 │
│           │ 7. Return Response                             │
└───────────┼─────────────────────────────────────────────────┘
            ↓
            ↓ INTERNET
            ↓
┌───────────┼─────────────────────────────────────────────────┐
│           ↓                 YOUR COMPUTER                   │
│  ┌──────────────────┐                                      │
│  │   Proxy Server   │                                      │
│  │                  │ 8. Log response                      │
│  └────────┬─────────┘                                      │
│           │                                                 │
│           │ 9. Forward Response                            │
│           ↓                                                 │
│  ┌──────────────────┐                                      │
│  │  Antigravity IDE │                                      │
│  │                  │ 10. Display result                   │
│  │  "Here's your    │                                      │
│  │   generated code" │                                      │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

## Setup Flow

```
┌─────────────────────────────────────────────────────┐
│ STEP 1: Install Node.js                            │
│                                                     │
│ $ brew install node                                 │
│                                                     │
│ ✓ Node.js and npm installed                        │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ STEP 2: Install Dependencies                       │
│                                                     │
│ $ cd ~/dev/personal/antigravity-proxy               │
│ $ npm install                                       │
│                                                     │
│ ✓ http-proxy, winston, chalk, dotenv installed     │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ STEP 3: Get Gemini API Key                        │
│                                                     │
│ 1. Visit https://aistudio.google.com/apikey        │
│ 2. Sign in with Google account                     │
│ 3. Click "Create API Key"                          │
│ 4. Copy the key                                     │
│                                                     │
│ ✓ API Key: AIzaSyABC123...                        │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ STEP 4: Configure .env File                       │
│                                                     │
│ $ cp .env.example .env                              │
│ $ nano .env                                         │
│                                                     │
│ GEMINI_API_KEY=AIzaSyABC123...                     │
│ PROXY_PORT=8080                                     │
│ LOG_LEVEL=info                                      │
│                                                     │
│ ✓ Configuration saved                              │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ STEP 5: Start Proxy Server                        │
│                                                     │
│ $ npm start                                         │
│                                                     │
│ 🚀 Antigravity Proxy Server                       │
│ 📍 Proxy listening on: http://localhost:8080      │
│ 🔑 Using API Key: AIzaSyABC123***                 │
│ ✨ Waiting for requests...                         │
│                                                     │
│ ✓ Proxy running                                    │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ STEP 6: Launch Antigravity                        │
│                                                     │
│ [Open new terminal]                                 │
│ $ cd ~/dev/personal/antigravity-proxy               │
│ $ npm run launch                                    │
│                                                     │
│ ✓ Antigravity launches with proxy settings         │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ STEP 7: Verify It Works                           │
│                                                     │
│ In Antigravity: "Write hello world"                │
│                                                     │
│ In proxy terminal:                                  │
│ 📥 INCOMING REQUEST                                │
│ 🔄 REPLACING API KEY                               │
│ ✅ RESPONSE Status: 200                            │
│                                                     │
│ ✓ Everything working!                              │
└─────────────────────────────────────────────────────┘
```

## Terminal Layout

Recommended terminal setup:

```
┌────────────────────────────────────────────────────────┐
│                    TERMINAL 1                          │
│                   Proxy Server                         │
│                                                        │
│  $ cd ~/dev/personal/antigravity-proxy                 │
│  $ npm start                                           │
│                                                        │
│  🚀 Antigravity Proxy Server                          │
│  📍 Proxy listening on: http://localhost:8080         │
│                                                        │
│  📥 INCOMING REQUEST                                  │
│    method: 'POST'                                      │
│    url: 'https://generativelanguage.googleapis...'    │
│                                                        │
│  🔄 REPLACING API KEY                                 │
│    oldKey: 'AIzaSyABC***'                            │
│    newKey: 'AIzaSyDEF***'                            │
│                                                        │
│  ✅ RESPONSE                                          │
│    statusCode: 200                                     │
│    duration: '1234ms'                                  │
│                                                        │
│  [Keep this running]                                   │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                    TERMINAL 2                          │
│                 Commands / Testing                     │
│                                                        │
│  $ cd ~/dev/personal/antigravity-proxy                 │
│  $ npm test         # Test the proxy                   │
│  $ npm run launch   # Launch Antigravity               │
│  $ tail -f logs/combined.log  # View logs              │
│                                                        │
│  [Use for commands]                                    │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                  ANTIGRAVITY IDE                       │
│                  (Separate Window)                     │
│                                                        │
│  [Code Editor]                                         │
│  [AI Chat]                                             │
│  [Tools]                                               │
│                                                        │
│  [Launched with proxy settings]                        │
└────────────────────────────────────────────────────────┘
```

## Request Lifecycle

```
TIME  →

t=0ms
┌─────────────┐
│ User types  │ "Generate a function to sort an array"
│ in          │
│ Antigravity │
└──────┬──────┘
       │
       │ Request created
       ↓
t=10ms
┌─────────────┐
│ Antigravity │ POST /v1beta/models/gemini-1.5-flash:generateContent
│ sends       │ Header: x-goog-api-key: THEIR_KEY_ABC123
│ HTTP request│
└──────┬──────┘
       │
       │ Via HTTP_PROXY=localhost:8080
       ↓
t=15ms
┌─────────────┐
│ Proxy       │ 📥 INCOMING REQUEST
│ receives    │    Detected Gemini API call
│ request     │    Original key: THEIR_KEY_ABC123
└──────┬──────┘
       │
       │ Interceptor.intercept()
       ↓
t=20ms
┌─────────────┐
│ Interceptor │ 🔄 REPLACING API KEY
│ replaces    │    Old: THEIR_KEY_ABC***
│ API key     │    New: YOUR_KEY_DEF***
└──────┬──────┘
       │
       │ Modified request
       ↓
t=25ms
┌─────────────┐
│ Proxy       │ → Forward to generativelanguage.googleapis.com
│ forwards    │    Header: x-goog-api-key: YOUR_KEY_DEF456
└──────┬──────┘
       │
       │ HTTPS connection
       ↓
t=50ms
┌─────────────┐
│ Google      │ Receives request
│ Gemini API  │ Authenticates with YOUR_KEY_DEF456
└──────┬──────┘
       │
       │ Processing...
       ↓
t=1200ms
┌─────────────┐
│ Google      │ ← Generates response
│ Gemini API  │    200 OK
└──────┬──────┘    { "candidates": [...] }
       │
       │ Response sent back
       ↓
t=1220ms
┌─────────────┐
│ Proxy       │ ✅ RESPONSE
│ receives    │    Status: 200
│ response    │    Duration: 1195ms
└──────┬──────┘
       │
       │ Forward unchanged
       ↓
t=1225ms
┌─────────────┐
│ Antigravity │ Receives response
│ receives    │ Displays generated code
└─────────────┘
```

## File Relationships

```
Configuration Flow:
.env.example  →  [copy]  →  .env  →  [loaded by]  →  src/config.js
                                                            │
                                                            ↓
                                    [used by]  →  src/server.js
                                                  src/interceptor.js
                                                  src/logger.js

Code Flow:
src/server.js  ──[creates]──→  HTTP Server
      │                             │
      │                             ↓
      │                       [listens on port 8080]
      │                             │
      ├─[uses]→  src/interceptor.js │
      │          (replaces API key) │
      │                             │
      ├─[uses]→  src/logger.js      │
      │          (logs requests)    │
      │                             │
      └─[uses]→  src/config.js      │
                 (configuration)    │
                                    ↓
                              [handles requests]

Launch Flow:
scripts/launch-antigravity.sh
      │
      ├─[reads]→  .env
      │
      └─[sets]→   HTTP_PROXY=localhost:8080
                  HTTPS_PROXY=localhost:8080
                  NODE_TLS_REJECT_UNAUTHORIZED=0
                       │
                       ↓
                 [launches]→  Antigravity.app
```

## Color Legend

In terminal output:

```
🚀 Cyan      → Startup messages
📍 Green     → Configuration info
🔑 Yellow    → API key (masked)
🎯 Blue      → Target URL
📊 Magenta   → Log level

📥 Cyan      → Incoming request
🔄 Green     → API key replacement
📤 Magenta   → Response
✅ Green     → Success (2xx)
❌ Red       → Error (4xx, 5xx)
⚠️ Yellow    → Warning
```

## npm Script Relationships

```
package.json scripts:
│
├── "start"   → node src/server.js
│                    │
│                    └─ Runs proxy server
│
├── "dev"     → nodemon src/server.js
│                    │
│                    └─ Auto-reload on file changes
│
├── "test"    → node src/test.js
│                    │
│                    └─ Sends test request through proxy
│
└── "launch"  → ./scripts/launch-antigravity.sh
                     │
                     ├─ Sets environment variables
                     └─ Launches Antigravity.app
```

## Getting Started Flowchart

```
START
  │
  ↓
Is Node.js installed? ───NO──→ Install Node.js ──┐
  │ YES                                           │
  ↓                                               │
Did you clone/download project? ───NO──→ Get code ┤
  │ YES                                           │
  ↓                                               │
Run: npm install ←──────────────────────────────┘
  │
  ↓
Copy .env.example to .env
  │
  ↓
Edit .env and add GEMINI_API_KEY
  │
  ↓
Run: npm start
  │
  ↓
Is proxy running? ───NO──→ Check logs ───→ Fix error ─┐
  │ YES                                                │
  ↓                                                    │
Run: npm test ←─────────────────────────────────────┘
  │
  ↓
Did test pass? ───NO──→ Check troubleshooting guide ─┐
  │ YES                                               │
  ↓                                                   │
Run: npm run launch ←────────────────────────────────┘
  │
  ↓
Is Antigravity running?
  │ YES
  ↓
Use AI features
  │
  ↓
Check proxy logs for intercepted requests
  │
  ↓
SUCCESS! 🎉
```

---

**Visual Guide Complete!**

For more details, see the other documentation files.
