# Site-wide image-reuse audit

**Generated:** 2026-05-07T12:22:51.453Z
**Images scanned:** 1300
**Unique image bytes:** 1218
**Storage waste:** 82 duplicate file(s) on disk

**⛔ SYMLINKS (always blocking):** 328
**🔴 CRITICAL findings:** 6
**🟠 ERROR findings:** 20
**🟡 WARN (filename does not match a slug):** 0
**ℹ️  INFO (intra-entity duplicates):** 12

Allowlisted sections (brand / icons / social) are not flagged for reuse.

---

## ⛔ SYMLINKS — always blocking (328)

Symlinks point at someone else's image. They are reuse with extra steps and extra deniability. Every symlink in a site image tree must be replaced with either an actual file (with its own attribution row) or removed.

- `assets/ships/1993-Independence_of_the_seas_na_Coruña.webp` → `1993-Independence_of_the_seas_na_Coruña.webp`
- `assets/ships/Adventure_of_the_Seas_02.webp` → `Adventure_of_the_Seas_(ship,_2001)_comes_back_to_Grand_Cayman_(April_2025).webp`
- `assets/ships/Adventure_of_the_Seas_03.webp` → `Adventure_of_the_Seas_(ship,_2001)_comes_back_to_Grand_Cayman_(April_2025).webp`
- `assets/ships/Adventure_of_the_Seas_04.webp` → `Adventure_of_the_Seas_(ship,_2001)_comes_back_to_Grand_Cayman_(April_2025).webp`
- `assets/ships/Caribbean_Princess_aerial.jpg` → `Caribbean_Princess_Belfast.jpg`
- `assets/ships/Caribbean_Princess_bow.jpg` → `Caribbean_Princess_Belfast.jpg`
- `assets/ships/Caribbean_Princess_deck.jpg` → `Caribbean_Princess_Belfast.jpg`
- `assets/ships/Caribbean_Princess_night.jpg` → `Caribbean_Princess_Belfast.jpg`
- `assets/ships/Caribbean_Princess_profile.jpg` → `Caribbean_Princess_Belfast.jpg`
- `assets/ships/Caribbean_Princess_stern.jpg` → `Caribbean_Princess_Belfast.jpg`
- `assets/ships/Coral_Princess_aerial.jpg` → `Coral_Princess_sunset.jpg`
- `assets/ships/Coral_Princess_bow.jpg` → `Coral_Princess_sunset.jpg`
- `assets/ships/Coral_Princess_port_arrival.jpg` → `Coral_Princess_sunset.jpg`
- `assets/ships/Coral_Princess_profile.jpg` → `Coral_Princess_sunset.jpg`
- `assets/ships/Coral_Princess_sea.jpg` → `Coral_Princess_sunset.jpg`
- `assets/ships/Coral_Princess_stern.jpg` → `Coral_Princess_sunset.jpg`
- `assets/ships/Coral_Princess_sunset.jpg` → `Sun_Viking_at_Ocean_Terminal,_Hong_Kong.webp`
- `assets/ships/Crown_Princess_atrium.jpg` → `princess/crown-princess-exterior.jpg`
- `assets/ships/Crown_Princess_bow.jpg` → `princess/crown-princess-exterior.jpg`
- `assets/ships/Crown_Princess_dining.jpg` → `princess/crown-princess-exterior.jpg`
- `assets/ships/Crown_Princess_pool.jpg` → `princess/crown-princess-exterior.jpg`
- `assets/ships/Crown_Princess_sanctuary.jpg` → `princess/crown-princess-exterior.jpg`
- `assets/ships/Crown_Princess_stern.jpg` → `princess/crown-princess-exterior.jpg`
- `assets/ships/Crown_Princess_theater.jpg` → `princess/crown-princess-exterior.jpg`
- `assets/ships/Cádiz_-_Crucero_Star_of_the_Seas,_atracado_en_el_puerto_de_Cádiz_(25_julio_2025)_01.webp` → `Star_of_the_Seas_Pansio_2024-1.jpeg`
- `assets/ships/Diamond_Princess_Yokohama.jpg` → `Diamond_Princess_Sakaiminato.jpg`
- `assets/ships/Diamond_Princess_atrium.jpg` → `Diamond_Princess_Sakaiminato.jpg`
- `assets/ships/Diamond_Princess_bow.jpg` → `Diamond_Princess_Sakaiminato.jpg`
- `assets/ships/Diamond_Princess_izumi.jpg` → `Diamond_Princess_Sakaiminato.jpg`
- `assets/ships/Diamond_Princess_pool.jpg` → `Diamond_Princess_Sakaiminato.jpg`
- `assets/ships/Diamond_Princess_stern.jpg` → `Diamond_Princess_Sakaiminato.jpg`
- `assets/ships/Enchanted_Princess_balcony.jpg` → `Enchanted_Princess_exterior.jpg`
- `assets/ships/Enchanted_Princess_dining.jpg` → `Enchanted_Princess_exterior.jpg`
- `assets/ships/Enchanted_Princess_movies.jpg` → `Enchanted_Princess_exterior.jpg`
- `assets/ships/Enchanted_Princess_piazza.jpg` → `Enchanted_Princess_exterior.jpg`
- `assets/ships/Enchanted_Princess_pool.jpg` → `Enchanted_Princess_exterior.jpg`
- `assets/ships/Enchanted_Princess_seawalk.jpg` → `Enchanted_Princess_exterior.jpg`
- `assets/ships/Enchanted_Princess_sunset.jpg` → `Enchanted_Princess_exterior.jpg`
- `assets/ships/Explorer_of_the_Seas_02.webp` → `Explorer_of_the_Sea_in_Ålesund.webp`
- `assets/ships/Explorer_of_the_Seas_03.webp` → `Explorer_of_the_Sea_in_Ålesund.webp`
- `assets/ships/Explorer_of_the_Seas_04.webp` → `Explorer_of_the_Sea_in_Ålesund.webp`
- `assets/ships/Icon_and_Mariner_Cozumel_Mexico_2024.jpg` → `Icon_and_Mariner_Cozumel_Mexico_2024.webp`
- `assets/ships/Icon_of_the_Seas_(cropped).jpg` → `Icon_and_Mariner_Cozumel_Mexico_2024.webp`
- `assets/ships/Icon_of_the_Seas_(kahunapulej).jpg` → `Icon_and_Mariner_Cozumel_Mexico_2024.webp`
- `assets/ships/Icon_of_the_Seas_stern_in_Philipsburg,_Sint_Maarten.jpg` → `Icon_and_Mariner_Cozumel_Mexico_2024.webp`
- `assets/ships/Island_Princess_aerial.jpg` → `Island_Princess_sunset.jpg`
- `assets/ships/Island_Princess_bow.jpg` → `Island_Princess_sunset.jpg`
- `assets/ships/Island_Princess_port_arrival.jpg` → `Island_Princess_sunset.jpg`
- `assets/ships/Island_Princess_profile.jpg` → `Island_Princess_sunset.jpg`
- `assets/ships/Island_Princess_sea.jpg` → `Island_Princess_sunset.jpg`
- `assets/ships/Island_Princess_stern.jpg` → `Island_Princess_sunset.jpg`
- `assets/ships/Island_Princess_sunset.jpg` → `Sun_Viking_at_Ocean_Terminal,_Hong_Kong.webp`
- `assets/ships/Majestic_Princess_Sydney.jpg` → `Majestic_Princess_Fremantle.jpg`
- `assets/ships/Majestic_Princess_aerial.jpg` → `Majestic_Princess_Fremantle.jpg`
- `assets/ships/Majestic_Princess_dock.jpg` → `Majestic_Princess_Fremantle.jpg`
- `assets/ships/Majestic_Princess_night.jpg` → `Majestic_Princess_Fremantle.jpg`
- `assets/ships/Majestic_Princess_profile.jpg` → `Majestic_Princess_Fremantle.jpg`
- `assets/ships/Majestic_Princess_sea.jpg` → `Majestic_Princess_Fremantle.jpg`
- `assets/ships/Majestic_Princess_stern.jpg` → `Majestic_Princess_Fremantle.jpg`
- `assets/ships/Navigator_of_the_Seas,_Puerto_de_la_Bahía_de_Cádiz.webp` → `Navigator_of_the_Seas,_Puerto_de_la_Bahía_de_Cádiz.webp`
- `assets/ships/Regal_Princess_Barcelona.jpg` → `Regal_Princess_Warnemunde.jpg`
- `assets/ships/Regal_Princess_movies_under_stars.jpg` → `Regal_Princess_Warnemunde.jpg`
- `assets/ships/Regal_Princess_piazza.jpg` → `Regal_Princess_Warnemunde.jpg`
- `assets/ships/Regal_Princess_profile.jpg` → `Regal_Princess_Warnemunde.jpg`
- `assets/ships/Regal_Princess_sea.jpg` → `Regal_Princess_Warnemunde.jpg`
- `assets/ships/Regal_Princess_seawalk.jpg` → `Regal_Princess_Warnemunde.jpg`
- `assets/ships/Regal_Princess_stern.jpg` → `Regal_Princess_Warnemunde.jpg`
- `assets/ships/Royal_Princess_bow.jpg` → `Royal_Caribbean_Spectrum_of_the_Seas_19-08-2023(2).webp`
- `assets/ships/Royal_Princess_piazza.jpg` → `Royal_Caribbean_Spectrum_of_the_Seas_19-08-2023(2).webp`
- `assets/ships/Royal_Princess_pool.jpg` → `Royal_Caribbean_Spectrum_of_the_Seas_19-08-2023(2).webp`
- `assets/ships/Royal_Princess_seawalk.jpg` → `Royal_Caribbean_Spectrum_of_the_Seas_19-08-2023(2).webp`
- `assets/ships/Royal_Princess_stern.jpg` → `Royal_Caribbean_Spectrum_of_the_Seas_19-08-2023(2).webp`
- `assets/ships/Sapphire_Princess_atrium.jpg` → `princess/diamond-princess-exterior.jpg`
- `assets/ships/Sapphire_Princess_bow.jpg` → `princess/diamond-princess-exterior.jpg`
- `assets/ships/Sapphire_Princess_dining.jpg` → `princess/diamond-princess-exterior.jpg`
- `assets/ships/Sapphire_Princess_exterior.jpg` → `princess/diamond-princess-exterior.jpg`
- `assets/ships/Sapphire_Princess_pool.jpg` → `princess/diamond-princess-exterior.jpg`
- `assets/ships/Sapphire_Princess_stateroom.jpg` → `princess/diamond-princess-exterior.jpg`
- `assets/ships/Sapphire_Princess_stern.jpg` → `princess/diamond-princess-exterior.jpg`
- `assets/ships/Sapphire_Princess_theater.jpg` → `princess/diamond-princess-exterior.jpg`
- `assets/ships/Sky_Princess_dining.jpg` → `Sky_Princess_Trieste.jpg`
- `assets/ships/Sky_Princess_movies.jpg` → `Sky_Princess_Trieste.jpg`
- `assets/ships/Sky_Princess_piazza.jpg` → `Sky_Princess_Trieste.jpg`
- `assets/ships/Sky_Princess_pool.jpg` → `Sky_Princess_Trieste.jpg`
- `assets/ships/Sky_Princess_seawalk.jpg` → `Sky_Princess_Trieste.jpg`
- `assets/ships/Sky_Princess_sky_suite.jpg` → `Sky_Princess_Trieste.jpg`
- `assets/ships/Sky_Princess_sunset.jpg` → `Sky_Princess_Trieste.jpg`
- `assets/ships/Star_Princess_deck.jpg` → `Star_of_the_Seas_Pansio_2024-1.jpeg`
- `assets/ships/Star_Princess_exterior.jpg` → `Star_of_the_Seas_Pansio_2024-1.jpeg`
- `assets/ships/Star_Princess_profile.jpg` → `Star_of_the_Seas_Pansio_2024-1.jpeg`
- `assets/ships/Star_Princess_sea.jpg` → `Star_of_the_Seas_Pansio_2024-1.jpeg`
- `assets/ships/Star_Princess_sphere.jpg` → `Star_of_the_Seas_Pansio_2024-1.jpeg`
- `assets/ships/Star_Princess_stern.jpg` → `Star_of_the_Seas_Pansio_2024-1.jpeg`
- `assets/ships/Star_Princess_sunset.jpg` → `Star_of_the_Seas_Pansio_2024-1.jpeg`
- `assets/ships/Sun_Princess_Sphere.jpg` → `Sun_Viking_at_Ocean_Terminal,_Hong_Kong.webp`
- `assets/ships/Sun_Princess_bow.jpg` → `Sun_Viking_at_Ocean_Terminal,_Hong_Kong.webp`
- `assets/ships/Sun_Princess_dining.jpg` → `Sun_Viking_at_Ocean_Terminal,_Hong_Kong.webp`
- `assets/ships/Sun_Princess_dock.jpg` → `Sun_Viking_at_Ocean_Terminal,_Hong_Kong.webp`
- `assets/ships/Sun_Princess_pool.jpg` → `Sun_Viking_at_Ocean_Terminal,_Hong_Kong.webp`
- `assets/ships/Sun_Princess_sea.jpg` → `Sun_Viking_at_Ocean_Terminal,_Hong_Kong.webp`
- `assets/ships/Sun_Princess_stern.jpg` → `Sun_Viking_at_Ocean_Terminal,_Hong_Kong.webp`
- `assets/ships/Voyager_of_the_Seas_(8194516843).webp` → `Voyager_of_the_Seas_04.webp`
- `assets/ships/Voyager_of_the_Seas_04.webp` → `"Voyager_of_the_Seas"_(8194516843).webp`
- `assets/ships/Wonder_of_the_Seas_atracando_en_Cartagena-España-.webp` → `Wonder_of_the_Seas_-_August_2021.png`
- `assets/ships/carnival-breeze_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-celebration-thumb.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-elation1.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-elation2.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-elation3.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-encounter1.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-encounter2.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-encounter3.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-firenze_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-firenze_02.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-firenze_03.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-firenze_04.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-firenze_05.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-firenze_06.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-firenze_07.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-firenze_08.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-horizon-thumb.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-jubilee-thumb.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-legend_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-luminosa_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-luminosa_02.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-luminosa_03.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-luminosa_04.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-magic_01.webp` → `Carnival_Magic_001.jpg`
- `assets/ships/carnival-mardi-gras-thumb.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-panorama-pool.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-panorama-thumb.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-paradise_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-paradise_02.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-paradise_03.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-paradise_04.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-paradise_05.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-paradise_06.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-paradise_07.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-paradise_08.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-pride_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-radiance_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-radiance_02.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-radiance_03.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-radiance_04.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-radiance_05.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-radiance_06.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-radiance_07.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-radiance_08.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-spirit_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-splendor_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-splendor_02.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-splendor_03.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-splendor_04.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-splendor_05.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-splendor_06.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-splendor_07.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-splendor_08.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunrise_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunrise_02.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunrise_03.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunrise_04.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunrise_05.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunrise_06.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunrise_07.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunrise_08.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunshine_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunshine_02.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunshine_03.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunshine_04.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunshine_05.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunshine_06.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunshine_07.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-sunshine_08.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-venezia-thumb.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-venezia_01.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-venezia_02.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-venezia_03.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-venezia_04.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-venezia_05.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-venezia_06.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-venezia_07.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-venezia_08.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-vista-thumb.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/carnival-vista_04.webp` → `Carnival_Breeze_001.jpg`
- `assets/ships/celebrity-apex_01.webp` → `celebrity/celebrity-apex-exterior.jpg`
- `assets/ships/celebrity-apex_02.webp` → `celebrity/celebrity-apex-exterior.jpg`
- `assets/ships/celebrity-apex_03.webp` → `celebrity/celebrity-apex-exterior.jpg`
- `assets/ships/celebrity-apex_04.webp` → `celebrity/celebrity-apex-exterior.jpg`
- `assets/ships/celebrity-apex_05.webp` → `celebrity/celebrity-apex-exterior.jpg`
- `assets/ships/celebrity-apex_06.webp` → `celebrity/celebrity-apex-exterior.jpg`
- `assets/ships/celebrity-apex_07.webp` → `celebrity/celebrity-apex-exterior.jpg`
- `assets/ships/celebrity-apex_08.webp` → `celebrity/celebrity-apex-exterior.jpg`
- `assets/ships/celebrity-ascent_01.webp` → `celebrity/celebrity-ascent-exterior.jpg`
- `assets/ships/celebrity-ascent_02.webp` → `celebrity/celebrity-ascent-exterior.jpg`
- `assets/ships/celebrity-ascent_03.webp` → `celebrity/celebrity-ascent-exterior.jpg`
- `assets/ships/celebrity-ascent_04.webp` → `celebrity/celebrity-ascent-exterior.jpg`
- `assets/ships/celebrity-ascent_05.webp` → `celebrity/celebrity-ascent-exterior.jpg`
- `assets/ships/celebrity-ascent_06.webp` → `celebrity/celebrity-ascent-exterior.jpg`
- `assets/ships/celebrity-ascent_07.webp` → `celebrity/celebrity-ascent-exterior.jpg`
- `assets/ships/celebrity-ascent_08.webp` → `celebrity/celebrity-ascent-exterior.jpg`
- `assets/ships/celebrity-beyond_01.webp` → `celebrity/celebrity-beyond-exterior.jpg`
- `assets/ships/celebrity-beyond_02.webp` → `celebrity/celebrity-beyond-exterior.jpg`
- `assets/ships/celebrity-beyond_03.webp` → `celebrity/celebrity-beyond-exterior.jpg`
- `assets/ships/celebrity-beyond_04.webp` → `celebrity/celebrity-beyond-exterior.jpg`
- `assets/ships/celebrity-beyond_05.webp` → `celebrity/celebrity-beyond-exterior.jpg`
- `assets/ships/celebrity-beyond_06.webp` → `celebrity/celebrity-beyond-exterior.jpg`
- `assets/ships/celebrity-beyond_07.webp` → `celebrity/celebrity-beyond-exterior.jpg`
- `assets/ships/celebrity-beyond_08.webp` → `celebrity/celebrity-beyond-exterior.jpg`
- `assets/ships/celebrity-eclipse_01.webp` → `celebrity/celebrity-eclipse-exterior.jpg`
- `assets/ships/celebrity-eclipse_02.webp` → `celebrity/celebrity-eclipse-exterior.jpg`
- `assets/ships/celebrity-eclipse_03.webp` → `celebrity/celebrity-eclipse-exterior.jpg`
- `assets/ships/celebrity-eclipse_04.webp` → `celebrity/celebrity-eclipse-exterior.jpg`
- `assets/ships/celebrity-eclipse_05.webp` → `celebrity/celebrity-eclipse-exterior.jpg`
- `assets/ships/celebrity-eclipse_06.webp` → `celebrity/celebrity-eclipse-exterior.jpg`
- `assets/ships/celebrity-eclipse_07.webp` → `celebrity/celebrity-eclipse-exterior.jpg`
- `assets/ships/celebrity-eclipse_08.webp` → `celebrity/celebrity-eclipse-exterior.jpg`
- `assets/ships/celebrity-edge_01.webp` → `celebrity/celebrity-edge-exterior.jpg`
- `assets/ships/celebrity-edge_02.webp` → `celebrity/celebrity-edge-exterior.jpg`
- `assets/ships/celebrity-edge_03.webp` → `celebrity/celebrity-edge-exterior.jpg`
- `assets/ships/celebrity-edge_04.webp` → `celebrity/celebrity-edge-exterior.jpg`
- `assets/ships/celebrity-edge_05.webp` → `celebrity/celebrity-edge-exterior.jpg`
- `assets/ships/celebrity-edge_06.webp` → `celebrity/celebrity-edge-exterior.jpg`
- `assets/ships/celebrity-edge_07.webp` → `celebrity/celebrity-edge-exterior.jpg`
- `assets/ships/celebrity-edge_08.webp` → `celebrity/celebrity-edge-exterior.jpg`
- `assets/ships/celebrity-equinox_01.webp` → `celebrity/celebrity-equinox-exterior.jpg`
- `assets/ships/celebrity-equinox_02.webp` → `celebrity/celebrity-equinox-exterior.jpg`
- `assets/ships/celebrity-equinox_03.webp` → `celebrity/celebrity-equinox-exterior.jpg`
- `assets/ships/celebrity-equinox_04.webp` → `celebrity/celebrity-equinox-exterior.jpg`
- `assets/ships/celebrity-equinox_05.webp` → `celebrity/celebrity-equinox-exterior.jpg`
- `assets/ships/celebrity-equinox_06.webp` → `celebrity/celebrity-equinox-exterior.jpg`
- `assets/ships/celebrity-equinox_07.webp` → `celebrity/celebrity-equinox-exterior.jpg`
- `assets/ships/celebrity-equinox_08.webp` → `celebrity/celebrity-equinox-exterior.jpg`
- `assets/ships/celebrity-reflection_01.webp` → `celebrity/celebrity-reflection-exterior.jpg`
- `assets/ships/celebrity-reflection_02.webp` → `celebrity/celebrity-reflection-exterior.jpg`
- `assets/ships/celebrity-reflection_03.webp` → `celebrity/celebrity-reflection-exterior.jpg`
- `assets/ships/celebrity-reflection_04.webp` → `celebrity/celebrity-reflection-exterior.jpg`
- `assets/ships/celebrity-reflection_05.webp` → `celebrity/celebrity-reflection-exterior.jpg`
- `assets/ships/celebrity-reflection_06.webp` → `celebrity/celebrity-reflection-exterior.jpg`
- `assets/ships/celebrity-reflection_07.webp` → `celebrity/celebrity-reflection-exterior.jpg`
- `assets/ships/celebrity-reflection_08.webp` → `celebrity/celebrity-reflection-exterior.jpg`
- `assets/ships/celebrity-silhouette_01.webp` → `celebrity/celebrity-silhouette-exterior.jpg`
- `assets/ships/celebrity-silhouette_02.webp` → `celebrity/celebrity-silhouette-exterior.jpg`
- `assets/ships/celebrity-silhouette_03.webp` → `celebrity/celebrity-silhouette-exterior.jpg`
- `assets/ships/celebrity-silhouette_04.webp` → `celebrity/celebrity-silhouette-exterior.jpg`
- `assets/ships/celebrity-silhouette_05.webp` → `celebrity/celebrity-silhouette-exterior.jpg`
- `assets/ships/celebrity-silhouette_06.webp` → `celebrity/celebrity-silhouette-exterior.jpg`
- `assets/ships/celebrity-silhouette_07.webp` → `celebrity/celebrity-silhouette-exterior.jpg`
- `assets/ships/celebrity-silhouette_08.webp` → `celebrity/celebrity-silhouette-exterior.jpg`
- `assets/ships/celebrity-solstice_01.webp` → `celebrity/celebrity-solstice-exterior.jpg`
- `assets/ships/celebrity-solstice_02.webp` → `celebrity/celebrity-solstice-exterior.jpg`
- `assets/ships/celebrity-solstice_03.webp` → `celebrity/celebrity-solstice-exterior.jpg`
- `assets/ships/celebrity-solstice_04.webp` → `celebrity/celebrity-solstice-exterior.jpg`
- `assets/ships/celebrity-solstice_05.webp` → `celebrity/celebrity-solstice-exterior.jpg`
- `assets/ships/celebrity-solstice_06.webp` → `celebrity/celebrity-solstice-exterior.jpg`
- `assets/ships/celebrity-solstice_07.webp` → `celebrity/celebrity-solstice-exterior.jpg`
- `assets/ships/celebrity-solstice_08.webp` → `celebrity/celebrity-solstice-exterior.jpg`
- `assets/ships/koningsdam_01.webp` → `other/koningsdam-exterior.jpg`
- `assets/ships/koningsdam_02.webp` → `other/koningsdam-exterior.jpg`
- `assets/ships/koningsdam_03.webp` → `other/koningsdam-exterior.jpg`
- `assets/ships/koningsdam_04.webp` → `other/koningsdam-exterior.jpg`
- `assets/ships/koningsdam_05.webp` → `other/koningsdam-exterior.jpg`
- `assets/ships/koningsdam_06.webp` → `other/koningsdam-exterior.jpg`
- `assets/ships/koningsdam_07.webp` → `other/koningsdam-exterior.jpg`
- `assets/ships/koningsdam_08.webp` → `other/koningsdam-exterior.jpg`
- `assets/ships/msc-world-europa_01.webp` → `MSC_Meraviglia_exterior.jpg`
- `assets/ships/msc-world-europa_02.webp` → `MSC_Meraviglia_exterior.jpg`
- `assets/ships/msc-world-europa_03.webp` → `MSC_Meraviglia_exterior.jpg`
- `assets/ships/msc-world-europa_04.webp` → `MSC_Meraviglia_exterior.jpg`
- `assets/ships/msc-world-europa_05.webp` → `MSC_Meraviglia_exterior.jpg`
- `assets/ships/msc-world-europa_06.webp` → `MSC_Meraviglia_exterior.jpg`
- `assets/ships/msc-world-europa_07.webp` → `MSC_Meraviglia_exterior.jpg`
- `assets/ships/msc-world-europa_08.webp` → `MSC_Meraviglia_exterior.jpg`
- `assets/ships/nieuw-statendam_01.webp` → `Nieuw_Amsterdam_exterior.jpg`
- `assets/ships/nieuw-statendam_02.webp` → `Nieuw_Amsterdam_exterior.jpg`
- `assets/ships/nieuw-statendam_03.webp` → `Nieuw_Amsterdam_exterior.jpg`
- `assets/ships/nieuw-statendam_04.webp` → `Nieuw_Amsterdam_exterior.jpg`
- `assets/ships/nieuw-statendam_05.webp` → `Nieuw_Amsterdam_exterior.jpg`
- `assets/ships/nieuw-statendam_06.webp` → `Nieuw_Amsterdam_exterior.jpg`
- `assets/ships/nieuw-statendam_07.webp` → `Nieuw_Amsterdam_exterior.jpg`
- `assets/ships/nieuw-statendam_08.webp` → `Nieuw_Amsterdam_exterior.jpg`
- `assets/ships/norwegian-bliss_01.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-bliss_02.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-bliss_03.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-bliss_04.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-bliss_05.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-bliss_06.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-bliss_07.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-bliss_08.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-encore_01.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-encore_02.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-encore_03.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-encore_04.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-encore_05.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-encore_06.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-encore_07.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-encore_08.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-escape_01.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-escape_02.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-escape_03.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-escape_04.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-escape_05.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-escape_06.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-escape_07.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-escape_08.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-gem_01.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-gem_02.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-gem_03.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-gem_04.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-gem_05.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-gem_06.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-gem_07.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-gem_08.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-spirit_01.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-spirit_02.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-spirit_03.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-spirit_04.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-spirit_05.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-spirit_06.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-spirit_07.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/norwegian-spirit_08.webp` → `Norwegian_Aqua_NYC.jpg`
- `assets/ships/rotterdam_01.webp` → `other/nieuw-statendam-exterior.jpg`
- `assets/ships/rotterdam_02.webp` → `other/nieuw-statendam-exterior.jpg`
- `assets/ships/rotterdam_03.webp` → `other/nieuw-statendam-exterior.jpg`
- `assets/ships/rotterdam_04.webp` → `other/nieuw-statendam-exterior.jpg`
- `assets/ships/rotterdam_05.webp` → `other/nieuw-statendam-exterior.jpg`
- `assets/ships/rotterdam_06.webp` → `other/nieuw-statendam-exterior.jpg`
- `assets/ships/rotterdam_07.webp` → `other/nieuw-statendam-exterior.jpg`
- `assets/ships/rotterdam_08.webp` → `other/nieuw-statendam-exterior.jpg`

## 🔴 CRITICAL — Cross-section / cross-line image reuse (6)

- **md5 `396ec3cf5dc83045ffc317bbee011887`** — same bytes appear in legacy/root bucket without a resolvable slug — provenance unclear
  - `assets/ships/carnival-glory_01.webp`  *(section: ships, line: _root, slug: carnival-glory)*
  - `assets/img/cruise-features-hero.webp`  *(section: ships, line: _legacy)*

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

- **md5 `4c69e1133d962d29552919bbf10f957c`** — same bytes used across DIFFERENT sections: articles, authors
  - `assets/articles/ken1.webp`  *(section: articles, line: _generic)*
  - `authors/img/ken1.webp`  *(section: authors, line: _generic)*

## 🟠 ERROR — Same-section different-entity reuse (20)

- **md5 `19255bbf7e5450ff50b001282899ac7d`** — same bytes used for DIFFERENT entities (celebrity-compass, celebrity-seeker) within the same line
  - `assets/ships/Celebrity_Compass_flickr_gabry92g.webp`  *(section: ships, line: _root, slug: celebrity-compass)*
  - `assets/ships/Celebrity_Seeker_flickr_gabry92g.webp`  *(section: ships, line: _root, slug: celebrity-seeker)*

- **md5 `a4849940a7a5871319be72e329d48b50`** — same bytes used for DIFFERENT entities (explora-iv, explora-v) within the same line
  - `assets/ships/Explora_Iv_flickr_gabry92g.webp`  *(section: ships, line: _root, slug: explora-iv)*
  - `assets/ships/Explora_V_flickr_gabry92g.webp`  *(section: ships, line: _root, slug: explora-v)*

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

- **md5 `5e693afed0f13e4cf21e3abcbafcd8a0`** — same bytes used for DIFFERENT entities (oasis-of-the-seas, serenade-of-the-seas) within the same line
  - `assets/ships/Oasis-of-the-seas-FOM- - 1.jpeg`  *(section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-4.jpeg`  *(section: ships, line: _root, slug: serenade-of-the-seas)*

- **md5 `868f2e3a475527349103c69dcb322611`** — same bytes used for DIFFERENT entities (oasis-of-the-seas, serenade-of-the-seas) within the same line
  - `assets/ships/Oasis-of-the-seas-FOM- - 1.webp`  *(section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-4.webp`  *(section: ships, line: _root, slug: serenade-of-the-seas)*

- **md5 `1951bd78fc96e85fe660885597427740`** — same bytes used for DIFFERENT entities (oasis-of-the-seas, serenade-of-the-seas) within the same line
  - `assets/ships/Oasis-of-the-seas-FOM- - 3.jpeg`  *(section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-5.jpeg`  *(section: ships, line: _root, slug: serenade-of-the-seas)*

- **md5 `d9cabe12e2b0a3bafc928ad3cf63fd2b`** — same bytes used for DIFFERENT entities (oasis-of-the-seas, serenade-of-the-seas) within the same line
  - `assets/ships/Oasis-of-the-seas-FOM- - 3.webp`  *(section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-5.webp`  *(section: ships, line: _root, slug: serenade-of-the-seas)*

- **md5 `945561a41bb98619f340f92b075b6f42`** — same bytes used for DIFFERENT entities (oasis-of-the-seas, serenade-of-the-seas) within the same line
  - `assets/ships/Oasis-of-the-seas-FOM- - 4.jpeg`  *(section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-6.jpeg`  *(section: ships, line: _root, slug: serenade-of-the-seas)*

- **md5 `46ce653559b707322e0631275bff7b3b`** — same bytes used for DIFFERENT entities (oasis-of-the-seas, serenade-of-the-seas) within the same line
  - `assets/ships/Oasis-of-the-seas-FOM- - 4.webp`  *(section: ships, line: _root, slug: oasis-of-the-seas)*
  - `assets/ships/serenade-of-the-seas-FOM-6.webp`  *(section: ships, line: _root, slug: serenade-of-the-seas)*

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

## ℹ️ INFO — Storage-only duplicates within one entity (12)

- **md5 `14fdd48416a3394a80058c0c5b970b59`** — same bytes under multiple filenames for slug "quantum-of-the-seas" — pick one and delete duplicates
  - `assets/ships/0016_Quantum_of_the_Seas.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*
  - `assets/ships/Quantum_of_the_Seas_01.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*

- **md5 `ab9195854bedc4e99783ae316d2bd48c`** — same bytes under multiple filenames for slug "quantum-of-the-seas" — pick one and delete duplicates
  - `assets/ships/0018_Quantum_of_the_Seas_(2).JPG`  *(section: ships, line: _root, slug: quantum-of-the-seas)*
  - `assets/ships/0018_Quantum_of_the_Seas_(2).jpg`  *(section: ships, line: _root, slug: quantum-of-the-seas)*

- **md5 `dfe98868bbf48a04f9ee714ae5cc0b0c`** — same bytes under multiple filenames for slug "quantum-of-the-seas" — pick one and delete duplicates
  - `assets/ships/0018_Quantum_of_the_Seas_(2).webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*
  - `assets/ships/Quantum_of_the_Seas_02.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*

- **md5 `12806e1d0378f1612986f8a153041074`** — same bytes under multiple filenames for slug "carnival-conquest" — pick one and delete duplicates
  - `assets/ships/Carnival_Conquest_3.jpg`  *(section: ships, line: _root, slug: carnival-conquest)*
  - `assets/ships/carnival/carnival-conquest-exterior.jpg`  *(section: ships, line: carnival, slug: carnival-conquest)*

- **md5 `cd02f782e08577fe4dbeb2f8e650aec0`** — same bytes under multiple filenames for slug "discovery-princess" — pick one and delete duplicates
  - `assets/ships/Discovery_Princess_profile.jpg`  *(section: ships, line: _root, slug: discovery-princess)*
  - `assets/ships/Discovery_Princess_sea.jpg`  *(section: ships, line: _root, slug: discovery-princess)*

- **md5 `848deba86406a3994a963899ab193ee7`** — same bytes under multiple filenames for slug "quantum-of-the-seas" — pick one and delete duplicates
  - `assets/ships/Quantum_of_the_Seas_-_Wedel_04.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*
  - `assets/ships/Quantum_of_the_Seas_03.webp`  *(section: ships, line: _root, slug: quantum-of-the-seas)*

- **md5 `931f0598453416d7c3f3a9d4ce05f2a9`** — same bytes under multiple filenames for slug "song-of-norway" — pick one and delete duplicates
  - `assets/ships/Song_of_Norway_Vigo_(cropped)_(cropped)-2.webp`  *(section: ships, line: _root, slug: song-of-norway)*
  - `assets/ships/Song_of_Norway_Vigo_(cropped)_(cropped).webp`  *(section: ships, line: _root, slug: song-of-norway)*

- **md5 `a801dae0fc830078e60d3479d8e82fce`** — same bytes under multiple filenames for slug "symphony-of-the-seas" — pick one and delete duplicates
  - `assets/ships/SymphonyOfTheSeas_(cropped)_02-2.webp`  *(section: ships, line: _root, slug: symphony-of-the-seas)*
  - `assets/ships/SymphonyOfTheSeas_(cropped)_02.webp`  *(section: ships, line: _root, slug: symphony-of-the-seas)*

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

