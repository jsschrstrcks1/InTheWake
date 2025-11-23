# Planning Dataset v0.2

Generated: 2025-10-20T14:11:03.101001Z

This dataset defines U.S. planning scaffolding (initial pass: Florida) for the "In the Wake" Planning page.
It includes:
- General blurb, tips, and warnings (house voice).
- Canonical ports (Miami, Everglades, Canaveral, Tampa, Jacksonville) and Royal Caribbean focus.
- Airports mapped to each port with approximate distances and drive-time ranges.
- Intra-state travel edges for cross-port sanity checks.

## File List
- planning_dataset_v0.2.json — primary data for the pill UI.
- planning_schema_v0.2.json — fields & UI blocks.
- airport_to_ports_v0.2.csv — quick spreadsheet preview.

## Notes
- Distances/drive times are approximate. Always verify based on live traffic and event calendars.
- Next states to add (recommended order): Texas (Galveston), New Jersey/NY (Cape Liberty), California (San Pedro/LA), Washington (Seattle), Maryland (Baltimore), Massachusetts (Boston), Alaska (several).
- After states are added, run a dedupe pass on Grok facts into the canonical entries here (no duplication, no loss).

Soli Deo Gloria — may every pixel and paragraph bear His reflection, this site is offered as worship to God.
