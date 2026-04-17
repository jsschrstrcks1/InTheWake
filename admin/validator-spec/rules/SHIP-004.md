---
id: SHIP-004
name: First Look section word count between 50 and 150
family: ship
severity: warn
applies-to:
  - ship
provenance: V-only
status: live
implementation:
  - file: admin/validate-ship-page.js
    function: validateSectionWordCounts (first_look constraints)
    lines: "165"
check: first_look section text word count >= 50 (minimum) and <= 150 (maximum)
standards-source: silent
standards-backfill: yes
decision: FINAL
last-updated: 2026-04-16
---

## Rule
The `first_look` section on a ship page — the initial visual impression + caption/lede content — must contain between 50 and 150 words. Under 50 is content-thin; over 150 turns the section from "a first look" into an expository wall.

## Why (rationale)
First_look is where the reader forms their visual impression in under a minute. It sits alongside the gallery / hero images and wants prose that frames what you're seeing — not a deep-dive. 50 words is the floor to say anything meaningful ("Allure of the Seas still feels distinctively itself even 13 years in — the Central Park neighborhood is the reason why..."). 150 is the ceiling before readers start scrolling past.

The range is strictly enforced in the validator constants (line 165: `first_look: { min: 50, max: 150, label: 'A First Look' }`) — both bounds matter.

## Pass example
First_look section at 90 words introducing the ship's signature feature and one distinguishing design element. Passes.

## Fail example (too short)
First_look at 22 words. Validator emits section-word-count warning (min 50).

## Fail example (too long)
First_look at 240 words recounting the ship's history and amenities. Validator emits section-word-count warning (max 150).

## Fix guidance
Under 50: add one concrete sensory detail (a specific feature, a first-view observation). Over 150: move detailed content to the logbook or dining section where long-form prose belongs. First_look wants tight, visual, invitational prose.
