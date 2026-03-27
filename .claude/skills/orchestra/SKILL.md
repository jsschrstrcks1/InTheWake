---
name: orchestra
description: "Round-robin multi-LLM consultation tuned for InTheWake PWA development. GPT proposes, Gemini refines, Grok challenges — full-context debate with wheat/chaff justifications, low-hanging fruit, and PWA checklist."
version: 1.0.0
---

# The Orchestra — InTheWake PWA Edition

> Ask the orchestra. Let them debate. Build what survives.

## Usage

```bash
cd /home/user/ken/orchestrator && python3 orchestra.py cruising "task description"
```

## How It Works

Round-robin debate where each model sees EVERYTHING from prior rounds — proposals, verdicts, justifications, rejections. Nothing filtered. What one model calls chaff, the next might rescue.

### The Rounds

**Round 1: GPT** — Proposes structure, approach, innovations. Each proposal has CONFIDENCE + JUSTIFICATION.

**Round 2: Gemini** — Sees GPT's full response. For each proposal: WHEAT | CHAFF | WHEAT_WITH_REFINEMENT (with justification). Adds own proposals. Identifies low-hanging fruit.

**Round 3: Grok** — Sees both GPT + Gemini. Verdicts on EVERY prior proposal. Specifically rescues dismissed ideas worth saving. Adds own proposals. Identifies blind spots + low-hanging fruit.

**Blind Spot Check** — Grok reviews the emerging synthesis: "What are we all still missing?"

**Claude Synthesizes** — Full debate chain → attributed plan → encode to memory.

### Why Full Context

Each model provides justifications for wheat/chaff verdicts. The next model can disagree with the *reasoning*, not just the conclusion. An idea rejected in Round 2 can be rescued in Round 3 because the justification was visible.

## PWA Checklist

After every orchestra run, verify these PWA concerns:

| Concern | Check | File |
|---------|-------|------|
| **Service Worker** | Does sw.js need updating for new pages/assets? | `sw.js` |
| **Cache Strategy** | Static assets: cache-first. Dynamic data: network-first. | `sw.js` |
| **Manifest** | App name, icons, theme color, start URL current? | `manifest.json`, `manifest.webmanifest` |
| **Offline** | New pages fallback to offline.html? | `offline.html` |
| **Precache** | New files added to precache manifest? | `precache-manifest.json` |
| **Prefetch Images** | New images in prefetch list? | `prefetch-images.json` |
| **Performance** | First load <200KB? LCP <2.5s? | Lighthouse |
| **Sitemap** | New pages listed? | `sitemap.xml` |
| **AI Discovery** | llms.txt current with new content? | `llms.txt` |
| **Schema** | POI/port data validates against schema? | `schema/*.json` |

## Cost

Typical: $0.03–$0.08 per full orchestra run. Report shows per-round breakdown.

## Integration

- **cognitive-memory** — recalls cruising memories before Round 1, encodes decisions after
- **deployment-validator** — run after orchestra to verify artifacts
- **webapp-testing** — run after orchestra if tools were modified
- **content-freshness** — orchestra may identify stale content to update
- **seasonal-content-planner** — orchestra informed by seasonal priorities

---

*Soli Deo Gloria* — Let the orchestra play. Build what serves the traveler.
