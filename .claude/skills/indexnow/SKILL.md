---
name: indexnow
description: "Auto-submit pages to IndexNow when created or edited. Instantly notifies Bing, Yandex, Naver, Seznam, and Yep — no waiting for crawlers."
version: 1.0.0
---

# IndexNow — Instant Search Engine Notification

> Edit a page, search engines know within seconds.

## How It Works

When you create or edit an HTML file, the `indexnow-submit.sh` hook fires automatically via PostToolUse. It calls the IndexNow API to notify all participating search engines that the page has changed.

**Search engines notified:** Bing, Yandex, Naver, Seznam, Yep
**Endpoint:** `POST https://api.indexnow.org/indexnow`
**Key file:** `/68e691d21e304db593e4aaac3b92e9e4.txt` (site root)

## Auto-Fire Behavior

The hook fires on **every Edit or Write** to `*.html` files. It:
1. Detects the file path
2. Maps it to the full URL (`https://cruisinginthewake.com/...`)
3. POSTs to IndexNow in the background
4. Never blocks Claude Code — runs silently

**Skips:** `offline.html`, `search.html` (non-content pages)

## Manual Commands

### Submit specific pages
```bash
cd /home/user/ken/orchestrator
python3 indexnow.py submit cruisinginthewake.com ships/wonder-of-the-seas.html ports/nassau.html
```

### Bulk submit all pages (from sitemap)
```bash
cd /home/user/ken/orchestrator
python3 indexnow.py bulk /home/user/InTheWake/sitemap.xml cruisinginthewake.com
```

### Auto-detect domain from file path
```bash
cd /home/user/ken/orchestrator
python3 indexnow.py auto /home/user/InTheWake/ships/wonder-of-the-seas.html
```

## Response Codes

| Code | Meaning |
|------|---------||
| 200 | Submitted and accepted |
| 202 | Received, key verification pending |
| 422 | Invalid URLs or payload |
| 429 | Rate limited — script auto-retries with backoff |
| 403 | Key verification failed — check key file exists at site root |

## Integration

- **Hook:** `.claude/hooks/indexnow-submit.sh` (PostToolUse on Edit|Write)
- **Script:** `/home/user/ken/orchestrator/indexnow.py`
- **Key file:** `68e691d21e304db593e4aaac3b92e9e4.txt` (repo root, deployed to site root)
- **Sitemap:** `sitemap.xml` (1,227 URLs)

## Cost

Free. IndexNow is an open protocol with no API fees.

---

*Soli Deo Gloria* — Let the work be found.
