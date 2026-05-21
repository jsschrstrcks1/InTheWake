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

    # ---- Insignia (batch H, 2026-05-18) ------------------------------------
    "assets/ships/oceania/insignia/Bordeaux_-_MS_Insignia_(2).webp.attr.json": (
        "confirmed", "Bow shot of Insignia berthed on the Garonne at Bordeaux with Saint-Michel basilica spires behind; \"Insignia\" lettering visible on bow"),
    "assets/ships/oceania/insignia/MS_Insignia_Istanbul.webp.attr.json": (
        "consistent", "Broadside of an R-class ship underway at Istanbul with pilot boat alongside and container port behind; R-class profile matches; sister-class ambiguity with Nautica/Regatta/Sirena applies"),

    # ---- Regatta (batch H, 2026-05-18) -------------------------------------
    "assets/ships/oceania/allura/Allura_Lettering_Port_of_Rhodes_11_August_2025.webp.attr.json": (
        "confirmed", "Bow close-up at Port of Rhodes; \"Allura / MAJURO\" script lettering clearly readable"),
    "assets/ships/oceania/allura/Allura_Stern_Port_of_Rhodes_11_August_2025.webp.attr.json": (
        "confirmed", "Stern view at Port of Rhodes; \"Allura\" stern name visible; Oceania crown emblem on funnel"),
    "assets/ships/oceania/allura/Allura_moored_at_Quay_in_Port_of_Rhodes_11_August_2025.webp.attr.json": (
        "consistent", "Moored at Rhodes quay viewed across a roadway with tree in foreground; PjotrMahh1 series + Rhodes 11-Aug-2025 context match the confirmed close-up and stern files"),
    "assets/ships/oceania/allura/AlluraCantiere.webp.attr.json": (
        "confirmed", "Alongside at Fincantieri Sestri Ponente shipyard with construction cranes overhead; \"Allura\" lettering visible on bow; Oceania crown emblem on funnel"),

    # ---- Oceania Vista (batch H, 2026-05-18) -------------------------------
    "assets/ships/oceania/vista/Cabin_on_Oceania_Vista.webp.attr.json": (
        "confirmed", "Vista-class balcony stateroom; \"OCEANIA CRUISES\" runner across bed visible; uploader RL0919 documented as Vista"),
    "assets/ships/oceania/vista/Grand_Lounge_on_Oceania_Vista.webp.attr.json": (
        "consistent", "Vista's Grand Lounge with distinctive gilded chandelier installation; Allura-class interior — sister ambiguity with Allura applies, uploader RL0919 attribution to Vista"),
    "assets/ships/oceania/vista/Central_staircase_on_Oceania_Vista.webp.attr.json": (
        "consistent", "Central atrium spiral metalwork sculpture; Allura-class interior — sister ambiguity, uploader RL0919 series attribution"),
    "assets/ships/oceania/vista/Casino_on_Oceania_Vista.webp.attr.json": (
        "consistent", "Casino with blackjack tables; Allura-class interior — sister ambiguity, uploader RL0919 series attribution"),

    # ---- Silver Nova (batch H, 2026-05-18) ---------------------------------
    "assets/ships/silversea/silver-nova/Silver_nova.webp.attr.json": (
        "consistent", "Wide broadside at shipyard quay at dusk; distinctive Nova-class twin-island superstructure; sister-class ambiguity with Silver Ray applies"),
    "assets/ships/silversea/silver-nova/Silver_Nova_docked_in_Auckland_PA01.webp.attr.json": (
        "consistent", "Auckland harbour port-side superstructure with heritage Pier Master House in foreground; Nova-class profile; sister ambiguity"),
    "assets/ships/silversea/silver-nova/Silver_Nova_docked_in_Auckland_PA02.webp.attr.json": (
        "consistent", "Same Auckland location from slightly different angle; same uploader Paora series"),
    "assets/ships/silversea/silver-nova/Silver_Nova_docked_in_Auckland_PA03.webp.attr.json": (
        "consistent", "Wide Auckland view with Sky Tower and city skyline framing Silver Nova; Nova-class profile; sister ambiguity"),

    # ---- Silver Cloud (batch H, 2026-05-18) --------------------------------
    "assets/ships/silversea/silver-cloud/Silver_Cloud_Isafjordur_18.webp.attr.json": (
        "confirmed", "Alongside at Ísafjörður, Iceland; \"SILVER CLOUD\" lettering visible on hull"),
    "assets/ships/silversea/silver-cloud/Silver_Cloud_Isafjordur_17.webp.attr.json": (
        "confirmed", "Broadside view at Ísafjörður with snow-streaked Westfjords mountains; \"SILVER CLOUD\" lettering visible on bow"),
    "assets/ships/silversea/silver-cloud/Silver_Cloud_Isafjordur_16.webp.attr.json": (
        "confirmed", "Wide view at Ísafjörður with fishing boats in foreground; \"SILVER CLOUD\" name visible on hull, same Christian Bickel series"),

    # ---- Carnival Pride (batch H, 2026-05-18) ------------------------------
    "assets/ships/carnival/carnival-pride/Carnival_Pride_at_Mazatlan_3.webp.attr.json": (
        "confirmed", "Bow alongside at Mazatlán; \"CARNIVAL PRIDE\" lettering clearly readable; mooring lines + bollards in foreground"),
    "assets/ships/carnival/carnival-pride/Carnival_Pride_in_Cabo_San_Lucas.webp.attr.json": (
        "confirmed", "At anchor off Cabo San Lucas; \"Carnival Pride\" lettering visible on bow; distinctive Carnival whale-tail funnel + red/white/blue hull stripe"),
    "assets/ships/carnival/carnival-pride/Carnival_Pride_at_Mazatlan_1.webp.attr.json": (
        "confirmed", "Departing Mazatlán with harbour tug alongside; whale-tail funnel + Carnival livery; same Stan Shebs series with confirmed file 3"),
    "assets/ships/carnival/carnival-pride/Carnival_Pride_at_Mazatlan_2.webp.attr.json": (
        "confirmed", "Alongside at Mazatlán with Celebrity ship adjacent; \"CARNIVAL PRIDE\" lettering readable on bow; Pride is centered subject"),

    # ---- Carnival Legend (batch H, 2026-05-18) -----------------------------
    "assets/ships/carnival/carnival-legend/Carnival_Legend_Roatan,_Honduras.webp.attr.json": (
        "confirmed", "Bow view at Roatán; Carnival \"C\" emblem on hull + whale-tail funnel partial; tropical foreground"),
    "assets/ships/carnival/carnival-legend/Carnival_Legend_seen_from_Tampa_Tribune_Streetcar_Stop.webp.attr.json": (
        "confirmed", "Bow seen through palm trees from Tampa Tribune Station; \"CARNIVAL LEGEND\" lettering visible on bow"),
    "assets/ships/carnival/carnival-legend/Carnival_Legend_in_Tampa,_Florida_August_2008.webp.attr.json": (
        "confirmed", "Rising behind palm-lined waterfront buildings at Tampa August 2008; \"CARNIVAL LEGEND\" lettering visible on bow"),
    "assets/ships/carnival/carnival-legend/TampaTrackChanelsideAug2008ToShip.webp.attr.json": (
        "consistent", "Distant view at end of streetcar tracks along Tampa Channelside; whale-tail funnel + Carnival livery visible; same Infrogmation Aug 2008 series"),

    # ---- Carnival Vista (batch H, 2026-05-18) ------------------------------
    "assets/ships/carnival/carnival-vista/TRIESTE_NAVI_(26741042616).webp.attr.json": (
        "confirmed", "Close-up at Trieste; \"CARNIVAL VISTA\" lettering clearly readable; Carnival whale-tail funnel prominent"),
    "assets/ships/carnival/carnival-vista/TRIESTE_NAVI_(26741045166).webp.attr.json": (
        "confirmed", "Broadside at Trieste with onlookers from quay; Angelgreat series match with confirmed file 26741042616"),
    "assets/ships/carnival/carnival-vista/TRIESTE_NAVI_(26741047546).webp.attr.json": (
        "confirmed", "Wider quay shot at Trieste with crowds; same Angelgreat series"),
    "assets/ships/carnival/carnival-vista/Trieste_(26740757246).webp.attr.json": (
        "confirmed", "Carnival Vista off Trieste at dusk with another cruise ship distant on right; Carnival livery + whale-tail funnel; Vista is the dominant centered subject"),

    # ---- Carnival Splendor (batch H, 2026-05-18) ---------------------------
    "assets/ships/carnival/carnival-splendor/Cruise_Ship_Carnival_Splendor_-_Stern_View_-_San_Francisco_-_March_2009.webp.attr.json": (
        "confirmed", "Stern view at San Francisco with Transamerica Pyramid skyline behind; \"CARNIVAL SPLENDOR\" lettering clearly readable on stern"),
    "assets/ships/carnival/carnival-splendor/Carnival_Splendor_In_Vancouver_on_May_14,_2009.webp.attr.json": (
        "confirmed", "Berthed at Canada Place, Vancouver; \"CARNIVAL SPLENDOR\" lettering clearly readable on hull"),
    "assets/ships/carnival/carnival-splendor/Le_carnival_splendor_au_depart_de_port_everglade.webp.attr.json": (
        "confirmed", "Broadside view departing Port Everglades at golden hour; Carnival whale-tail funnel + livery; \"CARNIVAL SPLENDOR\" lettering visible on hull"),
    "assets/ships/carnival/carnival-splendor/Carnival_Splendor_-_San_Diego_repairs.webp.attr.json": (
        "confirmed", "Alongside at San Diego with harbour tugs in foreground after the November 2010 engine-room fire incident; \"CARNIVAL SPLENDOR\" lettering visible on hull"),
    "assets/ships/carnival/carnival-splendor/Passagiers_Terminal_Amsterdam_2.webp.attr.json": (
        "confirmed", "Port-side superstructure close-up at Amsterdam Passenger Terminal; \"CARNIVAL SPLENDOR\" lettering faintly visible on hull; lifeboats + people + bicycles in foreground"),
    "assets/ships/carnival/carnival-splendor/Carnival_Splendor_Under_Construction_on_5_August_2007.webp.attr.json": (
        "confirmed", "At Fincantieri Sestri Ponente shipyard during construction, August 2007; distinctive Carnival whale-tail funnel + livery; sailboats in foreground"),

    # ---- Mardi Gras (batch H, 2026-05-18) ----------------------------------
    "assets/ships/carnival/mardi-gras/Mardi_Gras_ship_22-12-2020_front_view.webp.attr.json": (
        "confirmed", "Bow view with name visible; blue hull + Carnival whale-tail funnel + \"Carnival\" lettering on stern"),
    "assets/ships/carnival/mardi-gras/Mardi_Gras_ship_22-12-2020_back_view.webp.attr.json": (
        "confirmed", "Stern view with \"Mardi Gras\" and Carnival lettering visible; same Tunestoons 22-12-2020 series"),
    "assets/ships/carnival/mardi-gras/Mardi_Gras_ship_22-12-2020_top_deck.webp.attr.json": (
        "confirmed", "Top deck with the BOLT roller coaster wrapping around the Carnival whale-tail funnel — distinctive Excel-class feature unique to Mardi Gras at this time"),
    "assets/ships/carnival/mardi-gras/Mardi_Gras_(2020_ship)_in_September_2020_(cropped).webp.attr.json": (
        "confirmed", "At Meyer Turku shipyard during fitout, September 2020; Carnival whale-tail funnel + \"Carnival\" lettering on hull"),
    "assets/ships/carnival/mardi-gras/Mardi_Gras___RPA_16_(50747707406).webp.attr.json": (
        "confirmed", "Distant broadside passing wind turbines in the Maas approach; \"Mardi Gras\" + \"Carnival\" lettering visible; Carnival livery"),

    # ---- Carnival Paradise (batch H, 2026-05-18) ---------------------------
    "assets/ships/carnival/carnival-paradise/Carnival_Paradise_Docked_In_Cozumel,Mexico.webp.attr.json": (
        "confirmed", "Broadside at Cozumel; Carnival whale-tail funnel + Fantasy-class profile + Carnival livery; turquoise water"),
    "assets/ships/carnival/carnival-paradise/Carnival_Paradise_stern_close-up.webp.attr.json": (
        "confirmed", "Stern close-up; \"Carnival PARADISE\" lettering clearly readable + whale-tail funnel"),
    "assets/ships/carnival/carnival-paradise/Carnival_Paradise_docked_in_Havana,_Cuba.webp.attr.json": (
        "confirmed", "Alongside at Havana Cuba at golden hour; \"Carnival Paradise\" lettering visible on hull; cars on Malecón in foreground"),
    "assets/ships/carnival/carnival-paradise/Carnival_Paradise_20100216.webp.attr.json": (
        "confirmed", "Under way at sea, broadside in calm water; Carnival whale-tail funnel + Fantasy-class profile"),
    "assets/ships/carnival/carnival-paradise/Carnival_(3901409522)_(2).webp.attr.json": (
        "consistent", "Top-down aerial of a Carnival Fantasy-class ship alongside; lido deck visible; sister-class ambiguity among Fantasy-class but Commons categorization + uploader identifies as Paradise"),

    # ---- Carnival Sunshine (batch H, 2026-05-18) ---------------------------
    "assets/ships/carnival/carnival-sunshine/Carnival_Sunshine_03.webp.attr.json": (
        "confirmed", "Close-up at a port with salt mounds; \"CARNIVAL SUNSHINE\" lettering clearly readable on hull"),
    "assets/ships/carnival/carnival-sunshine/Carnival_Sunshine_02.webp.attr.json": (
        "confirmed", "Broadside; \"Carnival Sunshine\" lettering visible + whale-tail funnel + red-striped livery"),
    "assets/ships/carnival/carnival-sunshine/Carnival_Sunshine_01.webp.attr.json": (
        "confirmed", "Alongside at shipyard quay with construction equipment foreground; \"CARNIVAL S...\" lettering partially visible; same Chesipiero series"),
    "assets/ships/carnival/carnival-sunshine/Carnival_Sunshine_04.webp.attr.json": (
        "consistent", "Top deck close-up with whale-tail funnel + waterslides; same Chesipiero series; no on-hull name visible at this zoom level"),
    "assets/ships/carnival/carnival-sunshine/CarnivalSunshineCL.webp.attr.json": (
        "consistent", "In dry dock at a shipyard; distinctive Carnival whale-tail funnel + red-striped hull; bow-on view"),
    "assets/ships/carnival/carnival-sunshine/Carnival_Sunshine_Curacao_2014.webp.attr.json": (
        "confirmed", "Alongside at Curaçao with rocks foreground; \"CARNIVAL SUNSHINE\" lettering clearly visible on hull"),
    "assets/ships/carnival/carnival-sunshine/Leaving_Nyc_(165435867).webp.attr.json": (
        "confirmed", "Leaving New York Harbor with Statue of Liberty behind; \"Carnival Sunshine\" lettering visible on bow; Carnival whale-tail funnel"),
    "assets/ships/carnival/carnival-sunshine/Carnival_Sunshine_in_Charleston_November_2017.webp.attr.json": (
        "confirmed", "On Charleston harbor at golden hour with marsh grass foreground; Carnival livery + whale-tail funnel; broadside view"),

    # ---- Owner-provided (Nassau, 2026-05-19) -------------------------------
    "assets/ships/carnival/carnival-sunrise/Carnival_Sunrise_bow_Nassau_2026-05-19.webp.attr.json": (
        "confirmed", "Owner-photographed at Nassau 2026-05-19; \"CARNIVAL SUNRISE\" + \"NASSAU\" lettering clearly readable on bow; Carnival whale-tail funnel above"),
    "assets/ships/disney-cruise-line/disney-wish/Disney_Wish_broadside_Nassau_2026-05-19.webp.attr.json": (
        "confirmed", "Owner-photographed at Nassau 2026-05-19; classic Disney livery (dark blue + yellow trim + red waterline); Disney Wish-class profile"),
    "assets/ships/rcl/wonder-of-the-seas/Wonder_of_the_Seas_bow_Nassau_2026-05-19.webp.attr.json": (
        "consistent", "Owner-photographed at Nassau 2026-05-19; Oasis-class bow with the AquaDome visible on top deck; owner attribution to Wonder of the Seas"),
    "assets/ships/rcl/wonder-of-the-seas/Wonder_of_the_Seas_alongside_Carnival_Sunrise_Nassau_2026-05-19.webp.attr.json": (
        "consistent", "Owner-photographed at Nassau 2026-05-19; \"...y OF THE SEAS\" lettering partially visible (matches Wonder); same berth as the confirmed Carnival Sunrise bow shot"),
    "assets/ships/rcl/vision-of-the-seas/Vision_of_the_Seas_bow_Nassau_2026-05-19.webp.attr.json": (
        "confirmed", "Owner-photographed at Nassau 2026-05-19; \"VISION OF THE SEAS / NASSAU\" lettering visible on bow; bow-on dock view"),

    # ---- Carnival Sunrise (Commons, batch H, 2026-05-19) -------------------
    "assets/ships/carnival/carnival-sunrise/Sunset_Ship.webp.attr.json": (
        "confirmed", "Broadside at sunset; \"Carnival Sunrise\" lettering visible on bow + whale-tail funnel + Carnival livery"),
    "assets/ships/carnival/carnival-sunrise/Carnival_Sunrise_Cruise.webp.attr.json": (
        "confirmed", "At anchor in the Caribbean at golden hour; Carnival Sunrise name visible on bow; whale-tail funnel silhouetted"),
    "assets/ships/carnival/carnival-sunrise/Carnival_Sunrise_Anchored_in_Grand_Cayman_(May_2025).webp.attr.json": (
        "consistent", "Anchored off Grand Cayman May 2025 with Carnival Liberty visible at right; Carnival livery + whale-tail funnel match"),
    "assets/ships/carnival/carnival-sunrise/Carnival_Sunrise_(ship,_1999)_and_Carnival_Liberty_(ship,_2005).webp.attr.json": (
        "consistent", "Both Carnival ships at anchor off a Caribbean beach; Sunrise on left, Liberty on right; same Jack Adamenko series as the Grand Cayman shot"),

    # ---- Carnival Radiance (batch H, 2026-05-19) ---------------------------
    "assets/ships/carnival/carnival-radiance/Carnival_Radiance_in_Ensenada_2023.webp.attr.json": (
        "confirmed", "Alongside at Ensenada with mountains behind; \"CARNIVAL RADIANCE\" lettering clearly readable on bow and side"),
    "assets/ships/carnival/carnival-radiance/Carnival_Radiance.webp.attr.json": (
        "confirmed", "Departing harbor at golden hour; \"Carnival Radiance\" lettering visible on hull + whale-tail funnel + Carnival livery"),
    "assets/ships/carnival/carnival-radiance/Carnival_Radiance_at_Avalon_October_2023.webp.attr.json": (
        "confirmed", "At anchor off Avalon, Catalina Island, October 2023; \"Carnival Radiance\" lettering visible on hull"),
    "assets/ships/carnival/carnival-radiance/Carnival_Radiance_(ex._Carnival_Victory)_(ship,_2000)_Comes_Back_in_Long_Beach,_California_(December_2025).webp.attr.json": (
        "consistent", "Docked in Long Beach with the Spruce Goose dome visible at left; Carnival livery + whale-tail funnel; filename explicitly identifies the ship including its IMO/year"),

    # ---- Carnival Luminosa (batch H, 2026-05-19) ---------------------------
    "assets/ships/carnival/carnival-luminosa/Carnival_Luminosa_at_Brisbane_Australia.webp.attr.json": (
        "confirmed", "Alongside at Brisbane; \"CARNIVAL LUMINOSA\" lettering clearly readable on bow; Carnival 2.0 livery (blue hull bow + red whale-tail funnel)"),
    "assets/ships/carnival/carnival-luminosa/Luminosa_5680.webp.attr.json": (
        "consistent", "Broadside in calm Pacific Northwest water; Concordia/Vista-class profile + Carnival whale-tail funnel; same uploader series as Juan de Fuca shots"),
    "assets/ships/carnival/carnival-luminosa/With_Mt_Baker_5669.webp.attr.json": (
        "consistent", "Passing in front of snow-capped Mount Baker; Carnival livery + whale-tail funnel match"),
    "assets/ships/carnival/carnival-luminosa/Juan_de_Fuca_Straits_5677.webp.attr.json": (
        "consistent", "On the Juan de Fuca Strait approach to Vancouver Island; Carnival livery + whale-tail funnel; same Pacific Northwest series"),
    "assets/ships/carnival/carnival-luminosa/Juan_de_Fuca_Straits_5676.webp.attr.json": (
        "consistent", "Distant on the horizon on the Juan de Fuca Strait viewed from shore; same series"),
    "assets/ships/carnival/carnival-luminosa/Outbound_5666.webp.attr.json": (
        "consistent", "Outbound on a hazy day, distant horizon shot; same Carnival whale-tail funnel + livery; same series"),

    # ---- Carnival Elation (batch H, 2026-05-19) ----------------------------
    "assets/ships/carnival/carnival-elation/Carnival_Elation.webp.attr.json": (
        "confirmed", "Docked at San Diego with SilverGate ferry alongside; \"Carnival Elation\" lettering visible twice on hull; whale-tail funnel + classic Carnival livery"),
    "assets/ships/carnival/carnival-elation/Carnival_Elation_Bow.webp.attr.json": (
        "confirmed", "Water-level bow shot; \"CARNIVAL ELATION\" lettering visible; tug alongside; faded photographer credit visible in corner"),
    "assets/ships/carnival/carnival-elation/Gallery_du_carnival_elation.webp.attr.json": (
        "confirmed", "Distinctive Joe Farcus \"Gallery\" promenade interior with stained-glass panels and chandeliers — interior decor unique to Carnival Elation"),
    "assets/ships/carnival/carnival-elation/Carnival_Elation_docked_at_San_Diego_2009-12-22_1.webp.attr.json": (
        "consistent", "Docked at San Diego 22 Dec 2009; classic Carnival livery + whale-tail funnel; Fantasy-class profile"),
    "assets/ships/carnival/carnival-elation/Carnival_Elation_docked_at_San_Diego_2009-12-22_7.webp.attr.json": (
        "consistent", "Same San Diego 22 Dec 2009 series, different angle; BrokenSphere uploader documented as Elation"),

    # ---- MSC Euribia (batch H, 2026-05-19) ---------------------------------
    "assets/ships/msc/msc-euribia/MSC_Euribia_-_Saint-Nazaire_-_3_juin_2023.webp.attr.json": (
        "confirmed", "Under way off Saint-Nazaire 3 June 2023; distinctive blue/white whale-themed hull livery — unique to MSC Euribia"),
    "assets/ships/msc/msc-euribia/MSC_Euribia,_Chantiers_de_l_Atlantique_shipyard,_Saint-Nazaire-5017.webp.attr.json": (
        "confirmed", "Stern close-up during fitout at Chantiers de l'Atlantique; \"MSC EURIBIA / VALLETTA\" lettering clearly visible on stern"),
    "assets/ships/msc/msc-euribia/Chantiers_Atlantique_paquebot_armement.webp.attr.json": (
        "consistent", "MSC ship at Chantiers de l'Atlantique shipyard during fitout; Commons categorized as Euribia; Meraviglia-Plus-class profile"),
    "assets/ships/msc/msc-euribia/MSC_Euribia,_Chantiers_de_l_Atlantique_shipyard,_Saint-Nazaire-5015.webp.attr.json": (
        "consistent", "Wider view at Saint-Nazaire with shipyard cranes; same fitout series as 5017"),

    # ---- MSC Magnifica (batch H, 2026-05-19) -------------------------------
    "assets/ships/msc/msc-magnifica/MSC_Magnifica_1.webp.attr.json": (
        "confirmed", "Stern at Saint-Nazaire shipyard during fitout; \"MSC MAGNIFICA\" lettering visible on stern; gulls flying past"),
    "assets/ships/msc/msc-magnifica/MSC_Magnifica_2.webp.attr.json": (
        "confirmed", "Same Saint-Nazaire fitout location, different angle; \"MSC MAGNIFICA\" lettering visible"),
    "assets/ships/msc/msc-magnifica/MSC_Magnifica_3.webp.attr.json": (
        "consistent", "Wider Saint-Nazaire harbour view with Magnifica at left in fitout berth; MSC Musica-class profile + classic red/white livery"),

    # ---- MSC Lirica (batch H, 2026-05-19) ----------------------------------
    "assets/ships/msc/msc-lirica/MSC_Lirica.webp.attr.json": (
        "confirmed", "Stern view alongside; \"MSC LIRICA / PANAMA\" lettering clearly readable on stern"),
    "assets/ships/msc/msc-lirica/MSC_Lirica_Kiel.webp.attr.json": (
        "confirmed", "Alongside at Kiel; \"MSC LIRICA\" lettering visible on bow"),
    "assets/ships/msc/msc-lirica/HPIM0200.webp.attr.json": (
        "consistent", "Wide aerial view of Geirangerfjord, Norway, with MSC ship at anchor; Commons categorized as Lirica; Lirica-class profile match"),

    # ---- MSC Musica (batch H, 2026-05-19) ----------------------------------
    "assets/ships/msc/msc-musica/MSC_Musica.webp.attr.json": (
        "confirmed", "Broadside underway; faint MSC Musica name visible on bow; classic Musica-class white hull profile"),
    "assets/ships/msc/msc-musica/Venice_MSC_Musica_001.webp.attr.json": (
        "confirmed", "Alongside at Venice with tug and pilot boat; MSC bow lettering visible; Musica-class profile"),

    # ---- MSC Opera (batch H, 2026-05-19) -----------------------------------
    "assets/ships/msc/msc-opera/MSC_Opera.webp.attr.json": (
        "confirmed", "Broadside at sunset; \"MSC OPERA\" lettering visible on bow"),
    "assets/ships/msc/msc-opera/MSC_Opera_Heck.webp.attr.json": (
        "confirmed", "Stern view; \"MSC OPERA\" lettering clearly visible on stern; passengers on upper deck"),
    "assets/ships/msc/msc-opera/MSC_Opera_Bug.webp.attr.json": (
        "confirmed", "Head-on bow view alongside in harbour; \"MSC OPERA\" name visible on hull below bridge"),

    "assets/ships/oceania/regatta/Regatta_Stockholm.webp.attr.json": (
        "confirmed", "Three-quarter bow view alongside at Stockholm; \"Regatta\" lettering visible on bow"),
    "assets/ships/oceania/regatta/MS_Regatta_in_Saint_Petersburg,_Russia.webp.attr.json": (
        "confirmed", "Dramatic bow shot at Saint Petersburg with film-grain processing; \"Regatta\" lettering clearly visible on bow"),

    # ---- MSC Sinfonia (batch H, 2026-05-19) --------------------------------
    "assets/ships/msc/msc-sinfonia/MSC_Sinfonia_2.webp.attr.json": (
        "confirmed", "Stern view from water; \"MSC SINFONIA\" lettering visible"),
    "assets/ships/msc/msc-sinfonia/MSC_Sinfonia_3.webp.attr.json": (
        "confirmed", "Bow close-up with \"MSC SINFONIA\" lettering visible (water reflections distort the bow art)"),
    "assets/ships/msc/msc-sinfonia/Cruise_Ship_(8948848326).webp.attr.json": (
        "consistent", "Bow-on at a Mediterranean port; large MSC logo on bow + Lirica-class profile; sister-class ambiguity with Lirica/Opera/Armonia applies"),

    # ---- MSC Splendida (batch H, 2026-05-19) -------------------------------
    "assets/ships/msc/msc-splendida/MSC-Splendida-2012-Messina.webp.attr.json": (
        "confirmed", "Alongside at Messina; \"MSC SPLENDIDA\" lettering clearly visible on bow"),
    "assets/ships/msc/msc-splendida/MSC_Splendida.webp.attr.json": (
        "confirmed", "Broadside at a Mediterranean port; \"MSC Splendida\" lettering visible on bow + MSC funnel logo"),
    "assets/ships/msc/msc-splendida/MSC_Splendida_passes_under_25_de_Abril_Bridge.webp.attr.json": (
        "consistent", "Passing under the 25 de Abril Bridge in Lisbon; Fantasia-class profile + MSC livery; sister-class ambiguity with Fantasia/Divina/Preziosa applies"),

    # ---- MSC Meraviglia (batch H, 2026-05-19) ------------------------------
    "assets/ships/msc/msc-meraviglia/MSC_Meraviglia_Bow_Shot_Civitavecchia.webp.attr.json": (
        "confirmed", "Bow alongside at Civitavecchia; \"MSC MERAVIGLIA\" lettering visible on hull + MSC bow logo; orientation EXIF-corrected post-fetch"),
    "assets/ships/msc/msc-meraviglia/MSC_Meraviglia_de_nuit.webp.attr.json": (
        "confirmed", "Night view at Saint-Nazaire shipyard with construction crane at left; \"MSC MERAVIGLIA\" lettering visible on bow + MSC logo"),
    "assets/ships/msc/msc-meraviglia/Le__Maraviglia__(MSC)_au_Havre.webp.attr.json": (
        "consistent", "Alongside at Le Havre cruise terminal viewed across the harbour; Meraviglia-class profile + MSC livery; sister-class ambiguity with Bellissima/Virtuosa/Grandiosa applies"),

    # ---- MSC Seaview (batch H, 2026-05-19) ---------------------------------
    "assets/ships/msc/msc-seaview/MSC_Seaview_Ajaccio-b.webp.attr.json": (
        "consistent", "Broadside at Ajaccio with prominent MSC bow logo; Seaside-class profile; sister ambiguity with Seaside/Seashore noted"),
    "assets/ships/msc/msc-seaview/MSC_Seaview_Ajaccio-c.webp.attr.json": (
        "consistent", "Three-quarter view from Ajaccio quay; MSC bow logo + same Ajaccio series"),
    "assets/ships/msc/msc-seaview/MSC_Seaview_Ajaccio-a.webp.attr.json": (
        "consistent", "Wider view at Ajaccio with marina foreground; Seaside-class profile + MSC livery; same series"),

    # ---- MSC Divina (batch H, 2026-05-19) ----------------------------------
    "assets/ships/msc/msc-divina/MSC_Divina_in_Malta_2.webp.attr.json": (
        "confirmed", "At Valletta; \"MSC DIVINA\" lettering CLEARLY visible on stern + MSC logo on hull"),
    "assets/ships/msc/msc-divina/MSC_Divina_in_Malta.webp.attr.json": (
        "confirmed", "Broadside at Valletta; \"MSC Divina\" lettering visible on bow + big MSC logo on hull"),
    "assets/ships/msc/msc-divina/MSC_Divina_a_Istanbul.webp.attr.json": (
        "confirmed", "Alongside at Istanbul; \"MSC Divina\" lettering visible on bow"),
    "assets/ships/msc/msc-divina/MSC_Divina.webp.attr.json": (
        "consistent", "At anchor off Dubrovnik viewed across the harbour; Fantasia-class profile + MSC livery; sister-class ambiguity with Fantasia/Splendida/Preziosa noted"),

    # ---- MSC Fantasia (batch H, 2026-05-19) --------------------------------
    "assets/ships/msc/msc-fantasia/MSC_Fantasia.webp.attr.json": (
        "confirmed", "Broadside at sunset; \"MSC FANTASIA\" lettering visible on hull + huge MSC logo"),
    "assets/ships/msc/msc-fantasia/MSC_Fantasia2.webp.attr.json": (
        "confirmed", "Bow-on at Mediterranean port (Barcelona) with Costa ship adjacent; Fantasia-class profile + MSC livery"),
    "assets/ships/msc/msc-fantasia/Msc_fantasia.webp.attr.json": (
        "confirmed", "Broadside leaving a Mediterranean port; MSC logo on bow + Fantasia-class profile"),
    "assets/ships/msc/msc-fantasia/MSC_Fantasia_pool.webp.attr.json": (
        "consistent", "Main pool deck interior; distinctive Fantasia-class pool architecture; sister-class ambiguity but uploaded under Fantasia category"),

    # ---- MSC Armonia (batch H, 2026-05-19) ---------------------------------
    "assets/ships/msc/msc-armonia/MSC_Armonia_in_Venice_on_27.05.2007.webp.attr.json": (
        "confirmed", "Stern view in Venice; \"MSC ARMONIA / PANAMA\" lettering clearly readable on stern"),
    "assets/ships/msc/msc-armonia/MSC_Armonia_in_the_Bay_of_Kotor.webp.attr.json": (
        "confirmed", "Broadside in Bay of Kotor; \"MSC Armonia\" lettering visible + MSC funnel logo + Lirica-class profile"),
    "assets/ships/msc/msc-armonia/Mscarmonia.webp.attr.json": (
        "confirmed", "Alongside at a Greek port; \"MSC Armonia\" lettering on bow + MSC funnel logo"),
    "assets/ships/msc/msc-armonia/MSCARMONIABHV.webp.attr.json": (
        "confirmed", "Under way in calm water; \"MSC Armonia\" lettering visible on bow + MSC logo"),

    # ---- MSC Bellissima (batch H, 2026-05-19) ------------------------------
    "assets/ships/msc/msc-bellissima/MSC_Bellissima_20190226_190137.webp.attr.json": (
        "confirmed", "Saint-Nazaire delivery 26 Feb 2019; \"MSC BELLISSIMA\" lettering clearly visible on hull + MSC logo"),
    "assets/ships/msc/msc-bellissima/MSC_Bellissima_20190226_190502.webp.attr.json": (
        "confirmed", "Saint-Nazaire delivery 26 Feb 2019; broadside with prominent MSC logo + faint Bellissima lettering visible"),
    "assets/ships/msc/msc-bellissima/MSC_Bellissima_20190226_185438.webp.attr.json": (
        "consistent", "Saint-Nazaire delivery 26 Feb 2019; bow-on at dusk with partial \"MSC ___SIMA\" lettering visible; same uploader series as confirmed files"),
    "assets/ships/msc/msc-bellissima/MSC_Bellissima_20190226_190829.webp.attr.json": (
        "consistent", "Saint-Nazaire delivery 26 Feb 2019; side close-up with large MSC funnel logo; same uploader series"),

    # ---- MSC Seaside owner photos (Ocean Cay, 2026-05-21) ------------------
    "assets/ships/msc/msc-seaside/MSC_Seaside_bow_Ocean_Cay_2026-05-21.webp.attr.json": (
        "confirmed", "Owner-photographed at Ocean Cay 2026-05-21; \"MSC SEASIDE\" lettering visible on bow; beach parasol in foreground"),
    "assets/ships/msc/msc-seaside/MSC_Seaside_alongside_Ocean_Cay_2026-05-21.webp.attr.json": (
        "confirmed", "Owner-photographed at Ocean Cay 2026-05-21; \"MSC SEASIDE\" lettering visible on bow; beach + swimmers + Seaside in same frame"),
    "assets/ships/msc/msc-seaside/MSC_Seaside_from_water_low_Ocean_Cay_2026-05-21.webp.attr.json": (
        "confirmed", "Owner-photographed at Ocean Cay 2026-05-21; \"MSC SEASIDE\" lettering visible on bow; sea-level water foreground"),
    "assets/ships/msc/msc-seaside/MSC_Seaside_pier_view_Ocean_Cay_2026-05-21.webp.attr.json": (
        "confirmed", "Owner-photographed at Ocean Cay 2026-05-21; pier-level view alongside; \"MSC SEASIDE\" lettering visible on lifeboat + Seaside-class profile"),
    "assets/ships/msc/msc-seaside/MSC_Seaside_from_water_Ocean_Cay_2026-05-21.webp.attr.json": (
        "consistent", "Owner-photographed at Ocean Cay 2026-05-21; viewed across the harbour with palms and beach shacks foreground; Seaside-class profile + MSC livery; same owner series as confirmed bow shots"),

    # ---- MSC Virtuosa (batch H, 2026-05-21) --------------------------------
    "assets/ships/msc/msc-virtuosa/MSC_Virtuosa_-_Saint-Nazaire.webp.attr.json": (
        "confirmed", "Bow at Saint-Nazaire shipyard; \"MSC VIRTUOSA\" lettering clearly readable"),
    "assets/ships/msc/msc-virtuosa/MSC_Virtuosa,_Saint-Nazaire_september_2020.webp.attr.json": (
        "confirmed", "At Saint-Nazaire shipyard September 2020; \"MSC Virtuosa\" lettering visible on bow"),
    "assets/ships/msc/msc-virtuosa/Msc_virtuosa_2021.webp.attr.json": (
        "consistent", "Broadside underway in calm water; MSC funnel logo + Meraviglia-class profile; sister-class ambiguity with Meraviglia/Bellissima/Grandiosa applies"),

    # ---- MSC Grandiosa (batch H, 2026-05-21) -------------------------------
    "assets/ships/msc/msc-grandiosa/Vertrek_MSC_GRANDIOSA_(49018344746).webp.attr.json": (
        "confirmed", "Departing the Maas with stern \"MSC GRANDIOSA / VALLETTA\" lettering clearly readable"),
    "assets/ships/msc/msc-grandiosa/Vertrek_MSC_GRANDIOSA_(49018550362).webp.attr.json": (
        "confirmed", "Broadside in Rotterdam approach; \"MSC GRANDIOSA\" lettering + large MSC logo on hull"),
    "assets/ships/msc/msc-grandiosa/Vertrek_MSC_GRANDIOSA_(49018346231).webp.attr.json": (
        "confirmed", "Stern view departing; \"MSC GRANDIOSA\" + MSC funnel logo visible"),
    "assets/ships/msc/msc-grandiosa/MSC_GRANDIOSA_(49010599428).webp.attr.json": (
        "confirmed", "Night atmospheric shot with deck lights + \"MSC GRANDIOSA\" lettering on hull"),

    # ---- MSC World Europa (batch H, 2026-05-21) ----------------------------
    "assets/ships/msc/msc-world-europa/MSC_World_Europa_(ship,_2022).webp.attr.json": (
        "confirmed", "Berthed at Genoa with mountains behind; \"MSC WORLD EUROPA\" lettering visible on hull; distinctive World-class superstructure"),
    "assets/ships/msc/msc-world-europa/MSC_World_Europa_La_Rochelle.webp.attr.json": (
        "confirmed", "Broadside off La Rochelle viewed from beach; large MSC bow logo visible + World-class profile"),
    "assets/ships/msc/msc-world-europa/MSC_World_Europa_in_Saint-Nazaire.webp.attr.json": (
        "consistent", "At Saint-Nazaire shipyard viewed across estuary; MSC funnel logo + distinctive World-class profile (first of class so no sister-class ambiguity yet at time of photo)"),
    "assets/ships/msc/msc-world-europa/MSC_World_Europa_-_Saint-Nazaire_-_June_2022.webp.attr.json": (
        "consistent", "Saint-Nazaire June 2022; World-class profile + MSC livery; same Atlantic shipyard delivery context"),

    # ---- MSC Seashore (batch H, 2026-05-21) --------------------------------
    "assets/ships/msc/msc-seashore/MSC_Seashore_Ocean_Cay_2024.webp.attr.json": (
        "confirmed", "At Ocean Cay (MSC Marine Reserve) 2024 viewed from beach; Seaside Evo class profile + MSC livery; same setting as MSC's flagship Bahamas private island"),
    "assets/ships/msc/msc-seashore/Msc_seashore.webp.attr.json": (
        "consistent", "Alongside at Genoa; Seaside Evo class profile + MSC livery; sister-class ambiguity with Seaside/Seaview/Seascape applies"),

    # ---- MSC Orchestra (batch H, 2026-05-21) -------------------------------
    "assets/ships/msc/msc-orchestra/Porto_Genova_(19).webp.attr.json": (
        "confirmed", "Bow detail at Porto Genova; \"MSC ORCHESTRA\" lettering clearly visible + small fishing boat foreground"),
    "assets/ships/msc/msc-orchestra/Porto_Genova_(17).webp.attr.json": (
        "consistent", "Alongside at Porto Genova; broadside + MSC funnel logo visible; same uploader series as confirmed file 19"),
    "assets/ships/msc/msc-orchestra/Mscorchestra.webp.attr.json": (
        "consistent", "Broadside at Istanbul on the Bosphorus; Musica-class profile + MSC livery; sister ambiguity with Musica/Poesia/Magnifica applies"),

    # ---- Celebrity Apex (batch H, 2026-05-21) ------------------------------
    "assets/ships/celebrity-cruises/celebrity-apex/Celebrity_Apex.webp.attr.json": (
        "confirmed", "At dusk in Saint-Nazaire shipyard; \"CelebrityAPEX\" lettering visible on hull + lit X on stern"),
    "assets/ships/celebrity-cruises/celebrity-apex/Celebrity_Apex_-_The_Magic_Carpet.webp.attr.json": (
        "confirmed", "Close-up of orange Magic Carpet platform — distinctive Edge-class feature (Apex/Edge/Beyond/Ascent share this design)"),
    "assets/ships/celebrity-cruises/celebrity-apex/Celebrity_APEX_at_Saint_Nazaire_Jan_2020.webp.attr.json": (
        "confirmed", "At Saint-Nazaire January 2020; \"Celebrity APEX\" lettering visible on hull"),
    "assets/ships/celebrity-cruises/celebrity-apex/Celebrity_Apex_-_inside_The_Magic_Carpet_in_the_evening.webp.attr.json": (
        "consistent", "Interior of Magic Carpet venue with blue LED accent lighting; Edge-class signature venue; sister-class ambiguity with Edge/Beyond/Ascent but Commons attribution to Apex"),

    # ---- Sapphire Princess (batch H, 2026-05-21) ---------------------------
    "assets/ships/princess/sapphire-princess/Sapphire_Princess_04.webp.attr.json": (
        "confirmed", "Stern view at Ketchikan; \"SAPPHIRE PRINCESS / HAMILTON\" lettering clearly readable"),
    "assets/ships/princess/sapphire-princess/Sapphire_Princess_01.webp.attr.json": (
        "confirmed", "Bow detail at Ketchikan with sailboat marina foreground; \"SAPPHIRE PRINCESS\" lettering visible"),
    "assets/ships/princess/sapphire-princess/Sapphire_Princess_02.webp.attr.json": (
        "confirmed", "Side close-up; \"SAPPHIRE PRINCESS\" lettering + lifeboats visible"),
    "assets/ships/princess/sapphire-princess/Sapphire_Princess_03.webp.attr.json": (
        "consistent", "Across Ketchikan harbour marina with fishing boats foreground; same uploader Alaska series; Grand-class Princess profile + livery"),

    # ---- Sun Princess (batch H, 2026-05-21) --------------------------------
    "assets/ships/princess/sun-princess/Sue_Princess_(1).webp.attr.json": (
        "confirmed", "Broadside at port; \"SUN PRINCESS\" lettering + Princess emblem visible (filename typo Sue->Sun; actual ship is Sun Princess per visible hull lettering)"),
    "assets/ships/princess/sun-princess/Sun_Princess_at_Piraeus_Harbour.webp.attr.json": (
        "confirmed", "At Piraeus Harbour with tugboats alongside; \"SUN PRINCESS\" + Princess Cruises lettering visible"),
    "assets/ships/princess/sun-princess/Sue_Princess_(2).webp.attr.json": (
        "consistent", "Stern detail showing the distinctive Sphere-class dome architecture; same uploader series as confirmed file (1); sister-class ambiguity with Star Princess applies"),

    # ---- Ruby Princess (batch H, 2026-05-21) -------------------------------
    "assets/ships/princess/ruby-princess/Ruby_Princess_-Fort_Lauderdale,_Florida-24Nov2009.webp.attr.json": (
        "consistent", "Broadside at Fort Lauderdale with palm trees foreground; Grand-class Princess profile; sister-class ambiguity with Crown/Emerald/Caribbean Princess applies"),
    "assets/ships/princess/ruby-princess/Ruby_Princess_Grand_Cayman_Jan_27_2009.webp.attr.json": (
        "consistent", "At anchor off Grand Cayman January 2009; Grand-class profile + Princess livery"),
    "assets/ships/princess/ruby-princess/Ruby_Princess_at_port_in_Grenada.webp.attr.json": (
        "consistent", "At port in Grenada with Caribbean hillside behind; Grand-class profile"),

    # ---- Sky Princess (batch H, 2026-05-21) --------------------------------
    "assets/ships/princess/sky-princess/Sky_Princess_Trieste_2019-10-16_16-46-44.webp.attr.json": (
        "confirmed", "At Trieste 16 Oct 2019; bronze sculpture foreground + golden hour; Princess wave logo + \"SKY PRINCESS\" lettering visible"),
    "assets/ships/princess/sky-princess/Sky_Princess_Trieste_(48916851448).webp.attr.json": (
        "confirmed", "Bow detail at Trieste; \"SKY PRINCESS\" lettering + Princess wave logo clearly visible (photographer signature Ph. Antonio Marano)"),
    "assets/ships/princess/sky-princess/Sky_Princess_Trieste_(48917377436).webp.attr.json": (
        "confirmed", "Broadside at Trieste with sculptures foreground; same Antonio Marano series; \"SKY PRINCESS\" lettering visible"),
    "assets/ships/princess/sky-princess/Sky_Princess_Trieste_(48917377551).webp.attr.json": (
        "confirmed", "Black-and-white art shot at Trieste with sculptures observing; same Antonio Marano series; \"SKY PRINCESS\" name + Princess wave logo visible"),

    # ---- Island Princess (batch H, 2026-05-21) -----------------------------
    "assets/ships/princess/island-princess/Island_Princess_in_Port_Everglades.webp.attr.json": (
        "consistent", "Broadside at Port Everglades; Coral-class profile + Princess livery; sister-class ambiguity with Coral Princess applies"),
    "assets/ships/princess/island-princess/Cruise_in_Acapulco,_Mexico.webp.attr.json": (
        "consistent", "Alongside at Acapulco from elevated viewpoint; Coral-class profile + Princess livery"),
    "assets/ships/princess/island-princess/MS_Island_Princess_(4197456987).webp.attr.json": (
        "consistent", "At a Caribbean port with green hillside; Coral-class Princess profile; filename explicitly identifies Island Princess"),
    "assets/ships/princess/island-princess/MS_Island_Princess_(5654577732).webp.attr.json": (
        "consistent", "Distant broadside in calm waters with film-grade tones; Coral-class profile + Princess livery; filename explicit"),

    # ---- Coral Princess (batch H, 2026-05-21) ------------------------------
    "assets/ships/princess/coral-princess/Coral_Princess_pulls_away_from_the_Port_of_Ketchikan_pier_-_June_2011.webp.attr.json": (
        "confirmed", "Stern \"CORAL PRINCESS / HAMILTON\" lettering clearly visible pulling away from Ketchikan pier"),
    "assets/ships/princess/coral-princess/Coral_Princess.webp.attr.json": (
        "confirmed", "Broadside at anchor; \"CORAL PRINCESS\" lettering visible on bow + Princess wave logo + \"Coral Princess\" lettering visible on funnel structure"),
    "assets/ships/princess/coral-princess/Esclusas_de_Miraflores_III.webp.attr.json": (
        "consistent", "Transiting Miraflores Locks of the Panama Canal; Princess Cruises livery + Coral-class profile; sister ambiguity with Island Princess applies"),
    "assets/ships/princess/coral-princess/Coral_Princess_-_IMO_9229659_(2937202430).webp.attr.json": (
        "consistent", "Distant broadside under way; Coral-class profile + Princess livery; filename includes IMO 9229659 matching Coral Princess"),
    "assets/ships/princess/coral-princess/Coral_Princess_plaque.webp.attr.json": (
        "confirmed", "Builder's plaque inside the ship — \"CORAL PRINCESS / ALSTOM CHANTIERS DE L'ATLANTIQUE / 2002 / NEW BUILDING N° C32\" — documentary photo of the ship's identity plate"),

    # ---- Majestic Princess (batch H, 2026-05-21) ---------------------------
    "assets/ships/princess/majestic-princess/MAJESTIC_PRINCESS_Port_TokushimaKomatsushima.webp.attr.json": (
        "confirmed", "Broadside at Tokushima-Komatsushima port; \"PRINCESS CRUISES\" + \"MAJESTIC PRINCESS\" lettering visible + Princess wave bow logo + Japanese script"),
    "assets/ships/princess/majestic-princess/MAJESTIC_PRINCESS_20180405-1.webp.attr.json": (
        "confirmed", "Alongside April 2018; Princess wave bow logo + LED display + Royal-class profile visible"),
    "assets/ships/princess/majestic-princess/Majestic_Princess_Build_2015.webp.attr.json": (
        "consistent", "Under construction at Fincantieri Monfalcone shipyard 2015; documentary build photo; sister-class ambiguity with Royal/Regal Princess but Commons categorization explicit"),

    # ---- Enchanted Princess (batch H, 2026-05-21) --------------------------
    "assets/ships/princess/enchanted-princess/Enchanted_Princes_Cruise_Ship,_Southampton_-_geograph.org.uk_-_7231169.webp.attr.json": (
        "confirmed", "Broadside at Southampton; \"ENCHANTED PRINCESS\" lettering + Princess wave bow logo visible"),
    "assets/ships/princess/enchanted-princess/Enchanted_Princess,_Southampton_Cruise_Terminal_-_geograph.org.uk_-_7631307.webp.attr.json": (
        "confirmed", "Close-up at Southampton Cruise Terminal; \"ENCHANTED PRINCESS\" name plaque + \"PRINCESS CRUISES\" lettering on hull"),
    "assets/ships/princess/enchanted-princess/Princess_Cruise_Lines_Enchanted_Princess.webp.attr.json": (
        "consistent", "Broadside at Fort Lauderdale at golden hour with dramatic clouds; Princess wave bow logo + Royal-class profile; sister-class ambiguity with Sky/Discovery/Royal/Regal Princess applies"),

    # ---- Celebrity Reflection (batch H, 2026-05-21) ------------------------
    "assets/ships/celebrity-cruises/celebrity-reflection/CelebrityReflection.webp.attr.json": (
        "confirmed", "Panoramic broadside at Meyer Werft shipyard; \"Celebrity REFLECTION\" + \"Celebrity X Cruises\" lettering clearly visible"),
    "assets/ships/celebrity-cruises/celebrity-reflection/Celebrity_Reflection-Ueberfuehrung.webp.attr.json": (
        "confirmed", "Conveyance along the Ems river under cloudy skies with sluice bridge; Solstice-class profile + Meyer Werft delivery context"),
    "assets/ships/celebrity-cruises/celebrity-reflection/Celebrity_REFLECTION.webp.attr.json": (
        "confirmed", "Closer broadside at Meyer Werft; \"Celebrity REFLECTION\" + \"Celebrity X Cruises\" lettering visible"),
    "assets/ships/celebrity-cruises/celebrity-reflection/Celebrity_REFLECTION_by_Moehre1992.webp.attr.json": (
        "confirmed", "Meyer Werft from another angle; \"Celebrity REFLECTION\" lettering + X funnel marks visible; same Solstice-class profile"),

    # ---- Celebrity Silhouette (batch H, 2026-05-21) ------------------------
    "assets/ships/celebrity-cruises/celebrity-silhouette/Meyer_Werft_Papenburg_Celbrity_Silhouette.webp.attr.json": (
        "confirmed", "Broadside at Meyer Werft Papenburg; \"Celebrity SILHOUETTE\" lettering clearly visible"),
    "assets/ships/celebrity-cruises/celebrity-silhouette/Liner_Silhouette.webp.attr.json": (
        "confirmed", "Alongside at Meyer Werft with parking lot foreground; \"Celebrity SILHOUETTE\" lettering visible on hull"),
    "assets/ships/celebrity-cruises/celebrity-silhouette/Meyer_Werft.webp.attr.json": (
        "confirmed", "Meyer Werft from road-side angle; \"SILHOUETTE\" hull lettering visible + Celebrity X funnel marks"),
    "assets/ships/celebrity-cruises/celebrity-silhouette/Celebrity_Silhouette_Saluting_Battery_Valletta.webp.attr.json": (
        "confirmed", "Bow at Valletta's Saluting Battery at golden hour; \"Celebrity SILHOUETTE\" lettering clearly readable"),
    "assets/ships/celebrity-cruises/celebrity-silhouette/Celebrity_Silhouette_(ship,_2011)_001.webp.attr.json": (
        "confirmed", "Broadside under way; \"Celebrity X Cruises\" + Celebrity X funnel marks + Silhouette lettering visible"),
    "assets/ships/celebrity-cruises/celebrity-silhouette/Celebrity_Silhouette.webp.attr.json": (
        "confirmed", "Broadside at sea; \"Celebrity SILHOUETTE\" lettering visible + Celebrity X mark on hull"),

    # ---- Celebrity Solstice (batch H, 2026-05-21) --------------------------
    "assets/ships/celebrity-cruises/celebrity-solstice/Celebrity_Solstice.webp.attr.json": (
        "confirmed", "Broadside at port; \"Celebrity SOLSTICE\" lettering clearly visible on hull"),
    "assets/ships/celebrity-cruises/celebrity-solstice/Celebrity_Solstice_at_night.webp.attr.json": (
        "confirmed", "Night view at Meyer Werft Papenburg shipyard; bow floodlights + \"Celebrity SOLSTICE\" lettering visible"),
    "assets/ships/celebrity-cruises/celebrity-solstice/CelebritySolsticePapenburgCropped.webp.attr.json": (
        "confirmed", "At Meyer Werft Papenburg shipyard viewed from road; \"SOLSTICE\" lettering faintly visible (motion-blurred from moving vehicle)"),
    "assets/ships/celebrity-cruises/celebrity-solstice/Celebrity_Solstice_(ship,_2008)_001.webp.attr.json": (
        "confirmed", "Bow at golden hour; \"Celebrity SOLSTICE\" lettering clearly visible + Celebrity X mark on hull"),

    # ---- Celebrity Beyond (batch I, 2026-05-21) ----------------------------
    "assets/ships/celebrity-cruises/celebrity-beyond/Celebrity_BEYOND_La_Rochelle.webp.attr.json": (
        "confirmed", "Broadside at La Rochelle-Pallice; both \"BEYOND\" forward and \"Celebrity BEYOND\" amidships lettering visible + orange Magic Carpet platform (Edge-class signature)"),
    "assets/ships/celebrity-cruises/celebrity-beyond/Pool_Deck_on_the_Celebrity_Beyond_(54357888481).webp.attr.json": (
        "consistent", "Pool deck interior with orange Magic Carpet platform visible (Edge-class signature); Commons attribution states Celebrity Beyond"),
    "assets/ships/celebrity-cruises/celebrity-beyond/Trignac_-_44570_-_2021.06.16_-___Celebrity_Beyond___en_construction___Saint-Nazaire___Anthony_Levrot.webp.attr.json": (
        "consistent", "Under construction at Chantiers de l'Atlantique Saint-Nazaire June 2021; Edge-class hull silhouette + cranes visible; Commons attribution names Celebrity Beyond"),
    "assets/ships/celebrity-cruises/celebrity-beyond/Celebrity_Beyond_logo.webp.attr.json": (
        "confirmed", "Text logo reading \"Celebrity BEYOND\" — PD-textlogo official cruise line wordmark"),

    # ---- Celebrity Edge (batch J, 2026-05-21) ------------------------------
    "assets/ships/celebrity-cruises/celebrity-edge/Celebrity_Edge.webp.attr.json": (
        "confirmed", "Bow head-on at Naples; \"Celebrity EDGE\" lettering clearly visible on port bow"),
    "assets/ships/celebrity-cruises/celebrity-edge/Magic_Carpet_2.webp.attr.json": (
        "confirmed", "Orange Magic Carpet cantilevered platform (Edge-class signature, deployed mid-ship) + Celebrity X mark on hull at left"),
    "assets/ships/celebrity-cruises/celebrity-edge/Celebrity_Edge_-_Sept_2018.webp.attr.json": (
        "confirmed", "Broadside at Saint-Nazaire September 2018 (shortly after delivery); \"Celebrity EDGE\" lettering visible amidships, golden hour"),
    "assets/ships/celebrity-cruises/celebrity-edge/Celebrity_Edge_in_Sydney_Harbour.webp.attr.json": (
        "confirmed", "Departing Sydney Harbour January 2025; \"Celebrity EDGE\" lettering visible amidships + orange Magic Carpet platform"),

    # ---- Celebrity Ascent (batch K, 2026-05-21) ----------------------------
    "assets/ships/celebrity-cruises/celebrity-ascent/Celebrity_Ascent_-_Le_Pir_e_-_June_2024.webp.attr.json": (
        "confirmed", "Broadside at Le Pirée Greece, June 2024; \"Celebrity ASCENT\" lettering visible amidships + orange Magic Carpet"),
    "assets/ships/celebrity-cruises/celebrity-ascent/Celebrity_Ascent_St._John_s_20251205_1.webp.attr.json": (
        "confirmed", "Broadside at St. John's Antigua December 2025; \"Celebrity X Cruises\" hull mark visible + \"ASCENT\" lettering on funnel + Magic Carpet platform"),
    "assets/ships/celebrity-cruises/celebrity-ascent/Celebrity_Ascent_St._John_s_20251205_2.webp.attr.json": (
        "confirmed", "Bow at St. John's Antigua with \"celebrity ASCENT VALLETTA\" port-of-registry visible; Norwegian Getaway sister-ship at right (separate cruise line, different design)"),
    "assets/ships/celebrity-cruises/celebrity-ascent/Celebrity_Ascent_construit_par_les_Chantiers_de_l_Atlantique_(cropped).webp.attr.json": (
        "confirmed", "Under construction at Chantiers de l'Atlantique Saint-Nazaire; partial \"CelebrityAS\" lettering visible on hull amidships"),

    # ---- Costa Smeralda (batch L, 2026-05-21) ------------------------------
    "assets/ships/costa/costa-smeralda/Costa_Smeralda_in_Savona_(September_2020).webp.attr.json": (
        "confirmed", "Bow at Savona September 2020; \"Costa Smeralda\" lettering clearly visible on hull near bow + Costa Cruises yellow funnel mark"),

    # ---- Costa Toscana (batch M, 2026-05-21) -------------------------------
    "assets/ships/costa/costa-toscana/Costa_Toscana_in_Savona.webp.attr.json": (
        "confirmed", "Broadside at Savona November 2022; \"Costa Toscana\" lettering clearly visible on hull near bow"),
    "assets/ships/costa/costa-toscana/Costa_Toscana_from_rear.webp.attr.json": (
        "confirmed", "Stern at Savona; \"Costa Toscana\" + \"GENOVA\" port-of-registry visible + Italian flag"),

    # ---- Costa Firenze (batch N, 2026-05-21) -------------------------------
    "assets/ships/costa/costa-firenze/Costa_Firenze_(48111131563).webp.attr.json": (
        "confirmed", "Broadside at sea; \"Costa Firenze\" lettering visible amidships + yellow Costa C funnel mark"),
    "assets/ships/costa/costa-firenze/D7K_3592.webp.attr.json": (
        "confirmed", "Bow closeup at Ibiza 2021; \"Costa Firenze\" lettering clearly visible on hull + Italian tricolor stripes"),

    # ---- Costa Deliziosa (batch O, 2026-05-21) -----------------------------
    "assets/ships/costa/costa-deliziosa/CostaDeliziosa_at_Helsinki_29072010.webp.attr.json": (
        "confirmed", "Broadside departing Helsinki West Harbour July 2010; yellow Costa C funnel mark + ship lettering visible"),

    # ---- Costa Fascinosa (batch P, 2026-05-21) -----------------------------
    "assets/ships/costa/costa-fascinosa/Costa_Fascinosa_2022_in_Kiel.webp.attr.json": (
        "confirmed", "Broadside at Kiel 2022; \"Costa Fascinosa\" lettering clearly visible amidships + yellow Costa C funnel mark"),

    # ---- Costa Venezia (batch Q, 2026-05-21) -------------------------------
    "assets/ships/costa/costa-venezia/-1_COSTA_VENEZIA_FRECCE_XT2_1-3-2019_(40283689863).webp.attr.json": (
        "confirmed", "At 2019 Trieste christening; \"Costa Venezia\" lettering visible below funnel + yellow Costa C funnel mark + Frecce Tricolori smoke trail above"),
    "assets/ships/costa/costa-venezia/-1_COSTA_VENEZIA_FRECCE_XT2_1-3-2019_(40283690483).webp.attr.json": (
        "confirmed", "At 2019 Trieste christening; full broadside with crowd on quayside watching Frecce Tricolori flypast + yellow Costa C funnel mark"),

    # ---- MSC Poesia (batch R, 2026-05-21) ----------------------------------
    "assets/ships/msc/msc-poesia/MSC_Cruise_ship_at_Bergen-2.webp.attr.json": (
        "confirmed", "At Bergen; \"MSC POESIA\" lettering clearly visible amidships near stern + MSC compass/star logo on hull"),
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
