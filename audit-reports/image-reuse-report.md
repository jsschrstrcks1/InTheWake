# Site-wide image-reuse audit

**Generated:** 2026-05-08T20:35:51.762Z
**Images scanned:** 1259
**Unique image bytes:** 1203
**Storage waste:** 56 duplicate file(s) on disk

**⛔ SYMLINKS (always blocking):** 0
**🔴 CRITICAL findings:** 3
**🟠 ERROR findings:** 1
**🟡 WARN (filename does not match a slug):** 0
**ℹ️  INFO (intra-entity duplicates):** 9

Allowlisted sections (brand / icons / social) are not flagged for reuse.

---

## 🔴 CRITICAL — Cross-section / cross-line image reuse (3)

- **md5 `47d160f86e40207350ab806996f2dd85`** — same bytes appear in legacy/root bucket without a resolvable slug — provenance unclear
  - `assets/ships/grandeur-of-the-seas_01.webp`  *(section: ships, line: _root, slug: grandeur-of-the-seas)*
  - `assets/ships/template_01.webp`  *(section: ships, line: _root)*

- **md5 `263499439f2ac50abc28157308a5807d`** — same bytes used across DIFFERENT sections: articles, authors
  - `assets/articles/ken1.jpg`  *(section: articles, line: _generic)*
  - `authors/img/ken1.jpg`  *(section: authors, line: _generic)*

- **md5 `6d1872f821b6370fadbb8085677a4e05`** — same bytes used across DIFFERENT sections: articles, authors
  - `assets/articles/ken1.png`  *(section: articles, line: _generic)*
  - `authors/img/ken1.png`  *(section: authors, line: _generic)*

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

## ℹ️ INFO — Storage-only duplicates within one entity (9)

- **md5 `14fdd48416a3394a80058c0c5b970b59`** — same bytes under multiple filenames for slug "quantum-of-the-seas" — pick one and delete duplicates
  - `assets/ships/0016_Quantum_of_the_Seas.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*
  - `assets/ships/Quantum_of_the_Seas_01.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*

- **md5 `dfe98868bbf48a04f9ee714ae5cc0b0c`** — same bytes under multiple filenames for slug "quantum-of-the-seas" — pick one and delete duplicates
  - `assets/ships/0018_Quantum_of_the_Seas_(2).webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*
  - `assets/ships/Quantum_of_the_Seas_02.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*

- **md5 `cd02f782e08577fe4dbeb2f8e650aec0`** — same bytes under multiple filenames for slug "discovery-princess" — pick one and delete duplicates
  - `assets/ships/Discovery_Princess_profile.jpg`  *(section: ships, line: _root, slug: discovery-princess)*
  - `assets/ships/Discovery_Princess_sea.jpg`  *(section: ships, line: _root, slug: discovery-princess)*

- **md5 `848deba86406a3994a963899ab193ee7`** — same bytes under multiple filenames for slug "quantum-of-the-seas" — pick one and delete duplicates
  - `assets/ships/Quantum_of_the_Seas_-_Wedel_04.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*
  - `assets/ships/Quantum_of_the_Seas_03.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*

- **md5 `931f0598453416d7c3f3a9d4ce05f2a9`** — same bytes under multiple filenames for slug "song-of-norway" — pick one and delete duplicates
  - `assets/ships/Song_of_Norway_Vigo_(cropped)_(cropped)-2.webp`  *(section: ships, line: _root, slug: song-of-norway)*
  - `assets/ships/Song_of_Norway_Vigo_(cropped)_(cropped).webp`  *(section: ships, line: _root, slug: song-of-norway)*

- **md5 `c98a620b816a668050e6ca1e605f0bb6`** — same bytes under multiple filenames for slug "carnival-jubilee" — pick one and delete duplicates
  - `assets/ships/carnival/carnival-jubilee/carnival-jubilee1.jpg`  *(section: ships, line: carnival, slug: carnival-jubilee)*
  - `assets/ships/carnival/carnival-jubilee-exterior.jpg`  *(section: ships, line: carnival, slug: carnival-jubilee)*

- **md5 `b8341f60867a73a82cbe9ae0ad630b42`** — same bytes under multiple filenames for slug "emerald-princess" — pick one and delete duplicates
  - `assets/ships/emerald-princess2_flickr.jpg`  *(section: ships, line: _root, slug: emerald-princess)*
  - `assets/ships/emerald-princess_flickr_new.jpg`  *(section: ships, line: _root, slug: emerald-princess)*

- **md5 `32572a8dca2b53acf12bd1c0a0551583`** — same bytes under multiple filenames within one entity — pick one and delete duplicates
  - `authors/img/tina2.webp`  *(section: authors, line: _generic)*
  - `authors/tina2.webp`  *(section: authors, line: _generic)*

- **md5 `2e7455fe878f3d2209f5027ec4d2d864`** — same bytes under multiple filenames within one entity — pick one and delete duplicates
  - `authors/img/tina3.webp`  *(section: authors, line: _generic)*
  - `authors/tina3.webp`  *(section: authors, line: _generic)*

