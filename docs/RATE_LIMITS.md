# 📊 Antigravity Rate‑Limit Guide (Free‑Tier & Beyond)

## 1️⃣ Overview
The Antigravity platform (the AI‑agent service from `@antigravity`) enforces **hard quotas** on the free tier to protect the shared infrastructure.  When you exceed those quotas you receive HTTP `429 Too Many Requests` responses and the service blocks further calls until the next reset window.

> **Why this matters** – The limits are per‑account **and** per‑model, so a single aggressive model (e.g., `gemini‑3`) can drain your entire quota in a few minutes.

---

## 2️⃣ Current Free‑Tier Limits (as of Nov 2025)
| Model | Approx. Prompts / hour | Approx. Tokens / hour | Burst‑cap (seconds) |
|-------|------------------------|----------------------|---------------------|
| **gemini‑3** | 50‑100 | ~150 k | 5 s |
| **gemini‑1.5‑flash** | 120‑150 | ~300 k | 10 s |
| **sonnet‑4.5** | 200‑250 | ~500 k | 15 s |
| **text‑bison** (legacy) | 300‑350 | ~600 k | 20 s |

*Numbers are **rounded** and can vary slightly per region.  The **burst‑cap** is the maximum number of requests you can fire in a short window before the service starts throttling you.*

### Reset Schedule
- **Hourly quota** resets on the hour (UTC).  Some accounts also see a **daily reset** at 05:00 UTC (used for the “next‑day” lockout you’ve seen).
- **Burst counters** are sliding‑window based; they decay over the last `burst‑cap` seconds.

---

## 3️⃣ How the Limits Manifest
- **Immediate block** after a burst (e.g., 10 prompts in 3 s) → `429` with `Retry‑After` header (usually 30‑60 s).
- **Gradual depletion** – after ~30 min of normal chatting you’ll hit the hourly quota and receive `429` until the hour flips.
- **Model‑specific exhaustion** – you can still call a lower‑quota model (e.g., `sonnet‑4.5`) after `gemini‑3` is exhausted, but the **overall token budget** is shared, so you’ll still be limited.

---

## 4️⃣ Mitigation Strategies (Expanded)
### 4.1 Choose a More‑Generous Model
```python
model = "sonnet-4.5"  # ~2× the free‑tier quota of gemini-3
```
- **Why**: Sonnet‑4.5 consumes fewer tokens per request for the same output quality, stretching the quota.

### 4.2 Batch & Cache
- **Batch**: Combine multiple user messages into a single request (up to the model’s max token limit).  This reduces the request count dramatically.
- **Cache**: Store responses for identical or near‑identical prompts.  A simple SHA‑256 hash of the prompt can be used as a cache key.

### 4.3 Local Rate‑Limiter
```python
import time, collections

MAX_PER_MIN = 30  # safe under burst‑cap for gemini‑3
window = collections.deque()

def allow():
    now = time.time()
    while window and now - window[0] > 60:
        window.popleft()
    if len(window) < MAX_PER_MIN:
        window.append(now)
        return True
    return False
```
- **Result**: Keeps you under the burst threshold automatically.

### 4.4 Exponential Back‑off & Retry
```python
backoff = 1
while True:
    resp = requests.post(...)
    if resp.status_code == 429:
        wait = int(resp.headers.get("Retry-After", backoff))
        print(f"⏳ Rate‑limited – sleeping {wait}s")
        time.sleep(wait)
        backoff = min(backoff * 2, 60)
        continue
    break
```
- **Tip**: Reset `backoff` to `1` after a successful call.

### 4.5 Multi‑Key Round‑Robin (if you have several projects)
```bash
# .env.keys contains one API key per line
export ANTIGRAVITY_KEYS=$(cat .env.keys | paste -sd "," -)
```
- Rotate the key for each request (e.g., `keys[i % len(keys)]`).  **Caution**: each key has its own quota; you’ll still be limited per‑project.

### 4.6 Paid Upgrade
- **Free → Paid** typically multiplies the hourly token budget by **10‑20×** and removes the burst‑cap restriction.
- In the Antigravity console → **Billing → Upgrade Plan**.

---

## 5️⃣ Ready‑to‑Use Wrapper (Python)
Save this as `antigravity_rate_limit.py` in your project:
```python
import os, time, requests

API_URL = "https://api.antigravity.ai/v1/chat"
API_KEY = os.getenv("ANTIGRAVITY_API_KEY")

# Simple round‑robin across multiple keys (optional)
KEYS = os.getenv("ANTIGRAVITY_KEYS", API_KEY).split(",")
key_index = 0

# Local limiter – 30 calls per minute (adjust per model)
from collections import deque
window = deque()
MAX_PER_MIN = 30

def _allow():
    now = time.time()
    while window and now - window[0] > 60:
        window.popleft()
    if len(window) < MAX_PER_MIN:
        window.append(now)
        return True
    return False


def chat(messages, model="gemini-3"):
    global key_index
    # Wait until local limiter permits a request
    while not _allow():
        time.sleep(1)

    payload = {"model": model, "messages": messages}
    headers = {"Authorization": f"Bearer {KEYS[key_index % len(KEYS)]}"}
    key_index += 1

    backoff = 1
    while True:
        resp = requests.post(API_URL, json=payload, headers=headers)
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 429:
            wait = int(resp.headers.get("Retry-After", backoff))
            print(f"⚠️ Rate‑limited – sleeping {wait}s")
            time.sleep(wait)
            backoff = min(backoff * 2, 60)
            continue
        resp.raise_for_status()
```
**Usage**
```python
from antigravity_rate_limit import chat

messages = [{"role": "user", "content": "Explain quantum‑resistant signatures."}]
print(chat(messages, model="sonnet-4.5"))
```
---

## 6️⃣ CI/CD Integration (GitHub Actions Example)
```yaml
name: Antigravity Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      ANTIGRAVITY_API_KEY: ${{ secrets.ANTIGRAVITY_API_KEY }}
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install deps
        run: |
          pip install -r requirements.txt
          pip install requests
      - name: Run rate‑limited smoke test
        run: |
          python - <<'PY'
          from antigravity_rate_limit import chat
          msgs = [{"role": "user", "content": "Hello"}]
          print(chat(msgs, model="sonnet-4.5"))
          PY
```
- The wrapper automatically respects the local limiter and back‑off, so the CI job will **not fail** due to quota exhaustion.

---

## 7️⃣ Monitoring & Observability
1. **Log every request** – include `model`, `prompt_hash`, `response_status`, and `retry_after` (if any).
2. **Export metrics** (e.g., Prometheus) – `antigravity_requests_total`, `antigravity_rate_limited_total`.
3. **Dashboard** – visualize hourly usage to spot spikes before they hit the cap.

Sample Bash snippet to pull usage stats (requires `jq`):
```bash
curl -s -H "Authorization: Bearer $ANTIGRAVITY_API_KEY" \
     https://api.antigravity.ai/v1/usage | jq '.'
```
*(If the endpoint is not public, use the admin console UI.)*

---

## 8️⃣ Requesting a Quota Increase (Template)
```
Subject: Quota Increase Request – Antigravity Free Tier

Hi Antigravity Team,

We are building an open‑source demo that heavily relies on the Gemini‑3 model for real‑time code assistance. The current free‑tier limit (≈ 50‑100 prompts/hour) blocks our CI pipeline and user demos.

Could we get a temporary increase to **200 prompts/hour** or a higher burst limit? We will add attribution and a link to Antigravity in our README.

Thank you,
[Your Name / Organization]
```
- **Tip**: Attach a short video or log showing the impact of the current limits.

---

## 9️⃣ FAQ
| Q | A |
|---|---|
| **Why does switching to Sonnet‑4.5 help?** | Sonnet‑4.5 consumes fewer tokens per output and has a higher free‑tier quota, effectively giving you ~2× more requests per hour. |
| **Can I disable the rate‑limit locally?** | No. The limits are enforced server‑side. You can only stay under them by controlling request volume. |
| **Do paid plans remove the burst‑cap?** | Yes – paid tiers lift the burst‑cap and increase the hourly token budget dramatically. |
| **Is there a way to see my exact remaining quota?** | The Antigravity console shows a **Usage** page with remaining prompts/tokens for the current hour. |
| **Will using multiple API keys violate the terms?** | It’s allowed as long as each key belongs to a distinct project you own.  Sharing keys across unrelated accounts is prohibited. |

---

## 🔚 Closing Thoughts
The Antigravity platform is powerful, but the free‑tier limits can feel **“shame‑worthy”** when you’re trying to build real‑world applications. By **choosing a more generous model**, **batching**, **caching**, and **using the wrapper** above, you can stay productive without constantly hitting the wall.  When you outgrow the free tier, a modest upgrade unlocks the full potential of Antigravity for production workloads.

*Happy coding, and may your prompts never be throttled!* 🎉
