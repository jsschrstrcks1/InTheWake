# Site-wide image-reuse audit

**Generated:** 2026-06-04T02:52:10.971Z
**Images scanned:** 1790
**Unique image bytes:** 1730
**Storage waste:** 60 duplicate file(s) on disk

**⛔ SYMLINKS (always blocking):** 0
**🔴 CRITICAL findings:** 1
**🟠 ERROR findings:** 1
**🟡 WARN (filename does not match a slug):** 12
**ℹ️  INFO (intra-entity duplicates):** 16

Allowlisted sections (brand / icons / social) are not flagged for reuse.

---

## 🔴 CRITICAL — Cross-section / cross-line image reuse (1)

- **md5 `47d160f86e40207350ab806996f2dd85`** — same bytes appear in legacy/root bucket without a resolvable slug — provenance unclear
  - `assets/ships/grandeur-of-the-seas_01.webp`  *(section: ships, line: _root, slug: grandeur-of-the-seas)*
  - `assets/ships/template_01.webp`  *(section: ships, line: _root)*

## 🟠 ERROR — Same-section different-entity reuse (1)

- **md5 `cdf8bd1f00cbe19173712e81050c669c`** — same bytes used for DIFFERENT entities (christchurch, durban, luanda, mombasa, port-moresby) within the same line
  - `assets/ships/placeholder-ship.webp`  *(section: ships, line: _root)*
  - `images/ports/christchurch/botanic-gardens.webp`  *(section: ports, line: christchurch, slug: christchurch)*
  - `images/ports/christchurch/canterbury-museum.webp`  *(section: ports, line: christchurch, slug: christchurch)*
  - `images/ports/christchurch/cardboard-cathedral.webp`  *(section: ports, line: christchurch, slug: christchurch)*
  - `images/ports/christchurch/heritage-tram.webp`  *(section: ports, line: christchurch, slug: christchurch)*
  - `images/ports/christchurch/lyttelton-harbour.webp`  *(section: ports, line: christchurch, slug: christchurch)*
  - `images/ports/christchurch/port-hills.webp`  *(section: ports, line: christchurch, slug: christchurch)*
  - `images/ports/christchurch/punting-avon.webp`  *(section: ports, line: christchurch, slug: christchurch)*
  - `images/ports/christchurch-hero.webp`  *(section: ports, line: _root, slug: christchurch)*
  - `images/ports/durban-hero.webp`  *(section: ports, line: _root, slug: durban)*
  - `images/ports/luanda/fortaleza-sao-miguel.webp`  *(section: ports, line: luanda, slug: luanda)*
  - `images/ports/luanda/ilha-beach.webp`  *(section: ports, line: luanda, slug: luanda)*
  - `images/ports/luanda/iron-palace.webp`  *(section: ports, line: luanda, slug: luanda)*
  - `images/ports/luanda/marginal-promenade.webp`  *(section: ports, line: luanda, slug: luanda)*
  - `images/ports/luanda-hero.webp`  *(section: ports, line: _root, slug: luanda)*
  - `images/ports/mombasa/dhow-harbor.webp`  *(section: ports, line: mombasa, slug: mombasa)*
  - `images/ports/mombasa/diani-beach.webp`  *(section: ports, line: mombasa, slug: mombasa)*
  - `images/ports/mombasa/fort-jesus.webp`  *(section: ports, line: mombasa, slug: mombasa)*
  - `images/ports/mombasa/old-town-door.webp`  *(section: ports, line: mombasa, slug: mombasa)*
  - `images/ports/mombasa-hero.webp`  *(section: ports, line: _root, slug: mombasa)*
  - `images/ports/port-moresby/bird-of-paradise.webp`  *(section: ports, line: port-moresby, slug: port-moresby)*
  - `images/ports/port-moresby/bomana-cemetery.webp`  *(section: ports, line: port-moresby, slug: port-moresby)*
  - `images/ports/port-moresby/parliament-house.webp`  *(section: ports, line: port-moresby, slug: port-moresby)*
  - `images/ports/port-moresby/spirit-house.webp`  *(section: ports, line: port-moresby, slug: port-moresby)*
  - `images/ports/port-moresby-hero.webp`  *(section: ports, line: _root, slug: port-moresby)*
  - `authors/img/author-avatar.jpg`  *(section: authors, line: _generic)*
  - `assets/brand/placeholder-port.webp`  *(section: brand, line: _allow)*

## 🟡 WARN — Filename does not match a known slug (12)

- **md5 `ecd45cee15b17385a954768aaa3211d2`** — filename does not contain a known ships-slug
  - `assets/ships/costa/costa-fortuna/Costa_Fortuna.webp`  *(section: ships, line: costa)*

- **md5 `e61458073c55208cbe358e2e9c6686c5`** — filename does not contain a known ships-slug
  - `assets/ships/costa/costa-fortuna/Costa_Fortuna_-a.webp`  *(section: ships, line: costa)*

- **md5 `8c79028a18204d6f466b75b05dbaf17b`** — filename does not contain a known ships-slug
  - `assets/ships/costa/costa-fortuna/Costa_Fortuna_Ponte.webp`  *(section: ships, line: costa)*

- **md5 `c7eb0f12aea37d56b57599886a89d126`** — filename does not contain a known ships-slug
  - `assets/ships/costa/costa-fortuna/Costa_Fortuna_Prua.webp`  *(section: ships, line: costa)*

- **md5 `cb01192df25509120e97e4349b5547db`** — filename does not contain a known ships-slug
  - `assets/ships/costa/costa-fortuna/Costa_Fortuna_at_Fort_Lauderdale_-_IMO_9239783_(3306462221).webp`  *(section: ships, line: costa)*

- **md5 `241c8b501ad635a38de6605d31b8a43c`** — filename does not contain a known ships-slug
  - `assets/ships/costa/costa-fortuna/Costa_Fortuna_im_Juli_2011_beim_Auslaufen_aus_Venedig.webp`  *(section: ships, line: costa)*

- **md5 `24421a65269d4408024530c882e51278`** — filename does not contain a known ships-slug
  - `assets/ships/costa/costa-fortuna/TorrettaLeonPancaldoSAVONAFeb2006.webp`  *(section: ships, line: costa)*

- **md5 `ad2ec3f43eca7d4cc064db7b8eb2134f`** — filename does not contain a known ships-slug
  - `assets/ships/disney-cruise-line/disney-wish/Disney_Wish_broadside_Nassau_2026-05-19.webp`  *(section: ships, line: disney-cruise-line)*

- **md5 `c1209c9e6ef853d83b491801fdea02d0`** — filename does not contain a known ships-slug
  - `assets/ships/oceania/vista/Cabin_on_Oceania_Vista.webp`  *(section: ships, line: oceania)*

- **md5 `e821264b85664f336905021d41934530`** — filename does not contain a known ships-slug
  - `assets/ships/oceania/vista/Casino_on_Oceania_Vista.webp`  *(section: ships, line: oceania)*

- **md5 `b1d7742dcc936850432d6b95cba56659`** — filename does not contain a known ships-slug
  - `assets/ships/oceania/vista/Central_staircase_on_Oceania_Vista.webp`  *(section: ships, line: oceania)*

- **md5 `30097a327847bb076c541da17bc5be62`** — filename does not contain a known ships-slug
  - `assets/ships/oceania/vista/Grand_Lounge_on_Oceania_Vista.webp`  *(section: ships, line: oceania)*

## ℹ️ INFO — Storage-only duplicates within one entity (16)

- **md5 `14fdd48416a3394a80058c0c5b970b59`** — same bytes for ship slug "quantum-of-the-seas" across _root/line buckets — pick one and delete duplicates (same-entity)
  - `assets/ships/0016_Quantum_of_the_Seas.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*
  - `assets/ships/Quantum_of_the_Seas_01.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*

- **md5 `dfe98868bbf48a04f9ee714ae5cc0b0c`** — same bytes for ship slug "quantum-of-the-seas" across _root/line buckets — pick one and delete duplicates (same-entity)
  - `assets/ships/0018_Quantum_of_the_Seas_(2).webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*
  - `assets/ships/Quantum_of_the_Seas_02.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*

- **md5 `cd02f782e08577fe4dbeb2f8e650aec0`** — same bytes for ship slug "discovery-princess" across _root/line buckets — pick one and delete duplicates (same-entity)
  - `assets/ships/Discovery_Princess_profile.jpg`  *(section: ships, line: _root, slug: discovery-princess)*
  - `assets/ships/Discovery_Princess_sea.jpg`  *(section: ships, line: _root, slug: discovery-princess)*

- **md5 `848deba86406a3994a963899ab193ee7`** — same bytes for ship slug "quantum-of-the-seas" across _root/line buckets — pick one and delete duplicates (same-entity)
  - `assets/ships/Quantum_of_the_Seas_-_Wedel_04.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*
  - `assets/ships/Quantum_of_the_Seas_03.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*

- **md5 `931f0598453416d7c3f3a9d4ce05f2a9`** — same bytes for ship slug "song-of-norway" across _root/line buckets — pick one and delete duplicates (same-entity)
  - `assets/ships/Song_of_Norway_Vigo_(cropped)_(cropped)-2.webp`  *(section: ships, line: _root, slug: song-of-norway)*
  - `assets/ships/Song_of_Norway_Vigo_(cropped)_(cropped).webp`  *(section: ships, line: _root, slug: song-of-norway)*

- **md5 `c98a620b816a668050e6ca1e605f0bb6`** — same bytes for ship slug "carnival-jubilee" across _root/line buckets — pick one and delete duplicates (same-entity)
  - `assets/ships/carnival/carnival-jubilee/carnival-jubilee1.jpg`  *(section: ships, line: carnival, slug: carnival-jubilee)*
  - `assets/ships/carnival/carnival-jubilee-exterior.jpg`  *(section: ships, line: carnival, slug: carnival-jubilee)*

- **md5 `b8341f60867a73a82cbe9ae0ad630b42`** — same bytes for ship slug "emerald-princess" across _root/line buckets — pick one and delete duplicates (same-entity)
  - `assets/ships/emerald-princess2_flickr.jpg`  *(section: ships, line: _root, slug: emerald-princess)*
  - `assets/ships/emerald-princess_flickr_new.jpg`  *(section: ships, line: _root, slug: emerald-princess)*

- **md5 `8f60c4dfdb78b1a65f634b5894bafc3a`** — same bytes under multiple filenames for slug "ocean-cay" — pick one and delete duplicates
  - `images/ports/ocean-cay/clear-water-from-the-swim.jpg`  *(section: ports, line: ocean-cay, slug: ocean-cay)*
  - `images/ports/ocean-cay/originals/clear-water-from-the-swim.jpg`  *(section: ports, line: ocean-cay, slug: ocean-cay)*

- **md5 `4a9927cfb29bedbff781c9334930fe23`** — same bytes under multiple filenames for slug "ocean-cay" — pick one and delete duplicates
  - `images/ports/ocean-cay/ocean-cay-buffet-lunch-plate.jpg`  *(section: ports, line: ocean-cay, slug: ocean-cay)*
  - `images/ports/ocean-cay/originals/ocean-cay-buffet-lunch-plate.jpg`  *(section: ports, line: ocean-cay, slug: ocean-cay)*

- **md5 `616a016a0d662db22613b19ee5fc8f99`** — same bytes under multiple filenames for slug "ocean-cay" — pick one and delete duplicates
  - `images/ports/ocean-cay/ocean-cay-map-board-context.jpg`  *(section: ports, line: ocean-cay, slug: ocean-cay)*
  - `images/ports/ocean-cay/originals/ocean-cay-map-board-context.jpg`  *(section: ports, line: ocean-cay, slug: ocean-cay)*

- **md5 `0451d517dce8a13640229a650f35daa1`** — same bytes under multiple filenames for slug "ocean-cay" — pick one and delete duplicates
  - `images/ports/ocean-cay/originals/we-love-ocean-cay-boat-and-lighthouse.jpg`  *(section: ports, line: ocean-cay, slug: ocean-cay)*
  - `images/ports/ocean-cay/we-love-ocean-cay-boat-and-lighthouse.jpg`  *(section: ports, line: ocean-cay, slug: ocean-cay)*

- **md5 `030570d20344d5ea8f3c4b6e1e3edb85`** — same bytes under multiple filenames for slug "ocean-cay" — pick one and delete duplicates
  - `images/ports/ocean-cay/originals/welcome-to-ocean-cay-sign.jpg`  *(section: ports, line: ocean-cay, slug: ocean-cay)*
  - `images/ports/ocean-cay/welcome-to-ocean-cay-sign.jpg`  *(section: ports, line: ocean-cay, slug: ocean-cay)*

- **md5 `263499439f2ac50abc28157308a5807d`** — same bytes across authors↔articles for shared filename root — documented same-entity pattern
  - `assets/articles/ken1.jpg`  *(section: articles, line: _generic)*
  - `authors/img/ken1.jpg`  *(section: authors, line: _generic)*

- **md5 `6d1872f821b6370fadbb8085677a4e05`** — same bytes across authors↔articles for shared filename root — documented same-entity pattern
  - `assets/articles/ken1.png`  *(section: articles, line: _generic)*
  - `authors/img/ken1.png`  *(section: authors, line: _generic)*

- **md5 `32572a8dca2b53acf12bd1c0a0551583`** — same bytes under multiple filenames within one entity — pick one and delete duplicates
  - `authors/img/tina2.webp`  *(section: authors, line: _generic)*
  - `authors/tina2.webp`  *(section: authors, line: _generic)*

- **md5 `2e7455fe878f3d2209f5027ec4d2d864`** — same bytes under multiple filenames within one entity — pick one and delete duplicates
  - `authors/img/tina3.webp`  *(section: authors, line: _generic)*
  - `authors/tina3.webp`  *(section: authors, line: _generic)*

