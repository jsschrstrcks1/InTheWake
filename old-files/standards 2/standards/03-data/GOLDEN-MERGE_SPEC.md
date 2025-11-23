# Golden Merge (Superset) Spec — v3.006
Applies to JSON, CSV, and mixed formats. Never drop words.

- **Union, not intersection**: include all keys/columns seen in any source.
- **Preserve provenance**: for conflicting values, keep both as array with `source` annotations.
- **Stable dedupe**: on entities (e.g., ships) prefer `slug` stable IDs. If absent, synthesize from name.
- **Order**: stable natural order; do not sort lexically if an ordering signal exists (e.g., `year`).

Conflict examples and adapters are in future appendices.
