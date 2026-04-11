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
      champion: null
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
    const teamA = selectPlaying11(teamAId);
    const teamB = selectPlaying11(teamBId);

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

    // --- RAIN INTERRUPTION (~6% of non-playoff matches) ---
    let isRainAffected = false;
    if (!isPlayoff && Math.random() < 0.06) {
      isRainAffected = true;
      keyMoments.push({ text: `🌧️ RAIN! Match affected by rain delay!`, highlight: true });
    }

    // --- UPSET FACTOR: weaker team gets a morale boost ---
    // Compare squad strength loosely
    const teamAStrength = teamA.reduce((s, p) => s + (p.stats.batting + p.stats.bowling) / 2, 0);
    const teamBStrength = teamB.reduce((s, p) => s + (p.stats.batting + p.stats.bowling) / 2, 0);
    let underdogBoost = null;
    const strengthDiff = Math.abs(teamAStrength - teamBStrength);
    if (strengthDiff > 40 && Math.random() < 0.2) {
      // 20% chance underdog plays out of their skin
      underdogBoost = teamAStrength < teamBStrength ? teamAId : teamBId;
      const underdogName = TEAMS.find(t => t.id === underdogBoost).shortName;
      keyMoments.push({ text: `💪 ${underdogName} are fired up today! Underdogs are playing with passion!`, highlight: true });
    }

    // Simulate innings
    const innings1 = simulateInnings(
      battingFirst === teamAId ? teamA : teamB,
      battingFirst === teamAId ? teamB : teamA,
      venue, weather, null, isPlayoff, false, underdogBoost, battingFirst
    );

    // Rain-reduced target (DLS-lite): if rain affected, reduce target slightly
    let adjustedTarget = innings1.totalRuns + 1;
    if (isRainAffected) {
      const reductionPct = 0.05 + Math.random() * 0.15; // 5-20% reduction
      adjustedTarget = Math.floor(innings1.totalRuns * (1 - reductionPct)) + 1;
      keyMoments.push({ text: `🌧️ Revised target: ${adjustedTarget} (DLS method)`, highlight: false });
    }

    const innings2 = simulateInnings(
      bowlingFirst === teamAId ? teamA : teamB,
      bowlingFirst === teamAId ? teamB : teamA,
      venue, weather, adjustedTarget, isPlayoff, weather.dewFactor > 0, underdogBoost, bowlingFirst
    );

    // Determine winner
    let winner, margin;
    keyMoments.push(...innings1.keyMoments, ...innings2.keyMoments);

    if (innings2.totalRuns >= adjustedTarget) {
      winner = bowlingFirst;
      margin = `${10 - innings2.wickets} wickets`;
      const balls = innings2.ballsBowled;
      const oversLeft = ((120 - balls) / 6).toFixed(1);
      margin += ` (${oversLeft} overs left)`;
      keyMoments.push({ text: `${TEAMS.find(t=>t.id===winner).shortName} win by ${margin}!`, highlight: true });
    } else if (innings2.totalRuns < innings1.totalRuns) {
      winner = battingFirst;
      margin = isRainAffected ? `${adjustedTarget - 1 - innings2.totalRuns} runs (DLS)` : `${innings1.totalRuns - innings2.totalRuns} runs`;
      keyMoments.push({ text: `${TEAMS.find(t=>t.id===winner).shortName} win by ${margin}!`, highlight: true });
    } else {
      // Tie → Super Over: simulate mini-innings instead of coin flip
      keyMoments.push({ text: `🔥 IT'S A TIE! SUPER OVER TIME!`, highlight: true });
      const soA = simulateSuperOver(battingFirst === teamAId ? teamA : teamB, bowlingFirst === teamAId ? teamB : teamA);
      const soB = simulateSuperOver(bowlingFirst === teamAId ? teamA : teamB, battingFirst === teamAId ? teamB : teamA);
      keyMoments.push({ text: `Super Over: ${teamAName} ${battingFirst === teamAId ? soA : soB}/${battingFirst === teamAId ? '?' : '?'} vs ${teamBName} ${battingFirst === teamBId ? soA : soB}`, highlight: false });
      if (soA > soB) {
        winner = battingFirst;
      } else if (soB > soA) {
        winner = bowlingFirst;
      } else {
        // Even super over tied - boundary count or coin toss
        winner = Math.random() > 0.5 ? teamAId : teamBId;
        keyMoments.push({ text: `EVEN THE SUPER OVER IS TIED! ${TEAMS.find(t=>t.id===winner).shortName} win on boundary count!`, highlight: true });
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
      playing11A: teamA, playing11B: teamB
    };
  }

  function selectPlaying11(teamId) {
    const ts = tournament.teamStates[teamId];
    const squad = ts.squad.map(s => s.player);

    // Filter out injured
    const available = squad.filter(p => {
      const form = tournament.playerForms[p.id];
      return !form || !form.isInjured;
    });

    // Must pick max 4 overseas
    const indians = available.filter(p => !p.isOverseas);
    const overseas = available.filter(p => p.isOverseas);

    // Sort by composite rating
    const ratePlayer = (p) => {
      const form = tournament.playerForms[p.id];
      const formMod = form ? form.currentForm / 70 : 1;
      const primary = p.role === 'bowler' ? p.stats.bowling : p.role === 'allRounder' ? (p.stats.batting + p.stats.bowling) / 2 : p.stats.batting;
      return primary * formMod;
    };

    overseas.sort((a, b) => ratePlayer(b) - ratePlayer(a));
    indians.sort((a, b) => ratePlayer(b) - ratePlayer(a));

    const selected = [];
    const overseasPick = overseas.slice(0, 4);
    selected.push(...overseasPick);

    // Fill remaining 7 with best Indians, ensuring role balance
    let remaining = 11 - selected.length;
    const indianPool = [...indians];

    // Ensure at least 1 WK
    const hasWK = selected.some(p => p.role === 'wicketkeeper');
    if (!hasWK) {
      const wk = indianPool.find(p => p.role === 'wicketkeeper');
      if (wk) {
        selected.push(wk);
        indianPool.splice(indianPool.indexOf(wk), 1);
        remaining--;
      }
    }

    // Fill rest by rating
    for (let i = 0; i < remaining && indianPool.length > 0; i++) {
      selected.push(indianPool.shift());
    }

    // If still < 11, add any available
    while (selected.length < 11 && available.length > selected.length) {
      const remaining2 = available.filter(p => !selected.includes(p));
      if (remaining2.length > 0) selected.push(remaining2[0]);
      else break;
    }

    return selected;
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

    // Init batting order
    const batters = [...battingTeam];
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

    for (let over = 0; over < 20; over++) {
      if (wickets >= 10) break;

      // Select bowler (can't bowl consecutive, max 4 overs)
      const availBowlers = bowlerStats.filter(b => b.overs < 4);
      if (availBowlers.length === 0) break;
      const bowler = availBowlers[Math.floor(Math.random() * availBowlers.length)];

      let overRuns = 0, overWickets = 0;

      // Phase detection
      const phase = over < 6 ? 'powerplay' : over < 15 ? 'middle' : 'death';

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
        keyMoments.push({ text: `Target chased! ${totalRuns}/${wickets} in ${(ballsBowled/6).toFixed(1)} overs`, highlight: true });
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

    // Base rates by phase
    let wicketProb, dotProb, singleProb, twoProb, fourProb, sixProb;
    if (phase === 'powerplay') {
      wicketProb = 0.04; dotProb = 0.28; singleProb = 0.30; twoProb = 0.12; fourProb = 0.18; sixProb = 0.08;
    } else if (phase === 'middle') {
      wicketProb = 0.05; dotProb = 0.35; singleProb = 0.30; twoProb = 0.12; fourProb = 0.12; sixProb = 0.06;
    } else { // death
      wicketProb = 0.06; dotProb = 0.22; singleProb = 0.25; twoProb = 0.10; fourProb = 0.20; sixProb = 0.17;
    }

    // Batter skill modifier
    const batRating = batter.stats.batting / 70;
    fourProb *= batRating * formMod;
    sixProb *= batRating * formMod;
    singleProb *= (0.8 + batRating * 0.3);

    // Bowler skill modifier
    const bowlRating = bowler.stats.bowling / 70;
    wicketProb *= bowlRating * bowlerFormMod;
    dotProb *= (0.7 + bowlRating * 0.4);

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

    // Consistency modifier - inconsistent batters have more variance
    if (batter.stats.consistency < 60) {
      if (Math.random() > 0.5) {
        fourProb *= 1.3; sixProb *= 1.3;
      } else {
        wicketProb *= 1.4;
      }
    }

    // Underdog boost: batting team plays above their level
    if (isUnderdog) {
      fourProb *= 1.15;
      sixProb *= 1.1;
      wicketProb *= 0.85;
    }

    // Momentum: collapse (recent wickets make next batter nervous)
    if (recentWickets >= 2) {
      wicketProb *= (1 + recentWickets * 0.12);
      dotProb *= 1.15;
      fourProb *= 0.8;
    }

    // Momentum: hot streak (recent boundaries = batter is timing everything)
    if (recentBoundaries >= 3) {
      fourProb *= 1.2;
      sixProb *= 1.15;
      wicketProb *= 0.85;
    }

    // --- UNPREDICTABILITY FACTORS ---

    // 1. Magic ball / unplayable delivery (~2% chance)
    if (Math.random() < 0.02) {
      wicketProb *= 3.0; // almost certain wicket
      dotProb *= 1.5;
      fourProb *= 0.2;
      sixProb *= 0.1;
    }

    // 2. Dropped catch / missed stumping (~3% - reduces effective wicket prob)
    if (Math.random() < 0.03) {
      wicketProb *= 0.15; // should have been out but wasn't
    }

    // 3. Batter "in the zone" hot streak (~4% per ball)
    if (form && form.currentForm > 70 && Math.random() < 0.04) {
      fourProb *= 1.8;
      sixProb *= 2.0;
      wicketProb *= 0.4;
    }

    // 4. Last-over thriller: final over of chase, everything is amplified
    if (target && over === 19) {
      const needed = target - currentScore;
      if (needed > 0 && needed <= 20) {
        sixProb *= 1.5;
        fourProb *= 1.3;
        wicketProb *= 1.2;
      }
    }

    // 6. Random variance injection: slight chaos on every ball
    const chaosRoll = Math.random();
    if (chaosRoll < 0.03) {
      // Freak boundary (misfield, edge through slips, overthrow)
      fourProb *= 2.0;
    } else if (chaosRoll < 0.06) {
      // Dot ball pressure cluster
      dotProb *= 1.5;
      wicketProb *= 1.15;
    }

    // 7. Underdog factor: weaker batter occasionally plays innings of their life
    if (batter.stats.batting < 55 && Math.random() < 0.06) {
      fourProb *= 1.6;
      sixProb *= 1.4;
      wicketProb *= 0.6;
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
      const injuryProb = (100 - p.stats.fitness) / 1200;
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
    getTopPerformers, VENUES
  };
})();
