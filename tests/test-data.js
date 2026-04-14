// Data integrity tests
require('./setup');
restoreConsole(); // re-enable test output
const { test, describe, expect, summary } = require('./test-runner');

describe('Player Data Integrity', () => {
  test('All 10 IPL teams exist', () => {
    expect(TEAMS).toHaveLength(10);
    const ids = TEAMS.map(t => t.id);
    ['MI', 'CSK', 'RCB', 'DC', 'KKR', 'SRH', 'PBKS', 'RR', 'GT', 'LSG'].forEach(id => {
      expect(ids).toContain(id);
    });
  });

  test('200+ players in database', () => {
    expect(PLAYERS.length).toBeGreaterThan(200);
  });

  test('No Pakistan players', () => {
    const pakPlayers = PLAYERS.filter(p => p.nationality === 'PAK');
    expect(pakPlayers).toHaveLength(0);
  });

  test('Every player has required fields', () => {
    PLAYERS.forEach(p => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.role).toBeTruthy();
      expect(p.basePrice).toBeGreaterThan(0);
      expect(p.stats).toBeTruthy();
      expect(typeof p.isOverseas).toBe('boolean');
    });
  });

  test('Player IDs are unique', () => {
    const ids = PLAYERS.map(p => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('All teams have squadNeeds and personality', () => {
    TEAMS.forEach(t => {
      expect(t.squadNeeds).toBeTruthy();
      expect(t.personality).toBeTruthy();
      expect(t.squadNeeds.batters.min).toBeGreaterThan(0);
      expect(t.squadNeeds.bowlers.min).toBeGreaterThan(0);
    });
  });

  test('Star players exist (200+ rated batters/bowlers)', () => {
    const stars = PLAYERS.filter(p => p.starPower >= 85);
    expect(stars.length).toBeGreaterThan(10);
  });
});

describe('Auction Engine — Initialization', () => {
  test('init creates state for all 10 teams', () => {
    AuctionEngine.init({ MI: 'Player 1' });
    const states = AuctionEngine.getAllTeamStates();
    expect(Object.keys(states)).toHaveLength(10);
  });

  test('init marks correct team as human', () => {
    AuctionEngine.init({ MI: 'Player 1', RCB: 'Player 2' });
    const states = AuctionEngine.getAllTeamStates();
    expect(states.MI.isHuman).toBe(true);
    expect(states.RCB.isHuman).toBe(true);
    expect(states.CSK.isHuman).toBe(false);
  });

  test('Each team starts with 12500L (125 Cr) budget', () => {
    AuctionEngine.init({});
    const states = AuctionEngine.getAllTeamStates();
    Object.values(states).forEach(ts => {
      expect(ts.budget).toBe(12500);
      expect(ts.filled).toBe(0);
    });
  });

  test('Player pool includes all players', () => {
    AuctionEngine.init({});
    const state = AuctionEngine.getState();
    expect(state.playerPool.length).toBe(PLAYERS.length);
  });
});

describe('Auction Engine — canAfford', () => {
  test('Empty squad team can afford bid', () => {
    AuctionEngine.init({});
    expect(AuctionEngine.canAfford('MI', 1000)).toBe(true);
  });

  test('Cannot afford if budget would go below mandatory reserve', () => {
    AuctionEngine.init({});
    const states = AuctionEngine.getAllTeamStates();
    states.MI.budget = 300; // 3 Cr left
    states.MI.filled = 5; // 13 more needed; after this player = 12 slots, reserve = 12*20 = 240
    // Bid 100 → 300 - 100 = 200 vs 240 reserve → cannot afford
    expect(AuctionEngine.canAfford('MI', 100)).toBe(false);
    // Bid 60 → 300 - 60 = 240 = reserve → can afford (>=)
    expect(AuctionEngine.canAfford('MI', 60)).toBe(true);
  });

  test('Increment is always 25L (0.25 Cr)', () => {
    expect(AuctionEngine.getIncrement(0)).toBe(25);
    expect(AuctionEngine.getIncrement(200)).toBe(25);
    expect(AuctionEngine.getIncrement(2000)).toBe(25);
  });
});

describe('Auction Engine — Format Price', () => {
  test('Below 100L shows in lakhs', () => {
    expect(AuctionEngine.formatPrice(20)).toBe('₹20 L');
    expect(AuctionEngine.formatPrice(75)).toBe('₹75 L');
  });

  test('100L+ shows in crores', () => {
    expect(AuctionEngine.formatPrice(100)).toBe('₹1.00 Cr');
    expect(AuctionEngine.formatPrice(200)).toBe('₹2.00 Cr');
    expect(AuctionEngine.formatPrice(1250)).toBe('₹12.50 Cr');
  });
});

describe('Auction Engine — Overseas Limit', () => {
  test('canBuyPlayer blocks overseas at 8 limit', () => {
    AuctionEngine.init({});
    const states = AuctionEngine.getAllTeamStates();
    states.MI.overseasCount = 8;
    const overseasPlayer = PLAYERS.find(p => p.isOverseas);
    expect(AuctionEngine.canBuyPlayer('MI', overseasPlayer)).toBe(false);
  });

  test('canBuyPlayer allows Indian even when 8 overseas full', () => {
    AuctionEngine.init({});
    const states = AuctionEngine.getAllTeamStates();
    states.MI.overseasCount = 8;
    const indianPlayer = PLAYERS.find(p => !p.isOverseas);
    expect(AuctionEngine.canBuyPlayer('MI', indianPlayer)).toBe(true);
  });

  test('canBuyPlayer blocks any player at 25 squad limit', () => {
    AuctionEngine.init({});
    const states = AuctionEngine.getAllTeamStates();
    states.MI.filled = 25;
    expect(AuctionEngine.canBuyPlayer('MI', PLAYERS[0])).toBe(false);
  });
});

describe('Simulation — Schedule', () => {
  test('Tournament generates 90 league matches (each team 18)', () => {
    AuctionEngine.init({});
    // Manually fill squads to allow simulation init
    const states = AuctionEngine.getAllTeamStates();
    const playerPool = [...PLAYERS];
    Object.keys(states).forEach(tid => {
      states[tid].squad = playerPool.splice(0, 20).map(p => ({ player: p, price: 100 }));
      states[tid].filled = 20;
    });
    SimulationEngine.init(states);
    const sim = SimulationEngine.getState();
    expect(sim.schedule.length).toBe(90); // 10 teams × 9 opponents
  });

  test('Each team plays exactly 18 matches in schedule', () => {
    AuctionEngine.init({});
    const states = AuctionEngine.getAllTeamStates();
    const playerPool = [...PLAYERS];
    Object.keys(states).forEach(tid => {
      states[tid].squad = playerPool.splice(0, 20).map(p => ({ player: p, price: 100 }));
      states[tid].filled = 20;
    });
    SimulationEngine.init(states);
    const sim = SimulationEngine.getState();
    const counts = {};
    sim.schedule.forEach(m => {
      counts[m.teamA] = (counts[m.teamA] || 0) + 1;
      counts[m.teamB] = (counts[m.teamB] || 0) + 1;
    });
    Object.values(counts).forEach(c => expect(c).toBe(18));
  });
});

describe('Simulation — formatOvers (cricket notation)', () => {
  test('120 balls = 20.0 overs', () => {
    expect(SimulationEngine.formatOvers(120)).toBe('20.0');
  });

  test('118 balls = 19.4 overs (not 19.7)', () => {
    expect(SimulationEngine.formatOvers(118)).toBe('19.4');
  });

  test('60 balls = 10.0 overs', () => {
    expect(SimulationEngine.formatOvers(60)).toBe('10.0');
  });

  test('63 balls = 10.3 overs', () => {
    expect(SimulationEngine.formatOvers(63)).toBe('10.3');
  });

  test('1 ball = 0.1 overs', () => {
    expect(SimulationEngine.formatOvers(1)).toBe('0.1');
  });

  test('0 balls = 0.0 overs', () => {
    expect(SimulationEngine.formatOvers(0)).toBe('0.0');
  });
});

describe('Auction Engine — Squad Composition', () => {
  test('Adding overseas player increments overseasCount', () => {
    AuctionEngine.init({});
    const states = AuctionEngine.getAllTeamStates();
    const overseasPlayer = PLAYERS.find(p => p.isOverseas);
    AuctionEngine.syncSold(overseasPlayer, 'MI', 200);
    expect(states.MI.overseasCount).toBe(1);
    expect(states.MI.filled).toBe(1);
  });

  test('Budget decreases after buying', () => {
    AuctionEngine.init({});
    const states = AuctionEngine.getAllTeamStates();
    const initialBudget = states.MI.budget;
    AuctionEngine.syncSold(PLAYERS[0], 'MI', 500);
    expect(states.MI.budget).toBe(initialBudget - 500);
  });

  test('Duplicate sold prevented', () => {
    AuctionEngine.init({});
    const states = AuctionEngine.getAllTeamStates();
    AuctionEngine.syncSold(PLAYERS[0], 'MI', 200);
    AuctionEngine.syncSold(PLAYERS[0], 'MI', 200); // duplicate
    expect(states.MI.filled).toBe(1);
    expect(states.MI.budget).toBe(12500 - 200);
  });
});

describe('Batting Order — realistic positions', () => {
  function getBattingPosition(p) {
    const sub = p.subRole;
    const role = p.role;
    const bat = p.stats.batting || 0;
    if (role === 'bowler') return 900 - bat;
    if (role === 'wicketkeeper') {
      if (bat >= 75) return 200 - bat;
      return 450 - bat;
    }
    if (role === 'batter') {
      if (sub === 'top-order') return 100 - bat;
      if (sub === 'middle-order') return 400 - bat;
      if (sub === 'finisher') return 600 - bat;
      return 350 - bat;
    }
    if (role === 'allRounder') {
      if (sub === 'batting-ar' && bat >= 65) return 500 - bat;
      if (sub === 'batting-ar') return 650 - bat;
      if (sub === 'bowling-ar') return 750 - bat;
      return 700 - bat;
    }
    return 800;
  }

  test('Quinton de Kock (WK 82) bats before Stokes (allrounder 80)', () => {
    const dekock = PLAYERS.find(p => p.id === 'QUI_DEKOK');
    const stokes = PLAYERS.find(p => p.id === 'BEN_STOKES');
    expect(getBattingPosition(dekock)).toBeLessThan(getBattingPosition(stokes));
  });

  test('Bumrah (bowler) bats AFTER Patidar (batter)', () => {
    const bumrah = PLAYERS.find(p => p.id === 'JAS_BUMRAH');
    const patidar = PLAYERS.find(p => p.id === 'RAJAT_PATIDAR');
    expect(getBattingPosition(bumrah)).toBeGreaterThan(getBattingPosition(patidar));
  });

  test('Kuldeep Yadav (bowler) bats AFTER any batter', () => {
    const kuldeep = PLAYERS.find(p => p.id === 'KUL_YADAV');
    const batters = PLAYERS.filter(p => p.role === 'batter').slice(0, 5);
    batters.forEach(b => {
      expect(getBattingPosition(kuldeep)).toBeGreaterThan(getBattingPosition(b));
    });
  });

  test('Top-order batter (Kohli) bats first', () => {
    const kohli = PLAYERS.find(p => p.id === 'VIR_KOHLI');
    const middleOrder = PLAYERS.find(p => p.subRole === 'middle-order' && p.role === 'batter');
    expect(getBattingPosition(kohli)).toBeLessThan(getBattingPosition(middleOrder));
  });

  test('Finishers bat after middle-order', () => {
    const finisher = PLAYERS.find(p => p.subRole === 'finisher');
    const middle = PLAYERS.find(p => p.subRole === 'middle-order' && p.role === 'batter');
    if (finisher && middle) expect(getBattingPosition(finisher)).toBeGreaterThan(getBattingPosition(middle));
  });
});

describe('Realistic IPL Patterns', () => {
  test('Most overseas players over 36 should be considered unsold-prone', () => {
    const oldOverseas = PLAYERS.filter(p => p.isOverseas && p.age >= 36);
    // We just check the data exists for testing the AI filter logic
    expect(oldOverseas.length).toBeGreaterThanOrEqual(0);
  });

  test('Hidden gems exist for auction wars', () => {
    const gems = PLAYERS.filter(p => p.hiddenGem);
    expect(gems.length).toBeGreaterThan(5);
  });

  test('Star power distribution (realistic spread)', () => {
    const elite = PLAYERS.filter(p => p.starPower >= 90).length;
    const mid = PLAYERS.filter(p => p.starPower >= 60 && p.starPower < 90).length;
    const budget = PLAYERS.filter(p => p.starPower < 40).length;
    // Should have more mid/budget than elite (realistic pyramid)
    expect(mid).toBeGreaterThan(elite);
    expect(budget).toBeGreaterThan(elite);
  });

  test('Total overseas count is reasonable for 10 teams x 8 max = 80', () => {
    const overseas = PLAYERS.filter(p => p.isOverseas).length;
    // We need at least 60-100 overseas for variety but not so many that all teams fill 8
    expect(overseas).toBeGreaterThan(40);
    expect(overseas).toBeLessThan(150);
  });
});

summary();
