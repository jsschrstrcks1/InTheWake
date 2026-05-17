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
