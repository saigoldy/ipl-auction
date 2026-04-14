// ===== IPL AUCTION ENGINE =====
window.AuctionEngine = (function() {
  let state = null;

  // Fixed bid increment: 0.25 Cr (25 Lakhs) at all levels
  function getIncrement(currentBid) {
    return 25;
  }

  function formatPrice(lakhs) {
    if (lakhs >= 100) return '₹' + (lakhs / 100).toFixed(2) + ' Cr';
    return '₹' + lakhs + ' L';
  }

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function init(humanTeams) {
    // humanTeams = { "MI": "Player 1 Name", "RCB": "Player 2 Name", ... }
    const teamStates = {};
    TEAMS.forEach(t => {
      teamStates[t.id] = {
        budget: 12500,
        squad: [],
        filled: 0,
        roleCount: { batter: 0, bowler: 0, allRounder: 0, wicketkeeper: 0 },
        subRoleCount: {},
        overseasCount: 0,
        overseasByRole: {},
        isHuman: !!humanTeams[t.id],
        humanName: humanTeams[t.id] || null,
        bidCount: 0, // how many bids placed this player
        passed: false
      };
    });

    // Sort players into sets: marquee, mid, budget
    const marquee = shuffleArray(PLAYERS.filter(p => p.starPower >= 80));
    const mid = shuffleArray(PLAYERS.filter(p => p.starPower >= 40 && p.starPower < 80));
    const budget = shuffleArray(PLAYERS.filter(p => p.starPower < 40));
    const orderedPool = [...marquee, ...mid, ...budget];

    state = {
      playerPool: orderedPool,
      currentIndex: 0,
      currentPlayer: null,
      currentBid: 0,
      currentBidder: null,
      bidHistory: [],
      soldPlayers: [],
      unsoldPlayers: [],
      teamStates: teamStates,
      humanTeams: humanTeams,
      round: 1,
      phase: 'MARQUEE',
      isActive: false,
      isPaused: false,
      bidTimer: null,
      timerDuration: 8000,
      bidWars: {}, // teamId -> count of bids on current player
      pendingAITimeouts: [],
      callbacks: {
        onBid: null,
        onSold: null,
        onUnsold: null,
        onLog: null,
        onNewPlayer: null,
        onAuctionEnd: null,
        onHumanTurn: null,
        onTimerUpdate: null
      }
    };

    return state;
  }

  function getState() { return state; }

  function nextPlayer() {
    if (state.currentIndex >= state.playerPool.length) {
      // Check if round 2 needed
      if (state.round === 1 && state.unsoldPlayers.length > 0) {
        state.round = 2;
        state.phase = 'ROUND 2';
        state.playerPool = shuffleArray(state.unsoldPlayers).map(p => {
          return { ...p, basePrice: Math.max(20, Math.floor(p.basePrice * 0.75)) };
        });
        state.unsoldPlayers = [];
        state.currentIndex = 0;
        log('📢 ROUND 2 BEGINS! Unsold players return at reduced base prices!', 'dramatic');
      } else {
        // Before ending, ensure all teams have minimum 18 players
        mandatoryFillSquads();
        state.isActive = false;
        if (state.callbacks.onAuctionEnd) state.callbacks.onAuctionEnd();
        return null;
      }
    }

    const player = state.playerPool[state.currentIndex];
    state.currentPlayer = player;
    state.currentBid = player.basePrice;
    state.currentBidder = null;
    state.bidHistory = [];
    state.bidWars = {};
    state.isActive = true;

    // Update phase label
    if (state.round === 1) {
      if (state.currentIndex < state.playerPool.filter(p => p.starPower >= 80).length) {
        state.phase = 'MARQUEE';
      } else if (state.currentIndex < state.playerPool.filter(p => p.starPower >= 40).length) {
        state.phase = 'ACCELERATION';
      } else {
        state.phase = 'REGULAR';
      }
    }

    // Reset team bid states for this player
    TEAMS.forEach(t => {
      state.teamStates[t.id].bidCount = 0;
      state.teamStates[t.id].passed = false;
    });

    if (state.callbacks.onNewPlayer) state.callbacks.onNewPlayer(player);
    log(`🏏 ${player.name} comes to the auction! Base price: ${formatPrice(player.basePrice)}`, 'dramatic');

    // Start bidding process
    setTimeout(() => startBidRound(), 800);
    return player;
  }

  // ===== NEW BIDDING FLOW =====
  // After each bid, a 5-second countdown starts.
  // During those 5 seconds, AI teams may jump in (with random delays).
  // Human players see BID/PASS buttons.
  // If the timer expires with no new bid → SOLD or UNSOLD.
  // Any new bid resets the 5-second timer.

  let countdownTimer = null;
  let countdownStart = 0;
  // 8 seconds in online mode (network latency), 5 seconds offline
  let COUNTDOWN_MS = 5000;

  function setOnlineTimer(isOnline) {
    COUNTDOWN_MS = isOnline ? 8000 : 5000;
  }

  function startBidRound() {
    if (!state.isActive) return;

    // Check if anyone is interested at all (for base price)
    let anyoneInterested = false;
    TEAMS.forEach(team => {
      const ts = state.teamStates[team.id];
      if (ts.isHuman) { anyoneInterested = true; return; }
      if (ts.filled >= 25) return;
      if (!canAfford(team.id, state.currentBid)) return;
      const eval_ = evaluateBid(team, state.currentPlayer, state.currentBid);
      if (eval_.willBid) anyoneInterested = true;
    });

    if (!anyoneInterested && !state.currentBidder) {
      markUnsold();
      return;
    }

    // Show human controls and start the countdown
    showAllControls();
    startCountdown();
    // Schedule AI bids during the countdown
    scheduleAIBids();
  }

  function showAllControls() {
    // Show bid/pass to all active human players
    const activeHumans = Object.keys(state.humanTeams).filter(id =>
      !state.teamStates[id].passed && id !== state.currentBidder
    );
    if (activeHumans.length > 0 && state.callbacks.onHumanTurn) {
      state.callbacks.onHumanTurn(activeHumans);
    }
  }

  let pausedTimeRemaining = 0; // ms remaining when paused

  function startCountdown() {
    clearCountdown();
    countdownStart = Date.now();

    countdownTimer = setInterval(() => {
      if (state.isPaused) return; // freeze timer while paused

      const elapsed = Date.now() - countdownStart;
      const remaining = Math.max(0, 1 - elapsed / COUNTDOWN_MS);
      if (state.callbacks.onTimerUpdate) state.callbacks.onTimerUpdate(remaining);

      if (elapsed >= COUNTDOWN_MS) {
        clearCountdown();
        if (state.currentBidder) {
          markSold();
        } else {
          markUnsold();
        }
      }
    }, 50);
  }

  function pause() {
    if (!state || state.isPaused) return;
    state.isPaused = true;
    // Save remaining time
    pausedTimeRemaining = Math.max(0, COUNTDOWN_MS - (Date.now() - countdownStart));
    // Pause all pending AI timeouts by clearing them (they'll be re-scheduled on resume)
    if (state.pendingAITimeouts) {
      state.pendingAITimeouts.forEach(t => clearTimeout(t));
      state.pendingAITimeouts = [];
    }
  }

  function resume() {
    if (!state || !state.isPaused) return;
    state.isPaused = false;
    // Restart countdown with remaining time
    clearCountdown();
    countdownStart = Date.now() - (COUNTDOWN_MS - pausedTimeRemaining);
    countdownTimer = setInterval(() => {
      if (state.isPaused) return;
      const elapsed = Date.now() - countdownStart;
      const remaining = Math.max(0, 1 - elapsed / COUNTDOWN_MS);
      if (state.callbacks.onTimerUpdate) state.callbacks.onTimerUpdate(remaining);
      if (elapsed >= COUNTDOWN_MS) {
        clearCountdown();
        if (state.currentBidder) markSold();
        else markUnsold();
      }
    }, 50);
    // Re-schedule AI bids for remaining time
    scheduleAIBids();
  }

  function clearCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    // Also clear any pending AI bid timeouts
    if (state && state.pendingAITimeouts) {
      state.pendingAITimeouts.forEach(t => clearTimeout(t));
      state.pendingAITimeouts = [];
    }
  }

  function resetCountdown() {
    // New bid came in — restart the 5-second clock
    startCountdown();
    showAllControls();
    scheduleAIBids();
  }

  function scheduleAIBids() {
    if (!state.isActive) return;
    if (!state.pendingAITimeouts) state.pendingAITimeouts = [];

    // Each AI team evaluates and may bid at a random time within the 5s window
    // ONLY AI teams bid here — human teams bid via user input or broadcast
    TEAMS.forEach(team => {
      const ts = state.teamStates[team.id];
      // CRITICAL: never auto-bid for human-controlled teams
      if (ts.isHuman) return;
      if (team.id === state.currentBidder) return;
      if (ts.filled >= 25) return;

      // First bid = base price, subsequent = current + increment
      const nextBid = state.currentBidder ? state.currentBid + getIncrement(state.currentBid) : state.currentBid;
      if (!canAfford(team.id, nextBid)) return;

      const eval_ = evaluateBid(team, state.currentPlayer, nextBid);

      if (eval_.willBid && nextBid <= eval_.maxBid) {
        ts.passed = false;
        const delay = 800 + Math.random() * 3500;
        const timeout = setTimeout(() => {
          if (!state.isActive) return;
          if (state.teamStates[team.id].isHuman) return;
          if (team.id === state.currentBidder) return;

          const currentNext = state.currentBidder ? state.currentBid + getIncrement(state.currentBid) : state.currentBid;
          const reeval = evaluateBid(team, state.currentPlayer, currentNext);
          if (reeval.willBid && currentNext <= reeval.maxBid && canAfford(team.id, currentNext)) {
            placeBidInternal(team.id, currentNext, reeval.isBluff);
            resetCountdown();
          }
        }, delay);
        state.pendingAITimeouts.push(timeout);
      }
    });
  }

  function humanBid(teamId) {
    if (!state.isActive) return;
    // First bid = base price; subsequent bids = current + increment
    const newBid = state.currentBidder
      ? state.currentBid + getIncrement(state.currentBid)
      : state.currentBid; // base price
    if (!canAfford(teamId, newBid)) return;
    if (!canBuyPlayer(teamId, state.currentPlayer)) return;

    placeBidInternal(teamId, newBid, false, true); // fromHuman=true
    resetCountdown();
  }

  function humanPass(teamId) {
    state.teamStates[teamId].passed = true;
    const team = TEAMS.find(t => t.id === teamId);
    log(`${team.shortName} passes.`, '');

    // Update controls for remaining humans
    const remainingHumans = Object.keys(state.humanTeams).filter(id =>
      !state.teamStates[id].passed && id !== state.currentBidder
    );
    if (remainingHumans.length > 0 && state.callbacks.onHumanTurn) {
      state.callbacks.onHumanTurn(remainingHumans);
    }
    // Don't stop the countdown — other teams (AI) may still bid
  }

  function placeBidInternal(teamId, amount, isBluff, fromHuman) {
    // SAFETY: block AI from ever bidding for human-controlled teams
    if (!fromHuman && state.teamStates[teamId].isHuman) {
      console.error('BLOCKED: AI tried to bid for human team', teamId);
      return;
    }
    state.currentBid = amount;
    state.currentBidder = teamId;
    state.bidHistory.push({ teamId, amount, time: Date.now() });
    state.bidWars[teamId] = (state.bidWars[teamId] || 0) + 1;
    state.teamStates[teamId].bidCount++;

    const team = TEAMS.find(t => t.id === teamId);
    const ts = state.teamStates[teamId];

    // Generate dramatic log message
    let msg = `${team.shortName} bids ${formatPrice(amount)}`;
    if (isBluff) {
      msg += ' ❓';
    }

    // Check for rivalries
    if (state.bidHistory.length > 1) {
      const prevBidder = state.bidHistory[state.bidHistory.length - 2].teamId;
      const prevTeam = TEAMS.find(t => t.id === prevBidder);
      if (team.rivals && team.rivals.includes(prevBidder)) {
        msg = `🔥 ${team.shortName} counter-bids against rivals ${prevTeam.shortName}! ${formatPrice(amount)}`;
      }
    }

    // Sentiment check
    if (state.currentPlayer.teamHistory.includes(teamId) && state.bidWars[teamId] >= 2) {
      msg = `💛 ${team.shortName} fights to get back their player! ${formatPrice(amount)}`;
    }

    // Budget warning
    if (ts.budget - amount < 2000 && ts.filled < 15) {
      msg += ' ⚠️ Budget running low!';
    }

    // Bidding war detection
    const warTeams = Object.entries(state.bidWars).filter(([, c]) => c >= 3);
    if (warTeams.length >= 2 && amount > 500) {
      log(`⚡ BIDDING WAR! ${warTeams.map(([id]) => TEAMS.find(t => t.id === id).shortName).join(' vs ')}!`, 'dramatic');
    }

    // CHAOS MODE: 4+ unique bidders
    const uniqueBidders = Object.keys(state.bidWars).length;
    if (uniqueBidders >= 4 && state.bidHistory.length === uniqueBidders) {
      log(`🔥 ${uniqueBidders} TEAMS BIDDING for ${state.currentPlayer.name}! This is going to get crazy!`, 'dramatic');
    }
    if (uniqueBidders >= 5 && amount > 1500) {
      log(`💥 INSANE! ${state.currentPlayer.name} now at ${formatPrice(amount)}! ${uniqueBidders}-team war!`, 'dramatic');
    }
    if (amount >= 2500) {
      log(`🤯 RECORD-BREAKING bid! ${formatPrice(amount)} for ${state.currentPlayer.name}!`, 'dramatic');
    }

    log(msg, ts.isHuman ? 'dramatic' : '');
    if (state.callbacks.onBid) state.callbacks.onBid(teamId, amount);
  }

  function canAfford(teamId, bidAmount) {
    const ts = state.teamStates[teamId];
    // ALL teams (human + AI) must reserve budget for remaining mandatory slots
    const slotsNeeded = Math.max(0, 18 - ts.filled - 1);
    if (slotsNeeded === 0) {
      // Already at 18+ — can spend freely up to total budget
      return ts.budget >= bidAmount;
    }

    // Calculate the realistic minimum cost to fill remaining slots
    // Look at remaining unsold + upcoming pool to find cheapest available
    const reserveNeeded = calculateMinReserve(teamId, slotsNeeded);
    return ts.budget - bidAmount >= reserveNeeded;
  }

  // Calculate minimum budget needed to fill `slotsNeeded` more players
  // Uses actual base prices from remaining pool (not a flat assumption)
  function calculateMinReserve(teamId, slotsNeeded) {
    if (slotsNeeded <= 0) return 0;

    const ts = state.teamStates[teamId];
    // Combine remaining pool + unsold players
    const remainingPool = state.playerPool.slice(state.currentIndex + 1);
    const unsoldPool = state.unsoldPlayers || [];
    const allAvailable = [...remainingPool, ...unsoldPool];

    // Filter to players this team CAN buy (overseas limit, not in their squad)
    const teamSquadIds = new Set(ts.squad.map(s => s.player.id));
    const eligible = allAvailable.filter(p => {
      if (teamSquadIds.has(p.id)) return false;
      if (p.isOverseas && ts.overseasCount >= 8) return false;
      return true;
    });

    // Sort by base price ascending (cheapest first)
    const cheapest = [...eligible].sort((a, b) => a.basePrice - b.basePrice);

    // Sum the cheapest `slotsNeeded` players' base prices
    let total = 0;
    for (let i = 0; i < slotsNeeded && i < cheapest.length; i++) {
      total += cheapest[i].basePrice;
    }

    // Safety floor: at least 20L per slot if pool is somehow exhausted
    const minimum = slotsNeeded * 20;
    return Math.max(total, minimum);
  }

  function canBuyPlayer(teamId, player) {
    const ts = state.teamStates[teamId];
    if (ts.filled >= 25) return false;
    if (player.isOverseas && ts.overseasCount >= 8) return false;
    return true;
  }

  // Real IPL franchise archetypes (based on 2008-2025 patterns)
  // Each franchise has historical preferences that influence bidding
  const FRANCHISE_PREFS = {
    MI:   { paceBoost: 1.20, spinBoost: 0.85, youthBoost: 1.15, eldersBoost: 0.85, oldOverseasPenalty: 0.7 },
    CSK:  { paceBoost: 0.85, spinBoost: 1.30, youthBoost: 0.85, eldersBoost: 1.40, oldOverseasPenalty: 0.95 }, // CSK loves old/experienced
    RCB:  { paceBoost: 1.00, spinBoost: 0.90, youthBoost: 1.10, eldersBoost: 1.05, oldOverseasPenalty: 0.7, batterBoost: 1.20 },
    DC:   { paceBoost: 1.05, spinBoost: 1.05, youthBoost: 1.10, eldersBoost: 0.95, oldOverseasPenalty: 0.65 },
    KKR:  { paceBoost: 0.95, spinBoost: 1.25, youthBoost: 1.00, eldersBoost: 1.00, oldOverseasPenalty: 0.75, mysteryBowler: 1.20 },
    SRH:  { paceBoost: 1.20, spinBoost: 0.95, youthBoost: 1.05, eldersBoost: 0.95, oldOverseasPenalty: 0.65 },
    PBKS: { paceBoost: 1.05, spinBoost: 0.95, youthBoost: 1.10, eldersBoost: 0.85, oldOverseasPenalty: 0.6, variance: 1.25 }, // overspend variance
    RR:   { paceBoost: 0.95, spinBoost: 1.20, youthBoost: 1.20, eldersBoost: 0.85, oldOverseasPenalty: 0.65 },
    GT:   { paceBoost: 1.10, spinBoost: 1.10, youthBoost: 1.10, eldersBoost: 1.00, oldOverseasPenalty: 0.7, allRounderBoost: 1.20 },
    LSG:  { paceBoost: 1.10, spinBoost: 0.95, youthBoost: 1.20, eldersBoost: 0.85, oldOverseasPenalty: 0.6 }
  };

  // Realistic max bid based on player tier + bidding war intensity
  // 5+ teams competing = chaos mode, can reach 25+ Cr for top stars
  function getRealisticMaxBid(player) {
    const star = player.starPower;
    const age = player.age;

    // Count distinct bidders on current player (war intensity)
    const distinctBidders = state && state.bidWars ? Object.keys(state.bidWars).length : 0;

    // Base multiplier by tier
    let multiplier;
    if (star >= 90) multiplier = 6.0;            // Marquee elite
    else if (star >= 80) multiplier = 5.0;       // Top stars
    else if (star >= 60) multiplier = 3.5;       // Mid-tier
    else if (star >= 40) multiplier = 2.5;       // Decent
    else if (star >= 20) multiplier = 2.0;       // Budget
    else if (age <= 23 && player.hiddenGem) multiplier = 7.0; // Young gems
    else multiplier = 1.8;

    // BIDDING WAR INTENSITY MULTIPLIER (the chaos factor)
    let warMultiplier = 1.0;
    if (distinctBidders >= 5) warMultiplier = 2.5;       // 5+ teams = pure chaos
    else if (distinctBidders >= 4) warMultiplier = 1.8;  // 4 teams = heated
    else if (distinctBidders >= 3) warMultiplier = 1.4;  // 3 teams = competitive
    else if (distinctBidders >= 2) warMultiplier = 1.15; // 2 teams = mild boost

    // For top stars, no upper cap — bidding war can take it to 25+ Cr
    // For others, slight ceiling to prevent absurd prices
    const maxAllowed = star >= 80 ? 9999 : (player.basePrice * multiplier * warMultiplier);
    return Math.min(player.basePrice * multiplier * warMultiplier, maxAllowed === 9999 ? 99999 : maxAllowed);
  }

  function evaluateBid(team, player, bidAmount) {
    const ts = state.teamStates[team.id];

    // Hard blocks
    if (ts.isHuman) return { willBid: false }; // NEVER auto-evaluate for human teams
    if (ts.filled >= 25) return { willBid: false };
    if (player.isOverseas && ts.overseasCount >= 8) return { willBid: false };
    if (!canAfford(team.id, bidAmount)) return { willBid: false };

    // ===== REALISTIC AGE FILTERS (IPL data: overseas 36+ rarely picked) =====
    // Overseas players over 36: only top stars get picked, others go unsold
    if (player.isOverseas && player.age >= 36) {
      const isElite = player.starPower >= 85;
      if (!isElite) {
        // 80% skip — they usually go unsold in real IPL
        if (Math.random() < 0.8) return { willBid: false };
      }
    }

    // Indian players over 38: similar filter (Dhoni-tier exception)
    if (!player.isOverseas && player.age >= 38) {
      const isLegend = player.starPower >= 90;
      if (!isLegend && Math.random() < 0.7) return { willBid: false };
    }

    // Players over 33 with low starPower: budget pickup only
    if (player.age >= 33 && player.starPower < 50 && bidAmount > player.basePrice * 1.2) {
      return { willBid: false };
    }

    const role = player.role;
    const needs = team.squadNeeds;
    const rc = ts.roleCount;
    const src = ts.subRoleCount;
    const slotsRemaining = state.playerPool.length - state.currentIndex;
    const slotsNeeded = Math.max(0, 18 - ts.filled);
    const isDesperate = slotsNeeded > 0 && slotsRemaining < slotsNeeded * 3;

    // ===== SELF-AWARENESS FILTERS (probabilistic — keep some chaos) =====
    // Most filters reduce probability of bidding, not hard block.
    // This way 3-5 teams still compete on good players, but saturated teams mostly skip.

    const budgetPct = bidAmount / ts.budget;
    const roleKey = role === 'batter' ? 'batters' : role === 'bowler' ? 'bowlers' : role === 'allRounder' ? 'allRounders' : 'wicketkeepers';
    const needLevel = rc[role] < needs[roleKey].min ? 'high'
      : rc[role] < needs[roleKey].max ? 'medium' : 'low';

    // 1. HARD BLOCK: completely full role (>max) AND low need → skip always
    if (!isDesperate && needLevel === 'low') {
      // Full role: 85% chance to skip (still bid 15% for variety)
      if (Math.random() < 0.85) return { willBid: false };
    }

    // 2. HARD BLOCK: player way too expensive for low-need role
    if (!isDesperate && needLevel === 'low' && budgetPct > 0.15) return { willBid: false };
    if (!isDesperate && needLevel === 'medium' && budgetPct > 0.35) return { willBid: false };

    // 3. Overseas balance: probabilistic — don't stockpile overseas in one role
    if (player.isOverseas && !isDesperate) {
      const overseasInRole = ts.overseasByRole[role] || 0;
      if (overseasInRole >= 2 && needLevel !== 'high' && Math.random() < 0.7) {
        return { willBid: false };
      }
      // 7th overseas: only bid for high-need
      if (ts.overseasCount >= 7 && needLevel === 'low' && Math.random() < 0.9) return { willBid: false };
    }

    // 4. Sub-role saturation: probabilistic skips
    const subCount = src[player.subRole] || 0;
    if (!isDesperate) {
      // Oversaturated positions: 70% chance to skip
      if (player.subRole === 'top-order' && subCount >= 3 && Math.random() < 0.7) return { willBid: false };
      if (player.subRole === 'finisher' && subCount >= 2 && Math.random() < 0.6) return { willBid: false };
      if (player.subRole === 'wk-batter' && subCount >= 2 && Math.random() < 0.8) return { willBid: false };
      if (player.subRole === 'death-bowler' && subCount >= 3 && Math.random() < 0.7) return { willBid: false };
      if (player.subRole === 'spin' && subCount >= 3 && Math.random() < 0.7) return { willBid: false };
    }

    // 5. Play-style mismatch: mild preference, not hard skip
    const isPaceStyle = ['RF', 'RFM', 'LF', 'LFM'].includes(player.bowlingStyle);
    const isSpinStyle = ['OB', 'SLA', 'LB', 'CLA'].includes(player.bowlingStyle);
    if (!isDesperate && needLevel !== 'high') {
      if (isPaceStyle && team.playStyle.pacePreference < 0.3 && Math.random() < 0.5) return { willBid: false };
      if (isSpinStyle && team.playStyle.pacePreference > 0.75 && Math.random() < 0.5) return { willBid: false };
    }

    // ===== Step 1: NEED SCORE (0-100) — Sub-role aware =====
    let needScore = 0;

    // Base role need
    if (role === 'batter') {
      needScore = rc.batter < needs.batters.min ? 65 : (rc.batter < needs.batters.max ? 35 : 8);
    } else if (role === 'bowler') {
      needScore = rc.bowler < needs.bowlers.min ? 65 : (rc.bowler < needs.bowlers.max ? 35 : 8);
    } else if (role === 'allRounder') {
      needScore = rc.allRounder < needs.allRounders.min ? 70 : (rc.allRounder < needs.allRounders.max ? 40 : 10);
    } else if (role === 'wicketkeeper') {
      needScore = rc.wicketkeeper < needs.wicketkeepers.min ? 70 : (rc.wicketkeeper < needs.wicketkeepers.max ? 25 : 3);
    }

    // Star power bonus ONLY if role is actually needed (not for saturated roles)
    if (needLevel !== 'low') {
      if (player.starPower >= 85) needScore += 15;
      else if (player.starPower >= 70) needScore += 8;
      else if (player.starPower >= 55) needScore += 3;
    }

    // Sub-role positional need — batting order awareness
    const subRole = player.subRole;
    // subCount already defined in filter section above
    if (subRole === 'top-order' && subCount < 2) needScore += 20;
    else if (subRole === 'top-order' && subCount < 3) needScore += 8;
    if (subRole === 'finisher' && subCount < 1) needScore += 25;
    else if (subRole === 'finisher' && subCount < 2) needScore += 12;
    if (subRole === 'middle-order' && subCount < 2) needScore += 15;
    if (subRole === 'wk-batter' && subCount < 1) needScore += 22;

    // Bowling combination awareness
    if (subRole === 'death-bowler' && subCount < 2) needScore += 25;
    else if (subRole === 'death-bowler' && subCount < 3) needScore += 10;
    if (subRole === 'powerplay-bowler' && subCount < 2) needScore += 20;
    if (subRole === 'spin' && subCount < 2) needScore += 18;
    else if (subRole === 'spin' && subCount >= 3) needScore -= 10;

    // Overseas slot optimization
    if (player.isOverseas) {
      const overseasInRole = ts.overseasByRole[role] || 0;
      const totalInRole = rc[role] || 0;
      if (totalInRole > 0 && overseasInRole / totalInRole > 0.5) needScore -= 12;
      if (ts.overseasCount >= 7) needScore -= 15;
    }

    needScore = Math.max(0, needScore);

    // Desperation factor — use vars from top (already defined)
    if (slotsNeeded > 0) {
      if (slotsRemaining < slotsNeeded * 2) {
        needScore += Math.min(80, slotsNeeded * 15);
      } else if (slotsRemaining < slotsNeeded * 3) {
        needScore += Math.min(50, slotsNeeded * 10);
      } else if (slotsRemaining < slotsNeeded * 5) {
        needScore += Math.min(30, slotsNeeded * 5);
      }
    }

    // ===== Step 2: VALUE SCORE (0-80) — Derived composite, no starPower =====
    let statsComposite;
    if (role === 'bowler') {
      statsComposite = player.stats.bowling * 0.65 + player.stats.consistency * 0.15 + player.stats.clutch * 0.10 + player.stats.fielding * 0.05 + player.stats.fitness * 0.05;
    } else if (role === 'wicketkeeper') {
      statsComposite = player.stats.batting * 0.55 + player.stats.clutch * 0.15 + player.stats.fielding * 0.15 + player.stats.consistency * 0.10 + player.stats.fitness * 0.05;
    } else if (role === 'allRounder') {
      statsComposite = player.stats.batting * 0.35 + player.stats.bowling * 0.30 + player.stats.fielding * 0.10 + player.stats.consistency * 0.10 + player.stats.clutch * 0.10 + player.stats.fitness * 0.05;
    } else {
      statsComposite = player.stats.batting * 0.55 + player.stats.consistency * 0.15 + player.stats.clutch * 0.15 + player.stats.fielding * 0.08 + player.stats.fitness * 0.07;
    }

    // Age curve — peak 26-30, youth premium, decline penalty
    let ageMod = 1.0;
    if (player.age <= 23) ageMod = 1.12;
    else if (player.age <= 25) ageMod = 1.08;
    else if (player.age <= 30) ageMod = 1.0;
    else if (player.age <= 33) ageMod = 0.92;
    else if (player.age <= 36) ageMod = 0.82;
    else ageMod = 0.70;
    // Elite older players get partial protection
    if (player.age > 33 && statsComposite > 80) ageMod = Math.max(ageMod, 0.88);

    // Form reliability — narrow ceiling-floor = dependable = premium
    const formRange = player.stats.formCeiling - player.stats.formFloor;
    const formReliability = 1 - (formRange - 40) / 100;
    const formMod = 0.85 + Math.max(0, Math.min(1, formReliability)) * 0.15;

    // Role scarcity in remaining auction pool
    const remainingPool = state.playerPool.slice(state.currentIndex + 1);
    const sameSubRoleLeft = remainingPool.filter(p => p.subRole === player.subRole).length;
    let scarcityMod = 1.0;
    if (sameSubRoleLeft <= 2) scarcityMod = 1.25;
    else if (sameSubRoleLeft <= 5) scarcityMod = 1.12;
    else if (sameSubRoleLeft <= 10) scarcityMod = 1.05;
    else if (sameSubRoleLeft > 20) scarcityMod = 0.92;

    let valueScore = statsComposite * ageMod * formMod * scarcityMod / 100 * 80;

    // Play-style fit bonus (0-15)
    if (player.subRole === 'death-bowler' && team.playStyle.deathBowlingValue > 0.7) valueScore += 12;
    if (player.subRole === 'finisher' && team.playStyle.powerHittingValue > 0.7) valueScore += 12;
    if (player.subRole === 'powerplay-bowler' && team.playStyle.pacePreference > 0.6) valueScore += 8;
    // isPaceStyle/isSpinStyle already defined in filter section
    if (isPaceStyle && team.playStyle.pacePreference > 0.6) valueScore += 6;
    if (isSpinStyle && team.playStyle.pacePreference < 0.4) valueScore += 6;

    // ===== Step 3: SENTIMENT SCORE (0-60) — Multi-factor emotional attachment =====
    let sentimentScore = 0;
    const sentiWeight = team.personality.sentimentality;
    const fh = player.franchiseHistory && player.franchiseHistory[team.id];

    if (fh) {
      // Years of association: 2 pts per season, capped at 20
      const yearsBonus = Math.min(fh.seasons * 2, 20);
      // Captaincy / iconic status
      const captainBonus = fh.wasCaptain ? 15 : 0;
      const iconicBonus = fh.wasIconic ? 12 : 0;
      // Emotional attachment: longer tenure + higher starPower = more emotional
      const emotionalAttachment = (fh.seasons / 15) * (player.starPower / 100);
      const emotionBonus = emotionalAttachment * 15;
      sentimentScore = (yearsBonus + captainBonus + iconicBonus + emotionBonus) * sentiWeight;
    } else if (player.teamHistory && player.teamHistory.includes(team.id)) {
      // Fallback for players without franchiseHistory detail
      sentimentScore = 12 * sentiWeight;
      if (team.historicPlayers && team.historicPlayers.includes(player.id)) {
        sentimentScore += 18 * sentiWeight;
      }
    }

    // ===== Step 4: RIVALRY SCORE (0-30) =====
    let rivalryScore = 0;
    if (state.currentBidder && team.rivals && team.rivals.includes(state.currentBidder)) {
      rivalryScore = 30 * team.personality.rivalryIntensity;
    }

    // ===== Step 5: COMPUTE MAX BID (with purse awareness + unpredictability) =====
    const rawMax = needScore + valueScore + sentimentScore + rivalryScore;
    let maxBid = player.basePrice * (1 + rawMax / 30);
    maxBid *= (0.7 + team.personality.riskTolerance * 0.6);

    // ===== APPLY FRANCHISE ARCHETYPES (real IPL preferences) =====
    const prefs = FRANCHISE_PREFS[team.id] || {};
    if (isPaceStyle && prefs.paceBoost) maxBid *= prefs.paceBoost;
    if (isSpinStyle && prefs.spinBoost) maxBid *= prefs.spinBoost;
    if (player.age <= 25 && prefs.youthBoost) maxBid *= prefs.youthBoost;
    if (player.age >= 33 && prefs.eldersBoost) maxBid *= prefs.eldersBoost;
    if (player.role === 'allRounder' && prefs.allRounderBoost) maxBid *= prefs.allRounderBoost;
    if (player.role === 'batter' && prefs.batterBoost) maxBid *= prefs.batterBoost;
    if (isSpinStyle && player.starPower < 60 && prefs.mysteryBowler) maxBid *= prefs.mysteryBowler; // KKR mystery spin
    // Old overseas penalty (most franchises avoid 36+ overseas)
    if (player.isOverseas && player.age >= 36 && prefs.oldOverseasPenalty) maxBid *= prefs.oldOverseasPenalty;
    // PBKS variance: more likely to overspend (often overpays)
    if (prefs.variance && Math.random() < 0.3) maxBid *= prefs.variance;

    // --- UNPREDICTABILITY FACTORS ---

    // 1. Surprise splurge: ~5% chance a team gets irrationally excited about a player
    if (Math.random() < 0.05) {
      const splurgeMultiplier = 1.3 + Math.random() * 0.5; // 1.3x - 1.8x overbid
      maxBid *= splurgeMultiplier;
      log(`💡 ${team.shortName} seems VERY keen on ${player.name}!`, '');
    }

    // 2. Emotional panic buy: team with big need gets desperate even if price is high
    if (needScore > 55 && ts.filled > 12 && Math.random() < 0.15) {
      maxBid *= 1.25;
    }

    // 3. Auction fatigue: later in auction, AI occasionally makes poor decisions
    const auctionProgress = state.currentIndex / state.playerPool.length;
    if (auctionProgress > 0.6 && Math.random() < 0.08) {
      // Random overbid or underbid from fatigue
      maxBid *= (0.7 + Math.random() * 0.6); // 0.7x to 1.3x
    }

    // 4. "I won't let you have him" - ego-driven counter-bid
    if (state.currentBidder && state.bidWars[team.id] >= 2 && Math.random() < 0.12) {
      maxBid *= 1.2; // stubbornly keeps bidding
    }

    // 5. Random cold feet: team suddenly loses interest mid-bidding war
    if (state.bidWars[team.id] >= 3 && Math.random() < 0.1 && needScore < 40) {
      maxBid *= 0.5; // backs off suddenly
    }

    // Bidding war escalation
    if (state.bidWars[team.id] >= 3) {
      maxBid *= 1.1;
    }

    // Aggression scaling
    maxBid *= (0.8 + team.personality.aggression * 0.4);

    // End-of-auction panic
    const progress = state.currentIndex / state.playerPool.length;
    if (progress > 0.8 && ts.budget > 5000 && ts.filled < 15) {
      maxBid *= 1.3;
    }

    // ===== PURSE AWARENESS — Spend full budget, prioritize 18, then fill to 25 =====
    const mandatorySlotsLeft = Math.max(0, 18 - ts.filled - 1); // need this many to hit 18
    const optionalSlotsLeft = Math.max(0, 25 - ts.filled - 1); // upper cap target
    const reachedMin = ts.filled >= 18;

    // Hard reserve: 25L per remaining mandatory slot (lower than before — encourage spending)
    const hardReserve = mandatorySlotsLeft * 25;
    const maxAffordable = ts.budget - hardReserve;

    // Average budget available per remaining slot (encourages full spend)
    // If have ₹100 Cr left and need 10 more players, avg ₹10 Cr per slot
    const slotsToFill = Math.max(1, mandatorySlotsLeft + 1); // include current player
    const avgPerSlot = ts.budget / slotsToFill;

    // Phase 1: Building 18 (filled < 18) — AGGRESSIVE spending allowed
    if (!reachedMin) {
      // Can spend up to 3x average per slot for star players
      // 1.5x avg for medium-need
      // 0.7x avg for low-need (save for needed slots)
      let avgMultiplier;
      if (needScore >= 70) avgMultiplier = 3.0;       // high need: splurge OK
      else if (needScore >= 50) avgMultiplier = 2.0;  // medium need
      else if (needScore >= 30) avgMultiplier = 1.2;  // low need
      else avgMultiplier = 0.6;                        // not really needed

      const cap = avgPerSlot * avgMultiplier;
      if (maxBid > cap) maxBid = cap;

      // Boost: if very few slots left to fill 18 and lots of budget, spend more
      if (mandatorySlotsLeft <= 3 && ts.budget > 2000) {
        maxBid *= 1.3; // urgency boost — must complete 18
      }
    } else {
      // Phase 2: Already have 18+ — opportunistic spending up to 25
      // Use remaining budget freely, but only on players that genuinely fit
      const remainingForExtras = Math.max(0, ts.budget - 100); // keep 1 Cr safety
      const avgForExtras = remainingForExtras / Math.max(1, optionalSlotsLeft + 1);

      let extraMultiplier;
      if (needScore >= 60) extraMultiplier = 2.5;  // genuine upgrade
      else if (needScore >= 40) extraMultiplier = 1.5;
      else if (needScore >= 20) extraMultiplier = 0.8;
      else extraMultiplier = 0.4;  // probably skip

      const extraCap = avgForExtras * extraMultiplier;
      if (maxBid > extraCap) maxBid = extraCap;
    }

    // ===== BIDDING WAR INTENSITY (chaos mode when many teams compete) =====
    const distinctBiddersCount = state.bidWars ? Object.keys(state.bidWars).length : 0;
    let warBoost = 1.0;
    if (distinctBiddersCount >= 5) {
      warBoost = 2.0; // 5+ teams = chaos, anything goes
    } else if (distinctBiddersCount >= 4) {
      warBoost = 1.6;
    } else if (distinctBiddersCount >= 3) {
      warBoost = 1.3;
    }
    if (warBoost > 1.0) {
      maxBid *= warBoost;
    }

    // ===== TIERED SPENDING STRATEGY =====
    const isStar = player.starPower >= 80;
    const isMidTier = player.starPower >= 50 && player.starPower < 80;
    const isAverage = player.starPower >= 30 && player.starPower < 50;
    const hasPotential = player.age <= 24 || player.hiddenGem;

    // Star player: big spend allowed if needed
    if (isStar && needScore >= 40) {
      maxBid *= 1.4; // strong boost for stars in needed roles
    }
    if (player.starPower >= 90 && needScore >= 50) {
      maxBid *= 1.3; // marquee elite — extra layer
    }

    // Young potential / hidden gem: bidding war boost (3-5x base possible)
    if (hasPotential && needScore >= 30) {
      maxBid *= 1.3;
    }

    // Average player: keep value-conscious (no big boost)
    // Only mild boost if genuine high-need
    if (isAverage && needScore >= 60) {
      maxBid *= 1.1;
    }

    // BLUFF OVERPAY (10% chance on average players — causes chaos)
    if (isAverage && Math.random() < 0.10) {
      maxBid *= 1.5; // accidentally overpay
    }

    // Late auction urgency: must grab remaining players
    const slotsRemainingInPool = state.playerPool.length - state.currentIndex;
    if (mandatorySlotsLeft > 0 && slotsRemainingInPool < mandatorySlotsLeft * 2) {
      maxBid *= 1.5;
    }

    // ===== BURN-THE-BUDGET (only on stars + needed players, not average) =====
    const auctionPct = state.currentIndex / state.playerPool.length;
    const budgetUsedPct = 1 - (ts.budget / 12500);

    if (auctionPct > 0.5 && budgetUsedPct < 0.4) {
      // Halfway, spent <40% → boost ONLY for stars or high-need
      if (isStar || needScore >= 60) maxBid *= 1.4;
    }
    if (auctionPct > 0.7 && budgetUsedPct < 0.5) {
      // Late, spent <50% → broader boost
      if (player.starPower >= 50 || needScore >= 40) maxBid *= 1.6;
    }
    if (auctionPct > 0.85 && ts.budget > 3000) {
      // Final stretch with >30 Cr unspent — burn on quality picks
      if (player.starPower >= 40 || needScore >= 30) maxBid *= 2.0;
    }

    // Reached 18 with budget left: extras can go higher if quality
    if (reachedMin && optionalSlotsLeft > 0 && ts.budget > 2000) {
      const targetSpendPerExtra = ts.budget / Math.max(1, optionalSlotsLeft);
      // Stars: up to 3x avg | Mid: 2x avg | Average: 1.2x avg
      const tierMult = isStar ? 3.0 : isMidTier ? 2.0 : 1.2;
      const extraBoostCap = targetSpendPerExtra * tierMult;
      if (maxBid < extraBoostCap && needScore >= 30) {
        maxBid = Math.max(maxBid, extraBoostCap);
      }
    }

    // ===== HARD CAP: realistic max bid by player tier (IPL data) =====
    // Prevents AI from massively overpaying (e.g. 5x base for a mid-tier player)
    const realisticCap = getRealisticMaxBid(player);
    if (maxBid > realisticCap) {
      maxBid = realisticCap;
    }

    // Cap at what's actually affordable (hard limit)
    maxBid = Math.min(maxBid, maxAffordable);
    maxBid = Math.max(0, Math.floor(maxBid));

    // ===== Step 6: BLUFF CHECK =====
    let isBluff = false;
    if (Math.random() < team.personality.bluffFrequency && bidAmount < maxBid * 0.4 && needScore < 30) {
      isBluff = true;
      maxBid = bidAmount + getIncrement(bidAmount) * 2;
    }

    const willBid = bidAmount <= maxBid;

    return { willBid, maxBid, isBluff };
  }

  function markSold() {
    state.isActive = false;
    clearCountdown();
    const player = state.currentPlayer;
    const teamId = state.currentBidder;
    const price = state.currentBid;
    const team = TEAMS.find(t => t.id === teamId);
    const ts = state.teamStates[teamId];

    // Hard rule: never exceed 8 overseas — mark unsold instead
    if (player.isOverseas && ts.overseasCount >= 8) {
      state.unsoldPlayers.push(player);
      state.currentIndex++;
      setTimeout(() => nextPlayer(), 500);
      return;
    }

    // Prevent duplicate player in squad
    if (ts.squad.some(s => s.player.id === player.id)) {
      state.currentIndex++;
      setTimeout(() => nextPlayer(), 500);
      return;
    }

    // Also check if player is already in ANY other team
    const alreadySold = Object.values(state.teamStates).some(t =>
      t.squad.some(s => s.player.id === player.id)
    );
    if (alreadySold) {
      state.currentIndex++;
      setTimeout(() => nextPlayer(), 500);
      return;
    }

    // Update team state
    ts.budget -= price;
    ts.squad.push({ player, price });
    ts.filled++;
    ts.roleCount[player.role]++;
    ts.subRoleCount[player.subRole] = (ts.subRoleCount[player.subRole] || 0) + 1;
    if (player.isOverseas) {
      ts.overseasCount++;
      ts.overseasByRole[player.role] = (ts.overseasByRole[player.role] || 0) + 1;
    }

    state.soldPlayers.push({ player, teamId, price });

    let msg = `✅ SOLD! ${player.name} to ${team.name} for ${formatPrice(price)}!`;
    if (price >= 1500) msg = `🌟 SOLD! ${player.name} to ${team.name} for a MASSIVE ${formatPrice(price)}! 🌟`;
    if (price === player.basePrice) msg = `💰 ${player.name} picked up by ${team.name} at BASE PRICE ${formatPrice(price)}! What a steal!`;
    log(msg, 'sold');

    if (state.callbacks.onSold) state.callbacks.onSold(player, teamId, price);

    state.currentIndex++;
    // Longer delay in online mode for broadcast sync
    const soldDelay = COUNTDOWN_MS >= 8000 ? 3500 : 2500;
    setTimeout(() => nextPlayer(), soldDelay);
  }

  function markUnsold() {
    state.isActive = false;
    clearCountdown();
    const player = state.currentPlayer;
    state.unsoldPlayers.push(player);

    log(`❌ ${player.name} goes UNSOLD!`, 'unsold');
    if (state.callbacks.onUnsold) state.callbacks.onUnsold(player);

    state.currentIndex++;
    // Longer delay in online mode for broadcast sync
    const unsoldDelay = COUNTDOWN_MS >= 8000 ? 3000 : 1800;
    setTimeout(() => nextPlayer(), unsoldDelay);
  }

  function log(msg, type) {
    if (state.callbacks.onLog) state.callbacks.onLog(msg, type || '');
  }

  // ===== MANDATORY SQUAD FILL =====
  // Ensures every team reaches minimum 18 players by assigning unsold players
  function mandatoryFillSquads() {
    if (!state) return;

    // First, generate placeholder players if unsold pool is empty but teams still need players
    let fillAttempts = 0;
    const MAX_ATTEMPTS = 10;

    while (fillAttempts < MAX_ATTEMPTS) {
      fillAttempts++;
      const needyTeams = TEAMS.filter(t => state.teamStates[t.id].filled < 18)
        .sort((a, b) => state.teamStates[a.id].filled - state.teamStates[b.id].filled);

      if (needyTeams.length === 0) break;

      // If no unsold players left, pull from ALL players not yet in any squad
      if (state.unsoldPlayers.length === 0) {
        const allSquadPlayerIds = new Set();
        TEAMS.forEach(t => {
          state.teamStates[t.id].squad.forEach(s => allSquadPlayerIds.add(s.player.id));
        });
        const unassigned = PLAYERS.filter(p => !allSquadPlayerIds.has(p.id));
        if (unassigned.length > 0) {
          state.unsoldPlayers.push(...unassigned);
        } else {
          break; // truly no players left anywhere
        }
      }

      let anyFilled = false;
      for (const team of needyTeams) {
        const ts = state.teamStates[team.id];
        if (ts.filled >= 18) continue;

        // Find best matching unsold player
        let bestIdx = -1;
        let bestScore = -1;
        for (let i = 0; i < state.unsoldPlayers.length; i++) {
          const p = state.unsoldPlayers[i];
          // Skip overseas if at limit
          if (p.isOverseas && ts.overseasCount >= 8) continue;

          let score = 1;
          const rc = ts.roleCount;
          const needs = team.squadNeeds;
          if (p.role === 'batter' && rc.batter < needs.batters.min) score += 10;
          if (p.role === 'bowler' && rc.bowler < needs.bowlers.min) score += 10;
          if (p.role === 'allRounder' && rc.allRounder < needs.allRounders.min) score += 12;
          if (p.role === 'wicketkeeper' && rc.wicketkeeper < needs.wicketkeepers.min) score += 15;
          if (!p.isOverseas) score += 3;

          if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
          }
        }

        // Hard rule: never exceed 8 overseas per squad
        if (bestIdx === -1) break;

        const player = state.unsoldPlayers.splice(bestIdx, 1)[0];
        const price = ts.budget >= 20 ? 20 : 0; // free if budget exhausted
        ts.budget = Math.max(0, ts.budget - price);
        ts.squad.push({ player, price });
        ts.filled++;
        ts.roleCount[player.role]++;
        ts.subRoleCount[player.subRole] = (ts.subRoleCount[player.subRole] || 0) + 1;
        if (player.isOverseas) {
          ts.overseasCount++;
          ts.overseasByRole[player.role] = (ts.overseasByRole[player.role] || 0) + 1;
        }
        state.soldPlayers.push({ player, teamId: team.id, price });
        anyFilled = true;
      }

      if (!anyFilled) break;
    }

    // Log any teams that still couldn't reach 18 (shouldn't happen with 235+ players)
    TEAMS.forEach(t => {
      const ts = state.teamStates[t.id];
      if (ts.filled < 18) {
        log(`⚠️ ${t.shortName} could only fill ${ts.filled}/18 slots!`, 'dramatic');
      }
    });
  }

  // ===== SIMULATE ENTIRE AUCTION (instant, all AI) =====
  function simulateAll() {
    if (!state) return;
    // Clear any running timers
    clearCountdown();
    if (state.pendingAITimeouts) {
      state.pendingAITimeouts.forEach(t => clearTimeout(t));
      state.pendingAITimeouts = [];
    }

    // Make all teams AI for simulation
    Object.keys(state.humanTeams).forEach(id => {
      state.teamStates[id].isHuman = false;
    });
    const savedHumanTeams = { ...state.humanTeams };
    state.humanTeams = {};

    // Run through all players instantly
    while (state.currentIndex < state.playerPool.length || (state.round === 1 && state.unsoldPlayers.length > 0)) {
      // Set up next player
      if (state.currentIndex >= state.playerPool.length) {
        if (state.round === 1 && state.unsoldPlayers.length > 0) {
          state.round = 2;
          state.phase = 'ROUND 2';
          state.playerPool = shuffleArray(state.unsoldPlayers).map(p => {
            return { ...p, basePrice: Math.max(20, Math.floor(p.basePrice * 0.75)) };
          });
          state.unsoldPlayers = [];
          state.currentIndex = 0;
        } else {
          break;
        }
      }

      const player = state.playerPool[state.currentIndex];
      state.currentPlayer = player;
      state.currentBid = player.basePrice;
      state.currentBidder = null;
      state.bidHistory = [];
      state.bidWars = {};
      state.isActive = true;

      // Reset team bid states
      TEAMS.forEach(t => {
        state.teamStates[t.id].bidCount = 0;
        state.teamStates[t.id].passed = false;
      });

      // Simulate bidding rounds for this player
      let biddingActive = true;
      let rounds = 0;
      const MAX_ROUNDS = 50; // safety limit

      while (biddingActive && rounds < MAX_ROUNDS) {
        rounds++;
        let anyBid = false;

        // Each AI team evaluates — don't permanently pass, re-evaluate each round
        const teamOrder = shuffleArray([...TEAMS]);
        for (const team of teamOrder) {
          const ts = state.teamStates[team.id];
          if (ts.filled >= 25) continue;
          if (team.id === state.currentBidder) continue;

          const nextBid = state.currentBidder ? state.currentBid + getIncrement(state.currentBid) : state.currentBid;
          if (!canAfford(team.id, nextBid)) continue;

          const eval_ = evaluateBid(team, player, nextBid);

          if (eval_.willBid && nextBid <= eval_.maxBid) {
            state.currentBid = nextBid;
            state.currentBidder = team.id;
            state.bidWars[team.id] = (state.bidWars[team.id] || 0) + 1;
            ts.bidCount++;
            anyBid = true;
            break; // one bid per round, then re-evaluate
          }
          // Don't mark as passed — other teams bidding may change this team's interest
        }

        if (!anyBid) biddingActive = false;
      }

      // Resolve: sold or unsold (with duplicate and overseas checks)
      const alreadyInSquad = Object.values(state.teamStates).some(t =>
        t.squad.some(s => s.player.id === player.id)
      );
      const bidderState = state.currentBidder ? state.teamStates[state.currentBidder] : null;
      const overseasViolation = bidderState && player.isOverseas && bidderState.overseasCount >= 8;

      if (state.currentBidder && !alreadyInSquad && !overseasViolation) {
        const teamId = state.currentBidder;
        const price = state.currentBid;
        const ts = state.teamStates[teamId];
        ts.budget -= price;
        ts.squad.push({ player, price });
        ts.filled++;
        ts.roleCount[player.role]++;
        ts.subRoleCount[player.subRole] = (ts.subRoleCount[player.subRole] || 0) + 1;
        if (player.isOverseas) {
          ts.overseasCount++;
          ts.overseasByRole[player.role] = (ts.overseasByRole[player.role] || 0) + 1;
        }
        state.soldPlayers.push({ player, teamId, price });
      } else if (!state.currentBidder || overseasViolation) {
        // Unsold or blocked by overseas limit
        state.unsoldPlayers.push(player);
      }

      state.currentIndex++;
    }

    // Ensure all teams have minimum 18 players
    mandatoryFillSquads();

    // Restore human team labels for display
    state.humanTeams = savedHumanTeams;
    Object.keys(savedHumanTeams).forEach(id => {
      state.teamStates[id].isHuman = true;
    });

    state.isActive = false;
    if (state.callbacks.onAuctionEnd) state.callbacks.onAuctionEnd();
  }

  // Sync a sold player into local state (for non-host online clients)
  function syncSold(player, teamId, price) {
    if (!state) return;
    const ts = state.teamStates[teamId];
    if (!ts) return;
    // Avoid duplicates
    if (ts.squad.some(s => s.player.id === player.id)) return;
    ts.budget -= price;
    ts.squad.push({ player, price });
    ts.filled++;
    ts.roleCount[player.role] = (ts.roleCount[player.role] || 0) + 1;
    ts.subRoleCount[player.subRole] = (ts.subRoleCount[player.subRole] || 0) + 1;
    if (player.isOverseas) {
      ts.overseasCount++;
      ts.overseasByRole[player.role] = (ts.overseasByRole[player.role] || 0) + 1;
    }
    state.soldPlayers.push({ player, teamId, price });
  }

  // Sync current bid state (for non-host)
  function syncState(updates) {
    if (!state) return;
    if (updates.currentBid !== undefined) state.currentBid = updates.currentBid;
    if (updates.currentBidder !== undefined) state.currentBidder = updates.currentBidder;
    if (updates.currentPlayer !== undefined) state.currentPlayer = updates.currentPlayer;
    if (updates.currentIndex !== undefined) state.currentIndex = updates.currentIndex;
    if (updates.phase !== undefined) state.phase = updates.phase;
    if (updates.isActive !== undefined) state.isActive = updates.isActive;
  }

  function on(event, callback) {
    if (state && state.callbacks.hasOwnProperty('on' + event.charAt(0).toUpperCase() + event.slice(1))) {
      state.callbacks['on' + event.charAt(0).toUpperCase() + event.slice(1)] = callback;
    }
  }

  function getTeamData(teamId) {
    return state ? state.teamStates[teamId] : null;
  }

  function getAllTeamStates() {
    return state ? state.teamStates : {};
  }

  return {
    init, getState, nextPlayer, humanBid, humanPass,
    on, getTeamData, getAllTeamStates, formatPrice, getIncrement,
    canAfford, canBuyPlayer, pause, resume, simulateAll, setOnlineTimer,
    // Online sync functions for non-host clients
    syncSold, syncState
  };
})();
