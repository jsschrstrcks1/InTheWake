#!/usr/bin/env python3
"""
Stamp each per-image .attr.json sidecar with a visual_verification field
recording the manual Read-tool inspection performed 2026-05-14.

Levels:
  confirmed  : ship name/decal/IMO visible in the frame, or otherwise
               unambiguous evidence the depicted vessel is the claimed ship.
  consistent : right class + location + livery, no contradicting evidence,
               but no unique identifier visible.
  ambiguous  : visually indistinguishable from a same-class sister ship;
               identification rests on Commons uploader's attribution.

Run from repo root: python3 admin/stamp-visual-verification.py
"""
import json, sys
from pathlib import Path

VERIFICATIONS = {
    # ---- Valiant Lady -------------------------------------------------------
    "assets/ships/virgin-voyages/valiant-lady/Valiant_Lady_Feb_29_2024.webp.attr.json": (
        "confirmed", "\"VALIANT LADY\" lettering visible on hull"),
    "assets/ships/virgin-voyages/valiant-lady/ValiantLadyCarrara.webp.attr.json": (
        "consistent", "Virgin Voyages Lady-class ship at Marina di Carrara matches uploader claim; no name visible from this distance"),
    "assets/ships/virgin-voyages/valiant-lady/Valiant_Lady_arrives_at_Portsmouth_4.webp.attr.json": (
        "confirmed", "Portsmouth Spinnaker Tower visible; \"NASSAU\" registry port on stern matches Valiant Lady"),
    "assets/ships/virgin-voyages/valiant-lady/Valiant_Lady_in_Le_Havre_1.webp.attr.json": (
        "confirmed", "\"VALIANT LADY\" lettering visible on bow"),
    "assets/ships/virgin-voyages/valiant-lady/Valiant_Lady_in_Le_Havre_2.webp.attr.json": (
        "confirmed", "\"VALIANT LADY\" lettering visible on bow"),
    "assets/ships/virgin-voyages/valiant-lady/Valiant_Lady_in_Le_Havre_3.webp.attr.json": (
        "confirmed", "\"Valiant Lady\" signature visible below Virgin mermaid decal"),

    # ---- Scarlet Lady -------------------------------------------------------
    "assets/ships/virgin-voyages/scarlet-lady/Scarlet_Lady_in_Liverpool_February_2020.webp.attr.json": (
        "ambiguous", "Lady-class Virgin Voyages ship at Liverpool; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/scarlet-lady/A_lifeboat_on_the_cruise_ship_Scarlet_Lady.webp.attr.json": (
        "confirmed", "\"SCARLET LADY\" lettering visible on the lifeboat"),
    "assets/ships/virgin-voyages/scarlet-lady/Scarlet_Lady_in_Liverpool_in_February_2020.webp.attr.json": (
        "ambiguous", "Lady-class Virgin Voyages ship at Liverpool; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/scarlet-lady/Scarlet_Lady_front_side_view.webp.attr.json": (
        "ambiguous", "Lady-class profile; sideways-oriented EXIF; no name visible"),
    "assets/ships/virgin-voyages/scarlet-lady/Scarlet_Lady_back_side_view.webp.attr.json": (
        "ambiguous", "Lady-class stern with Virgin mermaid logo; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/scarlet-lady/Virgin_Voyages_-_Scarlet_Lady_-_In_partenza_dal_porto_di_Genova_-_25_09_2020.webp.attr.json": (
        "ambiguous", "Distant Lady-class ship off Genoa; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/scarlet-lady/IMO_9804801_-_Scarlet_Lady_alongside_in_Cozumel.webp.attr.json": (
        "confirmed", "\"SCARLET LADY\" lettering visible on stern; filename IMO 9804801 matches Scarlet Lady's IMO"),

    # ---- Resilient Lady -----------------------------------------------------
    "assets/ships/virgin-voyages/resilient-lady/Resilient_Lady_(ship,_2022)_catching_the_morning_sun_in_Palermo.webp.attr.json": (
        "ambiguous", "Lady-class Virgin Voyages ship at Palermo at night; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/resilient-lady/Resilient_Lady_(ship,_2022)_in_Palermo.webp.attr.json": (
        "ambiguous", "Lady-class Virgin Voyages ship at Palermo; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/resilient-lady/Resilient_Lady_(ship,_2022)_in_Palermo_(2).webp.attr.json": (
        "ambiguous", "Lady-class Virgin Voyages ship at Palermo, second angle; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/resilient-lady/Resilient_Lady_arriving_in_Rhodes_22_August_2023.webp.attr.json": (
        "ambiguous", "Distant Lady-class ship at Rhodes; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/resilient-lady/Resilient_Lady_arriving_in_Rhodes_Rhodes_22_August_2023.webp.attr.json": (
        "ambiguous", "Distant Lady-class ship through Rhodes street; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/resilient-lady/Resilient_Lady_underway_in_the_Strait_of_Rhodes_22_August_2023.webp.attr.json": (
        "ambiguous", "Lady-class ship at sea with Virgin Voyages lettering; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/resilient-lady/Resilient_Lady_passing_Aquarium_of_Rhodes_22_August_2023.webp.attr.json": (
        "ambiguous", "Distant Lady-class ship past Rhodes Aquarium grounds; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/resilient-lady/Resilient_Lady_and_Dodekanisos_Pride_passing_Elli_Beach_in_Rhodes_22_August_2023.webp.attr.json": (
        "ambiguous", "Lady-class ship + Dodekanisos Seaways ferry off Elli Beach; ferry matches filename but cruise ship visually indistinguishable from sister ships"),

    # ---- Brilliant Lady -----------------------------------------------------
    "assets/ships/virgin-voyages/brilliant-lady/Virgin_Voyages_Brilliant_Lady.webp.attr.json": (
        "ambiguous", "Lady-class Virgin Voyages ship at sea; visually indistinguishable from sister ships"),
    "assets/ships/virgin-voyages/brilliant-lady/Richard_Branson_on_Virgin_Voyages_Brilliant_Lady.webp.attr.json": (
        "ambiguous", "Richard Branson on a Virgin Voyages deck at a naming-style event; ship-identifying markers not visible in frame"),

    # ---- Wonder of the Seas -------------------------------------------------
    "assets/ships/rcl/wonder-of-the-seas/Wonder_of_the_Seas.webp.attr.json": (
        "confirmed", "\"WONDER OF THE SEAS\" lettering visible on hull"),
    "assets/ships/rcl/wonder-of-the-seas/Wonder_of_the_Seas_in_St-Nazaire_(2020).webp.attr.json": (
        "confirmed", "\"WONDER OF THE SEAS\" lettering visible on bow during Saint-Nazaire build"),
    "assets/ships/rcl/wonder-of-the-seas/Wonder_of_the_Seas_in_St-Nazaire_(2020)_(cropped).webp.attr.json": (
        "confirmed", "cropped variant of the St-Nazaire build photo; name visible on bow"),

    # ---- Mariner of the Seas ------------------------------------------------
    "assets/ships/rcl/mariner-of-the-seas/Mariner_of_the_Seas_in_San_Juan_at_Dusk.webp.attr.json": (
        "confirmed", "\"MARINER OF THE SEAS\" lettering visible on hull at San Juan at dusk"),
    "assets/ships/rcl/mariner-of-the-seas/Mariner_of_the_Seas_and_Green_Rocks.webp.attr.json": (
        "consistent", "Distant Voyager-class ship at sea; profile matches Mariner, no name visible"),
    "assets/ships/rcl/mariner-of-the-seas/MS_Mariner_of_the_Seas.webp.attr.json": (
        "consistent", "Voyager-class bow-on view; no name visible but profile + uploader claim consistent"),
    "assets/ships/rcl/mariner-of-the-seas/MS_Mariner_of_the_Seas_-_parasailing.webp.attr.json": (
        "consistent", "Voyager-class ship with parasail scene; profile + uploader claim consistent"),
    "assets/ships/rcl/mariner-of-the-seas/RockwallMS.webp.attr.json": (
        "ambiguous", "Climbing wall is a Voyager-class amenity present on all 5 sister ships (Mariner / Voyager / Explorer / Adventure / Navigator); visual evidence cannot confirm specifically Mariner"),
    "assets/ships/rcl/mariner-of-the-seas/BusinesscenterMS.webp.attr.json": (
        "ambiguous", "Generic Voyager-class business-centre interior; visual evidence cannot confirm specifically Mariner"),

    # ---- Queen Mary 2 (batch B, 2026-05-14) --------------------------------
    "assets/ships/cunard/queen-mary-2/QM2.webp.attr.json": (
        "confirmed", "Distant port-side profile in known QM2 livery (black hull, red Cunard funnel); \"Queen Mary 2\" lettering visible on hull"),
    "assets/ships/cunard/queen-mary-2/Quema.webp.attr.json": (
        "confirmed", "Bow-on at Hamburg; \"Cunard\" and \"Queen Mary 2\" lettering visible"),
    "assets/ships/cunard/queen-mary-2/Qm2_1.webp.attr.json": (
        "confirmed", "Crowd alongside; \"CUNARD\" lettering visible on hull; QM2 distinctive proportions"),
    "assets/ships/cunard/queen-mary-2/Queen_Mary_2_Hamburg.webp.attr.json": (
        "confirmed", "QM2 black-hull profile at Hamburg; \"Cunard\" lettering visible"),
    "assets/ships/cunard/queen-mary-2/Queen_Mary_2_Turn.webp.attr.json": (
        "confirmed", "QM2 making a turn; distinctive ocean-liner silhouette + Cunard funnel"),
    "assets/ships/cunard/queen-mary-2/Qm2-dock-17.webp.attr.json": (
        "consistent", "QM2 in Blohm + Voss Dock Elbe 17 (known QM2 refit dock) viewed from a smaller vessel; ship matches QM2 profile"),
    "assets/ships/cunard/queen-mary-2/Queen-Mary-II-Elbe-051119-0.webp.attr.json": (
        "confirmed", "Bow-on shot with \"Queen Mary 2 / SOUTHAMPTON\" lettering clearly visible on hull"),

    # ---- Queen Victoria (batch B, 2026-05-14) ------------------------------
    "assets/ships/cunard/queen-victoria/Queen_Victoria_2007.webp.attr.json": (
        "confirmed", "Port-side profile with \"Queen Victoria\" lettering on bow + \"Cunard\" lettering on hull"),
    "assets/ships/cunard/queen-victoria/MS_Queen_Victoria_Circular_Quay.webp.attr.json": (
        "ambiguous", "Distant Cunard ship at Sydney Circular Quay; no name visible. Vista-class sister Queen Elizabeth also calls here, so visual evidence cannot disambiguate"),
    "assets/ships/cunard/queen-victoria/Cunard_Queen_Victoria.webp.attr.json": (
        "ambiguous", "Broadside view of a Cunard ship; \"CUNARD\" lettering visible but no Queen name. Vista-class sister Queen Elizabeth is visually identical"),
    "assets/ships/cunard/queen-victoria/Queen_Victoria_Station_Pier.webp.attr.json": (
        "confirmed", "Bow-on at Station Pier, Melbourne; \"Queen Victoria\" lettering visible on hull"),
    "assets/ships/cunard/queen-victoria/Queen_Victoria_Sydney_with_bear.webp.attr.json": (
        "ambiguous", "Night shot at Sydney Harbour Bridge with an inflatable bear in foreground; Cunard ship visible but no name; Vista-class sister could match"),
    "assets/ships/cunard/queen-victoria/Queen_Victoria_and_Spirit_of_Tasmania_I.webp.attr.json": (
        "ambiguous", "Cunard ship beside the Spirit of Tasmania I ferry; Cunard funnel visible but no Queen name; Vista-class sister ambiguity"),
    "assets/ships/cunard/queen-victoria/Queen_Victoria_in_Sydney.webp.attr.json": (
        "ambiguous", "Night shot of a lit-up Cunard ship at Sydney Harbour with the Harbour Bridge behind; no name visible; Vista-class sister ambiguity"),

    # ---- Zuiderdam (batch B, 2026-05-14) -----------------------------------
    "assets/ships/holland-america-line/zuiderdam/20080921-Piraeus-MS_Zuiderdam.webp.attr.json": (
        "confirmed", "Bow-on at Piraeus; \"Holland America Line\" and partial \"Zuiderdam\" lettering visible on hull"),
    "assets/ships/holland-america-line/zuiderdam/Celestina_on_Zuiderdam_top_deck.webp.attr.json": (
        "confirmed", "Ship name \"Zuiderdam\" engraved into a top-deck wooden bench in foreground; Alaska mountains behind"),
    "assets/ships/holland-america-line/zuiderdam/03-057_Esclusas_de_Gat_n_-_Flickr_-_Andre_Pantin.webp.attr.json": (
        "confirmed", "Stern view in Gatún Locks, Panama Canal; \"ZUIDERDAM / ROTTERDAM\" lettering clearly visible"),
    "assets/ships/holland-america-line/zuiderdam/Zuiderdam_(ship,_2002).webp.attr.json": (
        "confirmed", "Profile shot underway; \"ZUIDERDAM\" + \"Holland America Line\" lettering on hull, \"Zuiderdam\" above bridge"),

    # ---- Queen Anne (batch C, 2026-05-14) ----------------------------------
    "assets/ships/cunard/queen-anne/Queen_Anne_at_Pier_26_in_Port_of_Tallinn_7_July_2024.webp.attr.json": (
        "confirmed", "Three-quarter view at Tallinn Pier 26; \"QUEEN ANNE\" lettering visible on bow"),
    "assets/ships/cunard/queen-anne/Queen_Anne_Bow_Pier_26_Port_of_Tallinn_7_July_2024.webp.attr.json": (
        "consistent", "Bow-on at Tallinn Pier 26; same ship and pier as the name-sign photos (same photographer, same day); profile matches Queen Anne"),
    "assets/ships/cunard/queen-anne/Queen_Anne_Name_Sign_Starboard_Side_Pier_26_Port_of_Tallinn_7_July_2024.webp.attr.json": (
        "confirmed", "Close-up of the \"QUEEN ANNE\" name sign painted on the starboard hull"),
    "assets/ships/cunard/queen-anne/Queen_Anne_Name_Sign_Port_Side_Pier_26_Port_of_Tallinn_7_July_2024.webp.attr.json": (
        "confirmed", "Close-up of the \"QUEEN ANNE\" name sign painted on the port hull"),
    "assets/ships/cunard/queen-anne/Queen_Anne_Funnel_Port_Side_Pier_26_Port_of_Tallinn_7_July_2024.webp.attr.json": (
        "confirmed", "Cunard funnel close-up with \"QUEEN ANNE\" lettering visible on the bridge wing below"),
    "assets/ships/cunard/queen-anne/Queen_Anne_arriving_in_Tallinn_7_July_2024.webp.attr.json": (
        "consistent", "Distant port-side profile of a Cunard ship approaching Tallinn; matches Queen Anne profile and uploader's same-day series"),
    "assets/ships/cunard/queen-anne/MS_Queen_Anne.webp.attr.json": (
        "consistent", "Cunard ship at Liverpool with Royal Liver Building behind; livery + funnel pattern match Queen Anne but no name visible"),
    "assets/ships/cunard/queen-anne/Ms_queen_anne_southampton.webp.attr.json": (
        "consistent", "Distant profile in Southampton; Cunard livery; no name visible at this distance"),

    # ---- Queen Elizabeth (batch C, 2026-05-14) -----------------------------
    "assets/ships/cunard/queen-elizabeth/Queen_Elizabeth_au_port_de_Monaco.webp.attr.json": (
        "confirmed", "Alongside at Monaco; \"Queen Elizabeth\" lettering clearly visible on hull"),
    "assets/ships/cunard/queen-elizabeth/Queen_Elizabeth(2)_au_port_de_Monaco.webp.attr.json": (
        "consistent", "Stern view at Monaco same day as the confirmed bow shot; same Cunard livery and pier"),
    "assets/ships/cunard/queen-elizabeth/Queen_Elizabeth_liner-2.webp.attr.json": (
        "ambiguous", "Daylight Vista-class profile; visually indistinguishable from sister Queen Victoria"),
    "assets/ships/cunard/queen-elizabeth/Queen_Elizabeth_cruise_liner.webp.attr.json": (
        "ambiguous", "Distant Vista-class profile at evening; sister Queen Victoria visually identical"),
    "assets/ships/cunard/queen-elizabeth/Queen_Elizabeth_liner_2.webp.attr.json": (
        "ambiguous", "Distant Vista-class profile near land; sister Queen Victoria visually identical"),
    "assets/ships/cunard/queen-elizabeth/Cunard_MS_Queen_Elizabeth_Southampton.webp.attr.json": (
        "ambiguous", "Cunard Vista-class ship at Southampton; sister Queen Victoria visually identical"),
    "assets/ships/cunard/queen-elizabeth/MS_Queen_Elizabeth_on_maiden_voyage_in_the_Solent.webp.attr.json": (
        "ambiguous", "Lit-up Cunard ship at dusk in the Solent; uploader claims maiden voyage Oct 2010, no visual identifier in frame"),

    # ---- Norwegian Breakaway (batch C, 2026-05-14) -------------------------
    # Norwegian Breakaway carries a distinctive Peter Max-designed hull art
    # (Statue-of-Liberty pop-art + NYC skyline + "Peter Max" signature) that
    # no other ship shares. Any photo showing that art is uniquely Breakaway.
    "assets/ships/norwegian/norwegian-breakaway/Norwegian_Breakaway_01.webp.attr.json": (
        "confirmed", "Bow with Peter Max signature and Statue-of-Liberty pop-art — Norwegian Breakaway's unique hull art"),
    "assets/ships/norwegian/norwegian-breakaway/Norwegian_Breakaway_02.webp.attr.json": (
        "confirmed", "Side profile with \"NORWEGIAN BREAKAWAY\" lettering and Peter Max hull art"),
    "assets/ships/norwegian/norwegian-breakaway/Norwegian_Breakaway_03.webp.attr.json": (
        "confirmed", "Departing Meyer Werft (\"MEYER PAPENBURG\" sign visible behind), Peter Max signature and Statue of Liberty visible on bow"),
    "assets/ships/norwegian/norwegian-breakaway/Norwegian_Breakaway_04.webp.attr.json": (
        "confirmed", "Bow with Peter Max signature; tugboat \"BREMERHAVEN\" alongside during delivery transit"),
    "assets/ships/norwegian/norwegian-breakaway/Norwegian_Breakaway_05.webp.attr.json": (
        "consistent", "Distant wide shot of a ship with the blue Peter Max bow visible; details muted by mist"),
    "assets/ships/norwegian/norwegian-breakaway/Norwegian_Breakaway_06.webp.attr.json": (
        "confirmed", "Side view with \"NORWEGIAN BREA[KAWAY]\" lettering and Peter Max hull art"),
    "assets/ships/norwegian/norwegian-breakaway/Norwegian_Breakaway_07.webp.attr.json": (
        "confirmed", "Full broadside with \"NORWEGIAN BREAKAWAY\" lettering and Peter Max hull art across the hull"),
    "assets/ships/norwegian/norwegian-breakaway/Norwegian_Breakaway_08.webp.attr.json": (
        "confirmed", "Bow close-up with Peter Max signature and Statue-of-Liberty pop-art (Breakaway's signature hull art)"),

    # ---- Caribbean Princess (batch C, 2026-05-14) --------------------------
    "assets/ships/princess/caribbean-princess/Caribbean_Princess.webp.attr.json": (
        "confirmed", "Bow close-up with \"CARIBBEAN PRINCESS\" lettering visible on hull at Fort Lauderdale"),
    "assets/ships/princess/caribbean-princess/Caribbean_princess2.webp.attr.json": (
        "confirmed", "Bow detail at sea with \"CARIBBEAN PRINCESS\" lettering visible on hull"),
    "assets/ships/princess/caribbean-princess/Caribbean_Princess3.webp.attr.json": (
        "ambiguous", "Grand-class Princess from beach foreground; sister ships (Crown, Emerald, Ruby, Grand Princess) are visually identical"),
    "assets/ships/princess/caribbean-princess/Caribbean_Princess_at_St_Maartin.webp.attr.json": (
        "ambiguous", "Grand-class Princess approaching St Maarten pier; no name visible; Grand-class sister ambiguity"),
    "assets/ships/princess/caribbean-princess/Caribbean_Princess_in_2010.webp.attr.json": (
        "ambiguous", "Grand-class Princess profile, 2010; no name visible; Grand-class sister ambiguity"),
    "assets/ships/princess/caribbean-princess/Caribbean_princess.webp.attr.json": (
        "ambiguous", "Distant Grand-class Princess off a beach; no name visible; Grand-class sister ambiguity"),
    "assets/ships/princess/caribbean-princess/Caribbean_princess_-b.webp.attr.json": (
        "ambiguous", "Grand-class Princess stern view; no name visible; Grand-class sister ambiguity"),

    # ---- Carnival Breeze (batch C, 2026-05-14) -----------------------------
    "assets/ships/carnival/carnival-breeze/Non_aux_grands_navires___Venise___(8157935541).webp.attr.json": (
        "confirmed", "Carnival Breeze passing through Venice; \"CARNIVAL BREEZE\" lettering visible on hull"),
    "assets/ships/carnival/carnival-breeze/Fotos_del_crucero_Carnival_Breeze_en_el_puerto_de_La_Luz_y_de_Las_Palmas_en_Gran_Canaria_(8179698070).webp.attr.json": (
        "confirmed", "Carnival Breeze alongside at La Luz harbour, Las Palmas; \"CARNIVAL BREEZE\" lettering visible"),
    "assets/ships/carnival/carnival-breeze/Fotos_del_crucero_Carnival_Breeze_en_el_puerto_de_La_Luz_y_de_Las_Palmas_en_Gran_Canaria_(8179698418).webp.attr.json": (
        "confirmed", "Upper-deck close-up at Las Palmas with \"CARNIVAL BREEZE\" lettering visible"),
    "assets/ships/carnival/carnival-breeze/Fotos_del_crucero_Carnival_Breeze_en_el_puerto_de_La_Luz_y_de_Las_Palmas_en_Gran_Canaria_(8179698968).webp.attr.json": (
        "confirmed", "Funnel close-up at Las Palmas with \"CARNIVAL BREEZE\" lettering visible"),
    "assets/ships/carnival/carnival-breeze/Fotos_del_crucero_Carnival_Breeze_en_el_puerto_de_La_Luz_y_de_Las_Palmas_en_Gran_Canaria_(8179697968).webp.attr.json": (
        "consistent", "Wide view of Las Palmas harbour with Carnival Breeze visible; same series/day as the four confirmed Las Palmas shots; no individual name visible from this distance"),
    "assets/ships/carnival/carnival-breeze/Carnival_Breeze.webp.attr.json": (
        "ambiguous", "Distant Dream-class Carnival ship at Monaco; sister ships Carnival Dream and Carnival Magic visually similar from this distance"),
    "assets/ships/carnival/carnival-breeze/Fotos_del_crucero_Carnival_Breeze_en_el_puerto_de_La_Luz_y_de_Las_Palmas_en_Gran_Canaria_(8179698282).webp.attr.json": (
        "ambiguous", "Upper-deck WaterWorks aqua-park close-up; same amenity exists on Dream-class sisters Dream and Magic"),
    "assets/ships/carnival/carnival-breeze/Fotos_del_crucero_Carnival_Breeze_en_el_puerto_de_La_Luz_y_de_Las_Palmas_en_Gran_Canaria_(8179698748).webp.attr.json": (
        "ambiguous", "Water-slide close-up; same Dream-class amenity exists on Dream and Magic"),

    # ---- Westerdam (batch C tail, 2026-05-14) ------------------------------
    "assets/ships/holland-america-line/westerdam/MS_Westerdam_heaving_up_its_anchor_in_Half_Moon_Cay.webp.attr.json": (
        "confirmed", "Close-up at Half Moon Cay; \"Holland America Line\" and \"WESTERDAM\" lettering visible on hull"),
    "assets/ships/holland-america-line/westerdam/MS_Westerdam_Getting_Underway.webp.attr.json": (
        "confirmed", "Stern view at sea; \"WESTERDAM\" + \"ROTTERDAM\" registry-port lettering visible on transom"),
    "assets/ships/holland-america-line/westerdam/Westerdam_bell.webp.attr.json": (
        "confirmed", "Ship's bell engraved \"WESTERDAM 2004\" on the bridge wing"),
    "assets/ships/holland-america-line/westerdam/Westerdam_from_Mt_Roberts.webp.attr.json": (
        "ambiguous", "Aerial view of HAL Vista-class ship at the Juneau cruise pier from Mt Roberts; sisters Zuiderdam / Oosterdam / Noordam / Eurodam are visually similar"),
    "assets/ships/holland-america-line/westerdam/Maasdam_and_Westerdam_anchored_in_Half_Moon_Cay.webp.attr.json": (
        "ambiguous", "Two ships in frame: Maasdam (S-class, left) + a Vista-class HAL ship (right). Right ship's class matches Westerdam but name not visible; Vista-class sister ambiguity"),
    "assets/ships/holland-america-line/westerdam/Westerdam_Atrium.webp.attr.json": (
        "ambiguous", "Interior atrium with crystal chandelier; similar Vista-class atrium design exists on sister ships"),
    "assets/ships/holland-america-line/westerdam/Westerdam_Vista_dining_entrance.webp.attr.json": (
        "ambiguous", "Vista Dining Room entrance with patterned glass partitions; same Vista-class signature decor used on sister ships"),
    "assets/ships/holland-america-line/westerdam/Westerdam_rear_Lido_pool.webp.attr.json": (
        "ambiguous", "Aft Lido pool deck with chevron-tile pool and hot tubs; similar Vista-class amenity on sister ships"),

    # ---- Diamond Princess (batch C tail, 2026-05-14) -----------------------
    "assets/ships/princess/diamond-princess/Diamond_Princess_in_Hobart.webp.attr.json": (
        "confirmed", "Bow detail at Hobart, Tasmania; \"DIAMOND PRINCESS\" lettering visible on hull"),
    "assets/ships/princess/diamond-princess/Diamond_Princess_at_Hong_Kong_-_IMO_9228198_(3614138858).webp.attr.json": (
        "confirmed", "Stern view at Hong Kong; \"DIAMOND PRINCESS\" and \"HAMILTON\" registry-port visible on transom; filename IMO 9228198 matches Diamond Princess"),
    "assets/ships/princess/diamond-princess/Diamond_Princess_from_Mt_Roberts.webp.attr.json": (
        "ambiguous", "Aerial view of Princess Grand-class ship at Juneau cruise pier from Mt Roberts; Grand-class sisters (Sapphire/Caribbean/Crown/Ruby/Emerald/Star) visually similar from above"),
    "assets/ships/princess/diamond-princess/Diamond_Princess_in_Tauranga.webp.attr.json": (
        "ambiguous", "Princess Grand-class ship at Tauranga, NZ; no name visible; Grand-class sister ambiguity"),
    "assets/ships/princess/diamond-princess/Diamond_Princess_at_Circular_Quay.webp.attr.json": (
        "ambiguous", "Princess Grand-class ship at Circular Quay, Sydney with Harbour Bridge behind; no name visible; Grand-class sister ambiguity"),
    "assets/ships/princess/diamond-princess/Diamond_Princess_Vancouver_September_2012.webp.attr.json": (
        "ambiguous", "Princess Grand-class ship at Vancouver, Sept 2012, with celebratory bunting; no name visible; Grand-class sister ambiguity"),
    "assets/ships/princess/diamond-princess/Diamond_Princess_(ship,_2004)_001.webp.attr.json": (
        "ambiguous", "Princess Grand-class ship near green coastline; no name visible; Grand-class sister ambiguity"),

    # ---- Norwegian Epic (batch C tail, 2026-05-14) -------------------------
    # Norwegian Epic is a one-of-a-kind class — Epic-class contains only this
    # one ship. Class signature features (Aqua Park waterslide complex on top
    # deck + Epic-specific hull-art canvas) are uniquely Epic.
    "assets/ships/norwegian/norwegian-epic/Norwegian_Epic_water_chute_3.webp.attr.json": (
        "confirmed", "Bow with \"NORWEGIAN EPIC\" lettering and Epic-class colorful hull art"),
    "assets/ships/norwegian/norwegian-epic/Norwegian_Epic_water_chute_2.webp.attr.json": (
        "confirmed", "Funnel close-up; \"NORWEGIAN EPIC\" + NCL logo visible alongside the Aqua Park waterslide structure"),
    "assets/ships/norwegian/norwegian-epic/Norwegian_Epic_1.webp.attr.json": (
        "confirmed", "Full broadside at sea; Epic-class colorful hull art visible across hull"),
    "assets/ships/norwegian/norwegian-epic/Norwegian_Epic_water_chute_1.webp.attr.json": (
        "confirmed", "Distant view of Epic underway; distinctive Aqua Park waterslide complex visible on top deck (Epic-class signature)"),
    "assets/ships/norwegian/norwegian-epic/Norwegian_Epic_-_Port_of_Naples_-_June_2011.webp.attr.json": (
        "confirmed", "Norwegian Epic alongside at Naples; \"NORWEGIAN EPIC\" lettering visible on hull"),
    "assets/ships/norwegian/norwegian-epic/Rotterdam_cruiseschip_Norwegian_Epic.webp.attr.json": (
        "consistent", "Distant view at Rotterdam; NCL livery + colorful hull art consistent with Epic; Epic-class is single-ship class so no sister to disambiguate against"),
    "assets/ships/norwegian/norwegian-epic/Bridge_of_the_Norwegian_Epic.webp.attr.json": (
        "consistent", "Bridge close-up with distinctive blue rounded observation deck; Epic-class signature bridge architecture"),
    "assets/ships/norwegian/norwegian-epic/Florencia_and_Norwegian_Epic_-_Port_of_Barcelona_-_June_2011.webp.attr.json": (
        "consistent", "Foreground subject is the Grimaldi ferry Florencia; the cruise ship at quay behind is Epic-class profile (Epic-class is one-ship; no sister to confuse)"),

    # ---- Carnival Magic (batch C tail, 2026-05-14) -------------------------
    "assets/ships/carnival/carnival-magic/Carnival_Magic,_in_port-Galveston,_TX_September_30,_2012.webp.attr.json": (
        "confirmed", "Three-quarter view at Galveston; \"CARNIVAL MAGIC\" lettering visible twice on hull"),
    "assets/ships/carnival/carnival-magic/Carnival_Magic_in_Venedig.webp.attr.json": (
        "confirmed", "Bow detail in Venice with \"CARNIVAL MAGIC\" lettering on the hull"),
    "assets/ships/carnival/carnival-magic/Carnival_Magic_(12385606213).webp.attr.json": (
        "confirmed", "Bow close-up with \"CARNIVAL MAGIC\" and \"PANAMA R.P.\" registry-port lettering visible"),
    "assets/ships/carnival/carnival-magic/Carnival_Magic_(7706567392).webp.attr.json": (
        "confirmed", "Alongside in port; \"CARNIVAL MAGIC\" lettering visible on upper deck"),
    "assets/ships/carnival/carnival-magic/Carnival_Magic_(12385914894).webp.attr.json": (
        "confirmed", "Funnel and waterpark close-up; \"CARNIVAL MAGIC\" lettering visible"),
    "assets/ships/carnival/carnival-magic/Carnival_Magic_(12385424915).webp.attr.json": (
        "confirmed", "Broadside near a Caribbean shoreline; \"CARNIVAL MAGIC\" lettering visible on upper deck"),
    "assets/ships/carnival/carnival-magic/Carnival_Magic_Monaco.webp.attr.json": (
        "confirmed", "At Monaco; \"CARNIVAL MAGIC\" lettering visible on hull"),
    "assets/ships/carnival/carnival-magic/Carnival_Magic_near_Belize_City.webp.attr.json": (
        "ambiguous", "Distant Carnival Dream-class profile off Belize City; sister ships Carnival Dream / Breeze are visually similar from this distance"),

    # ---- MSC Seascape (batch C tail, 2026-05-14) ---------------------------
    "assets/ships/msc/msc-seascape/MSC_Seascape_cruise_ship_3.webp.attr.json": (
        "confirmed", "Alongside in port with \"MSC SEASCAPE\" lettering visible on bow"),
    "assets/ships/msc/msc-seascape/MSC_Seascape_in_Cozumel_2024_(3).webp.attr.json": (
        "confirmed", "MSC Seaside-Evo-class ship at Cozumel 2024; \"MSC SEASCAPE\" lettering visible on bow"),
    "assets/ships/msc/msc-seascape/MSC_Seascape_cruise_ship_1.webp.attr.json": (
        "consistent", "MSC corporate badge visible at bow; Seaside-Evo class profile; sister MSC Seashore is visually similar"),
    "assets/ships/msc/msc-seascape/MSC_Seascape_cruise_ship_2.webp.attr.json": (
        "consistent", "MSC corporate badge visible; Seaside-Evo class profile; sister MSC Seashore is visually similar"),

    # ---- Grand Princess (batch D, 2026-05-18) ------------------------------
    "assets/ships/princess/grand-princess/Grand_Princess_en_el_Puerto_de_C_diz.webp.attr.json": (
        "confirmed", "Alongside at Cadiz with \"GRAND PRINCESS\" lettering visible on hull above lifeboats"),
    "assets/ships/princess/grand-princess/Grand_Princess.webp.attr.json": (
        "ambiguous", "Grand-class Princess underway; sister ships Star/Golden/Caribbean/Crown/Ruby/Emerald visually similar"),
    "assets/ships/princess/grand-princess/GrandPrincess-Scotland.webp.attr.json": (
        "ambiguous", "Grand-class Princess in Scottish waters viewed from a passenger ferry; no name visible; sister ambiguity"),
    "assets/ships/princess/grand-princess/Harbour_Dubrovnik.webp.attr.json": (
        "ambiguous", "Grand-class Princess approaching Dubrovnik harbour; no name visible; Grand-class sister ambiguity"),
    "assets/ships/princess/grand-princess/Juneau,_Alaska.webp.attr.json": (
        "ambiguous", "Grand-class Princess docked at Juneau, Alaska in evening light; no name visible; Grand-class sister ambiguity"),
    "assets/ships/princess/grand-princess/Bosfor_B18-39.webp.attr.json": (
        "ambiguous", "Grand-class Princess passing through the Bosphorus; no name visible; Grand-class sister ambiguity"),

    # ---- Crown Princess (batch D, 2026-05-18) ------------------------------
    "assets/ships/princess/crown-princess/Crown_Princess.webp.attr.json": (
        "confirmed", "Bow detail with \"CROWN PRINCESS\" lettering visible on hull, swimmers in foreground"),
    "assets/ships/princess/crown-princess/Crown_Princess2.webp.attr.json": (
        "confirmed", "Full broadside; \"CROWN PRINCESS\" lettering visible above the lifeboats"),
    "assets/ships/princess/crown-princess/Crown_Princess_en_el_Puerto_de_C_diz.webp.attr.json": (
        "confirmed", "Bow detail at Cadiz; \"CROWN PRINCESS\" lettering visible on upper deck"),
    "assets/ships/princess/crown-princess/Crown_Princess-1.webp.attr.json": (
        "confirmed", "Underway; \"CROWN PRINCESS\" lettering visible on upper deck near funnel"),
    "assets/ships/princess/crown-princess/Crown_Princess_at_Liverpool_26-08-10_-_DSC00624.webp.attr.json": (
        "confirmed", "Alongside at Liverpool 2010; \"CROWN PRINCESS\" lettering visible on hull"),
    "assets/ships/princess/crown-princess/Crown_Princess_en_el_Puerto_de_C_diz_(2).webp.attr.json": (
        "consistent", "Broadside at Cadiz, second angle of the same call as the confirmed Cadiz shot; same ship, same day"),
    "assets/ships/princess/crown-princess/Crown_princess.webp.attr.json": (
        "ambiguous", "Bow-on Grand-class Princess profile at port; no name visible; Grand-class sister ambiguity"),

    # ---- Norwegian Star (batch D, 2026-05-18) ------------------------------
    "assets/ships/norwegian/norwegian-star/Norwegian_Star_in_Seattle.webp.attr.json": (
        "confirmed", "Alongside in Seattle with Space Needle behind; \"NORWEGIAN STAR\" lettering visible on hull"),
    "assets/ships/norwegian/norwegian-star/Norwegian_Star_-_Seattle2.webp.attr.json": (
        "confirmed", "Second Seattle angle showing \"NORWEGIAN STAR\" lettering and the colorful hull art"),
    "assets/ships/norwegian/norwegian-star/Norwegian_Star_Kauai_2002.webp.attr.json": (
        "confirmed", "Alongside at Kauai 2002; \"NORWEGIAN STAR\" lettering visible on hull"),
    "assets/ships/norwegian/norwegian-star/Norwegian_Star_in_Prince_Rupert,_BC.webp.attr.json": (
        "confirmed", "Panorama view alongside at Prince Rupert, BC; \"NORWEGIAN STAR\" lettering visible"),
    "assets/ships/norwegian/norwegian-star/Crucero_en_la_Terminal_Mar_tima_de_Acapulco,_M_xico.webp.attr.json": (
        "confirmed", "Night photo at Acapulco terminal; \"NORWEGIAN STAR\" lettering visible on hull"),
    "assets/ships/norwegian/norwegian-star/Cruise_Pictures_089.webp.attr.json": (
        "ambiguous", "Distant NCL profile off a Mexican coastline; no name visible; profile matches Norwegian Star per uploader claim"),

    # ---- Celebrity Eclipse (batch D, 2026-05-18) ---------------------------
    "assets/ships/celebrity-cruises/celebrity-eclipse/Celebrity_Eclipse_Name_Sign_on_the_Starboard_Side_Port_of_Tallinn_26_June_2011.webp.attr.json": (
        "confirmed", "Close-up of the painted \"Celebrity ECLIPSE\" name sign on the starboard hull"),
    "assets/ships/celebrity-cruises/celebrity-eclipse/Celebrity_Eclipse-1.webp.attr.json": (
        "confirmed", "Full broadside underway; \"ECLIPSE\" lettering and Celebrity \"X\" funnel logo visible"),
    "assets/ships/celebrity-cruises/celebrity-eclipse/Celebrity_Eclipse_IMG_5898_C.webp.attr.json": (
        "confirmed", "Alongside at Tallinn with \"Celebrity ECLIPSE\" lettering visible on hull"),
    "assets/ships/celebrity-cruises/celebrity-eclipse/IMG_5903_Celebrity_Eclipse_C.webp.attr.json": (
        "confirmed", "Approaching Tallinn; \"Celebrity ECLIPSE\" + Celebrity X Cruises lettering visible"),
    "assets/ships/celebrity-cruises/celebrity-eclipse/Celebrityeclipsebalticsea2010.webp.attr.json": (
        "confirmed", "Underway in the Baltic Sea 2010; \"Celebrity ECLIPSE\" lettering visible on hull"),
    "assets/ships/celebrity-cruises/celebrity-eclipse/Celebrity_Eclipse_IMG_5905_C.webp.attr.json": (
        "ambiguous", "Distant Celebrity Solstice-class ship off Tallinn; sisters Solstice/Equinox/Silhouette/Reflection visually similar; no name visible"),
    "assets/ships/celebrity-cruises/celebrity-eclipse/The__X__signature_on_the_Celebrity_Eclipse,_Tallinn,_Estonia_-_26_June_2011.webp.attr.json": (
        "ambiguous", "Celebrity \"X\" funnel logo close-up; the X mark appears on every Celebrity ship, not Eclipse-specific. Commons uploader claims same-day Tallinn series as the confirmed name-sign shot"),

    # ---- Costa Diadema (batch D, 2026-05-18) -------------------------------
    "assets/ships/costa/costa-diadema/Costa_Diadema_(24922971025).webp.attr.json": (
        "confirmed", "Alongside in port; \"COSTA DIADEMA\" lettering visible on hull"),
    "assets/ships/costa/costa-diadema/Costa_Diadema_docked_at_Dubrovnik.webp.attr.json": (
        "confirmed", "Docked at Dubrovnik with Italian flag flying; \"COSTA DIADEMA\" lettering visible on hull"),
    "assets/ships/costa/costa-diadema/Costa_Diadema_(103)_(16310776402).webp.attr.json": (
        "ambiguous", "Distant Costa ship viewed past Savona's medieval clock tower; Costa funnel logo visible but no name; multiple Costa sisters share similar livery"),

    # ---- Celebrity Equinox (batch E, 2026-05-18) ---------------------------
    "assets/ships/celebrity-cruises/celebrity-equinox/Cozumel_-_Celebrity_Equinox.webp.attr.json": (
        "confirmed", "Alongside at Cozumel cruise pier; \"Celebrity EQUINOX\" lettering clearly visible on hull"),
    "assets/ships/celebrity-cruises/celebrity-equinox/CelebrityEquinox-maidenvoyage.webp.attr.json": (
        "confirmed", "Underway on maiden voyage; \"Celebrity Cruises\" + \"Celebrity EQUINOX\" lettering visible on hull"),
    "assets/ships/celebrity-cruises/celebrity-equinox/Cruise_ship_Celebrity_Equinox_2009.webp.attr.json": (
        "confirmed", "Alongside in Southampton 2009; \"EQUINOX\" lettering visible on hull"),
    "assets/ships/celebrity-cruises/celebrity-equinox/Celebrity_Equinox-05.webp.attr.json": (
        "confirmed", "Panorama alongside in port; \"Celebrity EQUINOX\" lettering visible on hull"),
    "assets/ships/celebrity-cruises/celebrity-equinox/Celebrity_Equinox_Istanbul.webp.attr.json": (
        "confirmed", "Underway in Istanbul waters; \"Celebrity Equinox\" lettering visible on hull"),
    "assets/ships/celebrity-cruises/celebrity-equinox/Equinox_-_Lifeboat_Used_as_Tender.webp.attr.json": (
        "confirmed", "Lifeboat used as a tender; \"CELEBRITY EQUINOX\" lettering visible on the boat"),
    "assets/ships/celebrity-cruises/celebrity-equinox/Celebrity_Equinox_s_lifeboat_in_port_in_Cartagena,_Colombia.webp.attr.json": (
        "confirmed", "Lifeboat from Celebrity Equinox at Cartagena, Colombia; \"CELEBRITY EQUINOX VALLETTA\" lettering visible on the boat"),

    # ---- Costa Pacifica (batch E, 2026-05-18) ------------------------------
    "assets/ships/costa/costa-pacifica/Costa_Pacifica_in_Savona_2010.webp.attr.json": (
        "confirmed", "Alongside at Savona 2010; \"COSTA PACIFICA / GENOVA\" registry lettering visible on hull"),
    "assets/ships/costa/costa-pacifica/Costa_Pacifica_sailing.webp.attr.json": (
        "confirmed", "Underway at sea; \"COSTA PACIFICA\" lettering visible on hull"),

    # ---- Costa Fortuna (batch E, 2026-05-18; staged for future page) -------
    # Costa Fortuna does not yet have a page at ships/costa/costa-fortuna.html.
    # Operator confirmed Fortuna will be covered; these assets are staged so
    # the page can adopt them when it is created.
    "assets/ships/costa/costa-fortuna/TorrettaLeonPancaldoSAVONAFeb2006.webp.attr.json": (
        "confirmed", "Costa ship at Savona quay viewed past Torretta Leon Pancaldo; \"COSTA FORTUNA\" lettering visible on hull"),
    "assets/ships/costa/costa-fortuna/Costa_Fortuna.webp.attr.json": (
        "confirmed", "Aerial alongside view; \"COSTA FORTUNA\" lettering visible on hull beside Costa funnel"),
    "assets/ships/costa/costa-fortuna/Costa_Fortuna_-a.webp.attr.json": (
        "confirmed", "Bow detail at port; \"COSTA FORTUNA\" lettering visible on hull"),
    "assets/ships/costa/costa-fortuna/Costa_Fortuna_at_Fort_Lauderdale_-_IMO_9239783_(3306462221).webp.attr.json": (
        "confirmed", "Alongside at Fort Lauderdale; \"COSTA FORTUNA\" lettering visible twice (bow + upper deck); IMO 9239783 in filename matches Costa Fortuna's IMO"),
    "assets/ships/costa/costa-fortuna/Costa_Fortuna_Ponte.webp.attr.json": (
        "ambiguous", "Sunset deck view with waterslide and partial \"COSTA\" lettering on stack; brand visible, ship name not"),
    "assets/ships/costa/costa-fortuna/Costa_Fortuna_Prua.webp.attr.json": (
        "ambiguous", "Bow-on view of a Costa ship at port; Costa funnel visible but no ship name in frame"),
    "assets/ships/costa/costa-fortuna/Costa_Fortuna_im_Juli_2011_beim_Auslaufen_aus_Venedig.webp.attr.json": (
        "ambiguous", "Costa ship's bow visible through a pier structure at Venice 2011; no ship name in frame"),

    # ---- Regal Princess (batch E, 2026-05-18) ------------------------------
    "assets/ships/princess/regal-princess/Regal_Princess_2014_7_17_3817.webp.attr.json": (
        "confirmed", "Bow detail at port July 2014; \"Regal Princess\" lettering visible on hull"),
    "assets/ships/princess/regal-princess/Regal_Princess_16_05_2014.webp.attr.json": (
        "consistent", "Royal-class Princess at port May 2014; no name visible but same uploader/series as confirmed shot; Royal-class sisters (Royal/Majestic/Sky) visually similar"),
    "assets/ships/princess/regal-princess/Regal_Princess_Starboard_Side_Tallinn_29_May_2015.webp.attr.json": (
        "ambiguous", "Royal-class Princess profile at Tallinn; no name visible; Royal-class sister ambiguity"),
    "assets/ships/princess/regal-princess/Regal_Princess_at_Pier_27_in_Tallinn_29_May_2015.webp.attr.json": (
        "ambiguous", "Royal-class Princess at Tallinn Pier 27 with city skyline; no name visible; Royal-class sister ambiguity"),
    "assets/ships/princess/regal-princess/Regal_Princess_turning_to_Starboard_Side_Tallinn_29_May_2015.webp.attr.json": (
        "consistent", "Royal-class Princess turning at Tallinn with Princess Cruises emblem visible on funnel; same uploader/series as Pier 27 shot"),
    "assets/ships/princess/regal-princess/Regal_Princess_leaving_Tallinn_18_May_2015.webp.attr.json": (
        "ambiguous", "Royal-class Princess leaving Tallinn; no name visible; Royal-class sister ambiguity"),

    # ---- Norwegian Dawn (batch F, 2026-05-18) ------------------------------
    "assets/ships/norwegian/norwegian-dawn/NYC_Norwegian_Dawn.webp.attr.json": (
        "confirmed", "Underway in NYC harbour; \"NORWEGIAN DAWN\" lettering visible on bow with colorful NCL hull art"),
    "assets/ships/norwegian/norwegian-dawn/Norwegian_Dawn_1.webp.attr.json": (
        "ambiguous", "Aft pool deck interior view; no ship name visible; could be Dawn or Star-class sister"),
    "assets/ships/norwegian/norwegian-dawn/Norwegian_Dawn_2.webp.attr.json": (
        "ambiguous", "Aft sun-loungers and twin tent canopies on funnel deck; characteristic Norwegian Dawn/Star deck design but no name visible"),

    # ---- MSC Preziosa (batch F, 2026-05-18) --------------------------------
    "assets/ships/msc/msc-preziosa/MSC_Preziosa_Chantiers_de_Saint_Nazaire_01.webp.attr.json": (
        "confirmed", "Bow-on at Chantiers de l'Atlantique, Saint-Nazaire; \"MSC PREZIOSA\" lettering visible on bow with MSC logo"),
    "assets/ships/msc/msc-preziosa/MSC_Preziosa_Chantiers_de_Saint_Nazaire_06.webp.attr.json": (
        "ambiguous", "Outdoor rim-pool deck during shipyard fitting-out; design consistent with Fantasia-class but no name visible"),
    "assets/ships/msc/msc-preziosa/MSC_Preziosa_Chantiers_de_Saint_Nazaire_02.webp.attr.json": (
        "ambiguous", "Interior atrium pool with glass-dome roof; Fantasia-class signature interior design — sisters Fantasia/Splendida/Divina share this layout"),
    "assets/ships/msc/msc-preziosa/MSC_Preziosa_Chantiers_de_Saint_Nazaire_03.webp.attr.json": (
        "ambiguous", "Interior pool with palm-tree sculpture; Fantasia-class signature interior — sister ship ambiguity"),
    "assets/ships/msc/msc-preziosa/MSC_Preziosa_Chantiers_de_Saint_Nazaire_04.webp.attr.json": (
        "ambiguous", "Interior pool mosaic detail; Fantasia-class shared decor"),
    "assets/ships/msc/msc-preziosa/Paquebot_en_construction_(4).webp.attr.json": (
        "ambiguous", "Cruise ship under construction at Saint-Nazaire shipyard; Commons category assigns to MSC Preziosa"),
    "assets/ships/msc/msc-preziosa/Paquebot_en_construction_(1).webp.attr.json": (
        "ambiguous", "Cruise ship under construction at Saint-Nazaire shipyard; Commons category assigns to MSC Preziosa"),
    "assets/ships/msc/msc-preziosa/Paquebot_en_construction_(2).webp.attr.json": (
        "ambiguous", "Distant Saint-Nazaire shipyard view with cruise ship in build; Commons category assigns to MSC Preziosa"),

    # ---- Carnival Spirit (batch F, 2026-05-18) -----------------------------
    "assets/ships/carnival/carnival-spirit/Carnival_spirit.webp.attr.json": (
        "confirmed", "Large \"Carnival Spirit\" name lettering on the ship's superstructure with clock — close-up portrait shot"),
    "assets/ships/carnival/carnival-spirit/Carnival_Spirit_docked_at_San_Diego_2009-12-21_1.webp.attr.json": (
        "confirmed", "Docked at San Diego December 2009; \"CARNIVAL SPIRIT\" lettering visible on bow"),
    "assets/ships/carnival/carnival-spirit/Carnival_Spirit_in_Acapulco.webp.attr.json": (
        "confirmed", "Stern close-up at Acapulco; \"CARNIVAL SPIRIT / PANAMA R.P.\" registry-port lettering visible"),
    "assets/ships/carnival/carnival-spirit/Carnival_Spirit_in_Ketchikan,_Alaska.webp.attr.json": (
        "confirmed", "At Ketchikan, Alaska; \"CARNIVAL SPIRIT\" lettering visible on stern"),
    "assets/ships/carnival/carnival-spirit/Carnival_Spirit_in_Acapulco_2.webp.attr.json": (
        "ambiguous", "Carnival Spirit-class ship at Acapulco; sister ships Pride/Legend/Miracle visually similar; no name visible from this angle"),
    "assets/ships/carnival/carnival-spirit/Carnival_Spirit1.webp.attr.json": (
        "ambiguous", "Carnival Spirit-class ship off a Hawaiian coastline; sister ambiguity at this distance"),
    "assets/ships/carnival/carnival-spirit/Carnival_Spirit_in_Ketchikan,_Alaska_2.webp.attr.json": (
        "ambiguous", "Distant view across the Ketchikan channel; sister Pride/Legend/Miracle ambiguity"),
    "assets/ships/carnival/carnival-spirit/Carnival_Spirit_in_Ketchikan,_Alaska_2_cropped.webp.attr.json": (
        "ambiguous", "Cropped tighter version of the Ketchikan channel view; same sister ambiguity"),

    # ---- Seabourn Sojourn (batch F, 2026-05-18) ----------------------------
    "assets/ships/seabourn/seabourn-sojourn/Seabourn_Sojourn_at_Geiranger.webp.attr.json": (
        "confirmed", "Alongside in Geiranger fjord; \"SEABOURN SOJOURN\" lettering visible on hull"),
    "assets/ships/seabourn/seabourn-sojourn/Seabourn_Sojourn_IMO_9417098_Starboard_Side_Tallinn_15_July_2012.webp.attr.json": (
        "ambiguous", "Full starboard side at Tallinn; IMO 9417098 in filename matches Seabourn Sojourn; sisters Odyssey/Quest are Odyssey-class with very similar profile"),
    "assets/ships/seabourn/seabourn-sojourn/Seabourn_Sojourn_IMO_9417098_departing_Tallinn_15_July_2012.webp.attr.json": (
        "ambiguous", "Departing Tallinn; Odyssey-class profile; sister ambiguity"),
    "assets/ships/seabourn/seabourn-sojourn/Seabourn_Sojourn_in_front_of_Helsinki_2010-07-21.webp.attr.json": (
        "ambiguous", "Distant Seabourn Odyssey-class ship off Helsinki July 2010; sister Odyssey was new at the time, Sojourn entered service June 2010"),
    "assets/ships/seabourn/seabourn-sojourn/Seabourn_Sojourn_IMO_9417098_Funnels_Tallinn_15_July_2012.webp.attr.json": (
        "ambiguous", "Distinctive Odyssey-class twin-funnel close-up with gold Seabourn shield; same design across Odyssey/Sojourn/Quest"),
    "assets/ships/seabourn/seabourn-sojourn/Seabourn_Sojourn__Funnel_Tallinn_28_May_2012.webp.attr.json": (
        "ambiguous", "Funnel + lifeboats close-up at Tallinn May 2012; Odyssey-class shared detail"),
    "assets/ships/seabourn/seabourn-sojourn/Seabourn_Sojourn_IMO_9417098_Top_Tallinn_15_July_2012.webp.attr.json": (
        "ambiguous", "Top of bridge with Estonian flag flying; generic detail, no ship-specific marker visible"),

    # ---- Seven Seas Voyager (batch G, 2026-05-18) --------------------------
    "assets/ships/regent/seven-seas-voyager/Benkid77_Seven_Seas_Voyager.webp.attr.json": (
        "confirmed", "Bow detail with \"SEVEN SEAS VOYAGER\" lettering clearly visible on hull"),
    "assets/ships/regent/seven-seas-voyager/MS_Seven_Seas_Voyager.webp.attr.json": (
        "confirmed", "Bow-on at port; \"SEVEN SEAS VOYAGER\" lettering visible"),
    "assets/ships/regent/seven-seas-voyager/MS_Seven_Seas_Voyager_1.webp.attr.json": (
        "confirmed", "Three-quarter bow shot; \"SEVEN SEAS VOYAGER\" lettering visible"),
    "assets/ships/regent/seven-seas-voyager/MS_Seven_Seas_Voyager_stern.webp.attr.json": (
        "confirmed", "Stern view; \"SEVEN SEAS VOYAGER / NASSAU\" registry-port lettering visible"),
    "assets/ships/regent/seven-seas-voyager/Seven_Seas_Voyager-Copenhagen.webp.attr.json": (
        "confirmed", "Alongside in Copenhagen with bunting; \"SEVEN SEAS VOYAGER\" lettering visible on hull"),
    "assets/ships/regent/seven-seas-voyager/Kristina_Regina_og_Seven_Seas_Voyager_in_Trondheim_2009.webp.attr.json": (
        "consistent", "Two-ship scene in Trondheim fjord: smaller Kristina Regina ferry left, Seven Seas Voyager right. Both named in filename; Voyager profile visible on right"),

    # ---- Costa Favolosa (batch G, 2026-05-18) ------------------------------
    "assets/ships/costa/costa-favolosa/Costa_Favolosa.webp.attr.json": (
        "confirmed", "Alongside in port with \"COSTA FAVOLOSA\" lettering visible on hull"),
    "assets/ships/costa/costa-favolosa/Costa_Favolosa_2011-10-18.webp.attr.json": (
        "confirmed", "Costa ship in port October 2011 with \"COSTA FAVOLOSA\" lettering visible on hull"),
    "assets/ships/costa/costa-favolosa/Costa_Favolosa_at_Marghera_2010.webp.attr.json": (
        "consistent", "Cruise ship under construction at Marghera/Fincantieri shipyard 2010 with Costa funnel visible; build date matches Costa Favolosa"),
    "assets/ships/costa/costa-favolosa/Costa_Favolosa_in_Dubrovnik.webp.attr.json": (
        "ambiguous", "Costa Concordia-class ship at sea off Dubrovnik; sister ships Pacifica/Serena/Concordia visually similar; no name visible"),
    "assets/ships/costa/costa-favolosa/Costa_Favolosa_2011-10-20.webp.attr.json": (
        "ambiguous", "Costa ship transiting the Bosphorus near Istanbul; Costa logo on funnel visible but no ship name"),
    "assets/ships/costa/costa-favolosa/Costa_Favolosa_in_Valletta_2013-11-10.webp.attr.json": (
        "ambiguous", "Upper-deck close-up at Valletta with Costa funnel 'C' logo; Costa branding visible but no ship name"),
    "assets/ships/costa/costa-favolosa/Costa_Favolosa_in_Valletta_2013-11-09.webp.attr.json": (
        "ambiguous", "Costa ship at Valletta showing waterslide deck and rim pool; no name visible"),
    "assets/ships/costa/costa-favolosa/Savona_IT,_mit_Costa_Favolosa.webp.attr.json": (
        "ambiguous", "Savona harbour panorama with Costa Favolosa berthed at right; town buildings dominate the frame; ship partially visible"),

    # ---- Silver Spirit (batch G, 2026-05-18) -------------------------------
    "assets/ships/silversea/silver-spirit/MV_Silver_Spirit-1.webp.attr.json": (
        "confirmed", "Underway in calm water; \"SILVER SPIRIT\" lettering visible on bow"),
    "assets/ships/silversea/silver-spirit/MV_Silver_Spirit-2.webp.attr.json": (
        "confirmed", "Second angle from the same photographer/day series; \"SILVER SPIRIT\" lettering visible on bow"),
    "assets/ships/silversea/silver-spirit/MV_Silver_Spirit-3.webp.attr.json": (
        "confirmed", "Stern-on view passing a navigation buoy; \"Silver Spirit\" lettering visible on bow"),

    # ---- Seabourn Encore (batch H, 2026-05-18) -----------------------------
    "assets/ships/seabourn/seabourn-encore/Seabourn_Encore_at_Benoa_(2).webp.attr.json": (
        "confirmed", "Bow detail at Benoa; \"SEABOURN ENCORE\" lettering clearly readable on hull"),
    "assets/ships/seabourn/seabourn-encore/Seabourn_Encore_at_Benoa_(3).webp.attr.json": (
        "confirmed", "Broadside at Benoa with bunker tanker alongside; \"SEABOURN ENCORE\" lettering visible on bow"),
    "assets/ships/seabourn/seabourn-encore/Seabourn_Encore_at_Benoa_(1).webp.attr.json": (
        "consistent", "Distant view across Benoa harbour from same photographer's series; Seabourn gold shield on funnel; matches Encore-class profile and same-day series with confirmed (2) and (3)"),

    # ---- Seabourn Odyssey (batch H, 2026-05-18) ----------------------------
    "assets/ships/seabourn/seabourn-odyssey/Seabourn_Odyssey_(ship,_2009)_IMO_9417086_in_Split,_2011-11-16_(2).webp.attr.json": (
        "confirmed", "Calm harbour at Split; \"SEABOURN ODYSSEY\" lettering clearly readable on bow"),
    "assets/ships/seabourn/seabourn-odyssey/Seabourn-Odyssey-Burnie-20160208-003.webp.attr.json": (
        "confirmed", "Berthed at Burnie, Tasmania; \"SEABOURN ODYSSEY\" lettering clearly readable on bow"),
    "assets/ships/seabourn/seabourn-odyssey/Seabourn_Odyssey_(ship,_2009)_IMO_9417086__in_Split,_2011-11-16.webp.attr.json": (
        "confirmed", "Broadside off Split at dusk; faint \"SEABOURN ODYSSEY\" lettering visible on bow"),
    "assets/ships/seabourn/seabourn-odyssey/Seabourn_Odyssey_turning_in_Grand_Harbour,_Valletta.webp.attr.json": (
        "consistent", "Odyssey-class ship turning in Valletta Grand Harbour with Saluting Battery cannons in foreground; sister-class ambiguity (Odyssey/Sojourn/Quest share profile)"),

    # ---- Seabourn Ovation (batch H, 2026-05-18) ----------------------------
    "assets/ships/seabourn/seabourn-ovation/Croisi_re_SEABOURN_OVATION_au_port.webp.attr.json": (
        "confirmed", "Alongside at Casablanca with city skyline behind; \"SEABOURN OVATION\" lettering clearly readable on stern"),
    "assets/ships/seabourn/seabourn-ovation/Seabourn_Ovation_Name_Sign_Port_of_Tallinn_1_July_2018.webp.attr.json": (
        "confirmed", "Close-up of bow with very large \"SEABOURN OVATION\" lettering — definitive identification"),
    "assets/ships/seabourn/seabourn-ovation/Seabourn_Ovation_at_Morrison_Pier,_Lerwick_(geograph_5873907).webp.attr.json": (
        "confirmed", "Berthed at Morrison Pier, Lerwick, Shetland; \"SEABOURN OVATION\" lettering visible on bow; wind turbine on hillside"),

    # ---- Seabourn Venture (batch H, 2026-05-18) ----------------------------
    "assets/ships/seabourn/seabourn-venture/SEABOURN_VENTURE_01.webp.attr.json": (
        "confirmed", "Broadside view; faint \"SEABOURN VENTURE\" lettering visible on dark green expedition hull; characteristic angular Venture-class superstructure"),
    "assets/ships/seabourn/seabourn-venture/SEABOURN_VENTURE_02.webp.attr.json": (
        "consistent", "Same photographer (D-AIFF), same day series as confirmed file 01; sister ambiguity with Seabourn Pursuit but Commons categorization + series context match Venture"),

    # ---- Seabourn Pursuit (batch H, 2026-05-18) ----------------------------
    "assets/ships/seabourn/seabourn-pursuit/Seabourn_Pursuit.webp.attr.json": (
        "confirmed", "Underway at sea; \"SEABOURN PURSUIT\" lettering clearly visible on dark green expedition hull"),
    "assets/ships/seabourn/seabourn-pursuit/Porto_Nogaro_banchina_Cimolai_-_Mar_173.webp.attr.json": (
        "consistent", "Bare hull at T. Mariotti shipyard fitout berth in Porto Nogaro — Pursuit's build name was yard number Mar 173; T. MARIOTTI gantry lettering visible; Commons-categorized as Seabourn Pursuit construction"),
    "assets/ships/seabourn/seabourn-pursuit/Porto_Nogaro_-_Mar_173_dal_basso.webp.attr.json": (
        "consistent", "Pre-livery hull section on launch barge with Mar 173 yard number visible; Commons-categorized as Seabourn Pursuit pre-delivery"),

    # ---- Seabourn Quest (batch H, 2026-05-18) ------------------------------
    "assets/ships/seabourn/seabourn-quest/Seeabourn_Quest_2012_092.webp.attr.json": (
        "confirmed", "Broadside at anchor with tender operations; \"SEABOURN QUEST\" lettering visible on bow (filename typo \"Seeabourn\" inherited from Commons)"),
    "assets/ships/seabourn/seabourn-quest/Seabourn_Quest_2012_096.webp.attr.json": (
        "confirmed", "Tender close-up; \"SEABOURN QUEST / NASSAU\" lettering clearly visible on tender side; Nassau registry matches Seabourn Quest"),
    "assets/ships/seabourn/seabourn-quest/Seabourn_Quest_2012_091.webp.attr.json": (
        "consistent", "Distant anchored view from hillside above Mediterranean port; same photographer/series (Gordito1869) as confirmed 092 and 096; sister-class ambiguity (Odyssey/Sojourn/Quest share profile)"),
    "assets/ships/seabourn/seabourn-quest/Seabourn_Quest_2012_094.webp.attr.json": (
        "consistent", "Distant Quest with same Nassau-marked tender visible in foreground; same series as confirmed 092 and 096"),

    # ---- Seven Seas Splendor (batch H, 2026-05-18) -------------------------
    "assets/ships/regent/seven-seas-splendor/AaIMG_2409_Seven_Seas_Splendor.webp.attr.json": (
        "consistent", "Explorer-class ship at Fincantieri Ancona shipyard with FINCANTIERI red gantry behind; characteristic curved Observation Lounge dome on top; Commons categorization as Splendor + Ancona setting where she was built; sister-class ambiguity with Explorer and Grandeur applies"),

    # ---- Seven Seas Explorer (batch H, 2026-05-18) -------------------------
    "assets/ships/regent/seven-seas-explorer/Seven_Seas_Explorer.webp.attr.json": (
        "consistent", "Valletta waterfront sunset by Continentaleurope; filename explicitly claims Seven Seas Explorer; Explorer-class profile matches; no on-hull lettering legible at the angle/distance but Commons attribution + series context support the identification"),
    "assets/ships/regent/seven-seas-explorer/Cruise_liner_at_Valletta_Waterfromt.webp.attr.json": (
        "consistent", "Same photographer series as the explicitly-named Seven Seas Explorer file; Valletta sunset; Explorer-class profile; Commons categorized under Seven Seas Explorer (ship, 2016)"),

    # ---- Seven Seas Navigator (batch H, 2026-05-18) ------------------------
    "assets/ships/regent/seven-seas-navigator/7SeasNav.webp.attr.json": (
        "confirmed", "Close stern view; \"SEVEN SEAS NAVIGATOR / HAMILTON\" lettering clearly readable on stern"),
    "assets/ships/regent/seven-seas-navigator/Seven_Seas_Navigator_in_Venice.webp.attr.json": (
        "confirmed", "Broadside at Venice with tender boat in foreground; \"Seven Seas Navigator\" lettering visible on bow"),
    "assets/ships/regent/seven-seas-navigator/MS_Seven_Seas_Navigator_(4190594236).webp.attr.json": (
        "confirmed", "Stern view at port; \"SEVEN SEAS NAVIGATOR\" lettering visible on stern"),
    "assets/ships/regent/seven-seas-navigator/Regent_Seven_Seas__Navigator__(16149878575).webp.attr.json": (
        "consistent", "Caribbean broadside viewed from a beach with palm fronds in foreground; distinctive Navigator dome and profile match; same photographer (Ahecht) as confirmed file 4190594236"),
    "assets/ships/regent/seven-seas-navigator/US-port-canav-seven-seas-navigator.webp.attr.json": (
        "consistent", "Port Canaveral alongside view across the parking lot; distinctive Navigator dome and profile match; filename explicitly identifies the ship"),
    "assets/ships/regent/seven-seas-navigator/MS_Seven_Seas_Navigator_(4171640179).webp.attr.json": (
        "consistent", "Distant broadside in tropical waters near a small island; Navigator profile match; period film softness; filename explicitly identifies the ship"),

    # ---- Seven Seas Mariner (batch H, 2026-05-18) --------------------------
    "assets/ships/regent/seven-seas-mariner/Osaka_Seven-Seas-Mariner01n3200.webp.attr.json": (
        "confirmed", "Bow close-up at Osaka with Tempozan Ferris wheel behind; \"SEVEN SEAS MARINER\" lettering clearly readable on bow"),
    "assets/ships/regent/seven-seas-mariner/Osaka_Seven-Seas-Mariner02n3200.webp.attr.json": (
        "confirmed", "Three-quarter bow view at Osaka with the same Tempozan Ferris wheel; \"SEVEN SEAS MARINER\" lettering visible on bow"),
    "assets/ships/regent/seven-seas-mariner/Osaka_Seven-Seas-Mariner04s3200.webp.attr.json": (
        "confirmed", "Full broadside at Osaka; \"SEVEN SEAS MARINER\" lettering visible on bow; same photographer series as 01n and 02n"),

    # ---- Silver Endeavour (batch H, 2026-05-18) ----------------------------
    "assets/ships/silversea/silver-endeavour/Silver_Endeavour_-_Gerlache_Strait_-_Antarctica_-_V-P.webp.attr.json": (
        "confirmed", "Broadside in Antarctica's Gerlache Strait with iceberg behind; \"SILVER ENDEAVOUR\" lettering visible on bow"),
    "assets/ships/silversea/silver-endeavour/2025_Silver_Endeavour_-_IMO_9821873_-_by_2eight_-_9SC0463.webp.attr.json": (
        "confirmed", "Alongside at port (likely Ushuaia, 2025); \"SILVER ENDEAVOUR\" lettering visible on bow; IMO 9821873 in filename matches Silver Endeavour"),
    "assets/ships/silversea/silver-endeavour/Silver_Endeavour_in_Loch_Dunvegan_-_geograph.org.uk_-_7759264.webp.attr.json": (
        "consistent", "At anchor in Loch Dunvegan, Isle of Skye; distinctive Crystal Endeavor / Silver Endeavour expedition hull profile; geograph.org.uk attribution + filename + Loch Dunvegan setting support identification"),

    # ---- Silver Wind (batch H, 2026-05-18) ---------------------------------
    "assets/ships/silversea/silver-wind/Silver_Wind_-_Port_of_Bay_of_Cadiz_-_Photo_1.webp.attr.json": (
        "consistent", "Silversea Wind-class ship alongside at Port of Cádiz; iconic Silversea \"S\" funnel logo visible; sister-class ambiguity with Cloud/Shadow/Whisper but Commons attribution + Cádiz setting + Emijrp series match"),
    "assets/ships/silversea/silver-wind/Silver_Wind_-_Port_of_Bay_of_Cadiz_-_Photo_3.webp.attr.json": (
        "consistent", "Wider Cádiz view from same Emijrp series; Silversea Wind-class profile with city skyline framing; same-day series as Photo 1"),

    # ---- Silver Shadow (batch H, 2026-05-18) -------------------------------
    "assets/ships/silversea/silver-shadow/Silver_shadow_ovik01.webp.attr.json": (
        "consistent", "Elevated view of Silver Shadow alongside at Örnsköldsvik, Sweden; Silversea \"S\" funnel logo visible; Shadow-class profile; sister-class ambiguity with Silver Whisper applies"),
    "assets/ships/silversea/silver-shadow/Silver_shadow_ovik02.webp.attr.json": (
        "consistent", "Underway in Örnsköldsvik bay under cloudy skies; same photographer (Petey21) series as ovik01; Silversea \"S\" funnel logo visible; Shadow-class profile"),

    # ---- Silver Whisper (batch H, 2026-05-18) ------------------------------
    "assets/ships/silversea/silver-whisper/Silver_Whisper_Split.webp.attr.json": (
        "confirmed", "Bow shot alongside at Split, Croatia; \"SILVER WHISPER\" lettering clearly visible on bow; mountains and city behind"),
    "assets/ships/silversea/silver-whisper/Silver_Whisper7.webp.attr.json": (
        "consistent", "Broadside view with reeds and waterway in foreground; Silversea \"S\" funnel logo visible; Shadow-class profile (sister of Silver Shadow)"),

    # ---- Silver Moon (batch H, 2026-05-18) ---------------------------------
    "assets/ships/silversea/silver-moon/Silver_Moon_approaching_Pier_26_in_Port_of_Tallinn_26_June_2022.webp.attr.json": (
        "confirmed", "Stern view approaching Pier 26 at Port of Tallinn; \"SILVER MOON / NASSAU\" lettering clearly readable on stern"),
    "assets/ships/silversea/silver-moon/AaIMG_2422_Silver_Moon.webp.attr.json": (
        "consistent", "Alongside at a Fincantieri shipyard with construction cranes overhead; Muse-class profile; sister-class ambiguity with Silver Dawn / Silver Nova applies; Commons filename and uploader (Xocolatl) explicitly identifies Silver Moon"),

    # ---- Silver Dawn (batch H, 2026-05-18) ---------------------------------
    "assets/ships/silversea/silver-dawn/Silver_Dawn_IMO_9857937_P_Sorrento_20-04-2022_(1).webp.attr.json": (
        "consistent", "Broadside at anchor off Sorrento; Muse-class profile; IMO 9857937 in filename matches Silver Dawn; Wolfgang Fricke series with matching IMO; sister-class ambiguity with Moon/Nova applies"),
    "assets/ships/silversea/silver-dawn/Silver_Dawn_IMO_9857937_P_Sorrento_20-04-2022_(2).webp.attr.json": (
        "consistent", "Same Sorrento series from Wolfgang Fricke, slightly different angle; IMO match in filename"),
}


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    missed = []
    for rel, (level, note) in VERIFICATIONS.items():
        p = root / rel
        if not p.exists():
            missed.append(rel)
            continue
        data = json.loads(p.read_text())
        data["visual_verification"] = {
            "level": level,
            "method": "Manual Read-tool inspection of the .webp by the operator (or operator-supervised agent), 2026-05-14",
            "note": note,
        }
        p.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print(f"  [{level}] {rel}")
    if missed:
        print("MISSING sidecars:")
        for m in missed:
            print(f"  - {m}")
        return 1
    print(f"\nStamped {len(VERIFICATIONS)} sidecars.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
