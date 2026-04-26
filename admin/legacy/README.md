# admin/legacy

Code preserved for reference but no longer in the active validation path.

## validate-ship-page.js (moved 2026-04-26)

Predecessor JavaScript ship-page validator. Retired in favor of
`admin/validate-ship-page.sh`, which is the single canonical ship validator.

**Why retired:** the JS validator hard-blocked on three rules that the live
ICP-2 standard had explicitly removed:

- `icp_lite/protocol_version` — required `content-protocol="ICP-Lite v1.4"`.
  ICP-2 (`.claude/skills/icp-2/SKILL.md`) demoted this tag to optional and
  pages now use `ICP-2`.
- `ai_breadcrumbs/missing` — required an `<!-- ai-breadcrumbs -->` HTML
  comment. ICP-2 explicitly removed these ("no crawler reads HTML comments").
- `json_ld/description_mismatch` — required character-identical JSON-LD
  description and `ai-summary`. ICP-2 relaxed this to "consistent with."

The cumulative effect: 49/51 active RCL ship pages failed the JS validator
solely on dead rules, while passing the shell validator with 0/0.

The Layer 2 / Layer 3 additions (runtime data + rendering baseline) were
genuine ideas, but the runtime-data layer was implemented without
cascade awareness — every fallback `SOURCES = [primary, fallback]` array
produced a uniform false-positive on the missing primary. The shell
validator's Section 9p already implements the cascade-aware version
("logbook data: N of 4 source paths exist").

## batch-validate-ships.js (moved 2026-04-26)

Wrapper that shelled out to the retired JS validator. Replace with a shell
loop over the canonical validator:

```bash
for f in ships/rcl/*.html; do bash admin/validate-ship-page.sh "$f"; done
```

## Re-promotion

If anyone wants to port a unique check from `validate-ship-page.js` back into
the canonical shell validator (e.g., the rendering-baseline stylesheet
existence check), open the legacy file, copy the logic into a new
`Section 9XX:` block in `admin/validate-ship-page.sh`, and verify it doesn't
re-introduce the drift bugs above.
