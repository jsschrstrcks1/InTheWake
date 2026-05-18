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
