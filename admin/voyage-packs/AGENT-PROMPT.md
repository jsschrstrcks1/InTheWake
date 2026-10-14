# Voyage Pack: prompt for a new agent session

Copy everything inside the fence, fill in the blanks, and paste it as the first message of a new session that has the `InTheWake` repository.

```text
Build a full Voyage Pack and its companion PWA for one cruise sailing on cruisinginthewake.com.

THE SAILING
- Ship and line: ____________________
- Dates: ____________ to ____________, departing from ____________
- The cruise line's own itinerary link (the page I copied from my browser): ____________________
- Who it's for: [solo traveler | hosted group | family | ...]
- Host, if any: ____________________ (if it's Tina Maulsby / Maulsby Travel Co., say so)
- Flyer image: [attached | none]
- Host's own words to quote (pricing notes, coupons, what's included): ____________________
- Anything firsthand from me to include, dated: ____________________

HOW TO WORK
1. Read admin/voyage-packs/AGENT-HANDOFF.md first, start to finish. Then README.md and PACK-PRESHIP-REVIEW-CHECKLIST.md in the same folder. Follow them. Where they disagree, the README and checklist win; tell me.
2. Load the household posture named in CLAUDE.md and run a memory recall on the ship and ports before you plan. Honor any directives it returns.
3. Confirm the sailing from the line's own page I gave you. Parse its schedule for port order, times and the voyage id, and compute all-aboard times. Don't search for the sailing anywhere else, don't crawl sitemaps, don't build URLs by pattern, and don't sign in to any site. If my link doesn't work, stop and ask me for another.
4. Every fact you print needs a primary source wherever one exists, recorded in the .factcheck.json sidecar with the URL, a short quote and the date you read it. Travel agencies, aggregators and blogs are leads, not sources. If you can't verify something, leave it out or say plainly that it's unconfirmed, and record the removal.
5. Ask me before you query Wikipedia or the Wikimedia Commons API. Use a ship photo already in assets/ships/ with its .attr.json when there is one.
6. Never put my email or any personal detail in a request to an outside service, including headers.
7. Link this site's ship, port, restaurant and tool pages wherever a page exists. Check the file is there first.
8. If the safety classifier stops a reply, don't retry that step, even with a different tool. After two stops on the same kind of step, stop and tell me what you need.
9. Use the exact build commands and gates in the handoff. Look at the share image and screenshot the companion before you call it done.
10. Commit with `git -c core.hooksPath=.githooks commit`, put [no-reasoning] in every commit message, and never write to REASONING-LOG.md or ENGINEERING-LOG.md. Push to your designated branch. Don't open a PR unless I ask, and never merge without my word.

WHEN YOU REPORT BACK
Start with "Sophos:". Tell me:
- what's built
- what the sources settled
- what you removed and why
- anything you owe me (a slip, a gap, something you couldn't verify)
Report test counts only from a run in the same turn. End with the usage footer.
```

*Soli Deo Gloria.*
