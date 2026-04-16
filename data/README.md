# Player Salary History & Team Purses

Training data for the AI bidding model. Captures how real IPL teams spent money 2022-2025 — the foundation for making AI franchises behave like their real-life counterparts (CSK loyalty to core, MI pace-heavy builds, RR uncapped-youth splurges, etc.).

## Files

- **`team-purses.js`** — season auction cap per year, in lakhs. Denominator for `pctOfPurse`.
- **`player-salary-history.js`** — per-player chronological salary records keyed by player id. Auto-enriches each record with `pctOfPurse` on load.

## Record shape

```js
{
  year: 2025,
  team: 'RCB',
  priceLakhs: 2100,
  basePriceLakhs: 200,   // optional — only for auction-sold records
  type: 'megaRetention', // or 'auction' | 'retained' | 'traded'
  pctOfPurse: 17.50      // computed on load: priceLakhs / cap × 100
}
```

## `type` semantics

| Type | Meaning |
|---|---|
| `auction` | Player was bid for at that season's auction; `basePriceLakhs` is set. |
| `retained` | Inferred — player stayed on roster from last auction at the same price (applies to mini-auction years 2023/2024). |
| `megaRetention` | Explicit pre-auction retention at the 2025 mega (fixed slabs: 18/14/11 Cr for capped, 4 Cr for uncapped). |
| `traded` | Moved team mid-window via pre-auction trade; salary carried. |

## Coverage — 2022-2025 only

Populated for:
- **~45 top-tier names** — Kohli, Rohit, Dhoni, Bumrah, Pant, Iyer, Gill, Jaiswal, Jadeja, Hardik, Rashid, Cummins, Starc, Buttler, Klaasen, Maxwell, etc.
- **~15 rare-talent / breakout picks** — Vaibhav Suryavanshi, Naman Dhir, Rasikh Salam, Sameer Rizvi, Angkrish Raghuvanshi, Dewald Brevis, Mayank Yadav, Robin Minz, etc.
- **~20 supporting names** — Bhuvi, Zampa, Hasaranga, Santner, Marsh, Hetmyer, Tim David, etc.

Gaps — players in the 232-player DB who are not yet covered in salary history:
- Many mid-tier Indian batters/bowlers (e.g. Anuj Rawat, Rajveer Singh, Harshit Rana)
- Overseas fringe picks (e.g. Jamie Smith, Cooper Connolly, Allah Ghazanfar — recent arrivals)
- Most uncapped players whose auction price was the 20 L floor (not interesting for model training)

## Prior seasons (planned)

- **PR #3**: 2018–2021 (post-CSK-return mega + mini auctions). Core trends for CSK/MI dynasty era.
- **PR #4**: 2015–2017 (incl. RPS/GL replacement franchises — may need to synthesize those as virtual-CSK/RR for modeling).
- **PR #5**: Derived `franchise-strategy.js` — per-team behavioral patterns extracted from the full 2015-2025 dataset, replacing the hand-tuned `FRANCHISE_PREFS` in `js/auction.js`.

## Using this for AI bidding

### Features you can compute

Per (team, year, player):
- `pctOfPurse` — direct signal for "how much of my budget am I willing to spend?"
- `basePriceLakhs → priceLakhs` ratio — overvaluation factor (1.0 = base price pick, 20+ = breakout uncapped splurge)
- `type == 'retained' | 'megaRetention'` — loyalty signal (CSK retains at ~2.5x the league-avg rate)

Per team:
- Average `pctOfPurse` spent in auctions vs retentions → shows if a franchise prefers to spend big at auction (DC, PBKS) or bank on retention (CSK, MI)
- Role split of auction spend: share of budget going to batters / bowlers / AR / WK
- Overseas spending concentration: total lakhs spent on overseas per year / total
- Uncapped/young upside: how many picks per year with `basePriceLakhs ≤ 30` and `pctOfPurse ≥ 3`

### Example query

```js
// Team loyalty score: what % of 2025 squad was retained vs auctioned?
const team = 'CSK';
const year = 2025;
const picks = Object.values(window.PLAYER_SALARY_HISTORY)
  .flatMap(rs => rs.filter(r => r.team === team && r.year === year));
const retainRate = picks.filter(r => r.type.includes('etention')).length / picks.length;
console.log(`${team} ${year} retention rate:`, retainRate);
```

## Sources

- Wikipedia per-season auction pages ("List of YYYY IPL personnel changes", "YYYY IPL auction")
- ESPNcricinfo auction recaps
- Outlook India, The Federal, India TV auction live blogs
- Cross-checked against `iplt20.com/auction/YYYY` where accessible

Known edge: retention prices for 2022-2024 mini-auction years are inferred as "last auction price" unless public record shows a release-and-re-sign. Minor discrepancies possible for traded players where salary adjusted mid-window.
