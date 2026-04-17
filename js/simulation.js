// ===== IPL TOURNAMENT SIMULATION ENGINE =====
window.SimulationEngine = (function() {
  let tournament = null;

  const VENUES = [
    { name: "Wankhede Stadium", city: "Mumbai", team: "MI", pitchType: "batting", paceFactor: 1.0, spinFactor: 0.8, avgScore: 175 },
    { name: "MA Chidambaram Stadium", city: "Chennai", team: "CSK", pitchType: "spin", paceFactor: 0.7, spinFactor: 1.4, avgScore: 155 },
    { name: "M Chinnaswamy Stadium", city: "Bengaluru", team: "RCB", pitchType: "batting", paceFactor: 0.9, spinFactor: 0.7, avgScore: 185 },
    { name: "Arun Jaitley Stadium", city: "Delhi", team: "DC", pitchType: "balanced", paceFactor: 1.0, spinFactor: 1.0, avgScore: 168 },
    { name: "Eden Gardens", city: "Kolkata", team: "KKR", pitchType: "balanced", paceFactor: 1.0, spinFactor: 1.1, avgScore: 165 },
    { name: "Rajiv Gandhi Intl Stadium", city: "Hyderabad", team: "SRH", pitchType: "batting", paceFactor: 0.9, spinFactor: 0.9, avgScore: 172 },
    { name: "IS Bindra Stadium", city: "Mohali", team: "PBKS", pitchType: "pace", paceFactor: 1.2, spinFactor: 0.8, avgScore: 168 },
    { name: "Sawai Mansingh Stadium", city: "Jaipur", team: "RR", pitchType: "balanced", paceFactor: 1.0, spinFactor: 1.0, avgScore: 165 },
    { name: "Narendra Modi Stadium", city: "Ahmedabad", team: "GT", pitchType: "balanced", paceFactor: 1.1, spinFactor: 0.9, avgScore: 170 },
    { name: "BRSABV Ekana Stadium", city: "Lucknow", team: "LSG", pitchType: "pace", paceFactor: 1.15, spinFactor: 0.85, avgScore: 162 }
  ];

  const WEATHER_OPTIONS = [
    { type: "clear", label: "Clear ☀️", paceBonus: 0, spinBonus: 0, dewFactor: 0 },
    { type: "hot", label: "Hot 🌡️", paceBonus: -0.05, spinBonus: 0.05, dewFactor: 0 },
    { type: "humid", label: "Humid 💧", paceBonus: 0.05, spinBonus: 0.08, dewFactor: 0.1 },
    { type: "overcast", label: "Overcast ☁️", paceBonus: 0.15, spinBonus: -0.05, dewFactor: 0 },
    { type: "dewy_night", label: "Dewy Night 🌙", paceBonus: 0, spinBonus: -0.1, dewFactor: 0.25 }
  ];

  function init(teamStates) {
    const teams = TEAMS.map(t => t.id);
    const schedule = generateSchedule(teams);
    const playerForms = {};

    // Init player forms for all squads
    Object.entries(teamStates).forEach(([teamId, ts]) => {
      ts.squad.forEach(({ player }) => {
        playerForms[player.id] = {
          currentForm: 50 + Math.random() * 30, // start 50-80
          isInjured: false,
          injuryMatchesLeft: 0,
          matchesPlayed: 0,
          seasonRuns: 0,
          seasonWickets: 0,
          seasonBalls: 0,
          seasonBallsBowled: 0,
          seasonRunsConceded: 0,
          hiddenGemActivated: false,
          breakoutActivated: false,
          breakoutMessage: null
        };
      });
    });

    tournament = {
      teamStates: teamStates,
      schedule: schedule,
      currentMatch: 0,
      standings: {},
      playerForms: playerForms,
      completedMatches: [],
      playoffs: null,
      champion: null,
      lockedXIs: {} // teamId -> { starters: [...playerIds], impactPlayer } — fixed for entire tournament
    };

    // Init standings
    teams.forEach(id => {
      tournament.standings[id] = { played: 0, won: 0, lost: 0, nrr: 0, points: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0 };
    });

    return tournament;
  }

  function generateSchedule(teams) {
    const matches = [];

    // Each team plays every other team TWICE (home + away) = 18 matches per team
    // Total: 10 teams * 9 opponents * 2 / 2 = 90 league matches
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        // Leg 1: team i hosts
        const venueA = VENUES.find(v => v.team === teams[i]) || VENUES[0];
        matches.push({ teamA: teams[i], teamB: teams[j], venue: venueA, isPlayoff: false });
        // Leg 2: team j hosts (return fixture)
        const venueB = VENUES.find(v => v.team === teams[j]) || VENUES[0];
        matches.push({ teamA: teams[j], teamB: teams[i], venue: venueB, isPlayoff: false });
      }
    }

    // Shuffle to randomize match order (but all 90 matches are played)
    return shuffleArray(matches);
  }

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getState() { return tournament; }

  function simulateNextMatch() {
    if (tournament.currentMatch >= tournament.schedule.length) return null;
    const fixture = tournament.schedule[tournament.currentMatch];
    const result = simulateMatch(fixture.teamA, fixture.teamB, fixture.venue, fixture.isPlayoff);
    tournament.completedMatches.push(result);

    if (!fixture.isPlayoff) {
      updateStandings(result);
    }

    tournament.currentMatch++;
    updateForms(result);
    checkInjuries(result);
    checkHiddenGems();

    // Surface breakout messages as key moments
    Object.values(tournament.playerForms).forEach(f => {
      if (f.breakoutMessage) {
        result.keyMoments.push({ text: f.breakoutMessage, highlight: true });
        f.breakoutMessage = null; // clear after surfacing
      }
    });

    return result;
  }

  function simulateMatch(teamAId, teamBId, venue, isPlayoff) {
    const weather = WEATHER_OPTIONS[Math.floor(Math.random() * WEATHER_OPTIONS.length)];
    const selA = selectPlaying11(teamAId);
    const selB = selectPlaying11(teamBId);
    const teamA = selA.playing11;
    const teamB = selB.playing11;

    // Toss
    const tossWinner = Math.random() > 0.5 ? teamAId : teamBId;
    let tossDecision;
    if (venue.pitchType === 'spin' || venue.pitchType === 'pace') {
      tossDecision = Math.random() > 0.35 ? 'field' : 'bat';
    } else if (weather.dewFactor > 0.15) {
      tossDecision = Math.random() > 0.3 ? 'field' : 'bat';
    } else {
      tossDecision = Math.random() > 0.5 ? 'bat' : 'field';
    }

    const battingFirst = tossDecision === 'bat' ? tossWinner :
                         (tossWinner === teamAId ? teamBId : teamAId);
    const bowlingFirst = battingFirst === teamAId ? teamBId : teamAId;

    const teamAName = TEAMS.find(t => t.id === teamAId).shortName;
    const teamBName = TEAMS.find(t => t.id === teamBId).shortName;
    const keyMoments = [];

    // === IMPACT PLAYER RULE ===
    // Each team can bring in 1 impact sub to replace a player
    // Impact player is added to the playing XI (effectively 12th man who bats/bowls)
    const impactA = selA.impactPlayer;
    const impactB = selB.impactPlayer;
    const batFirst11 = battingFirst === teamAId ? [...teamA] : [...teamB];
    const bowlFirst11 = bowlingFirst === teamAId ? [...teamA] : [...teamB];
    const batFirstImpact = battingFirst === teamAId ? impactA : impactB;
    const bowlFirstImpact = bowlingFirst === teamAId ? impactA : impactB;

    // Impact sub strategy: team batting first brings in impact after powerplay
    // The impact player replaces the weakest non-bowling member
    if (batFirstImpact) {
      // Replace weakest non-core player (lowest rated non-bowler who isn't WK)
      const replaceIdx = findImpactReplacement(batFirst11, batFirstImpact);
      if (replaceIdx >= 0) {
        const replaced = batFirst11[replaceIdx];
        batFirst11[replaceIdx] = batFirstImpact;
        const impactTeamName = battingFirst === teamAId ? teamAName : teamBName;
        keyMoments.push({ text: `🔄 IMPACT PLAYER: ${impactTeamName} bring in ${batFirstImpact.name} for ${replaced.name}!`, highlight: true });
      }
    }
    if (bowlFirstImpact) {
      const replaceIdx = findImpactReplacement(bowlFirst11, bowlFirstImpact);
      if (replaceIdx >= 0) {
        const replaced = bowlFirst11[replaceIdx];
        bowlFirst11[replaceIdx] = bowlFirstImpact;
        const impactTeamName = bowlingFirst === teamAId ? teamAName : teamBName;
        keyMoments.push({ text: `🔄 IMPACT PLAYER: ${impactTeamName} bring in ${bowlFirstImpact.name} for ${replaced.name}!`, highlight: true });
      }
    }

    // --- RAIN INTERRUPTION (~6% of non-playoff matches) ---
    let isRainAffected = false;
    if (!isPlayoff && Math.random() < 0.06) {
      isRainAffected = true;
      keyMoments.push({ text: `🌧️ RAIN! Match affected by rain delay!`, highlight: true });
    }

    // --- MATCH RANDOMNESS — unpredictability so not always the same team wins ---
    const teamAStrength = batFirst11.reduce((s, p) => s + (p.stats.batting + p.stats.bowling) / 2, 0);
    const teamBStrength = bowlFirst11.reduce((s, p) => s + (p.stats.batting + p.stats.bowling) / 2, 0);
    const strengthDiff = Math.abs(teamAStrength - teamBStrength);

    let underdogBoost = null;
    // LUCK + FORM FACTOR — higher upset probability for realistic IPL chaos
    // Real IPL: bottom teams beat top teams ~35-40% of the time
    if (strengthDiff > 80) {
      // Very one-sided: 35% upset chance (was 25%)
      if (Math.random() < 0.35) underdogBoost = teamAStrength < teamBStrength ? teamAId : teamBId;
    } else if (strengthDiff > 40) {
      // Moderate gap: 45% upset chance (was 35%)
      if (Math.random() < 0.45) underdogBoost = teamAStrength < teamBStrength ? teamAId : teamBId;
    } else {
      // Close match: 50/50 — either team can win
      if (Math.random() < 0.5) underdogBoost = Math.random() > 0.5 ? teamAId : teamBId;
    }
    // Additional "team of the day" luck factor — any team can have a hot day (10%)
    if (!underdogBoost && Math.random() < 0.10) {
      underdogBoost = Math.random() > 0.5 ? teamAId : teamBId;
    }
    if (underdogBoost) {
      const name = TEAMS.find(t => t.id === underdogBoost).shortName;
      const messages = [
        `💪 ${name} come in with confidence today!`,
        `🔥 ${name} are on fire today!`,
        `⚡ ${name} look red-hot in warm-ups!`,
        `🌟 ${name} have the stars aligned today!`,
        `🎯 ${name} are feeling lucky!`
      ];
      keyMoments.push({ text: messages[Math.floor(Math.random() * messages.length)], highlight: true });
    }

    // Simulate innings
    const innings1 = simulateInnings(
      batFirst11, bowlFirst11,
      venue, weather, null, isPlayoff, false, underdogBoost, battingFirst
    );

    let adjustedTarget = innings1.totalRuns + 1;
    if (isRainAffected) {
      const reductionPct = 0.05 + Math.random() * 0.15;
      adjustedTarget = Math.floor(innings1.totalRuns * (1 - reductionPct)) + 1;
      keyMoments.push({ text: `🌧️ Revised target: ${adjustedTarget} (DLS method)`, highlight: false });
    }

    const innings2 = simulateInnings(
      bowlFirst11, batFirst11,
      venue, weather, adjustedTarget, isPlayoff, weather.dewFactor > 0, underdogBoost, bowlingFirst
    );

    // Determine winner
    let winner, margin;
    keyMoments.push(...innings1.keyMoments, ...innings2.keyMoments);

    if (innings2.totalRuns >= adjustedTarget) {
      winner = bowlingFirst;
      margin = `${10 - innings2.wickets} wickets`;
      const oversLeft = formatOvers(120 - innings2.ballsBowled);
      margin += ` (${oversLeft} overs left)`;
      keyMoments.push({ text: `${TEAMS.find(t=>t.id===winner).shortName} win by ${margin}!`, highlight: true });
    } else if (innings2.totalRuns < innings1.totalRuns) {
      winner = battingFirst;
      margin = isRainAffected ? `${adjustedTarget - 1 - innings2.totalRuns} runs (DLS)` : `${innings1.totalRuns - innings2.totalRuns} runs`;
      keyMoments.push({ text: `${TEAMS.find(t=>t.id===winner).shortName} win by ${margin}!`, highlight: true });
    } else {
      keyMoments.push({ text: `🔥 IT'S A TIE! SUPER OVER TIME!`, highlight: true });
      const soA = simulateSuperOver(batFirst11, bowlFirst11);
      const soB = simulateSuperOver(bowlFirst11, batFirst11);
      if (soA > soB) {
        winner = battingFirst;
      } else if (soB > soA) {
        winner = bowlingFirst;
      } else {
        winner = Math.random() > 0.5 ? teamAId : teamBId;
        keyMoments.push({ text: `SUPER OVER TIED! ${TEAMS.find(t=>t.id===winner).shortName} win on boundary count!`, highlight: true });
      }
      margin = 'Super Over';
      keyMoments.push({ text: `${TEAMS.find(t=>t.id===winner).shortName} WIN THE SUPER OVER!`, highlight: true });
    }

    return {
      teamA: teamAId, teamB: teamBId,
      venue, weather,
      tossWinner, tossDecision,
      battingFirst, bowlingFirst,
      innings1, innings2,
      winner, margin,
      keyMoments,
      isPlayoff,
      playing11A: battingFirst === teamAId ? batFirst11 : bowlFirst11,
      playing11B: battingFirst === teamBId ? batFirst11 : bowlFirst11,
      impactPlayerA: impactA, impactPlayerB: impactB
    };
  }

  // Find which player to replace with impact player
  // Replaces the weakest non-essential player (not WK, not top bowler)
  function findImpactReplacement(playing11, impactPlayer) {
    // If impact is a bowler/allrounder, replace weakest batter
    // If impact is a batter, replace weakest bowler who isn't the only spinner/pacer
    let candidates = [];
    for (let i = 0; i < playing11.length; i++) {
      const p = playing11[i];
      // Don't replace the only wicketkeeper
      if (p.role === 'wicketkeeper' && playing11.filter(x => x.role === 'wicketkeeper').length <= 1) continue;
      candidates.push({ idx: i, player: p, rating: ratePlayer(p) });
    }

    if (candidates.length === 0) return -1;

    // Replace lowest-rated player, preferring to swap like-for-unlike (batter for bowler etc.)
    if (impactPlayer.role === 'bowler' || impactPlayer.role === 'allRounder') {
      // Prefer replacing a weak batter
      const batCandidates = candidates.filter(c => c.player.role === 'batter');
      if (batCandidates.length > 0) {
        batCandidates.sort((a, b) => a.rating - b.rating);
        return batCandidates[0].idx;
      }
    } else {
      // Prefer replacing a weak bowler
      const bowlCandidates = candidates.filter(c => c.player.role === 'bowler');
      if (bowlCandidates.length > 1) { // keep at least one pure bowler
        bowlCandidates.sort((a, b) => a.rating - b.rating);
        return bowlCandidates[0].idx;
      }
    }

    // Fallback: replace weakest overall
    candidates.sort((a, b) => a.rating - b.rating);
    return candidates[0].idx;
  }

  // Use user-saved XI, with like-for-like replacement for injured players
  // Apply locked XI with injury substitutions: injured starters get replaced,
  // recovered starters RETURN to their original slot
  function applyLockedXI(teamId, squad, lockedXI) {
    const selected = [];
    const missingStarters = [];

    // Walk through the LOCKED starters — these are the permanent XI
    lockedXI.starters.forEach(pid => {
      const player = squad.find(p => p.id === pid);
      if (!player) return;
      const form = tournament.playerForms[player.id];
      const isInjured = form && form.isInjured;

      if (!isInjured) {
        // Player is fit — stays in their slot (even if they were replaced last match)
        selected.push(player);
      } else {
        missingStarters.push(player);
      }
    });

    // For each injured starter, find best like-for-like replacement
    missingStarters.forEach(injured => {
      const available = squad.filter(p =>
        !selected.includes(p) &&
        !lockedXI.starters.includes(p.id) && // don't pick another locked starter as replacement
        !(tournament.playerForms[p.id] && tournament.playerForms[p.id].isInjured)
      );
      if (available.length === 0) return;

      const sameRole = available.filter(p => p.role === injured.role);
      const pool = sameRole.length > 0 ? sameRole : available;

      const overseasCount = selected.filter(p => p.isOverseas).length;
      const eligiblePool = overseasCount >= 4 ? pool.filter(p => !p.isOverseas) : pool;
      const finalPool = eligiblePool.length > 0 ? eligiblePool : pool;

      finalPool.sort((a, b) => ratePlayer(b) - ratePlayer(a));
      selected.push(finalPool[0]);
    });

    // If somehow still short, fill from squad
    while (selected.length < 11) {
      const rest = squad.filter(p =>
        !selected.includes(p) &&
        !(tournament.playerForms[p.id] && tournament.playerForms[p.id].isInjured)
      );
      if (rest.length === 0) break;
      rest.sort((a, b) => ratePlayer(b) - ratePlayer(a));
      selected.push(rest[0]);
    }

    // Impact player: use locked choice if not injured
    let impactPlayer = null;
    if (lockedXI.impactPlayer) {
      const imp = squad.find(p => p.id === lockedXI.impactPlayer);
      if (imp && !selected.includes(imp)) {
        const impForm = tournament.playerForms[imp.id];
        if (!impForm || !impForm.isInjured) {
          impactPlayer = imp;
        }
      }
    }

    // Fallback impact: best bench player
    if (!impactPlayer) {
      const bench = squad.filter(p =>
        !selected.includes(p) &&
        !(tournament.playerForms[p.id] && tournament.playerForms[p.id].isInjured)
      );
      const overseasInXI = selected.filter(p => p.isOverseas).length;
      const eligible = overseasInXI >= 4 ? bench.filter(p => !p.isOverseas) : bench;
      if (eligible.length > 0) {
        eligible.sort((a, b) => ratePlayer(b) - ratePlayer(a));
        impactPlayer = eligible[0];
      }
    }

    return {
      playing11: selected,
      impactPlayer,
      overseasInXI: selected.filter(p => p.isOverseas).length
    };
  }

  // Convert balls to cricket overs notation (e.g. 118 balls = "19.4")
  function formatOvers(balls) {
    const completeOvers = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return remainingBalls === 0 ? `${completeOvers}.0` : `${completeOvers}.${remainingBalls}`;
  }

  function ratePlayer(p) {
    const form = tournament.playerForms[p.id];
    const formMod = form ? form.currentForm / 70 : 1;
    const primary = p.role === 'bowler' ? p.stats.bowling : p.role === 'allRounder' ? (p.stats.batting + p.stats.bowling) / 2 : p.stats.batting;
    // Wider random factor for day-to-day variance (±10%)
    const randomMod = 0.90 + Math.random() * 0.2;
    return primary * formMod * randomMod;
  }

  // Select Playing XI + Impact Player substitute
  // Returns { playing11, impactPlayer, overseasInXI }
  // XI is LOCKED for the entire tournament — only injury replacements change it
  function selectPlaying11(teamId) {
    const ts = tournament.teamStates[teamId];
    const squad = ts.squad.map(s => s.player);

    // If this team already has a locked XI, use it with injury subs
    if (tournament.lockedXIs[teamId]) {
      return applyLockedXI(teamId, squad, tournament.lockedXIs[teamId]);
    }

    // Check if user has saved an XI for this team (first match — lock it)
    const userXI = window.userXISelections && window.userXISelections[teamId];
    if (userXI && userXI.starters && userXI.starters.length === 11) {
      // Lock this XI for all future matches
      tournament.lockedXIs[teamId] = {
        starters: [...userXI.starters],
        impactPlayer: userXI.impactPlayer
      };
      return applyLockedXI(teamId, squad, tournament.lockedXIs[teamId]);
    }

    // Filter out injured
    const available = squad.filter(p => {
      const form = tournament.playerForms[p.id];
      return !form || !form.isInjured;
    });

    // ROLE-BASED XI SELECTION (not just rating)
    // Target: 1 WK + 4-5 batters + 2 all-rounders + 4 bowlers = 11
    const byRole = {
      wicketkeeper: available.filter(p => p.role === 'wicketkeeper'),
      batter: available.filter(p => p.role === 'batter'),
      allRounder: available.filter(p => p.role === 'allRounder'),
      bowler: available.filter(p => p.role === 'bowler')
    };
    // Sort each by rating
    Object.keys(byRole).forEach(k => byRole[k].sort((a, b) => ratePlayer(b) - ratePlayer(a)));

    const selected = [];
    const pickedIds = new Set();

    function tryPick(player) {
      if (!player || pickedIds.has(player.id)) return false;
      // Overseas check
      const overseasCount = selected.filter(p => p.isOverseas).length;
      if (player.isOverseas && overseasCount >= 4) return false;
      selected.push(player);
      pickedIds.add(player.id);
      return true;
    }

    // 1. Pick 1 WK (best available)
    if (byRole.wicketkeeper[0]) tryPick(byRole.wicketkeeper[0]);

    // 2. Pick 4 bowlers (best available, prefer variety pace+spin)
    let bowlersPicked = 0;
    for (const p of byRole.bowler) {
      if (bowlersPicked >= 4) break;
      if (tryPick(p)) bowlersPicked++;
    }

    // 3. Pick 2 all-rounders
    let arPicked = 0;
    for (const p of byRole.allRounder) {
      if (arPicked >= 2) break;
      if (tryPick(p)) arPicked++;
    }

    // 4. Pick 4 batters (need openers + middle-order)
    const topOrderB = byRole.batter.filter(p => p.subRole === 'top-order');
    const middleOrderB = byRole.batter.filter(p => p.subRole === 'middle-order');
    const finisherB = byRole.batter.filter(p => p.subRole === 'finisher');
    const otherB = byRole.batter.filter(p => !['top-order','middle-order','finisher'].includes(p.subRole));
    // 2 top-order, 1 middle, 1 finisher (or best available)
    let battersPicked = 0;
    for (const p of topOrderB) { if (battersPicked >= 2) break; if (tryPick(p)) battersPicked++; }
    for (const p of middleOrderB) { if (battersPicked >= 3) break; if (tryPick(p)) battersPicked++; }
    for (const p of finisherB) { if (battersPicked >= 4) break; if (tryPick(p)) battersPicked++; }
    // Fallback: any batter
    for (const p of [...topOrderB, ...middleOrderB, ...finisherB, ...otherB]) {
      if (battersPicked >= 4) break;
      if (tryPick(p)) battersPicked++;
    }

    // 5. Fill remaining slots with best available (role-agnostic)
    const allRanked = available.slice().sort((a, b) => ratePlayer(b) - ratePlayer(a));
    for (const p of allRanked) {
      if (selected.length >= 11) break;
      tryPick(p);
    }

    // === IMPACT PLAYER SELECTION ===
    // Pick 4 substitutes from remaining squad, then choose 1 as impact player
    const overseasInXI = selected.filter(p => p.isOverseas).length;
    const remainingSquad = available.filter(p => !selected.includes(p));
    remainingSquad.sort((a, b) => ratePlayer(b) - ratePlayer(a));

    // Substitutes: up to 4 players
    const subs = remainingSquad.slice(0, 4);

    // Choose best substitute as impact player
    // If 4 overseas in XI, impact player must be Indian
    let impactPlayer = null;
    if (subs.length > 0) {
      const eligibleSubs = overseasInXI >= 4 ? subs.filter(p => !p.isOverseas) : subs;
      if (eligibleSubs.length > 0) {
        // Pick based on what team needs: if batting is weak, pick a batter; if bowling, pick bowler
        const batCount = selected.filter(p => p.role === 'batter' || p.role === 'wicketkeeper').length;
        const bowlCount = selected.filter(p => p.role === 'bowler').length;

        if (bowlCount < 4) {
          // Need more bowling — prefer allrounder/bowler
          impactPlayer = eligibleSubs.find(p => p.role === 'bowler' || p.role === 'allRounder') || eligibleSubs[0];
        } else {
          // Default: pick highest rated
          impactPlayer = eligibleSubs[0];
        }
      }
    }

    // LOCK this XI for all future matches (AI teams + first-time human teams)
    tournament.lockedXIs[teamId] = {
      starters: selected.map(p => p.id),
      impactPlayer: impactPlayer ? impactPlayer.id : null
    };

    return { playing11: selected, impactPlayer, overseasInXI };
  }

  // Select the best bowler for the current phase
  function selectBowlerForOver(bowlerStats, phase, lastBowlerIdx) {
    // Available: has overs left, not the last bowler (no consecutive)
    const available = bowlerStats.filter((b, i) => b.overs < 4 && i !== lastBowlerIdx);
    if (available.length === 0) {
      // Fallback: allow consecutive if no other option
      const fallback = bowlerStats.filter(b => b.overs < 4);
      return fallback.length > 0 ? fallback[0] : null;
    }

    // Score each bowler for this phase
    const scored = available.map(b => {
      const p = b.player;
      const sub = p.subRole;
      let score = p.stats.bowling; // base: bowling skill

      // Phase-specific bonuses
      if (phase === 'powerplay') {
        if (sub === 'powerplay-bowler') score += 25;
        if (['RF', 'RFM', 'LF', 'LFM'].includes(p.bowlingStyle)) score += 10; // pace in PP
        if (sub === 'spin') score -= 10; // spinners usually not in powerplay
      } else if (phase === 'middle') {
        if (['OB', 'SLA', 'LB', 'CLA'].includes(p.bowlingStyle)) score += 20; // spinners in middle
        if (sub === 'spin') score += 15;
        if (sub === 'bowling-ar') score += 5;
      } else { // death
        if (sub === 'death-bowler') score += 30;
        if (['RF', 'RFM', 'LF', 'LFM'].includes(p.bowlingStyle)) score += 10; // pace at death
        if (sub === 'spin') score -= 15; // spinners usually not at death
        if (sub === 'powerplay-bowler') score += 5; // can double at death
      }

      // Prefer bowlers who haven't bowled much yet (spread overs)
      if (b.overs === 0) score += 8;
      if (b.overs >= 3) score -= 10; // save last over for later

      // Small randomness to avoid identical bowling orders every match
      score += Math.random() * 10;

      return { bowler: b, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].bowler;
  }

  // Sort playing 11 into a realistic batting order — BULLETPROOF
  // Uses explicit tiers: bowlers always last, batters first
  function sortBattingOrder(players) {
    // Split by role into separate buckets
    const pureBatters = [];
    const wicketkeepers = [];
    const allRounders = [];
    const pureBowlers = [];

    players.forEach(p => {
      const role = p.role;
      if (role === 'bowler') pureBowlers.push(p);
      else if (role === 'wicketkeeper') wicketkeepers.push(p);
      else if (role === 'allRounder') allRounders.push(p);
      else if (role === 'batter') pureBatters.push(p);
      else pureBatters.push(p); // unknown → treat as batter
    });

    // Sort each bucket by batting ability (best first)
    const byBatting = (a, b) => (b.stats.batting || 0) - (a.stats.batting || 0);

    pureBatters.sort(byBatting);
    wicketkeepers.sort(byBatting);
    allRounders.sort(byBatting);
    pureBowlers.sort(byBatting);

    // CRICKET ORDER: openers first, then middle, then bowlers last
    // Positions 1-3: 2 best pureBatters (top-order) + best WK (if bat>=70)
    // Positions 4-6: remaining batters + WKs + best AR
    // Positions 7-8: remaining ARs
    // Positions 9-11: pureBowlers (sorted by batting)

    const result = [];

    // Sort pureBatters by subRole priority
    const topOrderBatters = pureBatters.filter(p => p.subRole === 'top-order').sort(byBatting);
    const middleOrderBatters = pureBatters.filter(p => p.subRole === 'middle-order').sort(byBatting);
    const finishers = pureBatters.filter(p => p.subRole === 'finisher').sort(byBatting);
    const otherBatters = pureBatters.filter(p => !['top-order','middle-order','finisher'].includes(p.subRole));

    // #1-3: top-order batters + good WK (bat>=70)
    const goodWKs = wicketkeepers.filter(p => (p.stats.batting || 0) >= 70);
    const otherWKs = wicketkeepers.filter(p => (p.stats.batting || 0) < 70);

    // Add top-order batters first (at least 2 openers)
    result.push(...topOrderBatters);
    // Add good WKs at #3 typically
    result.push(...goodWKs);
    // Middle-order batters at #4-5
    result.push(...middleOrderBatters);
    // Weaker WKs at #4-5
    result.push(...otherWKs);
    // Batting all-rounders at #5-6
    const battingARs = allRounders.filter(p => p.subRole === 'batting-ar').sort(byBatting);
    result.push(...battingARs);
    // Finishers at #5-7
    result.push(...finishers);
    // Other batters (unknown subRole)
    result.push(...otherBatters);
    // Bowling all-rounders at #7-8
    const bowlingARs = allRounders.filter(p => p.subRole !== 'batting-ar').sort(byBatting);
    result.push(...bowlingARs);
    // Pure bowlers ALWAYS LAST (#9-11)
    result.push(...pureBowlers);

    // FINAL VERIFICATION: ensure no bowler is in first 7 positions
    for (let i = 0; i < Math.min(7, result.length); i++) {
      if (result[i].role === 'bowler') {
        console.error('[BATTING ORDER BUG] Bowler at position', i+1, ':', result[i].name);
      }
    }

    return result;
  }

  // Super Over: 6 balls, pick best batter + best bowler
  function simulateSuperOver(battingTeam, bowlingTeam) {
    const bestBatter = [...battingTeam].sort((a, b) => b.stats.batting - a.stats.batting)[0];
    const bestBowler = [...bowlingTeam].sort((a, b) => b.stats.bowling - a.stats.bowling)[0];
    let runs = 0;
    for (let ball = 0; ball < 6; ball++) {
      const roll = Math.random();
      if (roll < 0.05) continue; // wicket (dot)
      else if (roll < 0.25) runs += 0; // dot
      else if (roll < 0.45) runs += 1;
      else if (roll < 0.55) runs += 2;
      else if (roll < 0.78) runs += 4;
      else runs += 6;
    }
    return runs;
  }

  function simulateInnings(battingTeam, bowlingTeam, venue, weather, target, isPlayoff, hasDew, underdogBoost, battingTeamId) {
    let totalRuns = 0, wickets = 0, extras = 0;
    let ballsBowled = 0;
    const batting = [];
    const bowling = [];
    const fow = [];
    const keyMoments = [];

    // Underdog boost: temporarily buff batting stats if this is the underdog team
    const isUnderdog = underdogBoost && underdogBoost === battingTeamId;

    // Momentum tracker for collapse/hot streak detection
    let recentWickets = 0; // wickets in last 2 overs
    let recentBoundaries = 0; // boundaries in last 2 overs

    // Init batting order — sorted by realistic position
    let batters = sortBattingOrder([...battingTeam]);
    // SAFETY CHECK: if somehow a bowler ended up in top 3, force re-sort
    const top3HasBowler = batters.slice(0, 3).some(p => p.role === 'bowler');
    if (top3HasBowler) {
      console.warn('[BUG] Bowler in top 3 — re-sorting strictly');
      batters = batters.slice().sort((a, b) => {
        const aIsBowler = a.role === 'bowler' ? 1 : 0;
        const bIsBowler = b.role === 'bowler' ? 1 : 0;
        if (aIsBowler !== bIsBowler) return aIsBowler - bIsBowler;
        return (b.stats.batting || 0) - (a.stats.batting || 0);
      });
    }
    const batsmenStats = batters.map(p => ({
      player: p, runs: 0, balls: 0, fours: 0, sixes: 0, howOut: 'not out'
    }));

    // Init bowlers from bowling team
    const bowlers = bowlingTeam.filter(p =>
      p.role === 'bowler' || p.role === 'allRounder' ||
      (p.bowlingStyle && p.stats.bowling > 20)
    );
    const bowlerStats = bowlers.map(p => ({
      player: p, overs: 0, balls: 0, maidens: 0, runs: 0, wickets: 0
    }));

    let strikerIdx = 0, nonStrikerIdx = 1;
    let lastBowlerIdx = -1; // track last bowler to prevent consecutive overs

    for (let over = 0; over < 20; over++) {
      if (wickets >= 10) break;

      // Phase detection
      const phase = over < 6 ? 'powerplay' : over < 15 ? 'middle' : 'death';

      // Select bowler: phase-aware, no consecutive overs, max 4 overs
      const bowler = selectBowlerForOver(bowlerStats, phase, lastBowlerIdx);
      if (!bowler) break;
      lastBowlerIdx = bowlerStats.indexOf(bowler);

      let overRuns = 0, overWickets = 0;

      for (let ball = 0; ball < 6; ball++) {
        if (wickets >= 10) break;
        if (target && totalRuns >= target) break;

        ballsBowled++;
        const batter = batsmenStats[strikerIdx];
        const batterPlayer = batter.player;
        const bowlerPlayer = bowler.player;

        // Compute outcome with momentum context
        const outcome = computeBallOutcome(batterPlayer, bowlerPlayer, venue, weather, phase, isPlayoff, hasDew, target, totalRuns, wickets, over, isUnderdog, recentWickets, recentBoundaries);

        if (outcome.isWicket) {
          wickets++;
          overWickets++;
          recentWickets++;
          batter.balls++;
          batter.howOut = outcome.dismissal + ' b ' + bowlerPlayer.name;
          bowler.wickets++;
          fow.push({ wicket: wickets, score: totalRuns, batter: batterPlayer.name, over: over + (ball + 1) / 10 });

          // Collapse detection
          if (recentWickets >= 3) {
            keyMoments.push({ text: `💀 COLLAPSE! ${recentWickets} wickets have fallen in quick succession!`, highlight: true });
          }

          // Key moment for star player dismissal
          if (batterPlayer.starPower >= 70 && batter.runs >= 30) {
            keyMoments.push({ text: `${batterPlayer.name} falls for ${batter.runs}(${batter.balls})!`, highlight: true });
          }

          // Next batter
          if (wickets < 10) {
            strikerIdx = wickets + 1;
            if (strikerIdx >= batsmenStats.length) break;
          }
        } else {
          const runs = outcome.runs;
          totalRuns += runs;
          overRuns += runs;
          batter.runs += runs;
          batter.balls++;
          bowler.runs += runs;

          if (runs === 4) { batter.fours++; recentBoundaries++; }
          if (runs === 6) { batter.sixes++; recentBoundaries++; }
          if (outcome.isExtra) { extras++; totalRuns++; bowler.runs++; }

          // Rotate strike on odd runs
          if (runs % 2 === 1) {
            [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];
          }

          // Milestones
          if (batter.runs >= 50 && batter.runs - runs < 50) {
            keyMoments.push({ text: `FIFTY! ${batterPlayer.name} reaches 50(${batter.balls}) 🔥`, highlight: true });
          }
          if (batter.runs >= 100 && batter.runs - runs < 100) {
            keyMoments.push({ text: `CENTURY! ${batterPlayer.name} smashes 100(${batter.balls})! 🌟🌟`, highlight: true });
          }
        }
      }

      bowler.balls += 6;
      bowler.overs = Math.floor(bowler.balls / 6);
      if (overRuns === 0 && overWickets === 0) bowler.maidens++;

      // Big over
      if (overRuns >= 18) {
        const batterName = batsmenStats[strikerIdx] ? batsmenStats[strikerIdx].player.name : 'the batters';
        keyMoments.push({ text: `${overRuns} off the over! ${batterName} goes berserk! 💥`, highlight: false });
      }

      // Reset momentum trackers every 2 overs
      if (over % 2 === 1) {
        recentWickets = 0;
        recentBoundaries = 0;
      }

      // Rotate strike at end of over
      [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];

      if (target && totalRuns >= target) break;
    }

    // Chase narrative
    if (target) {
      if (totalRuns >= target) {
        keyMoments.push({ text: `Target chased! ${totalRuns}/${wickets} in ${formatOvers(ballsBowled)} overs`, highlight: true });
      } else {
        keyMoments.push({ text: `All out / Overs done: ${totalRuns}/${wickets}. Fell short by ${target - totalRuns - 1} runs.`, highlight: false });
      }
    }

    // Update player season stats
    batsmenStats.forEach(b => {
      const form = tournament.playerForms[b.player.id];
      if (form) {
        form.seasonRuns += b.runs;
        form.seasonBalls += b.balls;
        form.matchesPlayed++;
      }
    });
    bowlerStats.forEach(b => {
      const form = tournament.playerForms[b.player.id];
      if (form) {
        form.seasonWickets += b.wickets;
        form.seasonBallsBowled += b.balls;
        form.seasonRunsConceded += b.runs;
      }
    });

    return {
      totalRuns, wickets, extras, ballsBowled,
      batting: batsmenStats.filter(b => b.balls > 0 || b.howOut !== 'not out'),
      bowling: bowlerStats.filter(b => b.balls > 0),
      fow, keyMoments
    };
  }

  function computeBallOutcome(batter, bowler, venue, weather, phase, isPlayoff, hasDew, target, currentScore, wickets, over, isUnderdog, recentWickets, recentBoundaries) {
    const form = tournament.playerForms[batter.id];
    const bowlerForm = tournament.playerForms[bowler.id];
    const formMod = form ? form.currentForm / 70 : 1;
    const bowlerFormMod = bowlerForm ? bowlerForm.currentForm / 70 : 1;

    // Base rates by phase (calibrated to real IPL: ~160-175 avg total, SR ~135-145)
    let wicketProb, dotProb, singleProb, twoProb, fourProb, sixProb;
    if (phase === 'powerplay') {
      wicketProb = 0.05; dotProb = 0.33; singleProb = 0.28; twoProb = 0.08; fourProb = 0.15; sixProb = 0.05;
    } else if (phase === 'middle') {
      wicketProb = 0.06; dotProb = 0.38; singleProb = 0.28; twoProb = 0.08; fourProb = 0.10; sixProb = 0.04;
    } else { // death
      wicketProb = 0.07; dotProb = 0.28; singleProb = 0.24; twoProb = 0.09; fourProb = 0.14; sixProb = 0.09;
    }

    // Batter skill modifier (dampened - /85 instead of /70 to avoid inflation)
    const batRating = batter.stats.batting / 85;
    fourProb *= (0.7 + batRating * 0.4) * formMod;
    sixProb *= (0.6 + batRating * 0.4) * formMod;
    singleProb *= (0.85 + batRating * 0.2);

    // Bowler skill modifier (dampened)
    const bowlRating = bowler.stats.bowling / 85;
    wicketProb *= (0.6 + bowlRating * 0.5) * bowlerFormMod;
    dotProb *= (0.75 + bowlRating * 0.3);

    // Pitch modifiers
    const isPace = bowler.bowlingStyle && (bowler.bowlingStyle.includes('F') || bowler.bowlingStyle.includes('RF'));
    const isSpin = !isPace && bowler.bowlingStyle;

    if (isPace) {
      wicketProb *= venue.paceFactor;
      wicketProb *= (1 + weather.paceBonus);
    }
    if (isSpin) {
      wicketProb *= venue.spinFactor;
      wicketProb *= (1 + weather.spinBonus);
    }

    // Dew effect (harder to bowl)
    if (hasDew) {
      wicketProb *= 0.8;
      fourProb *= 1.15;
      sixProb *= 1.1;
    }

    // Clutch factor in playoffs
    if (isPlayoff) {
      if (batter.stats.clutch > 75) {
        fourProb *= 1.1;
        sixProb *= 1.1;
        wicketProb *= 0.9;
      }
      if (bowler.stats.clutch > 75) {
        wicketProb *= 1.1;
      }
    }

    // Chase pressure
    if (target) {
      const required = target - currentScore;
      const ballsLeft = 120 - (over * 6);
      const reqRate = (required / ballsLeft) * 6;
      if (reqRate > 12) {
        sixProb *= 1.4;
        wicketProb *= 1.3;
      } else if (reqRate > 9) {
        fourProb *= 1.2;
        sixProb *= 1.2;
        wicketProb *= 1.1;
      }
    }

    // Consistency modifier - inconsistent batters have more variance (mild)
    if (batter.stats.consistency < 60) {
      if (Math.random() > 0.5) {
        fourProb *= 1.1; sixProb *= 1.1; // good day
      } else {
        wicketProb *= 1.2; // bad day
      }
    }

    // Underdog boost: batting team plays above their level (mild)
    if (isUnderdog) {
      fourProb *= 1.08;
      sixProb *= 1.05;
      wicketProb *= 0.92;
    }

    // Momentum: collapse (recent wickets make next batter nervous)
    if (recentWickets >= 2) {
      wicketProb *= (1 + recentWickets * 0.08);
      dotProb *= 1.1;
      fourProb *= 0.9;
    }

    // Momentum: hot streak (recent boundaries)
    if (recentBoundaries >= 3) {
      fourProb *= 1.1;
      sixProb *= 1.08;
      wicketProb *= 0.92;
    }

    // --- UNPREDICTABILITY FACTORS (subtle, not stat-inflating) ---

    // 1. Magic ball / unplayable delivery (~1.5%)
    if (Math.random() < 0.015) {
      wicketProb *= 2.0;
      fourProb *= 0.3;
      sixProb *= 0.1;
    }

    // 2. Dropped catch / missed stumping (~2%)
    if (Math.random() < 0.02) {
      wicketProb *= 0.2;
    }

    // 3. Batter hot streak (~2% per ball, mild boost)
    if (form && form.currentForm > 70 && Math.random() < 0.02) {
      fourProb *= 1.25;
      sixProb *= 1.3;
      wicketProb *= 0.75;
    }

    // 4. Last-over thriller: final over of close chase
    if (target && over === 19) {
      const needed = target - currentScore;
      if (needed > 0 && needed <= 15) {
        sixProb *= 1.2;
        fourProb *= 1.1;
        wicketProb *= 1.1;
      }
    }

    // 5. Random variance (~2% each way)
    const chaosRoll = Math.random();
    if (chaosRoll < 0.02) {
      fourProb *= 1.3; // misfield
    } else if (chaosRoll < 0.04) {
      dotProb *= 1.15;
    }

    // 6. Underdog factor: weaker batter occasionally plays well (~3%)
    if (batter.stats.batting < 55 && Math.random() < 0.03) {
      fourProb *= 1.2;
      sixProb *= 1.15;
      wicketProb *= 0.8;
    }

    // Normalize probabilities
    const total = wicketProb + dotProb + singleProb + twoProb + fourProb + sixProb;
    wicketProb /= total;
    dotProb /= total;
    singleProb /= total;
    twoProb /= total;
    fourProb /= total;
    sixProb /= total;

    // Roll
    const roll = Math.random();
    let cumulative = 0;

    cumulative += wicketProb;
    if (roll < cumulative) {
      const dismissals = isPace ? ['bowled', 'caught', 'lbw', 'caught', 'caught'] :
                                  ['bowled', 'stumped', 'caught', 'lbw', 'caught'];
      return { isWicket: true, runs: 0, dismissal: dismissals[Math.floor(Math.random() * dismissals.length)] };
    }

    cumulative += dotProb;
    if (roll < cumulative) return { isWicket: false, runs: 0 };

    cumulative += singleProb;
    if (roll < cumulative) return { isWicket: false, runs: 1 };

    cumulative += twoProb;
    if (roll < cumulative) return { isWicket: false, runs: 2 };

    // Extras (small chance)
    const isExtra = Math.random() < 0.03;

    cumulative += fourProb;
    if (roll < cumulative) return { isWicket: false, runs: 4, isExtra };

    return { isWicket: false, runs: 6, isExtra };
  }

  function updateStandings(result) {
    const w = tournament.standings[result.winner];
    const loserId = result.winner === result.teamA ? result.teamB : result.teamA;
    const l = tournament.standings[loserId];

    w.played++; w.won++; w.points += 2;
    l.played++; l.lost++;

    // NRR calculation
    const winnerBatFirst = result.battingFirst === result.winner;
    if (winnerBatFirst) {
      w.runsFor += result.innings1.totalRuns;
      w.oversFor += result.innings1.ballsBowled / 6;
      w.runsAgainst += result.innings2.totalRuns;
      w.oversAgainst += result.innings2.ballsBowled / 6;

      l.runsFor += result.innings2.totalRuns;
      l.oversFor += result.innings2.ballsBowled / 6;
      l.runsAgainst += result.innings1.totalRuns;
      l.oversAgainst += result.innings1.ballsBowled / 6;
    } else {
      w.runsFor += result.innings2.totalRuns;
      w.oversFor += result.innings2.ballsBowled / 6;
      w.runsAgainst += result.innings1.totalRuns;
      w.oversAgainst += result.innings1.ballsBowled / 6;

      l.runsFor += result.innings1.totalRuns;
      l.oversFor += result.innings1.ballsBowled / 6;
      l.runsAgainst += result.innings2.totalRuns;
      l.oversAgainst += result.innings2.ballsBowled / 6;
    }

    // Compute NRR
    [result.winner, loserId].forEach(id => {
      const s = tournament.standings[id];
      s.nrr = s.oversFor > 0 && s.oversAgainst > 0 ?
        (s.runsFor / s.oversFor) - (s.runsAgainst / s.oversAgainst) : 0;
    });
  }

  function updateForms(result) {
    // Graduated form changes based on impact, strike rate, and economy
    [result.innings1, result.innings2].forEach(inn => {
      inn.batting.forEach(b => {
        const form = tournament.playerForms[b.player.id];
        if (!form) return;

        const sr = b.balls > 0 ? (b.runs / b.balls) * 100 : 0;

        if (b.runs >= 75) {
          form.currentForm = Math.min(form.currentForm + 18, b.player.stats.formCeiling);
        } else if (b.runs >= 50) {
          form.currentForm = Math.min(form.currentForm + 12, b.player.stats.formCeiling);
        } else if (b.runs >= 30 && sr > 130) {
          // Quick-fire cameo — good impact
          form.currentForm = Math.min(form.currentForm + 8, b.player.stats.formCeiling);
        } else if (b.runs >= 30) {
          form.currentForm = Math.min(form.currentForm + 5, b.player.stats.formCeiling);
        } else if (b.balls >= 15 && b.runs < 10) {
          // Slow, wasteful innings — big confidence hit
          form.currentForm = Math.max(form.currentForm - 10, b.player.stats.formFloor);
        } else if (b.balls >= 8 && b.runs < 8) {
          form.currentForm = Math.max(form.currentForm - 6, b.player.stats.formFloor);
        } else {
          // Small random drift
          form.currentForm += (Math.random() - 0.5) * 6;
        }
        form.currentForm = Math.max(b.player.stats.formFloor, Math.min(b.player.stats.formCeiling, form.currentForm));
      });

      inn.bowling.forEach(b => {
        const form = tournament.playerForms[b.player.id];
        if (!form) return;

        const eco = b.overs > 0 ? b.runs / b.overs : 0;

        if (b.wickets >= 4) {
          form.currentForm = Math.min(form.currentForm + 15, b.player.stats.formCeiling);
        } else if (b.wickets >= 3) {
          form.currentForm = Math.min(form.currentForm + 10, b.player.stats.formCeiling);
        } else if (b.wickets >= 2 && eco < 8) {
          // Effective spell
          form.currentForm = Math.min(form.currentForm + 7, b.player.stats.formCeiling);
        } else if (b.wickets >= 1 && eco < 7) {
          // Tidy with a wicket
          form.currentForm = Math.min(form.currentForm + 3, b.player.stats.formCeiling);
        } else if (b.overs >= 3 && eco > 12) {
          // Got smashed
          form.currentForm = Math.max(form.currentForm - 8, b.player.stats.formFloor);
        } else if (b.overs >= 2 && eco > 14) {
          form.currentForm = Math.max(form.currentForm - 6, b.player.stats.formFloor);
        } else {
          form.currentForm += (Math.random() - 0.5) * 5;
        }
        form.currentForm = Math.max(b.player.stats.formFloor, Math.min(b.player.stats.formCeiling, form.currentForm));
      });
    });
  }

  function checkInjuries(result) {
    const allPlayers = [...(result.playing11A || []), ...(result.playing11B || [])];
    allPlayers.forEach(p => {
      const form = tournament.playerForms[p.id];
      if (!form || form.isInjured) return;
      // Injury probability reduced (was too frequent)
      // High fitness (90+) = 0.2% per match
      // Low fitness (50) = 1.67% per match
      const injuryProb = (100 - p.stats.fitness) / 3000;
      if (Math.random() < injuryProb) {
        form.isInjured = true;
        form.injuryMatchesLeft = 1 + Math.floor(Math.random() * 3);
        result.keyMoments.push({
          text: `🚨 INJURY: ${p.name} ruled out for ${form.injuryMatchesLeft} match(es)!`,
          highlight: true
        });
      }
    });

    // Decrement injury counters
    Object.values(tournament.playerForms).forEach(f => {
      if (f.isInjured && f.injuryMatchesLeft > 0) {
        f.injuryMatchesLeft--;
        if (f.injuryMatchesLeft <= 0) f.isInjured = false;
      }
    });
  }

  function checkHiddenGems() {
    // Organic breakout system — ANY low/mid rated player can break out
    // if form, youth, performance, and opportunity align
    Object.entries(tournament.playerForms).forEach(([id, form]) => {
      if (form.breakoutActivated) return;
      if (form.matchesPlayed < 2) return;

      const player = PLAYERS.find(p => p.id === id);
      if (!player) return;

      const primaryStat = player.role === 'bowler' ? player.stats.bowling :
                          player.role === 'allRounder' ? Math.max(player.stats.batting, player.stats.bowling) :
                          player.stats.batting;

      // Only low-to-mid rated players can break out (not already elite)
      if (primaryStat > 75) return;

      // 1. Youth factor: younger = higher breakout ceiling
      const youthFactor = player.age <= 22 ? 0.06 :
                          player.age <= 25 ? 0.04 :
                          player.age <= 28 ? 0.02 : 0.005;

      // 2. Form momentum: hot streak increases breakout chance
      const formFactor = form.currentForm > 75 ? 0.08 :
                         form.currentForm > 65 ? 0.04 :
                         form.currentForm > 55 ? 0.01 : 0;

      // 3. Performance trigger: actual match numbers
      let perfFactor = 0;
      if (form.seasonRuns > 0 && form.seasonBalls > 0) {
        const sr = (form.seasonRuns / form.seasonBalls) * 100;
        if (sr > 150 && form.seasonRuns > 60) perfFactor += 0.04;
      }
      if (form.seasonWickets >= 4) perfFactor += 0.04;

      // 4. Gap between current stats and ceiling = room to grow
      const ceilingGap = (player.stats.formCeiling - primaryStat) / 100;
      const ceilingFactor = ceilingGap * 0.06;

      // 5. Opportunity factor: played consistently (not benched)
      const oppFactor = form.matchesPlayed >= 5 ? 0.03 : 0;

      const breakoutProb = youthFactor + formFactor + perfFactor + ceilingFactor + oppFactor;

      if (Math.random() < breakoutProb) {
        form.breakoutActivated = true;

        // Determine breakout magnitude
        const isMajor = player.hiddenGem ? true :
                        (ceilingGap > 0.15 && player.age <= 25);

        if (isMajor) {
          const ceiling = player.hiddenGemCeiling || Math.min(primaryStat + 20, 85);
          player.stats.batting = Math.min(player.stats.batting + 14, ceiling);
          player.stats.bowling = Math.min(player.stats.bowling + 10, ceiling);
          player.stats.consistency = Math.min(player.stats.consistency + 10, 80);
          form.currentForm = Math.min(form.currentForm + 20, player.stats.formCeiling);
          form.breakoutMessage = `🌟 BREAKOUT: ${player.name} is having a SENSATIONAL tournament! Stats upgraded!`;
        } else {
          player.stats.batting = Math.min(player.stats.batting + 7, primaryStat + 12);
          player.stats.bowling = Math.min(player.stats.bowling + 5, player.stats.bowling + 10);
          player.stats.consistency = Math.min(player.stats.consistency + 5, 75);
          form.currentForm = Math.min(form.currentForm + 12, player.stats.formCeiling);
          form.breakoutMessage = `📈 ${player.name} is finding rhythm — showing real improvement!`;
        }
      }
    });
  }

  function getSortedStandings() {
    const arr = Object.entries(tournament.standings).map(([id, s]) => ({ id, ...s }));
    arr.sort((a, b) => b.points - a.points || b.nrr - a.nrr);
    return arr;
  }

  function isLeagueComplete() {
    return tournament.currentMatch >= tournament.schedule.length;
  }

  function setupPlayoffs() {
    const top4 = getSortedStandings().slice(0, 4).map(s => s.id);
    tournament.playoffs = {
      q1: { teamA: top4[0], teamB: top4[1], result: null },
      eliminator: { teamA: top4[2], teamB: top4[3], result: null },
      q2: { teamA: null, teamB: null, result: null },
      final: { teamA: null, teamB: null, result: null }
    };
    return tournament.playoffs;
  }

  function simulatePlayoffMatch(matchKey) {
    const po = tournament.playoffs[matchKey];
    if (!po || !po.teamA || !po.teamB) return null;

    const venue = matchKey === 'final' ?
      VENUES.find(v => v.team === 'GT') : // Ahmedabad for final
      VENUES.find(v => v.team === po.teamA);

    const result = simulateMatch(po.teamA, po.teamB, venue, true);
    po.result = result;
    updateForms(result);
    checkInjuries(result);

    // Progress bracket
    if (matchKey === 'q1') {
      tournament.playoffs.final.teamA = result.winner;
      tournament.playoffs.q2.teamA = result.winner === po.teamA ? po.teamB : po.teamA;
    } else if (matchKey === 'eliminator') {
      tournament.playoffs.q2.teamB = result.winner;
    } else if (matchKey === 'q2') {
      tournament.playoffs.final.teamB = result.winner;
    } else if (matchKey === 'final') {
      tournament.champion = result.winner;
    }

    return result;
  }

  function getTopPerformers() {
    const batsmen = [];
    const bowlers = [];

    Object.entries(tournament.playerForms).forEach(([id, form]) => {
      const player = PLAYERS.find(p => p.id === id);
      if (!player || form.matchesPlayed === 0) return;

      if (form.seasonRuns > 0) {
        batsmen.push({
          player, runs: form.seasonRuns,
          balls: form.seasonBalls,
          sr: form.seasonBalls > 0 ? ((form.seasonRuns / form.seasonBalls) * 100).toFixed(1) : 0,
          matches: form.matchesPlayed
        });
      }
      if (form.seasonWickets > 0) {
        bowlers.push({
          player, wickets: form.seasonWickets,
          runs: form.seasonRunsConceded,
          balls: form.seasonBallsBowled,
          eco: form.seasonBallsBowled > 0 ? ((form.seasonRunsConceded / form.seasonBallsBowled) * 6).toFixed(2) : 0,
          matches: form.matchesPlayed
        });
      }
    });

    batsmen.sort((a, b) => b.runs - a.runs);
    bowlers.sort((a, b) => b.wickets - a.wickets || a.eco - b.eco);

    return {
      orangeCap: batsmen[0] || null,
      purpleCap: bowlers[0] || null,
      topBatsmen: batsmen.slice(0, 10),
      topBowlers: bowlers.slice(0, 10)
    };
  }

  return {
    init, getState, simulateNextMatch, getSortedStandings,
    isLeagueComplete, setupPlayoffs, simulatePlayoffMatch,
    getTopPerformers, VENUES, formatOvers
  };
})();
