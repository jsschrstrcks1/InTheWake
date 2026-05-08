# Visual recrop / near-duplicate audit

**Generated:** 2026-05-08T10:37:21.301Z
**Method:** dHash on 9×8 grayscale (sharp). Hamming distance ≤ 8 = "near-identical at thumbnail scale."
**Images compared:** 1071
**Cross-entity near-duplicate groups:** 44

**🔴 CRITICAL:** 3
**🟠 ERROR:** 12
**ℹ️  INFO:** 29

Note: Groups with byte-identical members (single md5) are already caught by `scan-image-reuse.cjs` and excluded here. This report only surfaces visual reuse that md5 missed.

---

## 🔴 CRITICAL — Cross-section / cross-line near-duplicates (3)

- **near-duplicate across DIFFERENT sections: ships, articles**
  - `assets/ships/costa-deliziosa_flickr_new.jpg`  *(md5 `b771780a22c8…`, section: ships, line: _root, slug: costa-deliziosa)*
  - `assets/articles/thumbs/freedom-of-your-own-wake.webp`  *(md5 `8f86067b3ce4…`, section: articles, line: _generic)*

- **near-duplicate across DIFFERENT sections: articles, authors**
  - `assets/articles/ken1.jpg`  *(md5 `263499439f2a…`, section: articles, line: _generic)*
  - `authors/img/ken1.jpg`  *(md5 `263499439f2a…`, section: authors, line: _generic)*
  - `assets/articles/thumbs/ken1.webp`  *(md5 `2809263c9093…`, section: articles, line: _generic)*
  - `authors/img/ken1.webp`  *(md5 `4c69e1133d96…`, section: authors, line: _generic)*
  - `authors/img/ken1_192.webp`  *(md5 `8717957e2636…`, section: authors, line: _generic)*
  - `authors/img/ken1_96.webp`  *(md5 `d346f7d9c047…`, section: authors, line: _generic)*

- **near-duplicate across DIFFERENT sections: articles, authors**
  - `assets/articles/ken1.png`  *(md5 `6d1872f821b6…`, section: articles, line: _generic)*
  - `authors/img/ken1.png`  *(md5 `6d1872f821b6…`, section: authors, line: _generic)*
  - `authors/img/author.webp`  *(md5 `74acbc2827a7…`, section: authors, line: _generic)*
  - `authors/img/author_192.webp`  *(md5 `2ec1b9c18b06…`, section: authors, line: _generic)*
  - `authors/img/author_96.webp`  *(md5 `d5d64abfd77f…`, section: authors, line: _generic)*
  - `authors/img/ico/ken1ico.webp`  *(md5 `18bbebae6795…`, section: authors, line: _generic)*

## 🟠 ERROR — Same-section different-entity near-duplicates (12)

- **near-duplicate used for DIFFERENT entities: costa-deliziosa, celebrity-millennium**
  - `assets/ships/Costa_Deliziosa_flickr_StephenMarcus.webp`  *(md5 `265b638fabd8…`, section: ships, line: _root, slug: costa-deliziosa)*
  - `assets/ships/celebrity-millennium_05.webp`  *(md5 `3de9513f0fa4…`, section: ships, line: _root, slug: celebrity-millennium)*

- **near-duplicate used for DIFFERENT entities: costa-firenze, celebrity-infinity**
  - `assets/ships/Costa_Firenze_flickr_brlrzxmb18.webp`  *(md5 `bf2e80e21632…`, section: ships, line: _root, slug: costa-firenze)*
  - `assets/ships/celebrity-infinity_08.webp`  *(md5 `ded4d975b17c…`, section: ships, line: _root, slug: celebrity-infinity)*

- **near-duplicate used for DIFFERENT entities: liberty-of-the-seas, radiance-of-the-seas**
  - `assets/ships/Liberty-of-the-seas-FOM- - 2.jpeg`  *(md5 `f614b8681a3f…`, section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 1.jpeg`  *(md5 `f614b8681a3f…`, section: ships, line: _root, slug: radiance-of-the-seas)*
  - `assets/ships/Liberty-of-the-seas-FOM- - 2.webp`  *(md5 `40cbc1116b1d…`, section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 1.webp`  *(md5 `40cbc1116b1d…`, section: ships, line: _root, slug: radiance-of-the-seas)*

- **near-duplicate used for DIFFERENT entities: liberty-of-the-seas, radiance-of-the-seas**
  - `assets/ships/Liberty-of-the-seas-FOM- - 5.jpeg`  *(md5 `72418c3d4459…`, section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 3.jpeg`  *(md5 `72418c3d4459…`, section: ships, line: _root, slug: radiance-of-the-seas)*
  - `assets/ships/Liberty-of-the-seas-FOM- - 5.webp`  *(md5 `5564839f8013…`, section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 3.webp`  *(md5 `5564839f8013…`, section: ships, line: _root, slug: radiance-of-the-seas)*
  - `assets/ships/Liberty-of-the-seas-FOM- - 6.jpeg`  *(md5 `2e019fee853d…`, section: ships, line: _root, slug: liberty-of-the-seas)*
  - `assets/ships/Radiance-of-the-seas-FOM- - 4.jpeg`  *(md5 `2e019fee853d…`, section: ships, line: _root, slug: radiance-of-the-seas)*

- **near-duplicate used for DIFFERENT entities: oasis-of-the-seas, serenade-of-the-seas**
  - `assets/ships/Oasis-of-the-seas-FOM- - 1.jpeg`  *(md5 `5e693afed0f1…`, section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-4.jpeg`  *(md5 `5e693afed0f1…`, section: ships, line: _root, slug: serenade-of-the-seas)*
  - `assets/ships/Oasis-of-the-seas-FOM- - 1.webp`  *(md5 `868f2e3a4755…`, section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-4.webp`  *(md5 `868f2e3a4755…`, section: ships, line: _root, slug: serenade-of-the-seas)*

- **near-duplicate used for DIFFERENT entities: oasis-of-the-seas, serenade-of-the-seas**
  - `assets/ships/Oasis-of-the-seas-FOM- - 3.jpeg`  *(md5 `1951bd78fc96…`, section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-5.jpeg`  *(md5 `1951bd78fc96…`, section: ships, line: _root, slug: serenade-of-the-seas)*
  - `assets/ships/Oasis-of-the-seas-FOM- - 3.webp`  *(md5 `d9cabe12e2b0…`, section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-5.webp`  *(md5 `d9cabe12e2b0…`, section: ships, line: _root, slug: serenade-of-the-seas)*

- **near-duplicate used for DIFFERENT entities: oasis-of-the-seas, serenade-of-the-seas**
  - `assets/ships/Oasis-of-the-seas-FOM- - 4.jpeg`  *(md5 `945561a41bb9…`, section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-6.jpeg`  *(md5 `945561a41bb9…`, section: ships, line: _root, slug: serenade-of-the-seas)*
  - `assets/ships/Oasis-of-the-seas-FOM- - 4.webp`  *(md5 `46ce653559b7…`, section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-6.webp`  *(md5 `46ce653559b7…`, section: ships, line: _root, slug: serenade-of-the-seas)*

- **near-duplicate used for DIFFERENT entities: rotterdam-vi, zaandam**
  - `assets/ships/Rotterdam_Vi_flickr_CaptainMartini.webp`  *(md5 `059178914d7d…`, section: ships, line: _root, slug: rotterdam-vi)*
  - `assets/ships/zaandam_02.webp`  *(md5 `fbbffabaf3b4…`, section: ships, line: _root, slug: zaandam)*

- **near-duplicate used for DIFFERENT entities: seven-seas-voyager, voyager-of-the-seas**
  - `assets/ships/Seven_Seas_Voyager_(ship,_2003),_S_te_01.jpg`  *(md5 `64fee492afc3…`, section: ships, line: _root, slug: seven-seas-voyager)*
  - `assets/ships/rcl/voyager-of-the-seas-exterior.jpg`  *(md5 `1dfe5ef357ae…`, section: ships, line: rcl, slug: voyager-of-the-seas)*

- **near-duplicate used for DIFFERENT entities: carnival-adventure, norwegian-bliss**
  - `assets/ships/carnival-adventure_01.webp`  *(md5 `3ae130bc14f7…`, section: ships, line: _root, slug: carnival-adventure)*
  - `assets/ships/carnival-adventure_02.webp`  *(md5 `bc8acde50bcf…`, section: ships, line: _root, slug: carnival-adventure)*
  - `assets/ships/carnival-adventure_03.webp`  *(md5 `982628dada0e…`, section: ships, line: _root, slug: carnival-adventure)*
  - `assets/ships/carnival-adventure_04.webp`  *(md5 `acf834cd39e9…`, section: ships, line: _root, slug: carnival-adventure)*
  - `assets/ships/carnival-adventure_05.webp`  *(md5 `f63495987f09…`, section: ships, line: _root, slug: carnival-adventure)*
  - `assets/ships/carnival-adventure_06.webp`  *(md5 `12941cb2b326…`, section: ships, line: _root, slug: carnival-adventure)*
  - `assets/ships/carnival-adventure_07.webp`  *(md5 `a28c9affcb04…`, section: ships, line: _root, slug: carnival-adventure)*
  - `assets/ships/carnival-adventure_08.webp`  *(md5 `c111c43c72a9…`, section: ships, line: _root, slug: carnival-adventure)*
  - `assets/ships/ncl/norwegian-bliss-exterior.jpg`  *(md5 `4a3ab93674f4…`, section: ships, line: ncl, slug: norwegian-bliss)*

- **near-duplicate used for DIFFERENT entities: freedom-of-the-seas, mariner-of-the-seas**
  - `assets/ships/freedom-of-the-seas-FOM- - 2.jpeg`  *(md5 `da288363e365…`, section: ships, line: _root, slug: freedom-of-the-seas)*
  - `assets/ships/mariner-of-the-seas-FOM- - 1.jpeg`  *(md5 `da288363e365…`, section: ships, line: _root, slug: mariner-of-the-seas)*
  - `assets/ships/freedom-of-the-seas-FOM- - 2.webp`  *(md5 `94486f216fd2…`, section: ships, line: _root, slug: freedom-of-the-seas)*
  - `assets/ships/mariner-of-the-seas-FOM- - 1.webp`  *(md5 `94486f216fd2…`, section: ships, line: _root, slug: mariner-of-the-seas)*

- **near-duplicate used for DIFFERENT entities: freedom-of-the-seas, mariner-of-the-seas**
  - `assets/ships/freedom-of-the-seas-FOM- - 3.jpeg`  *(md5 `0ca717f7483b…`, section: ships, line: _root, slug: freedom-of-the-seas)*
  - `assets/ships/mariner-of-the-seas-FOM- - 2.jpeg`  *(md5 `0ca717f7483b…`, section: ships, line: _root, slug: mariner-of-the-seas)*
  - `assets/ships/freedom-of-the-seas-FOM- - 3.webp`  *(md5 `85ab8d842134…`, section: ships, line: _root, slug: freedom-of-the-seas)*
  - `assets/ships/mariner-of-the-seas-FOM- - 2.webp`  *(md5 `85ab8d842134…`, section: ships, line: _root, slug: mariner-of-the-seas)*

## ℹ️ INFO — Intra-entity recrops/recompresses (29)

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/ships/2009_05_09_Kirchdorf.JPG`  *(md5 `6b925d34443e…`, section: ships, line: _root)*
  - `assets/ships/2009_05_09_Kirchdorf.webp`  *(md5 `2b35803dfe88…`, section: ships, line: _root)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/ships/2560px-BOS_at_Valetta_121410.JPG`  *(md5 `c1ccbb351758…`, section: ships, line: _root)*
  - `assets/ships/2560px-BOS_at_Valetta_121410.webp`  *(md5 `9822f18c032b…`, section: ships, line: _root)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/ships/Avenida_do_Mar,_Funchal_-_29_Jan_2012_-_SDC15832.JPG`  *(md5 `6858848cbc49…`, section: ships, line: _root)*
  - `assets/ships/Avenida_do_Mar,_Funchal_-_29_Jan_2012_-_SDC15832.webp`  *(md5 `b764bfda6ec7…`, section: ships, line: _root)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/ships/grandeur-of-the-seas_01.webp`  *(md5 `47d160f86e40…`, section: ships, line: _root, slug: grandeur-of-the-seas)*
  - `assets/ships/template_01.webp`  *(md5 `47d160f86e40…`, section: ships, line: _root)*
  - `assets/img/Cordelia_Empress_Food_Court.jpg`  *(md5 `2efd1cc647cb…`, section: ships, line: _legacy)*
  - `assets/img/Cordelia_Empress_Food_Court.webp`  *(md5 `f6eeeaebf2f1…`, section: ships, line: _legacy)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/ships/liberty-radiance-wonder - 1.jpeg`  *(md5 `0c968fb801b4…`, section: ships, line: _root)*
  - `assets/ships/liberty-radiance-wonder - 1.webp`  *(md5 `9c1822ca2a82…`, section: ships, line: _root)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/articles/freedom-of-your-own-wake.jpg`  *(md5 `d0565e27f583…`, section: articles, line: _generic)*
  - `assets/articles/freedom-of-your-own-wake.webp`  *(md5 `b9860680bdaf…`, section: articles, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/articles/ncl-jade.png`  *(md5 `20e5b20321c7…`, section: articles, line: _generic)*
  - `assets/articles/ncl-jade.webp`  *(md5 `0860106e84a8…`, section: articles, line: _generic)*
  - `assets/articles/why-i-started-solo-cruising.jpg`  *(md5 `03ee7e39acc9…`, section: articles, line: _generic)*
  - `assets/articles/why-i-started-solo-cruising.webp`  *(md5 `fe13a83aa91e…`, section: articles, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/articles/thumbs/ncl-jade.webp`  *(md5 `478abe7ccb46…`, section: articles, line: _generic)*
  - `assets/articles/thumbs/why-i-started-solo-cruising.webp`  *(md5 `419a7b6170b0…`, section: articles, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/articles/top-20-questions/cover.jpg`  *(md5 `d78f6929765d…`, section: articles, line: _generic)*
  - `assets/articles/top-20-questions/cover.webp`  *(md5 `e76cde546ec5…`, section: articles, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/bionic-bar-1200w.webp`  *(md5 `eee9fd7a85f7…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/bionic-bar-720w.webp`  *(md5 `71b048e81854…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/cafe-promenade-1200w.webp`  *(md5 `42a651c240c6…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/cafe-promenade-720w.webp`  *(md5 `f2d7dfd7e031…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/chic-1200w.webp`  *(md5 `8fc147c8de72…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/chic-720w.webp`  *(md5 `409a6a2f537a…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/chops-grille-1200w.webp`  *(md5 `5412f81700a1…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/chops-grille-720w.webp`  *(md5 `3ea2d8af67af…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/coastal-kitchen-1200w.webp`  *(md5 `cfae2046a2d1…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/coastal-kitchen-720w.webp`  *(md5 `22be9a7224ce…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/crown-lounge-1200w.webp`  *(md5 `ff70fb1a3bb0…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/crown-lounge-720w.webp`  *(md5 `7b427131a368…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/grande-1200w.webp`  *(md5 `94f36cde2b42…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/grande-720w.webp`  *(md5 `4fec0c2b4666…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/harp-and-horn-1200w.webp`  *(md5 `85005c011aad…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/harp-and-horn-720w.webp`  *(md5 `f94aee231f19…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/izumi-1200w.webp`  *(md5 `8525b48a7793…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/izumi-720w.webp`  *(md5 `31af4410c283…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/music-hall-1200w.webp`  *(md5 `04a679d00381…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/music-hall-720w.webp`  *(md5 `dea7ba0d4e44…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/schooner-bar-1200w.webp`  *(md5 `32e78ee73d19…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/schooner-bar-720w.webp`  *(md5 `050de6b9b4da…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/sonic-odyssey-1200w.webp`  *(md5 `f4489b40f7c5…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/sonic-odyssey-720w.webp`  *(md5 `b2cc6a5dcbaf…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/sorrentos-1200w.webp`  *(md5 `8c79f5b4e1b1…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/sorrentos-720w.webp`  *(md5 `60c1514ec70c…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/the-shop-1200w.webp`  *(md5 `c64cdb130014…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/the-shop-720w.webp`  *(md5 `3ba77ab66b52…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/two70-1200w.webp`  *(md5 `b235185cd42d…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/two70-720w.webp`  *(md5 `e4106aab9609…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/windjammer-1200w.webp`  *(md5 `a6f9bfc2d551…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/windjammer-720w.webp`  *(md5 `a1df93616636…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `assets/images/restaurants/photos/venues/wonderland-1200w.webp`  *(md5 `93d4dfa7ecb1…`, section: restaurants, line: _generic)*
  - `assets/images/restaurants/photos/venues/wonderland-720w.webp`  *(md5 `048d64d4dd18…`, section: restaurants, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `authors/img/ico/tina1ico.webp`  *(md5 `6397e326c4f0…`, section: authors, line: _generic)*
  - `authors/img/tina1.webp`  *(md5 `e7e4600836fb…`, section: authors, line: _generic)*
  - `authors/img/tina1_192.webp`  *(md5 `04b28a3fd532…`, section: authors, line: _generic)*
  - `authors/img/tina1_96.webp`  *(md5 `103a52c3bd16…`, section: authors, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `authors/img/ico/tina2ico.webp`  *(md5 `d5cbc169392f…`, section: authors, line: _generic)*
  - `authors/img/tina2.webp`  *(md5 `32572a8dca2b…`, section: authors, line: _generic)*
  - `authors/tina2.webp`  *(md5 `32572a8dca2b…`, section: authors, line: _generic)*
  - `authors/img/tina2_192.webp`  *(md5 `d9d57f2bdf7e…`, section: authors, line: _generic)*
  - `authors/img/tina2_96.webp`  *(md5 `e568d4e90b11…`, section: authors, line: _generic)*

- **near-duplicate within one entity (likely a recompress/recrop variant)**
  - `authors/img/ico/tina3ico.webp`  *(md5 `28606d81437f…`, section: authors, line: _generic)*
  - `authors/img/tina3.webp`  *(md5 `2e7455fe878f…`, section: authors, line: _generic)*
  - `authors/tina3.webp`  *(md5 `2e7455fe878f…`, section: authors, line: _generic)*
  - `authors/img/tina3_192.webp`  *(md5 `78e4903b9127…`, section: authors, line: _generic)*
  - `authors/img/tina3_96.webp`  *(md5 `29d63d4e7089…`, section: authors, line: _generic)*

