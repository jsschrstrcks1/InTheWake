# Ship Pages Repair — LLM Integration Guide

**Date:** 2026-03-24
**Parent plan:** `docs/SHIP_PAGES_REPAIR_PLAN.md`
**Source:** cruising-mode orchestration (GPT structure + Gemini expand, confidence 0.95)
**Cost:** $0.0066 | Grok step skipped (auth unavailable)

---

## Ground Rule

**Only Claude may edit HTML files directly.**
GPT and Gemini produce JSON data files only. Claude reads their output, validates it, and integrates it. This prevents LLM-introduced regressions in markup, schema, or accessibility attributes.

---

## Summary

GPT and Gemini are most valuable in **Phase 5 (content uplift)** — not in the code repair phases.
Phases 1–4 and 6 are deterministic scripted work; injecting LLMs into those phases adds risk without benefit.
Phase 5 is where LLM strengths (creative generation, structured JSON output, content expansion) directly map to the work.

---

## Phase-by-Phase: Script vs. LLM

| Phase | Method | Rationale |
|-------|--------|-----------|
| 1 — Template blockers | **Script (Claude)** | Mechanical string substitution. LLM adds hallucination risk with no gain. |
| 2 — Validator fixes | **Script (Claude)** | Logic changes in JS files. LLMs can help *read* error patterns but should not *write* the fixes. |
| 3 — Fleet-wide warnings | **Script (Claude)** | Title/OG tag patterns are deterministic; `og:image` path is a formula. |
| 4 — MSC structural fixes | **Script (Claude)** | Regex + attribute moves. Zero ambiguity. |
| 5 — Content uplift | **GPT/Gemini → JSON → Claude integrates** | LLMs generate data files only. Claude reads, validates, and writes any resulting HTML changes. |
| 6 — Validation sign-off | **Script (Claude)** | `batch-validate-ships.js` output is the ground truth. |

---

## Phase 5 — LLM Role Assignment

### GPT-4 → Narrative Content (JSON output only)

GPT excels at creative text with consistent tone. Assign it:

- **Logbook stories** — 10+ traveler narratives per ship, with required personas (solo traveler, couple, family, accessible travel). Prompt as "cruise travel writer." Each story needs `title`, `date`, `summary`, `highlights`, `ports_visited`, `persona` fields.
- **Dining venue descriptions** — Ambiance, signature dishes, USP for each venue (`name`, `cuisine`, `description`, `highlights`, `dietary_notes`).
- **Entertainment section copy** — Shows, activities, enrichment programs in short structured entries.

### Gemini → Structured Data Extraction and Expansion (JSON output only)

Gemini performs well at synthesizing information into fixed schemas and expanding factual content. Assign it:

- **Video JSON metadata** — Given a YouTube URL or title, generate `title`, `description`, `duration_estimate`, `tags`, `thumbnail_alt`. Can process video context if multimodal input is available.
- **Ship specification JSON** — Expand sparse specs into full structured data: `imo_number`, `tonnage`, `length`, `beam`, `passenger_capacity`, `crew_capacity`, `build_year`, `refurbishment_dates`, `deck_count`.
- **Port descriptions in logbook context** — Given a port name, generate factual `port_name`, `country`, `description`, `top_attractions`, `local_foods` entries to seed itinerary data.

---

## Prompting Strategy for Phase 5

### Core principles

1. **Generate JSON, not HTML.** LLMs should produce structured data files (`logbook/{slug}.json`, `videos/{slug}.json`). The HTML pages load these via the existing data pipeline — GPT and Gemini never touch HTML.

2. **Few-shot every prompt.** Provide one complete example of a passing output (e.g., the Norwegian Prima logbook JSON) as the template. This constrains format and tone.

3. **Schema-first.** State the exact JSON schema at the top of every prompt. Use output like:
   ```
   Output ONLY valid JSON matching this schema. No commentary, no markdown fences:
   { "stories": [ { "title": "...", "persona": "...", "date": "...", "summary": "...", "highlights": ["..."], "ports_visited": ["..."] } ] }
   ```

4. **Constrain the persona.** Use: *"You are a cruise travel writer for In the Wake. Write in an informative, warm, and factual tone. Do not use superlatives like 'best' or 'amazing.' Do not invent specific prices, dates, or booking details."*

5. **Batch by line, not by ship.** Generate all MSC logbook files in one session to maintain tonal consistency across the fleet. Do the same for Silversea, Seabourn, etc.

### Example prompt structure (logbook)

```
You are a cruise travel writer for In the Wake, a cruise research site.

SCHEMA (output ONLY valid JSON, no extra text):
{
  "stories": [
    {
      "title": "string",
      "persona": "solo|couple|family|accessible",
      "date": "YYYY-MM",
      "summary": "2-3 sentences",
      "highlights": ["string", ...],   // 3-5 items
      "ports_visited": ["string", ...]  // 2-4 ports
    }
  ]
}

EXAMPLE (Norwegian Prima, passing):
[paste one complete passing logbook JSON here]

TASK:
Generate 10 logbook stories for MSC Armonia. This is a classic MSC ship
sailing Mediterranean itineraries (typical ports: Genoa, Barcelona, Marseille,
Civitavecchia, Palermo). Include at least 2 solo, 2 couple, 2 family, 2 accessible personas.
Tone: warm, informative, practical. No invented prices or specific dates.
```

---

## Quality Controls

| Control | Implementation |
|---------|---------------|
| Schema validation | Run `node scripts/validate-json-schema.js` on every LLM output before committing |
| Fact spot-check | Cross-reference port names against known itineraries; flag any port that doesn't match the line's typical routes |
| Persona distribution | Script checks that each logbook has ≥2 of each required persona |
| Uniqueness check | Diff story summaries across ships to catch copy-paste drift (LLMs sometimes recycle phrases fleet-wide) |
| Human review gate | All generated content goes through one editorial pass before being committed to the repo |
| Version control | Each generated file committed individually with message `content: generate logbook for {slug}` |

---

## Guardrails

- **Only Claude edits HTML.** GPT and Gemini output JSON data files. Claude reads, validates, and integrates.
- **Never feed LLMs the HTML files directly.** Pass only ship name, line, and known factual data as input.
- **Pin a "seed" example per line.** Each cruise line should have one manually-written logbook entry that all LLM prompts use as a few-shot anchor. This prevents style drift across the fleet.
- **Rate-limit batches.** Process one cruise line at a time. Review output before moving to the next.
- **No LLM hallucination of IMO numbers or specs.** Ship specifications must come from the existing `fleets.json` / `ship_pages.json` data, not generated. LLMs can *format* specs but must not *invent* them.
- **Regression test after each Phase 5 batch.** Run `batch-validate-ships.js` on the updated line after each content commit to confirm scores are moving up, not down.

---

## Suggested Work Order for Phase 5 LLM Batches

Ordered by proximity to the 80-point pass threshold (highest ROI first):

| Priority | Line | Ships | Closest to Threshold | LLM Tasks |
|----------|------|-------|---------------------|-----------|
| 1 | Seabourn | 7 | Encore (76%), Quest (76%) | Logbook, video, dining |
| 2 | Oceania | 8 | All at 61% avg | Logbook, dining, entertainment |
| 3 | Cunard | 4 | All at 63% avg | Logbook, video, dining |
| 4 | Celebrity (failing) | ~18 | Millennium/Constellation/Infinity/Summit (52-64%) | Logbook, video |
| 5 | MSC | 23 | After Phase 4 structural fixes | Logbook, dining, entertainment, carousel |
| 6 | Silversea | 12 | All at 55% avg | Logbook, dining, video |
| 7 | Regent | 7 | All at 53% avg | Logbook, dining, video |
| 8 | Explora / Costa | 15 | All at 54-58% avg | Logbook, dining |

---

## Gemini Expansion: Additional Content Gemini Flagged as Missing

Gemini's expand pass surfaced these Phase 5 content gaps not in the original plan:

- **Detailed itinerary/port data** — `port_json` per ship with `port_name`, `country`, `top_attractions`, `excursions`, `local_foods`. High SEO value.
- **Full ship specifications** — Standardized spec JSON including MMSI, call sign, flag, home port, max speed. Gemini suggested sourcing from structured web data rather than generating.
- **Onboard activities JSON** — `activity_name`, `description`, `category`, `age_group` entries beyond the entertainment section.

These are additive to the current plan. They can be deferred to a Phase 5b after the core logbook/dining/video uplift achieves 100% pass.

---

*Soli Deo Gloria*
