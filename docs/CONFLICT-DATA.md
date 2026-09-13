# Conflict Tracker data

The initial catalog contains 28 curated briefings across five regions. Its background and humanitarian context were reviewed against ICRC country operations pages and CFR's Global Conflict Tracker on **13 September 2026**. Individual records link directly to their sources. The text is original concise synthesis, not copied source reports.

## What the data means

- `updatedAt` is the catalog's **review date**, not the time of the latest incident or the source's publication date. The app must label it accordingly.
- This is a checked-in snapshot. No live news service or scheduled updating is implied. Source pages may change after review.
- Geographic coverage is broad but **not exhaustive**. Absence does not establish peace or safety. Sources use different scopes; CFR's tracker emphasizes conflicts relevant to US interests.
- Markers are approximate representative locations for opening a regional briefing. They are not boundaries, front lines, troop locations, strike coordinates, or claims about territorial control.
- `status` separates **Armed conflict**, **Security crisis**, **Conflict aftermath**, and **Flashpoint**. These are navigation categories, not formal international humanitarian law determinations. A flashpoint is not a claim that war is underway. A ceasefire does not eliminate the humanitarian consequences of conflict.
- `severity` is an editorial attention level. **Critical** prioritizes the catalog's large, acute humanitarian emergencies; **high** covers other substantial conflicts and security crises; **elevated** covers aftermath and escalation contingencies. These are not calibrated risk scores, casualty rankings, predictions, official ICRC classifications, or CFR's separate measure of impact on US interests.
- Actor lists orient readers; they are not exhaustive orders of battle, claims of equivalence or responsibility for a specific incident. Descriptions emphasize civilian consequences and avoid unsupported numerical estimates.
- Potential humanitarian consequences in flashpoint entries are explicitly labeled planning concerns, rather than presented as observed impacts.

## Research starting points

- [ICRC country operations and humanitarian reporting](https://www.icrc.org/en/where-we-work)
- [CFR Global Conflict Tracker](https://www.cfr.org/global-conflict-tracker)
- [CFR regional overview for Asia](https://www.cfr.org/global-conflict-tracker/region/asia)

The catalog includes ICRC-supported contexts outside CFR's current 27-topic overview, including Colombia, Cameroon, northern Mozambique and the Lake Chad basin. It does not attempt to duplicate either organization's scope or taxonomy.

## Updating and validation

Re-read the linked context before changing a briefing. Review status and prose together, update the review date only for content actually checked, and retain the distinction between background information and dated developments. If records acquire separate review dates, stop deriving all dates from the dataset metadata. Add statistics only with a dated, attributable definition and explicit geographic scope; never infer live values from this snapshot.

Run `node --test src/data/conflictCatalog.test.mjs` to validate stable IDs, coordinates, safe HTTPS provenance, required briefing content, categories, region/search filters and immutable source records. These checks validate data integrity; editorial review is still needed to assess whether a source remains current. No test makes an external network request.
