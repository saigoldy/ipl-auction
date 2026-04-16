// ===== PLAYER SALARY HISTORY 2022-2025 =====
// Keyed by player id from data/players.js. Each entry is a chronological list
// of season records. Prices are in LAKHS (100 L = 1 Cr).
//
// Record shape: { year, team, priceLakhs, basePriceLakhs?, type }
//   type: "auction"  — bought at that season's auction
//         "retained" — kept from a prior season at previously-auctioned price
//                      (mini-auction years carry over last auction price)
//         "megaRetention" — explicit pre-mega-auction retention (2025: fixed
//                      bands of 1800/1400/1100 L, or own pick at 400 L)
//         "traded"   — moved mid-window via trade (rare; same salary carried)
//
// Sources: Wikipedia per-season auction pages, ESPNcricinfo, Outlook, The
// Federal, India TV auction live blogs. Retention inferences for mini-auction
// years assume the player stayed with their last-auctioned team at the last
// auctioned price unless the public record shows a release.
//
// Coverage: top ~80 names + rare talents. Many mid-tier/budget players in the
// 232-player DB are not yet populated — see README.md in this folder.
window.PLAYER_SALARY_HISTORY = {

  // ===== TOP-TIER BATTERS =====
  VIR_KOHLI: [
    { year: 2022, team: 'RCB', priceLakhs: 1500, type: 'retained' },
    { year: 2023, team: 'RCB', priceLakhs: 1500, type: 'retained' },
    { year: 2024, team: 'RCB', priceLakhs: 1500, type: 'retained' },
    { year: 2025, team: 'RCB', priceLakhs: 2100, type: 'megaRetention' }
  ],
  RO_SHARMA: [
    { year: 2022, team: 'MI', priceLakhs: 1600, type: 'retained' },
    { year: 2023, team: 'MI', priceLakhs: 1600, type: 'retained' },
    { year: 2024, team: 'MI', priceLakhs: 1600, type: 'retained' },
    { year: 2025, team: 'MI', priceLakhs: 1630, type: 'megaRetention' }
  ],
  SK_YADAV: [
    { year: 2022, team: 'MI', priceLakhs: 800, type: 'retained' },
    { year: 2023, team: 'MI', priceLakhs: 800, type: 'retained' },
    { year: 2024, team: 'MI', priceLakhs: 800, type: 'retained' },
    { year: 2025, team: 'MI', priceLakhs: 1635, type: 'megaRetention' }
  ],
  KL_RAHUL: [
    { year: 2022, team: 'LSG', priceLakhs: 1700, type: 'auction' },
    { year: 2023, team: 'LSG', priceLakhs: 1700, type: 'retained' },
    { year: 2024, team: 'LSG', priceLakhs: 1700, type: 'retained' },
    { year: 2025, team: 'DC',  priceLakhs: 1400, basePriceLakhs: 200, type: 'auction' }
  ],
  SHU_GILL: [
    { year: 2022, team: 'GT', priceLakhs: 800, type: 'auction' },
    { year: 2023, team: 'GT', priceLakhs: 800, type: 'retained' },
    { year: 2024, team: 'GT', priceLakhs: 800, type: 'retained' },
    { year: 2025, team: 'GT', priceLakhs: 1650, type: 'megaRetention' }
  ],
  RIS_PANT: [
    { year: 2022, team: 'DC', priceLakhs: 1600, type: 'retained' },
    { year: 2023, team: 'DC', priceLakhs: 1600, type: 'retained' },
    { year: 2024, team: 'DC', priceLakhs: 1600, type: 'retained' },
    { year: 2025, team: 'LSG', priceLakhs: 2700, basePriceLakhs: 200, type: 'auction' }
  ],
  SAN_SAMSON: [
    { year: 2022, team: 'RR', priceLakhs: 1400, type: 'retained' },
    { year: 2023, team: 'RR', priceLakhs: 1400, type: 'retained' },
    { year: 2024, team: 'RR', priceLakhs: 1400, type: 'retained' },
    { year: 2025, team: 'RR', priceLakhs: 1800, type: 'megaRetention' }
  ],
  SHR_IYER: [
    { year: 2022, team: 'KKR', priceLakhs: 1225, type: 'auction' },
    { year: 2023, team: 'KKR', priceLakhs: 1225, type: 'retained' },
    { year: 2024, team: 'KKR', priceLakhs: 1225, type: 'retained' },
    { year: 2025, team: 'PBKS', priceLakhs: 2675, basePriceLakhs: 200, type: 'auction' }
  ],
  RUT_GAIK: [
    { year: 2022, team: 'CSK', priceLakhs: 800,  type: 'retained' },
    { year: 2023, team: 'CSK', priceLakhs: 800,  type: 'retained' },
    { year: 2024, team: 'CSK', priceLakhs: 800,  type: 'retained' },
    { year: 2025, team: 'CSK', priceLakhs: 1800, type: 'megaRetention' }
  ],
  YAS_JAISWAL: [
    { year: 2022, team: 'RR', priceLakhs: 400,  type: 'auction' },
    { year: 2023, team: 'RR', priceLakhs: 400,  type: 'retained' },
    { year: 2024, team: 'RR', priceLakhs: 400,  type: 'retained' },
    { year: 2025, team: 'RR', priceLakhs: 1800, type: 'megaRetention' }
  ],
  IS_KISHAN: [
    { year: 2022, team: 'MI', priceLakhs: 1525, type: 'auction' },
    { year: 2023, team: 'MI', priceLakhs: 1525, type: 'retained' },
    { year: 2024, team: 'MI', priceLakhs: 1525, type: 'retained' }
    // 2025: went unsold in mega auction; SRH signed later as replacement (mid-season)
  ],
  MS_DHONI: [
    { year: 2022, team: 'CSK', priceLakhs: 1200, type: 'retained' },
    { year: 2023, team: 'CSK', priceLakhs: 1200, type: 'retained' },
    { year: 2024, team: 'CSK', priceLakhs: 1200, type: 'retained' },
    { year: 2025, team: 'CSK', priceLakhs: 400,  type: 'megaRetention' } // uncapped rule
  ],
  DEV_PADIK: [
    { year: 2022, team: 'RR', priceLakhs: 775,  type: 'auction' },
    { year: 2023, team: 'RR', priceLakhs: 775,  type: 'retained' },
    { year: 2024, team: 'RCB', priceLakhs: 775, type: 'traded' },
    { year: 2025, team: 'RCB', priceLakhs: 200, basePriceLakhs: 75, type: 'auction' }
  ],
  TIL_VARMA: [
    { year: 2022, team: 'MI', priceLakhs: 170, type: 'auction' },
    { year: 2023, team: 'MI', priceLakhs: 170, type: 'retained' },
    { year: 2024, team: 'MI', priceLakhs: 170, type: 'retained' },
    { year: 2025, team: 'MI', priceLakhs: 800, type: 'megaRetention' }
  ],
  RIN_SINGH: [
    { year: 2022, team: 'KKR', priceLakhs: 55,   type: 'auction' },
    { year: 2023, team: 'KKR', priceLakhs: 55,   type: 'retained' },
    { year: 2024, team: 'KKR', priceLakhs: 55,   type: 'retained' },
    { year: 2025, team: 'KKR', priceLakhs: 1300, type: 'megaRetention' }
  ],
  ABH_SHARMA: [
    { year: 2022, team: 'SRH', priceLakhs: 650,  type: 'auction' },
    { year: 2023, team: 'SRH', priceLakhs: 650,  type: 'retained' },
    { year: 2024, team: 'SRH', priceLakhs: 650,  type: 'retained' },
    { year: 2025, team: 'SRH', priceLakhs: 1400, type: 'megaRetention' }
  ],
  PRI_SHAW: [
    { year: 2022, team: 'DC', priceLakhs: 750, type: 'auction' },
    { year: 2023, team: 'DC', priceLakhs: 750, type: 'retained' },
    { year: 2024, team: 'DC', priceLakhs: 750, type: 'retained' }
    // 2025: went unsold
  ],
  SAI_SUDHARSAN: [
    { year: 2022, team: 'GT', priceLakhs: 20,  type: 'auction' },
    { year: 2023, team: 'GT', priceLakhs: 20,  type: 'retained' },
    { year: 2024, team: 'GT', priceLakhs: 20,  type: 'retained' },
    { year: 2025, team: 'GT', priceLakhs: 850, type: 'megaRetention' }
  ],
  DIN_KARTHIK: [
    { year: 2022, team: 'RCB', priceLakhs: 550, type: 'auction' },
    { year: 2023, team: 'RCB', priceLakhs: 550, type: 'retained' },
    { year: 2024, team: 'RCB', priceLakhs: 550, type: 'retained' }
    // retired after 2024
  ],
  AM_RAHANE: [
    { year: 2022, team: 'KKR', priceLakhs: 100,  type: 'auction' },
    { year: 2023, team: 'CSK', priceLakhs: 50,   basePriceLakhs: 50,  type: 'auction' },
    { year: 2024, team: 'CSK', priceLakhs: 50,   type: 'retained' },
    { year: 2025, team: 'KKR', priceLakhs: 150,  basePriceLakhs: 150, type: 'auction' }
  ],
  NIT_RANA: [
    { year: 2022, team: 'KKR', priceLakhs: 800, type: 'retained' },
    { year: 2023, team: 'KKR', priceLakhs: 800, type: 'retained' },
    { year: 2024, team: 'KKR', priceLakhs: 800, type: 'retained' }
    // 2025: unsold
  ],

  // ===== TOP-TIER BOWLERS =====
  JAS_BUMRAH: [
    { year: 2022, team: 'MI', priceLakhs: 1200, type: 'retained' },
    { year: 2023, team: 'MI', priceLakhs: 1200, type: 'retained' },
    { year: 2024, team: 'MI', priceLakhs: 1200, type: 'retained' },
    { year: 2025, team: 'MI', priceLakhs: 1800, type: 'megaRetention' }
  ],
  MOH_SHAMI: [
    { year: 2022, team: 'GT',  priceLakhs: 625,  type: 'auction' },
    { year: 2023, team: 'GT',  priceLakhs: 625,  type: 'retained' },
    { year: 2024, team: 'GT',  priceLakhs: 625,  type: 'retained' },
    { year: 2025, team: 'SRH', priceLakhs: 1000, basePriceLakhs: 200, type: 'auction' }
  ],
  MO_SIRAJ: [
    { year: 2022, team: 'RCB', priceLakhs: 700,  type: 'auction' },
    { year: 2023, team: 'RCB', priceLakhs: 700,  type: 'retained' },
    { year: 2024, team: 'RCB', priceLakhs: 700,  type: 'retained' },
    { year: 2025, team: 'GT',  priceLakhs: 1225, basePriceLakhs: 200, type: 'auction' }
  ],
  YUZ_CHAHAL: [
    { year: 2022, team: 'RR',   priceLakhs: 650,  type: 'auction' },
    { year: 2023, team: 'RR',   priceLakhs: 650,  type: 'retained' },
    { year: 2024, team: 'RR',   priceLakhs: 650,  type: 'retained' },
    { year: 2025, team: 'PBKS', priceLakhs: 1800, basePriceLakhs: 200, type: 'auction' }
  ],
  KUL_YADAV: [
    { year: 2022, team: 'DC', priceLakhs: 200,  type: 'auction' },
    { year: 2023, team: 'DC', priceLakhs: 200,  type: 'retained' },
    { year: 2024, team: 'DC', priceLakhs: 200,  type: 'retained' },
    { year: 2025, team: 'DC', priceLakhs: 1325, type: 'megaRetention' }
  ],
  ARS_SINGH: [
    { year: 2022, team: 'PBKS', priceLakhs: 400, type: 'auction' },
    { year: 2023, team: 'PBKS', priceLakhs: 400, type: 'retained' },
    { year: 2024, team: 'PBKS', priceLakhs: 400, type: 'retained' },
    { year: 2025, team: 'PBKS', priceLakhs: 1800, type: 'megaRetention' }
  ],
  R_ASHWIN: [
    { year: 2022, team: 'RR',  priceLakhs: 500,  type: 'auction' },
    { year: 2023, team: 'RR',  priceLakhs: 500,  type: 'retained' },
    { year: 2024, team: 'RR',  priceLakhs: 500,  type: 'retained' },
    { year: 2025, team: 'CSK', priceLakhs: 975,  basePriceLakhs: 200, type: 'auction' }
  ],
  AVE_KHAN: [
    { year: 2022, team: 'LSG', priceLakhs: 1000, type: 'auction' },
    { year: 2023, team: 'LSG', priceLakhs: 1000, type: 'retained' },
    { year: 2024, team: 'LSG', priceLakhs: 1000, type: 'retained' }
    // 2025: unsold
  ],
  PRA_KRISHNA: [
    { year: 2022, team: 'RR',  priceLakhs: 1000, type: 'auction' },
    { year: 2023, team: 'RR',  priceLakhs: 1000, type: 'retained' },
    { year: 2024, team: 'RR',  priceLakhs: 1000, type: 'retained' },
    { year: 2025, team: 'GT',  priceLakhs: 950,  basePriceLakhs: 200, type: 'auction' }
  ],
  MUK_KUMAR: [
    { year: 2023, team: 'DC', priceLakhs: 550,  basePriceLakhs: 20, type: 'auction' },
    { year: 2024, team: 'DC', priceLakhs: 550,  type: 'retained' },
    { year: 2025, team: 'DC', priceLakhs: 800,  basePriceLakhs: 200, type: 'auction' }
  ],
  UMR_MALIK: [
    { year: 2022, team: 'SRH', priceLakhs: 400, type: 'auction' },
    { year: 2023, team: 'SRH', priceLakhs: 400, type: 'retained' },
    { year: 2024, team: 'SRH', priceLakhs: 400, type: 'retained' }
    // 2025: unsold
  ],
  NAT_NATARA: [
    { year: 2022, team: 'SRH', priceLakhs: 400,  type: 'auction' },
    { year: 2023, team: 'SRH', priceLakhs: 400,  type: 'retained' },
    { year: 2024, team: 'SRH', priceLakhs: 400,  type: 'retained' },
    { year: 2025, team: 'DC',  priceLakhs: 1025, basePriceLakhs: 200, type: 'auction' }
  ],
  DL_CHAHAR: [
    { year: 2022, team: 'CSK', priceLakhs: 1400, type: 'auction' },
    { year: 2023, team: 'CSK', priceLakhs: 1400, type: 'retained' },
    { year: 2024, team: 'CSK', priceLakhs: 1400, type: 'retained' },
    { year: 2025, team: 'MI',  priceLakhs: 925,  basePriceLakhs: 200, type: 'auction' }
  ],
  HAR_PATEL: [
    { year: 2022, team: 'RCB',  priceLakhs: 1075, type: 'auction' },
    { year: 2023, team: 'RCB',  priceLakhs: 1075, type: 'retained' },
    { year: 2024, team: 'PBKS', priceLakhs: 1175, basePriceLakhs: 200, type: 'auction' },
    { year: 2025, team: 'SRH',  priceLakhs: 800,  basePriceLakhs: 200, type: 'auction' }
  ],
  VAR_CHAKRA: [
    { year: 2022, team: 'KKR', priceLakhs: 800,  type: 'auction' },
    { year: 2023, team: 'KKR', priceLakhs: 800,  type: 'retained' },
    { year: 2024, team: 'KKR', priceLakhs: 800,  type: 'retained' },
    { year: 2025, team: 'KKR', priceLakhs: 1200, type: 'megaRetention' }
  ],
  RAH_CHAHAR: [
    { year: 2022, team: 'PBKS', priceLakhs: 525, type: 'auction' },
    { year: 2023, team: 'PBKS', priceLakhs: 525, type: 'retained' },
    { year: 2024, team: 'PBKS', priceLakhs: 525, type: 'retained' }
    // 2025: unsold
  ],
  SHA_THAKUR: [
    { year: 2022, team: 'DC',  priceLakhs: 1075, type: 'auction' },
    { year: 2023, team: 'CSK', priceLakhs: 400,  basePriceLakhs: 200, type: 'auction' },
    { year: 2024, team: 'CSK', priceLakhs: 400,  type: 'retained' },
    { year: 2025, team: 'LSG', priceLakhs: 200,  basePriceLakhs: 200, type: 'auction' }
  ],

  // ===== TOP-TIER ALL-ROUNDERS =====
  HR_PANDYA: [
    { year: 2022, team: 'GT', priceLakhs: 1500, type: 'auction' },
    { year: 2023, team: 'GT', priceLakhs: 1500, type: 'retained' },
    { year: 2024, team: 'MI', priceLakhs: 1500, type: 'traded' },
    { year: 2025, team: 'MI', priceLakhs: 1635, type: 'megaRetention' }
  ],
  RA_JADEJA: [
    { year: 2022, team: 'CSK', priceLakhs: 1600, type: 'retained' },
    { year: 2023, team: 'CSK', priceLakhs: 1600, type: 'retained' },
    { year: 2024, team: 'CSK', priceLakhs: 1600, type: 'retained' },
    { year: 2025, team: 'CSK', priceLakhs: 1800, type: 'megaRetention' }
  ],
  AX_PATEL: [
    { year: 2022, team: 'DC', priceLakhs: 900,  type: 'auction' },
    { year: 2023, team: 'DC', priceLakhs: 900,  type: 'retained' },
    { year: 2024, team: 'DC', priceLakhs: 900,  type: 'retained' },
    { year: 2025, team: 'DC', priceLakhs: 1650, type: 'megaRetention' }
  ],
  WAS_SUNDAR: [
    { year: 2022, team: 'SRH', priceLakhs: 875, type: 'auction' },
    { year: 2023, team: 'SRH', priceLakhs: 875, type: 'retained' },
    { year: 2024, team: 'SRH', priceLakhs: 875, type: 'retained' },
    { year: 2025, team: 'GT',  priceLakhs: 320, basePriceLakhs: 200, type: 'auction' }
  ],
  VEN_IYER: [
    { year: 2022, team: 'KKR', priceLakhs: 800,  type: 'auction' },
    { year: 2023, team: 'KKR', priceLakhs: 800,  type: 'retained' },
    { year: 2024, team: 'KKR', priceLakhs: 800,  type: 'retained' },
    { year: 2025, team: 'KKR', priceLakhs: 2375, basePriceLakhs: 200, type: 'auction' }
  ],
  KRU_PANDYA: [
    { year: 2022, team: 'LSG', priceLakhs: 825, type: 'auction' },
    { year: 2023, team: 'LSG', priceLakhs: 825, type: 'retained' },
    { year: 2024, team: 'LSG', priceLakhs: 825, type: 'retained' },
    { year: 2025, team: 'RCB', priceLakhs: 575, basePriceLakhs: 200, type: 'auction' }
  ],
  SHA_AHMED: [
    { year: 2022, team: 'RCB', priceLakhs: 240, type: 'auction' },
    { year: 2023, team: 'RCB', priceLakhs: 240, type: 'retained' },
    { year: 2024, team: 'RCB', priceLakhs: 240, type: 'retained' }
  ],
  RAJ_TEWATIA: [
    { year: 2022, team: 'GT', priceLakhs: 900, type: 'auction' },
    { year: 2023, team: 'GT', priceLakhs: 900, type: 'retained' },
    { year: 2024, team: 'GT', priceLakhs: 900, type: 'retained' }
    // 2025: unsold
  ],

  // ===== OVERSEAS BATTERS =====
  FAF_DUP: [
    { year: 2022, team: 'RCB', priceLakhs: 700,  type: 'auction' },
    { year: 2023, team: 'RCB', priceLakhs: 700,  type: 'retained' },
    { year: 2024, team: 'RCB', priceLakhs: 700,  type: 'retained' },
    { year: 2025, team: 'DC',  priceLakhs: 200,  basePriceLakhs: 200, type: 'auction' }
  ],
  DAV_WARNER: [
    { year: 2022, team: 'DC', priceLakhs: 625, type: 'auction' },
    { year: 2023, team: 'DC', priceLakhs: 625, type: 'retained' },
    { year: 2024, team: 'DC', priceLakhs: 625, type: 'retained' }
    // 2025: unsold
  ],
  TRA_HEAD: [
    { year: 2023, team: 'SRH', priceLakhs: 680,  basePriceLakhs: 200, type: 'auction' },
    { year: 2024, team: 'SRH', priceLakhs: 680,  type: 'retained' },
    { year: 2025, team: 'SRH', priceLakhs: 1400, type: 'megaRetention' }
  ],
  JOS_BUTTLER: [
    { year: 2022, team: 'RR', priceLakhs: 1000, type: 'auction' },
    { year: 2023, team: 'RR', priceLakhs: 1000, type: 'retained' },
    { year: 2024, team: 'RR', priceLakhs: 1000, type: 'retained' },
    { year: 2025, team: 'GT', priceLakhs: 1575, basePriceLakhs: 200, type: 'auction' }
  ],
  QUI_DEKOK: [
    { year: 2022, team: 'LSG',  priceLakhs: 675, type: 'auction' },
    { year: 2023, team: 'LSG',  priceLakhs: 675, type: 'retained' },
    { year: 2024, team: 'LSG',  priceLakhs: 675, type: 'retained' },
    { year: 2025, team: 'KKR',  priceLakhs: 360, basePriceLakhs: 200, type: 'auction' }
  ],
  PHI_SALT: [
    { year: 2023, team: 'DC',  priceLakhs: 200, basePriceLakhs: 200, type: 'auction' },
    { year: 2024, team: 'KKR', priceLakhs: 200, type: 'traded' }
    // 2025: not retained, skipped auction (not in IPL that season)
  ],
  HEI_KLAASEN: [
    { year: 2023, team: 'SRH', priceLakhs: 525,  basePriceLakhs: 200, type: 'auction' },
    { year: 2024, team: 'SRH', priceLakhs: 525,  type: 'retained' },
    { year: 2025, team: 'SRH', priceLakhs: 2300, type: 'megaRetention' }
  ],
  DEV_CONWAY: [
    { year: 2022, team: 'CSK', priceLakhs: 100, type: 'auction' },
    { year: 2023, team: 'CSK', priceLakhs: 100, type: 'retained' },
    { year: 2024, team: 'CSK', priceLakhs: 100, type: 'retained' },
    { year: 2025, team: 'CSK', priceLakhs: 625, basePriceLakhs: 200, type: 'auction' }
  ],
  DAV_MILLER: [
    { year: 2022, team: 'GT',  priceLakhs: 300, type: 'auction' },
    { year: 2023, team: 'GT',  priceLakhs: 300, type: 'retained' },
    { year: 2024, team: 'GT',  priceLakhs: 300, type: 'retained' },
    { year: 2025, team: 'LSG', priceLakhs: 75,  basePriceLakhs: 75,  type: 'auction' }
  ],
  NIC_POORAN: [
    { year: 2022, team: 'SRH', priceLakhs: 1075, type: 'auction' },
    { year: 2023, team: 'LSG', priceLakhs: 1600, basePriceLakhs: 200, type: 'auction' },
    { year: 2024, team: 'LSG', priceLakhs: 1600, type: 'retained' },
    { year: 2025, team: 'LSG', priceLakhs: 2100, type: 'megaRetention' }
  ],
  RAC_RAVIN: [
    { year: 2024, team: 'CSK', priceLakhs: 180, basePriceLakhs: 50, type: 'auction' },
    { year: 2025, team: 'CSK', priceLakhs: 400, type: 'megaRetention' }
  ],
  WIL_JACKS: [
    { year: 2023, team: 'RCB', priceLakhs: 320, basePriceLakhs: 100, type: 'auction' },
    { year: 2024, team: 'RCB', priceLakhs: 320, type: 'retained' },
    { year: 2025, team: 'MI',  priceLakhs: 525, basePriceLakhs: 200, type: 'auction' }
  ],
  SHIM_HETMYER: [
    { year: 2022, team: 'RR', priceLakhs: 850,  type: 'auction' },
    { year: 2023, team: 'RR', priceLakhs: 850,  type: 'retained' },
    { year: 2024, team: 'RR', priceLakhs: 850,  type: 'retained' },
    { year: 2025, team: 'RR', priceLakhs: 1100, type: 'megaRetention' }
  ],
  TIM_DAVID: [
    { year: 2022, team: 'MI', priceLakhs: 825, type: 'auction' },
    { year: 2023, team: 'MI', priceLakhs: 825, type: 'retained' },
    { year: 2024, team: 'MI', priceLakhs: 825, type: 'retained' },
    { year: 2025, team: 'RCB', priceLakhs: 300, basePriceLakhs: 200, type: 'auction' }
  ],
  HAR_BROOK: [
    { year: 2023, team: 'SRH', priceLakhs: 1325, basePriceLakhs: 150, type: 'auction' },
    { year: 2024, team: 'DC',  priceLakhs: 400,  basePriceLakhs: 150, type: 'auction' },
    { year: 2025, team: 'DC',  priceLakhs: 625,  basePriceLakhs: 200, type: 'auction' }
  ],
  JOE_ROOT: [
    { year: 2023, team: 'RR', priceLakhs: 100, basePriceLakhs: 100, type: 'auction' }
  ],

  // ===== OVERSEAS BOWLERS =====
  MIT_STARC: [
    { year: 2024, team: 'KKR', priceLakhs: 2475, basePriceLakhs: 200, type: 'auction' },
    { year: 2025, team: 'DC',  priceLakhs: 1175, basePriceLakhs: 200, type: 'auction' }
  ],
  PAT_CUMMINS: [
    { year: 2022, team: 'KKR', priceLakhs: 725,  type: 'auction' },
    { year: 2023, team: 'KKR', priceLakhs: 725,  type: 'retained' },
    { year: 2024, team: 'SRH', priceLakhs: 2050, basePriceLakhs: 200, type: 'auction' },
    { year: 2025, team: 'SRH', priceLakhs: 1800, type: 'megaRetention' }
  ],
  JOF_ARCHER: [
    { year: 2022, team: 'MI',   priceLakhs: 800,  type: 'auction' },
    { year: 2023, team: 'MI',   priceLakhs: 800,  type: 'retained' },
    { year: 2025, team: 'RR',   priceLakhs: 1250, basePriceLakhs: 200, type: 'auction' }
  ],
  KAG_RABADA: [
    { year: 2022, team: 'PBKS', priceLakhs: 925,  type: 'auction' },
    { year: 2023, team: 'PBKS', priceLakhs: 925,  type: 'retained' },
    { year: 2024, team: 'PBKS', priceLakhs: 925,  type: 'retained' },
    { year: 2025, team: 'GT',   priceLakhs: 1075, basePriceLakhs: 200, type: 'auction' }
  ],
  ANR_NORTJE: [
    { year: 2022, team: 'DC',  priceLakhs: 650, type: 'auction' },
    { year: 2023, team: 'DC',  priceLakhs: 650, type: 'retained' },
    { year: 2024, team: 'DC',  priceLakhs: 650, type: 'retained' },
    { year: 2025, team: 'KKR', priceLakhs: 650, basePriceLakhs: 200, type: 'auction' }
  ],
  TRE_BOULT: [
    { year: 2022, team: 'RR', priceLakhs: 800, type: 'auction' },
    { year: 2023, team: 'RR', priceLakhs: 800, type: 'retained' },
    { year: 2025, team: 'MI', priceLakhs: 1225, basePriceLakhs: 200, type: 'auction' }
  ],
  LOC_FERGUSON: [
    { year: 2022, team: 'GT',   priceLakhs: 1000, type: 'auction' },
    { year: 2023, team: 'GT',   priceLakhs: 1000, type: 'retained' },
    { year: 2024, team: 'RCB',  priceLakhs: 200,  basePriceLakhs: 200, type: 'auction' },
    { year: 2025, team: 'RCB',  priceLakhs: 200,  basePriceLakhs: 200, type: 'auction' }
  ],
  MAR_WOOD: [
    { year: 2022, team: 'LSG',  priceLakhs: 750, type: 'auction' },
    { year: 2025, team: 'LSG',  priceLakhs: 750, basePriceLakhs: 200, type: 'auction' }
  ],
  JOH_HAZLEWOOD: [
    { year: 2022, team: 'RCB', priceLakhs: 775, type: 'auction' }
    // Not in 2023/24/25 IPL (national duty)
  ],

  // ===== OVERSEAS SPINNERS / LEGENDS =====
  RAS_KHAN: [
    { year: 2022, team: 'GT', priceLakhs: 1500, type: 'auction' },
    { year: 2023, team: 'GT', priceLakhs: 1500, type: 'retained' },
    { year: 2024, team: 'GT', priceLakhs: 1500, type: 'retained' },
    { year: 2025, team: 'GT', priceLakhs: 1800, type: 'megaRetention' }
  ],
  SUN_NARINE: [
    { year: 2022, team: 'KKR', priceLakhs: 600,  type: 'auction' },
    { year: 2023, team: 'KKR', priceLakhs: 600,  type: 'retained' },
    { year: 2024, team: 'KKR', priceLakhs: 600,  type: 'retained' },
    { year: 2025, team: 'KKR', priceLakhs: 1200, type: 'megaRetention' }
  ],
  AND_RUSSELL: [
    { year: 2022, team: 'KKR', priceLakhs: 1200, type: 'retained' },
    { year: 2023, team: 'KKR', priceLakhs: 1200, type: 'retained' },
    { year: 2024, team: 'KKR', priceLakhs: 1200, type: 'retained' },
    { year: 2025, team: 'KKR', priceLakhs: 1200, type: 'megaRetention' }
  ],

  // ===== OVERSEAS ALL-ROUNDERS =====
  BEN_STOKES: [
    { year: 2023, team: 'CSK', priceLakhs: 1625, basePriceLakhs: 200, type: 'auction' },
    { year: 2024, team: 'CSK', priceLakhs: 1625, type: 'retained' }
    // 2025: unsold
  ],
  GLE_MAXWELL: [
    { year: 2022, team: 'RCB',  priceLakhs: 1100, type: 'auction' },
    { year: 2023, team: 'RCB',  priceLakhs: 1100, type: 'retained' },
    { year: 2024, team: 'RCB',  priceLakhs: 1100, type: 'retained' },
    { year: 2025, team: 'PBKS', priceLakhs: 420,  basePriceLakhs: 200, type: 'auction' }
  ],
  SAM_CURRAN: [
    { year: 2023, team: 'PBKS', priceLakhs: 1850, basePriceLakhs: 200, type: 'auction' },
    { year: 2024, team: 'PBKS', priceLakhs: 1850, type: 'retained' },
    { year: 2025, team: 'CSK',  priceLakhs: 240,  basePriceLakhs: 200, type: 'auction' }
  ],
  LIA_LIVINGSTONE: [
    { year: 2022, team: 'PBKS', priceLakhs: 1150, type: 'auction' },
    { year: 2023, team: 'PBKS', priceLakhs: 1150, type: 'retained' },
    { year: 2024, team: 'PBKS', priceLakhs: 1150, type: 'retained' },
    { year: 2025, team: 'RCB',  priceLakhs: 875,  basePriceLakhs: 200, type: 'auction' }
  ],
  MAR_STOINIS: [
    { year: 2022, team: 'LSG', priceLakhs: 920, type: 'auction' },
    { year: 2023, team: 'LSG', priceLakhs: 920, type: 'retained' },
    { year: 2024, team: 'LSG', priceLakhs: 920, type: 'retained' },
    { year: 2025, team: 'PBKS', priceLakhs: 1100, basePriceLakhs: 200, type: 'auction' }
  ],
  CAM_GREEN: [
    { year: 2023, team: 'MI',   priceLakhs: 1750, basePriceLakhs: 200, type: 'auction' },
    { year: 2024, team: 'RCB',  priceLakhs: 1750, type: 'traded' }
    // 2025: not in IPL
  ],
  ROM_POWELL: [
    { year: 2023, team: 'DC',  priceLakhs: 280,  basePriceLakhs: 75, type: 'auction' },
    { year: 2024, team: 'RR',  priceLakhs: 740,  basePriceLakhs: 100, type: 'auction' }
  ],
  MOE_ALI: [
    { year: 2022, team: 'CSK', priceLakhs: 600,  type: 'auction' },
    { year: 2023, team: 'CSK', priceLakhs: 600,  type: 'retained' },
    { year: 2024, team: 'CSK', priceLakhs: 600,  type: 'retained' }
    // 2025: unsold
  ],

  // ===== RARE TALENTS / UNCAPPED BREAKOUTS =====
  DEWALD_BREVIS: [
    { year: 2022, team: 'MI', priceLakhs: 300, basePriceLakhs: 20, type: 'auction' },
    { year: 2023, team: 'MI', priceLakhs: 300, type: 'retained' },
    { year: 2024, team: 'MI', priceLakhs: 300, type: 'retained' }
    // 2025: unsold
  ],
  SIS_IYER: [ // Sameer Rizvi
    { year: 2024, team: 'CSK', priceLakhs: 840, basePriceLakhs: 20, type: 'auction' }
    // Released for 2025, went unsold
  ],
  SHAHRUKH_KHAN: [
    { year: 2022, team: 'PBKS', priceLakhs: 900, type: 'auction' },
    { year: 2023, team: 'PBKS', priceLakhs: 900, type: 'retained' },
    { year: 2024, team: 'GT',   priceLakhs: 740, basePriceLakhs: 75, type: 'auction' }
    // 2025: unsold
  ],
  NAMAN_DHIR: [
    { year: 2024, team: 'MI', priceLakhs: 20,  basePriceLakhs: 20, type: 'auction' },
    { year: 2025, team: 'MI', priceLakhs: 525, basePriceLakhs: 30, type: 'auction' }
  ],
  RASIKH_SALAM: [
    { year: 2024, team: 'DC',  priceLakhs: 20,  basePriceLakhs: 20, type: 'auction' },
    { year: 2025, team: 'RCB', priceLakhs: 600, basePriceLakhs: 30, type: 'auction' }
  ],
  ARSH_KHAN: [
    { year: 2024, team: 'LSG', priceLakhs: 20,  basePriceLakhs: 20, type: 'auction' },
    { year: 2025, team: 'LSG', priceLakhs: 130, basePriceLakhs: 30, type: 'auction' }
  ],
  ABH_BANDEKAR: [ // Angkrish Raghuvanshi
    { year: 2024, team: 'KKR', priceLakhs: 20,  basePriceLakhs: 20, type: 'auction' },
    { year: 2025, team: 'KKR', priceLakhs: 300, basePriceLakhs: 30, type: 'auction' }
  ],
  VAIBHAV_SURYA: [
    { year: 2025, team: 'RR', priceLakhs: 110, basePriceLakhs: 30, type: 'auction' } // youngest ever, age 13
  ],
  PRABHSIMRAN: [
    { year: 2022, team: 'PBKS', priceLakhs: 60,  type: 'auction' },
    { year: 2023, team: 'PBKS', priceLakhs: 60,  type: 'retained' },
    { year: 2024, team: 'PBKS', priceLakhs: 60,  type: 'retained' }
    // 2025: unsold
  ],
  RAJAT_PATIDAR: [
    { year: 2022, team: 'RCB', priceLakhs: 20,   type: 'auction' },
    { year: 2023, team: 'RCB', priceLakhs: 20,   type: 'retained' },
    { year: 2024, team: 'RCB', priceLakhs: 20,   type: 'retained' },
    { year: 2025, team: 'RCB', priceLakhs: 1100, type: 'megaRetention' }
  ],
  NITISH_REDDY: [
    { year: 2024, team: 'SRH', priceLakhs: 20,  basePriceLakhs: 20, type: 'auction' },
    { year: 2025, team: 'SRH', priceLakhs: 600, type: 'megaRetention' }
  ],
  MAY_YADAV: [ // Mayank Yadav
    { year: 2024, team: 'LSG', priceLakhs: 20,   basePriceLakhs: 20, type: 'auction' },
    { year: 2025, team: 'LSG', priceLakhs: 1100, type: 'megaRetention' }
  ],
  RAVI_BISHNOI: [
    { year: 2022, team: 'LSG', priceLakhs: 400,  type: 'auction' },
    { year: 2023, team: 'LSG', priceLakhs: 400,  type: 'retained' },
    { year: 2024, team: 'LSG', priceLakhs: 400,  type: 'retained' },
    { year: 2025, team: 'LSG', priceLakhs: 1100, type: 'megaRetention' }
  ],
  DH_JUREL: [
    { year: 2022, team: 'RR', priceLakhs: 20,   type: 'auction' },
    { year: 2023, team: 'RR', priceLakhs: 20,   type: 'retained' },
    { year: 2024, team: 'RR', priceLakhs: 20,   type: 'retained' },
    { year: 2025, team: 'RR', priceLakhs: 1400, type: 'megaRetention' }
  ],
  RIA_PARAG: [
    { year: 2022, team: 'RR', priceLakhs: 380,  type: 'auction' },
    { year: 2023, team: 'RR', priceLakhs: 380,  type: 'retained' },
    { year: 2024, team: 'RR', priceLakhs: 380,  type: 'retained' },
    { year: 2025, team: 'RR', priceLakhs: 1400, type: 'megaRetention' }
  ],
  SHI_DUBE: [
    { year: 2022, team: 'CSK', priceLakhs: 400,  type: 'auction' },
    { year: 2023, team: 'CSK', priceLakhs: 400,  type: 'retained' },
    { year: 2024, team: 'CSK', priceLakhs: 400,  type: 'retained' },
    { year: 2025, team: 'CSK', priceLakhs: 1200, type: 'megaRetention' }
  ],
  AYU_BADONI: [
    { year: 2022, team: 'LSG', priceLakhs: 20,  type: 'auction' },
    { year: 2023, team: 'LSG', priceLakhs: 20,  type: 'retained' },
    { year: 2024, team: 'LSG', priceLakhs: 20,  type: 'retained' },
    { year: 2025, team: 'LSG', priceLakhs: 400, type: 'megaRetention' }
  ],
  JIT_SHARMA: [
    { year: 2022, team: 'PBKS', priceLakhs: 20,  type: 'auction' },
    { year: 2023, team: 'PBKS', priceLakhs: 20,  type: 'retained' },
    { year: 2024, team: 'PBKS', priceLakhs: 20,  type: 'retained' },
    { year: 2025, team: 'PBKS', priceLakhs: 1100, type: 'megaRetention' } // uncapped → elevated 2025
  ],

  // ===== OTHER NOTABLE =====
  GER_COETZEE: [
    { year: 2024, team: 'MI',  priceLakhs: 500, basePriceLakhs: 100, type: 'auction' },
    { year: 2025, team: 'GT',  priceLakhs: 240, basePriceLakhs: 200, type: 'auction' }
  ],
  SPENCER_JOHNSON: [
    { year: 2024, team: 'GT',  priceLakhs: 1000, basePriceLakhs: 200, type: 'auction' },
    { year: 2025, team: 'MI',  priceLakhs: 275,  basePriceLakhs: 200, type: 'auction' }
  ],
  BHU_KUMAR: [
    { year: 2022, team: 'SRH',  priceLakhs: 420, type: 'auction' },
    { year: 2023, team: 'SRH',  priceLakhs: 420, type: 'retained' },
    { year: 2024, team: 'SRH',  priceLakhs: 420, type: 'retained' },
    { year: 2025, team: 'RCB',  priceLakhs: 1050, basePriceLakhs: 200, type: 'auction' }
  ],
  MAN_PANDEY: [
    { year: 2022, team: 'LSG', priceLakhs: 460, type: 'auction' },
    { year: 2023, team: 'DC',  priceLakhs: 240, basePriceLakhs: 100, type: 'auction' },
    { year: 2024, team: 'KKR', priceLakhs: 50,  basePriceLakhs: 50,  type: 'auction' }
  ],
  BRYDON_CARSE: [
    { year: 2025, team: 'PBKS', priceLakhs: 100, basePriceLakhs: 100, type: 'auction' }
  ],
  JAKE_FMG: [ // DUN_WELL is Jake Fraser-McGurk
    { year: 2025, team: 'DC', priceLakhs: 900, basePriceLakhs: 150, type: 'auction' }
  ],
  DUN_WELL: [
    { year: 2024, team: 'DC', priceLakhs: 20,  basePriceLakhs: 20, type: 'auction' },
    { year: 2025, team: 'DC', priceLakhs: 900, basePriceLakhs: 150, type: 'auction' }
  ],
  JONNY_BAIRSTOW: [
    { year: 2022, team: 'PBKS', priceLakhs: 675, type: 'auction' },
    { year: 2023, team: 'PBKS', priceLakhs: 675, type: 'retained' },
    { year: 2024, team: 'PBKS', priceLakhs: 675, type: 'retained' }
  ],
  DARYL_MITCHELL: [
    { year: 2024, team: 'CSK', priceLakhs: 1400, basePriceLakhs: 200, type: 'auction' }
  ],
  GUS_ATKINSON: [
    { year: 2024, team: 'KKR', priceLakhs: 100, basePriceLakhs: 50, type: 'auction' }
  ],
  MUJEEB_RAHMAN: [
    { year: 2024, team: 'KKR', priceLakhs: 200, basePriceLakhs: 200, type: 'auction' }
  ],
  JHYE_RICHARDSON: [
    { year: 2022, team: 'PBKS', priceLakhs: 1400, type: 'auction' },
    { year: 2024, team: 'DC',   priceLakhs: 500,  basePriceLakhs: 150, type: 'auction' }
  ],
  ROBIN_MINZ: [
    { year: 2024, team: 'GT', priceLakhs: 360, basePriceLakhs: 20, type: 'auction' }
  ],
  MUS_AHMED: [ // Mustafizur Rahman
    { year: 2022, team: 'DC',  priceLakhs: 200, type: 'auction' },
    { year: 2024, team: 'CSK', priceLakhs: 200, basePriceLakhs: 200, type: 'auction' }
  ],
  ADA_ZAMPA: [
    { year: 2023, team: 'RR', priceLakhs: 150, basePriceLakhs: 150, type: 'auction' }
  ],
  WAN_HASARANGA: [
    { year: 2022, team: 'RCB', priceLakhs: 1075, type: 'auction' },
    { year: 2023, team: 'RCB', priceLakhs: 1075, type: 'retained' },
    { year: 2024, team: 'SRH', priceLakhs: 150,  basePriceLakhs: 150, type: 'auction' }
  ],
  MAT_THEEK: [ // Maheesh Theekshana
    { year: 2022, team: 'CSK', priceLakhs: 70, type: 'auction' },
    { year: 2023, team: 'CSK', priceLakhs: 70, type: 'retained' },
    { year: 2024, team: 'CSK', priceLakhs: 70, type: 'retained' }
    // 2025: unsold
  ],
  MAHI_THEEKSHANA: [ // DB alias — Matheesha Pathirana
    { year: 2022, team: 'CSK', priceLakhs: 70,   type: 'auction' },
    { year: 2023, team: 'CSK', priceLakhs: 70,   type: 'retained' },
    { year: 2024, team: 'CSK', priceLakhs: 70,   type: 'retained' },
    { year: 2025, team: 'CSK', priceLakhs: 1300, type: 'megaRetention' }
  ],
  MIT_SANTNER: [
    { year: 2022, team: 'CSK', priceLakhs: 190, type: 'auction' },
    { year: 2023, team: 'CSK', priceLakhs: 190, type: 'retained' },
    { year: 2024, team: 'CSK', priceLakhs: 190, type: 'retained' },
    { year: 2025, team: 'MI',  priceLakhs: 200, basePriceLakhs: 200, type: 'auction' }
  ],
  MIT_MARSH: [
    { year: 2022, team: 'DC',  priceLakhs: 650, type: 'auction' },
    { year: 2023, team: 'DC',  priceLakhs: 650, type: 'retained' },
    { year: 2025, team: 'LSG', priceLakhs: 350, basePriceLakhs: 200, type: 'auction' }
  ]
};

// ===== HELPER: add pct-of-purse to every record =====
// Call once on load to enrich records with pctOfPurse = priceLakhs / cap * 100.
// Useful feature for training a bid model: lets you compare across seasons
// despite the cap changing from 90 Cr → 120 Cr.
(function enrichWithPct() {
  if (!window.TEAM_PURSES_BY_YEAR) return;
  Object.values(window.PLAYER_SALARY_HISTORY).forEach(records => {
    records.forEach(r => {
      const purse = window.TEAM_PURSES_BY_YEAR[r.year];
      if (purse && purse.cap) {
        r.pctOfPurse = +(r.priceLakhs / purse.cap * 100).toFixed(2);
      }
    });
  });
})();
