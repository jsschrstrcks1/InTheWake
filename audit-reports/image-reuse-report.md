# Site-wide image-reuse audit

**Generated:** 2026-05-08T16:40:48.103Z
**Images scanned:** 1285
**Unique image bytes:** 1215
**Storage waste:** 70 duplicate file(s) on disk

**⛔ SYMLINKS (always blocking):** 0
**🔴 CRITICAL findings:** 4
**🟠 ERROR findings:** 13
**🟡 WARN (filename does not match a slug):** 0
**ℹ️  INFO (intra-entity duplicates):** 9

Allowlisted sections (brand / icons / social) are not flagged for reuse.

---

## 🔴 CRITICAL — Cross-section / cross-line image reuse (4)

- **md5 `47d160f86e40207350ab806996f2dd85`** — same bytes appear in legacy/root bucket without a resolvable slug — provenance unclear
  - `assets/ships/grandeur-of-the-seas_01.webp`  *(section: ships, line: _root, slug: grandeur-of-the-seas)*
  - `assets/ships/template_01.webp`  *(section: ships, line: _root)*

- **md5 `c652b150136e170a917bde5ba007a238`** — same bytes used across DIFFERENT cruise lines / port-groups within ships
  - `assets/ships/other/westerdam-exterior.jpg`  *(section: ships, line: other, slug: westerdam)*
  - `assets/ships/other/zuiderdam-exterior.jpg`  *(section: ships, line: other, slug: zuiderdam)*
  - `assets/ships/princess/star-princess-exterior.jpg`  *(section: ships, line: princess, slug: star-princess)*

- **md5 `263499439f2ac50abc28157308a5807d`** — same bytes used across DIFFERENT sections: articles, authors
  - `assets/articles/ken1.jpg`  *(section: articles, line: _generic)*
  - `authors/img/ken1.jpg`  *(section: authors, line: _generic)*

- **md5 `6d1872f821b6370fadbb8085677a4e05`** — same bytes used across DIFFERENT sections: articles, authors
  - `assets/articles/ken1.png`  *(section: articles, line: _generic)*
  - `authors/img/ken1.png`  *(section: authors, line: _generic)*

## 🟠 ERROR — Same-section different-entity reuse (13)

- **md5 `19255bbf7e5450ff50b001282899ac7d`** — same bytes used for DIFFERENT entities (celebrity-compass, celebrity-seeker) within the same line
  - `assets/ships/Celebrity_Compass_flickr_gabry92g.webp`  *(section: ships, line: _root, slug: celebrity-compass)*
  - `assets/ships/Celebrity_Seeker_flickr_gabry92g.webp`  *(section: ships, line: _root, slug: celebrity-seeker)*

- **md5 `f614b8681a3f6bc79bc426350a3377dd`** — same bytes used for DIFFERENT entities (liberty-of-the-seas, radiance-of-the-seas) within the same line
  - `assets/ships/Liberty-of-the-seas-FOM- - 2.jpeg`  *(section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 1.jpeg`  *(section: ships, line: _root, slug: radiance-of-the-seas)*

- **md5 `40cbc1116b1daef4687874629f21ae84`** — same bytes used for DIFFERENT entities (liberty-of-the-seas, radiance-of-the-seas) within the same line
  - `assets/ships/Liberty-of-the-seas-FOM- - 2.webp`  *(section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 1.webp`  *(section: ships, line: _root, slug: radiance-of-the-seas)*

- **md5 `72418c3d4459161cb90cfe1794a16cfc`** — same bytes used for DIFFERENT entities (liberty-of-the-seas, radiance-of-the-seas) within the same line
  - `assets/ships/Liberty-of-the-seas-FOM- - 5.jpeg`  *(section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 3.jpeg`  *(section: ships, line: _root, slug: radiance-of-the-seas)*

- **md5 `5564839f8013477b7c0e40743e3f4b9b`** — same bytes used for DIFFERENT entities (liberty-of-the-seas, radiance-of-the-seas) within the same line
  - `assets/ships/Liberty-of-the-seas-FOM- - 5.webp`  *(section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 3.webp`  *(section: ships, line: _root, slug: radiance-of-the-seas)*

- **md5 `2e019fee853df3f6bdb0178520aef53b`** — same bytes used for DIFFERENT entities (liberty-of-the-seas, radiance-of-the-seas) within the same line
  - `assets/ships/Liberty-of-the-seas-FOM- - 6.jpeg`  *(section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 4.jpeg`  *(section: ships, line: _root, slug: radiance-of-the-seas)*

- **md5 `1818996836203115613abc9403afd7d7`** — same bytes used for DIFFERENT entities (liberty-of-the-seas, radiance-of-the-seas) within the same line
  - `assets/ships/Liberty-of-the-seas-FOM- - 6.webp`  *(section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 4.webp`  *(section: ships, line: _root, slug: radiance-of-the-seas)*

- **md5 `a6f3f6ab6252b907d238cdde77d938bf`** — same bytes used for DIFFERENT entities (rijndam-ii, rijndam) within the same line
  - `assets/ships/Rijndam_II_flickr_wimhoppenbrouwers.webp`  *(section: ships, line: _root, slug: rijndam-ii)*
  - `assets/ships/Rijndam_flickr_wimhoppenbrouwers.webp`  *(section: ships, line: _root, slug: rijndam)*

- **md5 `da288363e365348a712a10832e9a0ea1`** — same bytes used for DIFFERENT entities (freedom-of-the-seas, mariner-of-the-seas) within the same line
  - `assets/ships/freedom-of-the-seas-FOM- - 2.jpeg`  *(section: ships, line: _root, slug: freedom-of-the-seas)*
  - `assets/ships/mariner-of-the-seas-FOM- - 1.jpeg`  *(section: ships, line: _root, slug: mariner-of-the-seas)*

- **md5 `94486f216fd2801f20d91ca66a997de0`** — same bytes used for DIFFERENT entities (freedom-of-the-seas, mariner-of-the-seas) within the same line
  - `assets/ships/freedom-of-the-seas-FOM- - 2.webp`  *(section: ships, line: _root, slug: freedom-of-the-seas)*
  - `assets/ships/mariner-of-the-seas-FOM- - 1.webp`  *(section: ships, line: _root, slug: mariner-of-the-seas)*

- **md5 `0ca717f7483b025d3dc45e4855772833`** — same bytes used for DIFFERENT entities (freedom-of-the-seas, mariner-of-the-seas) within the same line
  - `assets/ships/freedom-of-the-seas-FOM- - 3.jpeg`  *(section: ships, line: _root, slug: freedom-of-the-seas)*
  - `assets/ships/mariner-of-the-seas-FOM- - 2.jpeg`  *(section: ships, line: _root, slug: mariner-of-the-seas)*

- **md5 `85ab8d842134d16541d34e0a8d547d36`** — same bytes used for DIFFERENT entities (freedom-of-the-seas, mariner-of-the-seas) within the same line
  - `assets/ships/freedom-of-the-seas-FOM- - 3.webp`  *(section: ships, line: _root, slug: freedom-of-the-seas)*
  - `assets/ships/mariner-of-the-seas-FOM- - 2.webp`  *(section: ships, line: _root, slug: mariner-of-the-seas)*

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

