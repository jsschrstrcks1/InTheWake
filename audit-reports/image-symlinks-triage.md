# Image-symlink triage

**Generated:** 2026-05-07T21:21:18.364Z
**Total symlinks in image trees:** 0

| Class | Count | Recommended action |
|---|---|---|
| ORPHAN        | 0 | safe to `rm`; no HTML touches it |
| TARGET-ONLY   | 0 | safe to `rm`; HTML already points at the real target |
| REDIRECTABLE  | 0 | rewrite HTML to point at target, then `rm` symlink |
| SHARED        | 0 | per-page judgment: HTML refs both sides separately |
| BROKEN-TARGET | 0 | `rm` symlink AND remove HTML refs (target missing) |

Each section below lists at most 30 entries; the full list is in `image-symlinks-triage.json`.

---

## 🟢 ORPHAN — no HTML reference, delete on sight (0)

_(none)_

## 🟢 TARGET-ONLY — HTML already references the real target (0)

_(none)_

## 🟡 REDIRECTABLE — rewrite HTML, then delete (0)

_(none)_

## 🟠 SHARED — HTML references both paths separately (0)

_(none)_

## 🔴 BROKEN-TARGET — target does not exist, remove everywhere (0)

_(none)_

