// ===== MAIN APP CONTROLLER =====
window.App = (function() {
  let currentScreen = 'home';
  let teamOwnership = {}; // teamId -> { type: 'ai' | 'human', playerNum: number, name: string }
  let humanPlayerCount = 0;
  let activeHumanTeams = []; // which humans are being prompted
  let currentHumanIdx = 0;
  let auctionViewTeam = null; // which team's squad is shown

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) { el.classList.add('active'); el.style.display = 'block'; }
    document.querySelectorAll('.screen:not(.active)').forEach(s => s.style.display = 'none');
    currentScreen = id;

    if (id === 'team-select') renderTeamSelect();
  }

  // ===== TEAM SELECTION =====
  function renderTeamSelect() {
    const grid = document.getElementById('team-select-grid');
    grid.innerHTML = '';

    TEAMS.forEach(team => {
      const ownership = teamOwnership[team.id] || { type: 'ai', playerNum: 0 };
      const card = document.createElement('div');
      card.className = 'team-select-card' + (ownership.type === 'human' ? ' selected' : '');
      card.style.borderColor = ownership.type === 'human' ? team.colors.primary : '#2a2a3e';
      card.innerHTML = `
        <div class="team-emoji">${team.emoji}</div>
        <div class="team-name" style="color:${team.colors.primary}">${team.name}</div>
        <div class="team-city">${team.city}</div>
        <div class="owner-badge" style="background:${ownership.type === 'human' ? team.colors.primary : '#333'}; color:${ownership.type === 'human' ? '#fff' : '#aaa'}">
          ${ownership.type === 'ai' ? '🤖 AI' : '🎮 P' + ownership.playerNum}
        </div>
      `;
      card.onclick = () => cycleOwnership(team.id);
      grid.appendChild(card);
    });

    renderHumanPlayerList();
    updateStartButton();
  }

  function cycleOwnership(teamId) {
    const current = teamOwnership[teamId] || { type: 'ai', playerNum: 0 };
    if (current.type === 'ai') {
      humanPlayerCount++;
      teamOwnership[teamId] = { type: 'human', playerNum: humanPlayerCount, name: 'Player ' + humanPlayerCount };
    } else {
      // Remove this human, renumber remaining
      const removedNum = current.playerNum;
      delete teamOwnership[teamId];
      // Renumber
      humanPlayerCount = 0;
      Object.keys(teamOwnership).forEach(id => {
        if (teamOwnership[id].type === 'human') {
          humanPlayerCount++;
          teamOwnership[id].playerNum = humanPlayerCount;
          if (!teamOwnership[id].name || teamOwnership[id].name.startsWith('Player')) {
            teamOwnership[id].name = 'Player ' + humanPlayerCount;
          }
        }
      });
    }
    renderTeamSelect();
  }

  function renderHumanPlayerList() {
    const list = document.getElementById('human-player-list');
    const humans = Object.entries(teamOwnership).filter(([, o]) => o.type === 'human');
    if (humans.length === 0) {
      list.innerHTML = '<p style="color:var(--text-dim)">Click on teams to assign human players</p>';
      return;
    }

    list.innerHTML = humans.map(([teamId, o]) => {
      const team = TEAMS.find(t => t.id === teamId);
      return `<div class="human-chip" style="border:2px solid ${team.colors.primary}">
        <span style="color:${team.colors.primary}">${team.emoji} ${team.shortName}</span>
        <input type="text" value="${o.name}" onchange="App.renamePlayer('${teamId}', this.value)" placeholder="Player name">
      </div>`;
    }).join('');
  }

  function renamePlayer(teamId, name) {
    if (teamOwnership[teamId]) teamOwnership[teamId].name = name;
  }

  function updateStartButton() {
    const btn = document.getElementById('btn-start-auction');
    const hasHuman = Object.values(teamOwnership).some(o => o.type === 'human');
    btn.disabled = !hasHuman;
  }

  // ===== AUCTION =====
  function startAuction() {
    const humanTeams = {};
    Object.entries(teamOwnership).forEach(([teamId, o]) => {
      if (o.type === 'human') humanTeams[teamId] = o.name;
    });

    AuctionEngine.init(humanTeams);

    // Set first human team as default view
    auctionViewTeam = Object.keys(humanTeams)[0] || TEAMS[0].id;

    // Wire up callbacks
    AuctionEngine.on('newPlayer', renderAuctionPlayer);
    AuctionEngine.on('bid', onBid);
    AuctionEngine.on('sold', onSold);
    AuctionEngine.on('unsold', onUnsold);
    AuctionEngine.on('log', addAuctionLog);
    AuctionEngine.on('humanTurn', onHumanTurn);
    AuctionEngine.on('timerUpdate', onTimerUpdate);
    AuctionEngine.on('auctionEnd', onAuctionEnd);

    document.getElementById('auction-total-players').textContent = AuctionEngine.getState().playerPool.length;
    renderTeamBudgetBar();
    renderSquadTabs();
    showScreen('auction');

    // Start auction
    setTimeout(() => AuctionEngine.nextPlayer(), 1000);
  }

  function renderAuctionPlayer(player) {
    const state = AuctionEngine.getState();
    document.getElementById('auction-player-num').textContent = state.currentIndex + 1;
    document.getElementById('auction-phase').textContent = state.phase;

    document.getElementById('player-name').textContent = player.name;
    document.getElementById('player-flag').textContent = player.isOverseas ? '🌍 OVERSEAS' : '🇮🇳 INDIA';
    document.getElementById('player-nationality').textContent = player.nationality;
    document.getElementById('player-age').textContent = 'Age ' + player.age;
    document.getElementById('player-base-price').textContent = AuctionEngine.formatPrice(player.basePrice);

    const roleBadge = document.getElementById('player-role');
    roleBadge.textContent = player.role.replace('allR', 'All-R').replace('wicketkeeper', 'WK-Batter');
    roleBadge.className = 'role-badge role-' + player.role;

    // Stats
    const statsGrid = document.getElementById('player-stats-grid');
    const stats = [];
    if (player.stats.batting > 10) stats.push(['BAT', player.stats.batting]);
    if (player.stats.bowling > 10) stats.push(['BOWL', player.stats.bowling]);
    stats.push(['FLD', player.stats.fielding]);
    stats.push(['FIT', player.stats.fitness]);
    if (player.subRole) stats.push(['TYPE', player.subRole.replace('-', ' ')]);
    stats.push(['⭐', player.starPower]);

    statsGrid.innerHTML = stats.map(([l, v]) => `
      <div class="stat-item"><span class="stat-label">${l}</span> <span class="stat-val">${v}</span></div>
    `).join('');

    // Team history
    const history = document.getElementById('player-history');
    if (player.teamHistory.length > 0) {
      history.innerHTML = 'Former: ' + player.teamHistory.map(id => {
        const t = TEAMS.find(t => t.id === id);
        return t ? `<span style="color:${t.colors.primary}">${t.shortName}</span>` : id;
      }).join(', ');
    } else {
      history.innerHTML = '<span style="color:var(--text-dim)">IPL Uncapped</span>';
    }

    // Reset bid display
    document.getElementById('bid-amount').textContent = AuctionEngine.formatPrice(player.basePrice);
    document.getElementById('bid-team').textContent = 'No bids yet';
    document.getElementById('bid-team').style.color = 'var(--text-dim)';

    // Hide sold overlay
    document.getElementById('sold-overlay').classList.remove('show');

    // Show bid controls immediately — always visible during bidding
    showBidControlsForAllHumans();

    // Re-animate player card
    const card = document.getElementById('player-card');
    card.style.animation = 'none';
    card.offsetHeight; // trigger reflow
    card.style.animation = 'slideIn 0.4s ease';
  }

  function onBid(teamId, amount) {
    const team = TEAMS.find(t => t.id === teamId);
    const el = document.getElementById('bid-amount');
    el.textContent = AuctionEngine.formatPrice(amount);
    el.classList.remove('pulse');
    el.offsetHeight;
    el.classList.add('pulse');

    const teamEl = document.getElementById('bid-team');
    teamEl.textContent = team.name;
    teamEl.style.color = team.colors.primary;

    renderTeamBudgetBar();
    renderSquadContent();
    showBidControlsForAllHumans(); // refresh bid button amount and state
  }

  function onSold(player, teamId, price) {
    const team = TEAMS.find(t => t.id === teamId);
    const overlay = document.getElementById('sold-overlay');
    const text = document.getElementById('sold-text');
    text.textContent = `SOLD to ${team.shortName}!`;
    text.className = 'sold-text sold';
    text.style.color = team.colors.primary;
    overlay.classList.add('show');

    document.getElementById('bid-controls').classList.add('hidden');
    renderTeamBudgetBar();
    renderSquadContent();
  }

  function onUnsold(player) {
    const overlay = document.getElementById('sold-overlay');
    const text = document.getElementById('sold-text');
    text.textContent = 'UNSOLD';
    text.className = 'sold-text unsold';
    overlay.classList.add('show');
    document.getElementById('bid-controls').classList.add('hidden');
  }

  function onHumanTurn(humanTeamIds) {
    activeHumanTeams = humanTeamIds;
    currentHumanIdx = 0;
    showBidControlsForAllHumans();
  }

  // Always-visible bid controls — shows buttons for all active human teams
  function showBidControlsForAllHumans() {
    const state = AuctionEngine.getState();
    if (!state || !state.currentPlayer || !state.isActive) {
      document.getElementById('bid-controls').classList.add('hidden');
      return;
    }

    const player = state.currentPlayer;
    const controls = document.getElementById('bid-controls');
    controls.classList.remove('hidden');

    // Build buttons for each human team
    const humanIds = Object.keys(teamOwnership).filter(id => teamOwnership[id].type === 'human');
    const nextBid = state.currentBid + AuctionEngine.getIncrement(state.currentBid);

    // Show which team(s) can bid
    let label = '';
    let buttonsHtml = '';
    const helper = document.getElementById('bid-helper');

    if (humanIds.length === 1) {
      // Single human player — simple view
      const teamId = humanIds[0];
      const team = TEAMS.find(t => t.id === teamId);
      const ts = AuctionEngine.getTeamData(teamId);
      const ownerName = teamOwnership[teamId] ? teamOwnership[teamId].name : team.shortName;
      const canBid = AuctionEngine.canAfford(teamId, nextBid) && AuctionEngine.canBuyPlayer(teamId, player)
                     && teamId !== state.currentBidder && !ts.passed;

      document.getElementById('active-bidder-label').innerHTML =
        `<span style="color:${team.colors.primary}">${team.emoji} ${ownerName} (${team.shortName})</span>`;

      const bidBtn = document.getElementById('btn-bid');
      const bidAmountSpan = document.getElementById('btn-bid-amount');
      bidAmountSpan.textContent = AuctionEngine.formatPrice(nextBid);
      bidBtn.disabled = !canBid;
      bidBtn.style.display = '';
      document.getElementById('btn-pass').style.display = '';
      document.getElementById('btn-pass').disabled = ts.passed || teamId === state.currentBidder;

      const need = Math.max(0, 18 - ts.filled);
      const needTag = need > 0 ? ` | Need ${need} more (min 18)` : '';
      if (teamId === state.currentBidder) {
        helper.textContent = `✅ You are the highest bidder! | ${ts.filled}/25 players${needTag}`;
      } else if (ts.passed) {
        helper.textContent = `You passed on this player | ${ts.filled}/25${needTag}`;
      } else if (!canBid) {
        if (player.isOverseas && ts.overseasCount >= 8) helper.textContent = '⚠️ Overseas slots full (8/8)';
        else if (ts.filled >= 25) helper.textContent = '⚠️ Squad full (25/25 max)';
        else helper.textContent = '⚠️ Cannot afford — need reserve for remaining slots (min 18)';
      } else {
        helper.textContent = `Budget after: ${AuctionEngine.formatPrice(ts.budget - nextBid)} | ${ts.filled}/25 players${needTag}`;
      }

      activeHumanTeams = [teamId];
      currentHumanIdx = 0;
    } else {
      // Multi-human — show all teams' buttons
      document.getElementById('active-bidder-label').innerHTML = 'Your Teams:';
      document.getElementById('btn-bid').style.display = 'none';
      document.getElementById('btn-pass').style.display = 'none';

      let multiHtml = '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:8px">';
      humanIds.forEach(teamId => {
        const team = TEAMS.find(t => t.id === teamId);
        const ts = AuctionEngine.getTeamData(teamId);
        const canBid = AuctionEngine.canAfford(teamId, nextBid) && AuctionEngine.canBuyPlayer(teamId, player)
                       && teamId !== state.currentBidder && !ts.passed;
        const isLeading = teamId === state.currentBidder;

        multiHtml += `<div style="text-align:center">
          <div style="font-size:11px;color:${team.colors.primary};font-weight:700">${team.emoji} ${team.shortName}</div>
          ${isLeading ? '<div style="font-size:10px;color:var(--green)">Leading!</div>' :
            ts.passed ? '<div style="font-size:10px;color:var(--text-dim)">Passed</div>' :
            `<button class="btn btn-bid" style="font-size:12px;padding:6px 12px;min-width:auto" onclick="App.placeBidFor('${teamId}')" ${canBid ? '' : 'disabled'}>BID ${AuctionEngine.formatPrice(nextBid)}</button>
             <button class="btn btn-pass" style="font-size:11px;padding:4px 10px" onclick="App.passBidFor('${teamId}')">PASS</button>`}
        </div>`;
      });
      multiHtml += '</div>';
      helper.innerHTML = multiHtml;
    }
  }

  function placeBid() {
    if (activeHumanTeams.length === 0) return;
    const teamId = activeHumanTeams[currentHumanIdx];
    placeBidFor(teamId);
  }

  function placeBidFor(teamId) {
    AuctionEngine.humanBid(teamId);
    // Controls stay visible — will be refreshed by onBid callback
  }

  function passBid() {
    if (activeHumanTeams.length === 0) return;
    const teamId = activeHumanTeams[currentHumanIdx];
    passBidFor(teamId);
  }

  function passBidFor(teamId) {
    AuctionEngine.humanPass(teamId);
    showBidControlsForAllHumans(); // refresh controls
  }

  function onTimerUpdate(remaining) {
    const bar = document.getElementById('bid-timer-bar');
    bar.style.width = (remaining * 100) + '%';
    bar.className = 'bid-timer-bar' + (remaining < 0.3 ? ' urgent' : '');
  }

  function addAuctionLog(msg, type) {
    const log = document.getElementById('auction-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry' + (type === 'dramatic' ? ' dramatic' : type === 'sold' ? ' sold-log' : type === 'unsold' ? ' unsold-log' : '');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    entry.innerHTML = `<span class="log-time">${time}</span>${msg}`;
    log.insertBefore(entry, log.firstChild);
  }

  function renderTeamBudgetBar() {
    const bar = document.getElementById('teams-budget-bar');
    const states = AuctionEngine.getAllTeamStates();
    bar.innerHTML = TEAMS.map(team => {
      const ts = states[team.id];
      if (!ts) return '';
      const pct = (ts.budget / 12500 * 100).toFixed(0);
      const slotColor = ts.filled < 18 ? '#f44336' : ts.filled >= 25 ? '#888' : '#4CAF50';
      return `<div class="team-budget-chip" style="background:${team.colors.bg || team.colors.primary}22; border-color:${team.colors.primary}">
        <div class="chip-name">${team.emoji} ${team.shortName}${ts.isHuman ? ' 🎮' : ''}</div>
        <div class="chip-budget">${AuctionEngine.formatPrice(ts.budget)}</div>
        <div class="chip-slots" style="color:${slotColor}">${ts.filled}/25 ${ts.filled < 18 ? '(need '+(18-ts.filled)+')' : ts.filled >= 25 ? 'FULL' : ''}</div>
      </div>`;
    }).join('');
  }

  function renderSquadTabs() {
    const tabs = document.getElementById('squad-tabs');
    tabs.innerHTML = TEAMS.map(team => {
      const isActive = team.id === auctionViewTeam;
      return `<div class="squad-tab${isActive ? ' active' : ''}" style="color:${team.colors.primary}" onclick="App.viewSquad('${team.id}')">${team.shortName}</div>`;
    }).join('');
  }

  function viewSquad(teamId) {
    auctionViewTeam = teamId;
    renderSquadTabs();
    renderSquadContent();
  }

  function renderSquadContent() {
    const content = document.getElementById('squad-content');
    const ts = AuctionEngine.getTeamData(auctionViewTeam);
    if (!ts) { content.innerHTML = ''; return; }

    const team = TEAMS.find(t => t.id === auctionViewTeam);
    const slotsColor = ts.filled < 18 ? 'var(--red)' : ts.filled >= 25 ? 'var(--text-dim)' : 'var(--green)';
    const needMore = Math.max(0, 18 - ts.filled);
    const slotsLabel = needMore > 0 ? `Need ${needMore} more` : ts.filled >= 25 ? 'FULL' : `${25 - ts.filled} slots left`;
    let html = `<div class="squad-summary">
      <div class="summary-item"><span class="stat-label">Budget</span> <span class="summary-val">${AuctionEngine.formatPrice(ts.budget)}</span></div>
      <div class="summary-item"><span class="stat-label">Players</span> <span class="summary-val" style="color:${slotsColor}">${ts.filled}/25 <small>(min 18)</small></span></div>
      <div class="summary-item"><span class="stat-label">Overseas</span> <span class="summary-val">${ts.overseasCount}/8</span></div>
      <div class="summary-item"><span class="stat-label">BAT/BOWL/AR/WK</span> <span class="summary-val">${ts.roleCount.batter}/${ts.roleCount.bowler}/${ts.roleCount.allRounder}/${ts.roleCount.wicketkeeper}</span></div>
    </div>
    <div style="text-align:center;font-size:12px;color:${slotsColor};margin-bottom:8px">${slotsLabel}</div>`;

    if (ts.squad.length === 0) {
      html += '<p style="text-align:center;color:var(--text-dim)">No players yet</p>';
    } else {
      ts.squad.forEach(({ player, price }) => {
        html += `<div class="squad-player-row${player.isOverseas ? ' overseas' : ''}">
          <span>${player.name} <small style="color:var(--text-dim)">(${player.role.substring(0,3).toUpperCase()})</small></span>
          <span style="color:var(--gold)">${AuctionEngine.formatPrice(price)}</span>
        </div>`;
      });
    }

    content.innerHTML = html;
    renderSquadTabs();
  }

  function onAuctionEnd() {
    addAuctionLog('🏁 AUCTION COMPLETE! All players have been auctioned.', 'dramatic');
    document.getElementById('bid-controls').classList.add('hidden');

    setTimeout(() => {
      showScreen('squad-review');
      renderSquadReview();
    }, 3000);
  }

  // ===== SQUAD REVIEW =====
  function renderSquadReview() {
    const states = AuctionEngine.getAllTeamStates();
    const tabs = document.getElementById('review-tabs');
    const firstTeam = Object.keys(teamOwnership)[0] || TEAMS[0].id;

    tabs.innerHTML = TEAMS.map(team => {
      const ts = states[team.id];
      return `<div class="review-tab" style="color:${team.colors.primary}" data-team="${team.id}" onclick="App.showReviewTeam('${team.id}')">${team.emoji} ${team.shortName} (${ts.filled})</div>`;
    }).join('');

    showReviewTeam(firstTeam);
  }

  function showReviewTeam(teamId) {
    document.querySelectorAll('.review-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.review-tab[data-team="${teamId}"]`)?.classList.add('active');

    const states = AuctionEngine.getAllTeamStates();
    const ts = states[teamId];
    const team = TEAMS.find(t => t.id === teamId);
    const content = document.getElementById('review-content');

    let html = `<h3 style="color:${team.colors.primary};text-align:center;margin-bottom:12px">${team.emoji} ${team.name}</h3>`;
    html += `<div class="review-squad-summary">
      <div class="review-summary-chip">💰 Spent: ${AuctionEngine.formatPrice(12500 - ts.budget)}</div>
      <div class="review-summary-chip">🏦 Remaining: ${AuctionEngine.formatPrice(ts.budget)}</div>
      <div class="review-summary-chip" style="color:${ts.filled < 18 ? '#f44336' : '#4CAF50'}">👤 Players: ${ts.filled}/25 ${ts.filled < 18 ? '(UNDER MIN 18!)' : '(min 18)'}</div>
      <div class="review-summary-chip">🌍 Overseas: ${ts.overseasCount}</div>
    </div>`;

    html += '<div class="review-squad-grid">';
    ts.squad.forEach(({ player, price }) => {
      html += `<div class="review-player-card${player.isOverseas ? ' overseas' : ''}">
        <div class="review-player-name">${player.name}</div>
        <div class="review-player-role">${player.role} • ${player.subRole || ''} ${player.isOverseas ? '🌍' : '🇮🇳'}</div>
        <div class="review-player-price">${AuctionEngine.formatPrice(price)}</div>
      </div>`;
    });
    html += '</div>';

    content.innerHTML = html;
  }

  // ===== TOURNAMENT =====
  function startTournament() {
    const states = AuctionEngine.getAllTeamStates();
    SimulationEngine.init(states);
    showScreen('tournament');
    renderPointsTable();
  }

  function simNext() {
    const state = SimulationEngine.getState();
    if (SimulationEngine.isLeagueComplete()) {
      // Check if playoffs started
      if (!state.playoffs) {
        SimulationEngine.setupPlayoffs();
        renderPlayoffs();
        return;
      }
      // Simulate next playoff
      simNextPlayoff();
      return;
    }

    const result = SimulationEngine.simulateNextMatch();
    if (result) {
      renderMatchResult(result);
      renderPointsTable();
      document.getElementById('match-counter').textContent =
        `Match ${state.currentMatch} of ${state.schedule.length}`;
    }
  }

  function simFive() {
    for (let i = 0; i < 5; i++) {
      if (SimulationEngine.isLeagueComplete()) break;
      SimulationEngine.simulateNextMatch();
    }
    const state = SimulationEngine.getState();
    const last = state.completedMatches[state.completedMatches.length - 1];
    if (last) renderMatchResult(last);
    renderPointsTable();
    document.getElementById('match-counter').textContent =
      `Match ${state.currentMatch} of ${state.schedule.length}`;

    if (SimulationEngine.isLeagueComplete()) {
      document.getElementById('btn-sim-all').textContent = 'Start Playoffs';
    }
  }

  function simAll() {
    const state = SimulationEngine.getState();
    if (SimulationEngine.isLeagueComplete()) {
      if (!state.playoffs) {
        SimulationEngine.setupPlayoffs();
        renderPlayoffs();
      }
      return;
    }

    while (!SimulationEngine.isLeagueComplete()) {
      SimulationEngine.simulateNextMatch();
    }
    const last = state.completedMatches[state.completedMatches.length - 1];
    if (last) renderMatchResult(last);
    renderPointsTable();
    document.getElementById('match-counter').textContent =
      `Match ${state.currentMatch} of ${state.schedule.length}`;
    document.getElementById('btn-sim-all').textContent = 'Start Playoffs';
  }

  function renderPointsTable() {
    const standings = SimulationEngine.getSortedStandings();
    const tbody = document.getElementById('points-tbody');
    tbody.innerHTML = standings.map((s, i) => {
      const team = TEAMS.find(t => t.id === s.id);
      const ts = AuctionEngine.getTeamData(s.id);
      const isHuman = ts && ts.isHuman;
      return `<tr style="${i < 4 ? 'background:#1a2e1a' : ''}">
        <td>${i + 1}</td>
        <td><div class="team-cell"><span class="team-dot" style="background:${team.colors.primary}"></span>${team.emoji} ${team.shortName}${isHuman ? ' 🎮' : ''}</div></td>
        <td>${s.played}</td>
        <td>${s.won}</td>
        <td>${s.lost}</td>
        <td>${s.nrr >= 0 ? '+' : ''}${s.nrr.toFixed(3)}</td>
        <td style="font-weight:700;color:var(--gold)">${s.points}</td>
      </tr>`;
    }).join('');
  }

  function renderMatchResult(result) {
    const center = document.getElementById('match-center');
    const teamA = TEAMS.find(t => t.id === result.teamA);
    const teamB = TEAMS.find(t => t.id === result.teamB);
    const winnerTeam = TEAMS.find(t => t.id === result.winner);
    const battingFirstTeam = TEAMS.find(t => t.id === result.battingFirst);
    const bowlingFirstTeam = TEAMS.find(t => t.id === result.bowlingFirst);

    let html = `<div class="match-result-card">
      <div class="match-teams-row">
        <span style="color:${teamA.colors.primary}">${teamA.emoji} ${teamA.shortName}</span>
        <span class="match-vs">vs</span>
        <span style="color:${teamB.colors.primary}">${teamB.emoji} ${teamB.shortName}</span>
      </div>
      <div class="match-venue">📍 ${result.venue.name}, ${result.venue.city}</div>
      <div class="match-conditions">
        <span class="condition-badge">🏟️ ${result.venue.pitchType} pitch</span>
        <span class="condition-badge">${result.weather.label}</span>
        <span class="condition-badge">🪙 ${TEAMS.find(t=>t.id===result.tossWinner).shortName} won toss, chose to ${result.tossDecision}</span>
      </div>

      <div class="match-score">
        <div>${battingFirstTeam.shortName}: <strong>${result.innings1.totalRuns}/${result.innings1.wickets}</strong> (${(result.innings1.ballsBowled/6).toFixed(1)} ov)</div>
        <div>${bowlingFirstTeam.shortName}: <strong>${result.innings2.totalRuns}/${result.innings2.wickets}</strong> (${(result.innings2.ballsBowled/6).toFixed(1)} ov)</div>
      </div>

      <div class="match-winner" style="color:${winnerTeam.colors.primary}">
        ${winnerTeam.emoji} ${winnerTeam.name} won by ${result.margin}
      </div>`;

    // Top performers
    const topBat1 = result.innings1.batting.sort((a,b) => b.runs - a.runs)[0];
    const topBat2 = result.innings2.batting.sort((a,b) => b.runs - a.runs)[0];
    const topBowl1 = result.innings1.bowling.sort((a,b) => b.wickets - a.wickets || a.runs - b.runs)[0];
    const topBowl2 = result.innings2.bowling.sort((a,b) => b.wickets - a.wickets || a.runs - b.runs)[0];

    html += '<div style="margin:10px 0;font-size:13px;">';
    if (topBat1) html += `<div>⭐ ${topBat1.player.name}: ${topBat1.runs}(${topBat1.balls}) [${topBat1.fours}x4, ${topBat1.sixes}x6]</div>`;
    if (topBat2) html += `<div>⭐ ${topBat2.player.name}: ${topBat2.runs}(${topBat2.balls}) [${topBat2.fours}x4, ${topBat2.sixes}x6]</div>`;
    if (topBowl1 && topBowl1.wickets > 0) html += `<div>🎯 ${topBowl1.player.name}: ${topBowl1.wickets}/${topBowl1.runs} (${topBowl1.overs} ov)</div>`;
    if (topBowl2 && topBowl2.wickets > 0) html += `<div>🎯 ${topBowl2.player.name}: ${topBowl2.wickets}/${topBowl2.runs} (${topBowl2.overs} ov)</div>`;
    html += '</div>';

    // Key moments
    if (result.keyMoments.length > 0) {
      html += '<div class="key-moments"><strong>Key Moments:</strong>';
      result.keyMoments.slice(-8).forEach(m => {
        html += `<div class="moment${m.highlight ? ' highlight' : ''}">${m.text}</div>`;
      });
      html += '</div>';
    }

    // Scorecard toggle
    html += `<details style="margin-top:10px"><summary style="cursor:pointer;color:var(--gold)">View Full Scorecard</summary>`;
    html += renderScorecard(result.innings1, battingFirstTeam.shortName);
    html += renderScorecard(result.innings2, bowlingFirstTeam.shortName);
    html += `</details>`;

    html += '</div>';
    center.innerHTML = html;
  }

  function renderScorecard(innings, teamName) {
    let html = `<div class="scorecard-section"><h4>${teamName} Innings: ${innings.totalRuns}/${innings.wickets} (${(innings.ballsBowled/6).toFixed(1)} ov)</h4>`;

    html += '<table class="scorecard-table"><thead><tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead><tbody>';
    innings.batting.forEach(b => {
      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
      html += `<tr><td>${b.player.name}<br><small style="color:var(--text-dim)">${b.howOut}</small></td><td><strong>${b.runs}</strong></td><td>${b.balls}</td><td>${b.fours}</td><td>${b.sixes}</td><td>${sr}</td></tr>`;
    });
    html += '</tbody></table>';

    html += '<table class="scorecard-table"><thead><tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Eco</th></tr></thead><tbody>';
    innings.bowling.forEach(b => {
      const eco = b.overs > 0 ? (b.runs / b.overs).toFixed(1) : '0.0';
      html += `<tr><td>${b.player.name}</td><td>${b.overs}</td><td>${b.maidens}</td><td>${b.runs}</td><td><strong>${b.wickets}</strong></td><td>${eco}</td></tr>`;
    });
    html += '</tbody></table></div>';

    return html;
  }

  // ===== PLAYOFFS =====
  let playoffOrder = ['q1', 'eliminator', 'q2', 'final'];
  let playoffIdx = 0;

  function renderPlayoffs() {
    const bracket = document.getElementById('playoffs-bracket');
    bracket.style.display = 'block';
    document.getElementById('match-title').textContent = 'Playoffs';
    document.getElementById('btn-sim-five').style.display = 'none';
    document.getElementById('btn-sim-all').style.display = 'none';
    document.getElementById('btn-sim-next').textContent = 'Simulate Next Playoff';
    playoffIdx = 0;
    updateBracketUI();
  }

  function simNextPlayoff() {
    if (playoffIdx >= playoffOrder.length) return;

    const key = playoffOrder[playoffIdx];
    const result = SimulationEngine.simulatePlayoffMatch(key);
    if (result) {
      renderMatchResult(result);
      playoffIdx++;
      updateBracketUI();

      const state = SimulationEngine.getState();
      if (state.champion) {
        setTimeout(() => showResult(), 3000);
      }
    }
  }

  function updateBracketUI() {
    const po = SimulationEngine.getState().playoffs;
    if (!po) return;

    const container = document.getElementById('bracket-container');
    const renderSlot = (key, label) => {
      const match = po[key];
      const teamA = match.teamA ? TEAMS.find(t => t.id === match.teamA) : null;
      const teamB = match.teamB ? TEAMS.find(t => t.id === match.teamB) : null;
      const winner = match.result ? match.result.winner : null;

      return `<div class="bracket-match">
        <h4>${label}</h4>
        <div class="bracket-team${winner === match.teamA ? ' winner' : ''}" style="color:${teamA ? teamA.colors.primary : '#555'}">
          ${teamA ? teamA.emoji + ' ' + teamA.shortName : 'TBD'}
          ${winner === match.teamA ? ' ✓' : ''}
        </div>
        <div style="color:var(--text-dim)">vs</div>
        <div class="bracket-team${winner === match.teamB ? ' winner' : ''}" style="color:${teamB ? teamB.colors.primary : '#555'}">
          ${teamB ? teamB.emoji + ' ' + teamB.shortName : 'TBD'}
          ${winner === match.teamB ? ' ✓' : ''}
        </div>
        ${match.result ? `<div style="font-size:11px;color:var(--text-dim);margin-top:4px">${match.result.margin}</div>` : ''}
      </div>`;
    };

    container.innerHTML = renderSlot('q1', 'Qualifier 1') +
      renderSlot('eliminator', 'Eliminator') +
      renderSlot('q2', 'Qualifier 2') +
      renderSlot('final', '🏆 FINAL');
  }

  // ===== RESULT =====
  function showResult() {
    const state = SimulationEngine.getState();
    const champion = TEAMS.find(t => t.id === state.champion);
    const performers = SimulationEngine.getTopPerformers();

    showScreen('result');
    const container = document.getElementById('result-container');

    let html = `<div class="trophy">🏆</div>
      <h1>IPL CHAMPION</h1>
      <div class="champion-name" style="color:${champion.colors.primary}">${champion.emoji} ${champion.name} ${champion.emoji}</div>`;

    // Awards
    html += '<div class="awards-section"><h3 style="color:var(--gold);margin-bottom:16px">Season Awards</h3>';

    if (performers.orangeCap) {
      html += `<div class="award-item"><span class="award-label">🧡 Orange Cap (Most Runs)</span><span class="award-value">${performers.orangeCap.player.name} — ${performers.orangeCap.runs} runs (SR ${performers.orangeCap.sr})</span></div>`;
    }
    if (performers.purpleCap) {
      html += `<div class="award-item"><span class="award-label">💜 Purple Cap (Most Wickets)</span><span class="award-value">${performers.purpleCap.player.name} — ${performers.purpleCap.wickets} wickets (Eco ${performers.purpleCap.eco})</span></div>`;
    }

    // Top 5 batsmen
    html += '<h4 style="margin-top:20px;color:var(--gold)">Top Run Scorers</h4>';
    performers.topBatsmen.slice(0, 5).forEach((b, i) => {
      html += `<div class="award-item"><span>${i + 1}. ${b.player.name}</span><span class="award-value">${b.runs} runs (${b.matches} matches)</span></div>`;
    });

    // Top 5 bowlers
    html += '<h4 style="margin-top:20px;color:var(--gold)">Top Wicket Takers</h4>';
    performers.topBowlers.slice(0, 5).forEach((b, i) => {
      html += `<div class="award-item"><span>${i + 1}. ${b.player.name}</span><span class="award-value">${b.wickets} wkts (Eco ${b.eco})</span></div>`;
    });

    // Hidden gems
    const gems = Object.entries(state.playerForms).filter(([id, f]) => f.hiddenGemActivated);
    if (gems.length > 0) {
      html += '<h4 style="margin-top:20px;color:var(--gold)">🌟 Breakout Stars</h4>';
      gems.forEach(([id, f]) => {
        const p = PLAYERS.find(p => p.id === id);
        if (p) {
          html += `<div class="award-item"><span>${p.name}</span><span class="award-value">${f.seasonRuns} runs / ${f.seasonWickets} wkts</span></div>`;
        }
      });
    }

    html += '</div>';
    container.innerHTML = html;
  }

  // ===== PAUSE SYSTEM =====
  let isPaused = false;

  function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById('btn-pause');

    if (isPaused) {
      AuctionEngine.pause();
      btn.textContent = '▶ RESUME';
      btn.classList.add('paused');
      // Show pause overlay
      const overlay = document.createElement('div');
      overlay.className = 'pause-overlay';
      overlay.id = 'pause-overlay';
      overlay.innerHTML = '<div><div class="pause-text">⏸ AUCTION PAUSED</div><div class="pause-sub">Click RESUME to continue</div></div>';
      overlay.onclick = () => togglePause();
      document.body.appendChild(overlay);
    } else {
      AuctionEngine.resume();
      btn.textContent = '⏸ PAUSE';
      btn.classList.remove('paused');
      const overlay = document.getElementById('pause-overlay');
      if (overlay) overlay.remove();
    }
  }

  return {
    showScreen, renamePlayer, startAuction, placeBid, passBid,
    placeBidFor, passBidFor, togglePause,
    viewSquad, showReviewTeam, startTournament,
    simNext, simFive, simAll
  };
})();
