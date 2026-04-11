// IPL Teams Database (Updated for IPL 2026)
// Captains: All 10 teams led by Indian captains for the first time in IPL history
// RCB are defending champions (IPL 2025 winners)
window.TEAMS = [
  {
    id: "MI",
    name: "Mumbai Indians",
    shortName: "MI",
    city: "Mumbai",
    homeGround: "Wankhede Stadium",
    colors: { primary: "#004BA0", secondary: "#D4A843", bg: "#002D62" },
    emoji: "🔵",
    personality: {
      aggression: 0.75,
      sentimentality: 0.85,
      riskTolerance: 0.6,
      bluffFrequency: 0.3,
      rivalryIntensity: 0.7
    },
    squadNeeds: {
      batters: { min: 5, max: 7 },
      bowlers: { min: 5, max: 7 },
      allRounders: { min: 3, max: 5 },
      wicketkeepers: { min: 2, max: 3 },
      overseas: { min: 5, max: 8 }
    },
    playStyle: { pacePreference: 0.7, powerHittingValue: 0.8, deathBowlingValue: 0.9 },
    historicPlayers: ["RO_SHARMA", "JAS_BUMRAH", "SK_YADAV", "HR_PANDYA", "TIL_VARMA", "TRE_BOULT", "DL_CHAHAR", "WIL_JACKS", "NAMAN_DHIR"],
    rivals: ["CSK"]
  },
  {
    id: "CSK",
    name: "Chennai Super Kings",
    shortName: "CSK",
    city: "Chennai",
    homeGround: "MA Chidambaram Stadium",
    colors: { primary: "#FCCA06", secondary: "#0081E9", bg: "#F4A100" },
    emoji: "🦁",
    personality: {
      aggression: 0.5,
      sentimentality: 0.95,
      riskTolerance: 0.4,
      bluffFrequency: 0.2,
      rivalryIntensity: 0.6
    },
    squadNeeds: {
      batters: { min: 5, max: 7 },
      bowlers: { min: 5, max: 7 },
      allRounders: { min: 3, max: 5 },
      wicketkeepers: { min: 2, max: 3 },
      overseas: { min: 5, max: 8 }
    },
    playStyle: { pacePreference: 0.4, powerHittingValue: 0.6, deathBowlingValue: 0.7 },
    historicPlayers: ["RUT_GAIK", "SAN_SAMSON", "SHI_DUBE", "MS_DHONI", "PRASHANT_VEER", "KARTIK_SHARMA", "AYUSH_MHATRE", "DEWALD_BREVIS"],
    rivals: ["MI"]
  },
  {
    id: "RCB",
    name: "Royal Challengers Bengaluru",
    shortName: "RCB",
    city: "Bengaluru",
    homeGround: "M Chinnaswamy Stadium",
    colors: { primary: "#EC1C24", secondary: "#2B2A29", bg: "#B71C1C" },
    emoji: "🔴",
    personality: {
      aggression: 0.9,
      sentimentality: 0.6,
      riskTolerance: 0.9,
      bluffFrequency: 0.4,
      rivalryIntensity: 0.8
    },
    squadNeeds: {
      batters: { min: 5, max: 7 },
      bowlers: { min: 5, max: 7 },
      allRounders: { min: 3, max: 5 },
      wicketkeepers: { min: 2, max: 3 },
      overseas: { min: 5, max: 8 }
    },
    playStyle: { pacePreference: 0.5, powerHittingValue: 0.9, deathBowlingValue: 0.8 },
    historicPlayers: ["VIR_KOHLI", "RAJAT_PATIDAR", "PHI_SALT", "JOH_HAZLEWOOD", "BHU_KUMAR", "JACOB_BETHELL", "JIT_SHARMA", "VEN_IYER"],
    rivals: ["MI", "CSK"]
  },
  {
    id: "DC",
    name: "Delhi Capitals",
    shortName: "DC",
    city: "Delhi",
    homeGround: "Arun Jaitley Stadium",
    colors: { primary: "#004C93", secondary: "#EF1B23", bg: "#00337C" },
    emoji: "🏛️",
    personality: {
      aggression: 0.6,
      sentimentality: 0.4,
      riskTolerance: 0.7,
      bluffFrequency: 0.3,
      rivalryIntensity: 0.5
    },
    squadNeeds: {
      batters: { min: 5, max: 7 },
      bowlers: { min: 5, max: 7 },
      allRounders: { min: 3, max: 5 },
      wicketkeepers: { min: 2, max: 3 },
      overseas: { min: 5, max: 8 }
    },
    playStyle: { pacePreference: 0.6, powerHittingValue: 0.7, deathBowlingValue: 0.8 },
    historicPlayers: ["AX_PATEL", "KL_RAHUL", "KUL_YADAV", "MIT_STARC", "NAT_NATARA", "TRISTAN_STUBBS", "MUK_KUMAR", "PATHUM_NISSANKA"],
    rivals: ["PBKS"]
  },
  {
    id: "KKR",
    name: "Kolkata Knight Riders",
    shortName: "KKR",
    city: "Kolkata",
    homeGround: "Eden Gardens",
    colors: { primary: "#3A225D", secondary: "#D4A843", bg: "#2D1854" },
    emoji: "💜",
    personality: {
      aggression: 0.7,
      sentimentality: 0.7,
      riskTolerance: 0.5,
      bluffFrequency: 0.5,
      rivalryIntensity: 0.6
    },
    squadNeeds: {
      batters: { min: 5, max: 7 },
      bowlers: { min: 5, max: 7 },
      allRounders: { min: 3, max: 5 },
      wicketkeepers: { min: 2, max: 3 },
      overseas: { min: 5, max: 8 }
    },
    playStyle: { pacePreference: 0.5, powerHittingValue: 0.8, deathBowlingValue: 0.7 },
    historicPlayers: ["SUN_NARINE", "AND_RUSSELL", "RIN_SINGH", "VAR_CHAKRA", "HAR_RANA", "CAM_GREEN", "MAHI_THEEKSHANA", "AM_RAHANE"],
    rivals: ["RCB"]
  },
  {
    id: "SRH",
    name: "Sunrisers Hyderabad",
    shortName: "SRH",
    city: "Hyderabad",
    homeGround: "Rajiv Gandhi Intl Stadium",
    colors: { primary: "#FF822A", secondary: "#000000", bg: "#E65100" },
    emoji: "🌅",
    personality: {
      aggression: 0.4,
      sentimentality: 0.5,
      riskTolerance: 0.3,
      bluffFrequency: 0.1,
      rivalryIntensity: 0.4
    },
    squadNeeds: {
      batters: { min: 5, max: 7 },
      bowlers: { min: 5, max: 7 },
      allRounders: { min: 3, max: 5 },
      wicketkeepers: { min: 2, max: 3 },
      overseas: { min: 5, max: 8 }
    },
    playStyle: { pacePreference: 0.8, powerHittingValue: 0.85, deathBowlingValue: 0.75 },
    historicPlayers: ["HEI_KLAASEN", "TRA_HEAD", "PAT_CUMMINS", "ABH_SHARMA", "IS_KISHAN", "HAR_PATEL", "NITISH_REDDY", "LIA_LIVINGSTONE"],
    rivals: ["RR"]
  },
  {
    id: "PBKS",
    name: "Punjab Kings",
    shortName: "PBKS",
    city: "Mohali",
    homeGround: "IS Bindra Stadium",
    colors: { primary: "#ED1B24", secondary: "#A7A9AC", bg: "#C62828" },
    emoji: "👑",
    personality: {
      aggression: 0.85,
      sentimentality: 0.3,
      riskTolerance: 0.95,
      bluffFrequency: 0.2,
      rivalryIntensity: 0.5
    },
    squadNeeds: {
      batters: { min: 5, max: 7 },
      bowlers: { min: 5, max: 7 },
      allRounders: { min: 3, max: 5 },
      wicketkeepers: { min: 2, max: 3 },
      overseas: { min: 5, max: 8 }
    },
    playStyle: { pacePreference: 0.6, powerHittingValue: 0.9, deathBowlingValue: 0.6 },
    historicPlayers: ["SHR_IYER", "ARS_SINGH", "YUZ_CHAHAL", "MAR_STOINIS", "MARCO_JANSEN", "LOC_FERGUSON", "PRABHSIMRAN"],
    rivals: ["DC"]
  },
  {
    id: "RR",
    name: "Rajasthan Royals",
    shortName: "RR",
    city: "Jaipur",
    homeGround: "Sawai Mansingh Stadium",
    colors: { primary: "#EA1A85", secondary: "#254AA5", bg: "#C2185B" },
    emoji: "👒",
    personality: {
      aggression: 0.55,
      sentimentality: 0.6,
      riskTolerance: 0.5,
      bluffFrequency: 0.3,
      rivalryIntensity: 0.5
    },
    squadNeeds: {
      batters: { min: 5, max: 7 },
      bowlers: { min: 5, max: 7 },
      allRounders: { min: 3, max: 5 },
      wicketkeepers: { min: 2, max: 3 },
      overseas: { min: 5, max: 8 }
    },
    playStyle: { pacePreference: 0.5, powerHittingValue: 0.7, deathBowlingValue: 0.8 },
    historicPlayers: ["YAS_JAISWAL", "RIA_PARAG", "RA_JADEJA", "DH_JUREL", "JOF_ARCHER", "SHIM_HETMYER", "SAM_CURRAN", "RAVI_BISHNOI"],
    rivals: ["SRH"]
  },
  {
    id: "GT",
    name: "Gujarat Titans",
    shortName: "GT",
    city: "Ahmedabad",
    homeGround: "Narendra Modi Stadium",
    colors: { primary: "#1C1C1C", secondary: "#A0D2DB", bg: "#0D1B2A" },
    emoji: "🛡️",
    personality: {
      aggression: 0.65,
      sentimentality: 0.5,
      riskTolerance: 0.6,
      bluffFrequency: 0.25,
      rivalryIntensity: 0.55
    },
    squadNeeds: {
      batters: { min: 5, max: 7 },
      bowlers: { min: 5, max: 7 },
      allRounders: { min: 3, max: 5 },
      wicketkeepers: { min: 2, max: 3 },
      overseas: { min: 5, max: 8 }
    },
    playStyle: { pacePreference: 0.7, powerHittingValue: 0.65, deathBowlingValue: 0.85 },
    historicPlayers: ["SHU_GILL", "RAS_KHAN", "JOS_BUTTLER", "MO_SIRAJ", "KAG_RABADA", "PRA_KRISHNA", "SAI_SUDHARSAN", "WAS_SUNDAR"],
    rivals: ["LSG"]
  },
  {
    id: "LSG",
    name: "Lucknow Super Giants",
    shortName: "LSG",
    city: "Lucknow",
    homeGround: "BRSABV Ekana Stadium",
    colors: { primary: "#A72056", secondary: "#FFCC00", bg: "#7B1642" },
    emoji: "⚡",
    personality: {
      aggression: 0.7,
      sentimentality: 0.4,
      riskTolerance: 0.65,
      bluffFrequency: 0.35,
      rivalryIntensity: 0.6
    },
    squadNeeds: {
      batters: { min: 5, max: 7 },
      bowlers: { min: 5, max: 7 },
      allRounders: { min: 3, max: 5 },
      wicketkeepers: { min: 2, max: 3 },
      overseas: { min: 5, max: 8 }
    },
    playStyle: { pacePreference: 0.6, powerHittingValue: 0.75, deathBowlingValue: 0.8 },
    historicPlayers: ["RIS_PANT", "NIC_POORAN", "MAY_YADAV", "MOH_SHAMI", "AVE_KHAN", "AYU_BADONI", "MIT_MARSH", "JOSH_INGLIS"],
    rivals: ["GT"]
  }
];
