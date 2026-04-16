// ===== IPL TEAM PURSES BY YEAR (in lakhs) =====
// Source: IPL official rules for each season's auction cap.
// Units: lakhs (100 = 1 Cr). Use `pct = priceLakhs / purseLakhs * 100`
// to reproduce the % of purse each team spent on a given player.
//
// Note: these are the SEASON-CAP purses (applied uniformly to all 10 teams
// at the start of each auction cycle). A team's available-at-auction purse
// may differ based on retentions/trades — that's reflected per-player in
// player-salary-history.js. These caps are the denominator for % features.
window.TEAM_PURSES_BY_YEAR = {
  2022: { cap: 9000,  unit: 'lakhs', note: 'Mega auction (new LSG + GT franchises, 10 teams)' },
  2023: { cap: 9500,  unit: 'lakhs', note: 'Mini auction in Kochi, 23 Dec 2022' },
  2024: { cap: 10000, unit: 'lakhs', note: 'Mini auction in Dubai, 19 Dec 2023' },
  2025: { cap: 12000, unit: 'lakhs', note: 'Mega auction in Jeddah, 24-25 Nov 2024' }
};
