// ===== IPL AUCTION ENGINE =====
window.AuctionEngine = (function() {
  let state = null;

  const BID_INCREMENTS = [
    { threshold: 0, increment: 20 },
    { threshold: 200, increment: 25 },
    { threshold: 500, increment: 50 },
    { threshold: 1000, increment: 75 },
    { threshold: 1500, increment: 100 }
  ];

  function getIncrement(currentBid) {
    let inc = 20;
    for (const tier of BID_INCREMENTS) {
      if (currentBid >= tier.threshold) inc = tier.increment;
    }
    return inc;
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
  const COUNTDOWN_MS = 5000;

  function startBidRound() {
    if (!state.isActive) return;

    // First check if anyone is interested at all (for base price)
    let anyoneInterested = false;
    TEAMS.forEach(team => {
      const ts = state.teamStates[team.id];
      if (ts.passed) return;
      if (ts.isHuman) { anyoneInterested = true; return; }
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
    TEAMS.forEach(team => {
      const ts = state.teamStates[team.id];
      if (ts.isHuman || ts.passed) return;
      if (team.id === state.currentBidder) return; // already leading

      const nextBid = state.currentBid + getIncrement(state.currentBid);
      const eval_ = evaluateBid(team, state.currentPlayer, nextBid);

      if (eval_.willBid && nextBid <= eval_.maxBid && canAfford(team.id, nextBid)) {
        // AI will bid at a random time between 1-4 seconds into the countdown
        const delay = 1000 + Math.random() * 3000;
        const timeout = setTimeout(() => {
          if (!state.isActive) return;
          if (team.id === state.currentBidder) return; // became leader already

          // Re-evaluate with current bid (may have changed)
          const currentNext = state.currentBid + getIncrement(state.currentBid);
          const reeval = evaluateBid(team, state.currentPlayer, currentNext);
          if (reeval.willBid && currentNext <= reeval.maxBid && canAfford(team.id, currentNext)) {
            placeBidInternal(team.id, currentNext, reeval.isBluff);
            // Reset countdown — new bid came in
            resetCountdown();
          } else {
            ts.passed = true;
          }
        }, delay);
        state.pendingAITimeouts.push(timeout);
      } else {
        ts.passed = true;
      }
    });
  }

  function humanBid(teamId) {
    if (!state.isActive) return;
    const newBid = state.currentBid + getIncrement(state.currentBid);
    if (!canAfford(teamId, newBid)) return;
    if (!canBuyPlayer(teamId, state.currentPlayer)) return;

    placeBidInternal(teamId, newBid, false);
    // Reset countdown — new bid came in
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

  function placeBidInternal(teamId, amount, isBluff) {
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

    log(msg, ts.isHuman ? 'dramatic' : '');
    if (state.callbacks.onBid) state.callbacks.onBid(teamId, amount);
  }

  function canAfford(teamId, bidAmount) {
    const ts = state.teamStates[teamId];
    const slotsNeeded = 18 - ts.filled - 1; // -1 for current player
    const reserveNeeded = Math.max(0, slotsNeeded) * 20; // 20L minimum per remaining slot
    return ts.budget - bidAmount >= reserveNeeded;
  }

  function canBuyPlayer(teamId, player) {
    const ts = state.teamStates[teamId];
    if (ts.filled >= 25) return false;
    if (player.isOverseas && ts.overseasCount >= 8) return false;
    return true;
  }

  function evaluateBid(team, player, bidAmount) {
    const ts = state.teamStates[team.id];

    // Hard blocks
    if (ts.filled >= 25) return { willBid: false };
    if (player.isOverseas && ts.overseasCount >= 8) return { willBid: false };
    if (!canAfford(team.id, bidAmount)) return { willBid: false };

    // ===== Step 1: NEED SCORE (0-100) — Sub-role aware =====
    let needScore = 0;
    const role = player.role;
    const needs = team.squadNeeds;
    const rc = ts.roleCount;
    const src = ts.subRoleCount;

    // Base role need
    if (role === 'batter') {
      needScore = rc.batter < needs.batters.min ? 55 : (rc.batter < needs.batters.max ? 28 : 7);
    } else if (role === 'bowler') {
      needScore = rc.bowler < needs.bowlers.min ? 55 : (rc.bowler < needs.bowlers.max ? 28 : 7);
    } else if (role === 'allRounder') {
      needScore = rc.allRounder < needs.allRounders.min ? 60 : (rc.allRounder < needs.allRounders.max ? 35 : 10);
    } else if (role === 'wicketkeeper') {
      needScore = rc.wicketkeeper < needs.wicketkeepers.min ? 65 : (rc.wicketkeeper < needs.wicketkeepers.max ? 20 : 3);
    }

    // Sub-role positional need — batting order awareness
    const subRole = player.subRole;
    const subCount = src[subRole] || 0;
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

    // Desperation factor
    const slotsRemaining = state.playerPool.length - state.currentIndex;
    const slotsNeeded = 18 - ts.filled;
    if (slotsNeeded > 0 && slotsRemaining < slotsNeeded * 3) {
      needScore += Math.min(40, slotsNeeded * 8);
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
    const isPaceStyle = ['RF', 'RFM', 'LF', 'LFM'].includes(player.bowlingStyle);
    const isSpinStyle = ['OB', 'SLA', 'LB', 'CLA'].includes(player.bowlingStyle);
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

    // ===== Step 5: COMPUTE MAX BID =====
    const rawMax = needScore + valueScore + sentimentScore + rivalryScore;
    let maxBid = player.basePrice * (1 + rawMax / 30);
    maxBid *= (0.7 + team.personality.riskTolerance * 0.6);

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

    // Cap at affordable
    const slotsNeededAfter = Math.max(0, 18 - ts.filled - 1);
    const maxAffordable = ts.budget - (slotsNeededAfter * 20);
    maxBid = Math.min(maxBid, maxAffordable);
    maxBid = Math.floor(maxBid);

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
    // Delay before next player
    setTimeout(() => nextPlayer(), 2500);
  }

  function markUnsold() {
    state.isActive = false;
    clearCountdown();
    const player = state.currentPlayer;
    state.unsoldPlayers.push(player);

    log(`❌ ${player.name} goes UNSOLD!`, 'unsold');
    if (state.callbacks.onUnsold) state.callbacks.onUnsold(player);

    state.currentIndex++;
    setTimeout(() => nextPlayer(), 1800);
  }

  function log(msg, type) {
    if (state.callbacks.onLog) state.callbacks.onLog(msg, type || '');
  }

  // Old timer functions removed — countdown system is defined above in the bidding flow

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
    canAfford, canBuyPlayer, pause, resume
  };
})();
