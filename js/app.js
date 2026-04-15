// ===== MAIN APP CONTROLLER =====
window.App = (function() {
  let currentScreen = 'home';
  let teamOwnership = {}; // teamId -> { type: 'ai' | 'human', playerNum: number, name: string }
  let humanPlayerCount = 0;
  let activeHumanTeams = []; // which humans are being prompted
  let currentHumanIdx = 0;
  let auctionViewTeam = null; // which team's squad is shown

  // ===== OFFLINE SAVE/RESUME =====
  const SAVE_KEY = 'ipl_auction_save_v1';

  function buildSaveData(phase) {
    const states = AuctionEngine.getAllTeamStates();
    const simState = SimulationEngine && SimulationEngine.getState ? SimulationEngine.getState() : null;
    return {
      timestamp: Date.now(),
      phase: phase,
      teamStates: Object.fromEntries(Object.entries(states).map(([id, s]) => [id, {
        budget: s.budget,
        squad: s.squad,
        filled: s.filled,
        roleCount: s.roleCount,
        subRoleCount: s.subRoleCount,
        overseasCount: s.overseasCount,
        overseasByRole: s.overseasByRole,
        isHuman: s.isHuman,
        humanName: s.humanName
      }])),
      teamOwnership,
      userXISelections: window.userXISelections || {},
      tournament: simState ? {
        schedule: simState.schedule,
        currentMatch: simState.currentMatch,
        standings: simState.standings,
        playerForms: simState.playerForms,
        completedMatches: simState.completedMatches,
        playoffs: simState.playoffs,
        champion: simState.champion
      } : null
    };
  }

  async function saveGame(phase) {
    if (window.onlineMode) return; // online games saved via room state
    try {
      const save = buildSaveData(phase);
      // Always save locally as fallback
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
      // If logged in, also save to DB
      if (window.Auth && Auth.getUser()) {
        await Auth.saveGameToDB(save);
      }
      console.log('Game saved at phase:', phase);
    } catch (e) { console.error('Save failed:', e); }
  }

  async function loadSavedGame() {
    // If logged in, prefer DB save
    if (window.Auth && Auth.getUser()) {
      const dbSave = await Auth.loadGameFromDB();
      if (dbSave) return dbSave;
    }
    // Fallback to local
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function clearSavedGame() {
    localStorage.removeItem(SAVE_KEY);
    if (window.Auth && Auth.getUser()) {
      Auth.clearGameFromDB();
    }
  }

  async function checkForSavedGame() {
    const save = await loadSavedGame();
    const btn = document.getElementById('btn-resume-game');
    const info = document.getElementById('resume-info');
    if (save && btn) {
      btn.style.display = '';
      const date = new Date(save.timestamp).toLocaleString();
      const phaseLabel = {
        'squad_review': 'After auction',
        'xi_setup': 'Choosing XI',
        'tournament': 'Tournament in progress',
        'playoffs': 'Playoffs'
      }[save.phase] || save.phase;
      if (info) {
        info.style.display = '';
        const source = (window.Auth && Auth.getUser()) ? 'cloud' : 'local';
        info.innerHTML = `Saved: ${phaseLabel} — ${date} (${source})`;
      }
    } else if (btn) {
      btn.style.display = 'none';
      if (info) info.style.display = 'none';
    }
  }

  async function resumeOfflineGame() {
    const save = await loadSavedGame();
    if (!save) { alert('No saved game found'); return; }

    // Restore team ownership
    teamOwnership = save.teamOwnership || {};
    humanPlayerCount = Object.values(teamOwnership).filter(o => o.type === 'human').length;

    // Build humanTeams for AuctionEngine init
    const humanTeams = {};
    Object.entries(teamOwnership).forEach(([tid, o]) => {
      if (o.type === 'human') humanTeams[tid] = o.name;
    });

    // Re-init auction engine with saved data
    AuctionEngine.init(humanTeams);
    // Restore team states
    const states = AuctionEngine.getAllTeamStates();
    Object.entries(save.teamStates).forEach(([tid, saved]) => {
      Object.assign(states[tid], saved);
    });

    // Restore user XI
    window.userXISelections = save.userXISelections || {};

    // Restore simulation if present
    if (save.tournament && window.SimulationEngine) {
      SimulationEngine.init(states);
      const simState = SimulationEngine.getState();
      Object.assign(simState, save.tournament);
    }

    // Jump to the right screen
    if (save.phase === 'squad_review') {
      showScreen('squad-review');
      renderSquadReview();
    } else if (save.phase === 'xi_setup') {
      showPlayingXISetup();
    } else if (save.phase === 'tournament' || save.phase === 'playoffs') {
      showScreen('tournament');
      renderPointsTable();
    }
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) { el.classList.add('active'); el.style.display = 'block'; }
    document.querySelectorAll('.screen:not(.active)').forEach(s => s.style.display = 'none');
    currentScreen = id;

    if (id === 'team-select') renderTeamSelect();
    if (id === 'lobby' && typeof loadActiveRooms === 'function') loadActiveRooms();
    if (id === 'home') {
      // Show "Play Online" only if logged in
      const onlineBtn = document.getElementById('btn-play-online');
      if (onlineBtn) onlineBtn.style.display = Auth.getUser() ? '' : 'none';
      // Check for saved game
      checkForSavedGame();
    }
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
    startAuctionWithTeams(humanTeams);
  }

  // Called from both offline (team-select screen) and online (room) modes
  // myTeamId: in online mode, the team controlled by THIS user
  // clientOnly: true for non-host online players (don't run engine, just set up UI)
  function startAuctionWithTeams(humanTeams, myTeamId, clientOnly) {
    window.myOnlineTeamId = myTeamId || null;
    // Also update teamOwnership for UI consistency
    Object.entries(humanTeams).forEach(([teamId, name]) => {
      teamOwnership[teamId] = { type: 'human', playerNum: Object.keys(teamOwnership).filter(k => teamOwnership[k].type === 'human').length + 1, name };
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

    // Log which teams are human vs AI
    const states = AuctionEngine.getAllTeamStates();
    const humanList = TEAMS.filter(t => states[t.id]?.isHuman).map(t => t.shortName);
    const aiList = TEAMS.filter(t => !states[t.id]?.isHuman).map(t => t.shortName);
    console.log('HUMAN teams:', humanList.join(', '), '| AI teams:', aiList.join(', '));

    // Start auction — only if this client runs the engine (not for online non-host)
    if (!clientOnly) {
      setTimeout(() => AuctionEngine.nextPlayer(), 1000);
    }
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

    // Show bid controls — for online non-host, use simplified version
    if (window.onlineMode && window.myOnlineTeamId) {
      // Don't show yet — wait for human_turn broadcast from host
    } else {
      showBidControlsForAllHumans();
    }

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
    showBidControlsForAllHumans();
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
    // In online mode, only track THIS user's team — not all human teams
    if (window.onlineMode && window.myOnlineTeamId) {
      activeHumanTeams = humanTeamIds.includes(window.myOnlineTeamId)
        ? [window.myOnlineTeamId] : [];
      currentHumanIdx = 0;
      showOnlineBidControls();
    } else {
      // Offline: show all human teams
      activeHumanTeams = humanTeamIds;
      currentHumanIdx = 0;
      showBidControlsForAllHumans();
    }
  }

  // Simplified bid controls for online non-host — doesn't depend on engine state
  function showOnlineBidControls() {
    const myTeam = window.myOnlineTeamId;
    if (!myTeam || !activeHumanTeams.includes(myTeam)) {
      document.getElementById('bid-controls').classList.add('hidden');
      return;
    }

    const controls = document.getElementById('bid-controls');
    controls.classList.remove('hidden');

    const team = TEAMS.find(t => t.id === myTeam);
    document.getElementById('active-bidder-label').innerHTML =
      `<span style="color:${team.colors.primary}">${team.emoji} ${team.shortName} — Your Turn!</span>`;

    const bidBtn = document.getElementById('btn-bid');
    const bidAmountSpan = document.getElementById('btn-bid-amount');
    bidAmountSpan.textContent = 'BID';
    bidBtn.disabled = false;
    bidBtn.style.display = '';
    document.getElementById('btn-pass').style.display = '';
    document.getElementById('btn-pass').disabled = false;
    document.getElementById('bid-helper').textContent = 'Place your bid or pass';
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

    // Build buttons for human teams — in online mode, only show THIS user's team
    let humanIds = Object.keys(teamOwnership).filter(id => teamOwnership[id].type === 'human');
    if (window.onlineMode && window.myOnlineTeamId) {
      humanIds = humanIds.filter(id => id === window.myOnlineTeamId);
    }
    if (humanIds.length === 0) {
      controls.classList.add('hidden');
      return;
    }
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
        else {
          const slotsLeft = Math.max(0, 18 - ts.filled);
          helper.textContent = `⚠️ Cannot bid — need ${slotsLeft} more players. Budget left: ${AuctionEngine.formatPrice(ts.budget)}, need to reserve for cheapest available picks`;
        }
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
    // In online mode, non-host sends bid via broadcast to host
    if (window.onlineMode && window.Lobby && !Lobby.isHost()) {
      console.log('NON-HOST: sending bid for team', teamId);
      Lobby.sendBid(teamId, 0);
      // Disable bid button briefly to prevent double-click
      const bidBtn = document.getElementById('btn-bid');
      if (bidBtn) { bidBtn.disabled = true; setTimeout(() => { bidBtn.disabled = false; }, 1500); }
    } else {
      AuctionEngine.humanBid(teamId);
    }
  }

  function passBid() {
    if (activeHumanTeams.length === 0) return;
    const teamId = activeHumanTeams[currentHumanIdx];
    passBidFor(teamId);
  }

  function passBidFor(teamId) {
    if (window.onlineMode && window.Lobby && !Lobby.isHost()) {
      Lobby.sendPass(teamId);
    } else {
      AuctionEngine.humanPass(teamId);
    }
    showBidControlsForAllHumans();
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

    // Save game state after auction completes (offline only)
    saveGame('squad_review');

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

  // ===== PLAYING XI SETUP =====
  const userXISelections = {}; // teamId -> { starters: [...playerIds], impactPlayer: playerId }
  let currentXITeam = null;

  function showPlayingXISetup() {
    // Get human teams that need XI setup
    const states = AuctionEngine.getAllTeamStates();
    const humanTeamIds = TEAMS.filter(t => {
      const ts = states[t.id];
      return ts && ts.isHuman;
    }).map(t => t.id);

    // In online mode, only THIS user's team needs setup
    let teamsToSetup = humanTeamIds;
    if (window.onlineMode && window.myOnlineTeamId) {
      teamsToSetup = [window.myOnlineTeamId];
    }

    // Auto-select XI for teams that don't have one yet
    teamsToSetup.forEach(tid => {
      if (!userXISelections[tid]) {
        userXISelections[tid] = autoSelectXIForTeam(tid);
      }
    });

    if (teamsToSetup.length === 0) {
      // No humans — skip to tournament
      startTournamentWithXI();
      return;
    }

    currentXITeam = teamsToSetup[0];
    showScreen('xi-setup');
    renderXITeamTabs(teamsToSetup);
    renderXISetup();
  }

  function autoSelectXIForTeam(teamId) {
    const ts = AuctionEngine.getTeamData(teamId);
    if (!ts) return { starters: [], impactPlayer: null };
    const squad = ts.squad.map(s => s.player);

    // Sort by rating
    const rate = p => {
      const primary = p.role === 'bowler' ? p.stats.bowling :
                       p.role === 'allRounder' ? (p.stats.batting + p.stats.bowling) / 2 :
                       p.stats.batting;
      return primary;
    };

    const indians = squad.filter(p => !p.isOverseas).sort((a, b) => rate(b) - rate(a));
    const overseas = squad.filter(p => p.isOverseas).sort((a, b) => rate(b) - rate(a));

    const selected = [];
    // Max 4 overseas
    selected.push(...overseas.slice(0, 4));
    // Fill with best Indians
    const indianPool = [...indians];
    // Ensure WK
    if (!selected.some(p => p.role === 'wicketkeeper')) {
      const wk = indianPool.find(p => p.role === 'wicketkeeper');
      if (wk) { selected.push(wk); indianPool.splice(indianPool.indexOf(wk), 1); }
    }
    // Ensure 5 bowlers
    while (selected.filter(p => p.role === 'bowler' || p.role === 'allRounder').length < 5 && indianPool.length) {
      const bowler = indianPool.find(p => p.role === 'bowler' || p.role === 'allRounder');
      if (bowler) { selected.push(bowler); indianPool.splice(indianPool.indexOf(bowler), 1); }
      else break;
    }
    // Fill rest
    while (selected.length < 11 && indianPool.length) selected.push(indianPool.shift());

    // Impact player: best remaining player (Indian if 4 overseas in XI)
    const overseasInXI = selected.filter(p => p.isOverseas).length;
    const bench = squad.filter(p => !selected.includes(p)).sort((a, b) => rate(b) - rate(a));
    const eligibleImpact = overseasInXI >= 4 ? bench.filter(p => !p.isOverseas) : bench;
    const impactPlayer = eligibleImpact.length > 0 ? eligibleImpact[0].id : null;

    return { starters: selected.map(p => p.id), impactPlayer };
  }

  function renderXITeamTabs(humanTeamIds) {
    const tabs = document.getElementById('xi-teams-tabs');
    tabs.innerHTML = humanTeamIds.map(tid => {
      const team = TEAMS.find(t => t.id === tid);
      const active = tid === currentXITeam;
      return `<div class="xi-team-tab${active ? ' active' : ''}" style="color:${team.colors.primary}" onclick="App.switchXITeam('${tid}')">${team.emoji} ${team.shortName}</div>`;
    }).join('');
  }

  function switchXITeam(teamId) {
    currentXITeam = teamId;
    const tabs = document.querySelectorAll('.xi-team-tab');
    tabs.forEach((t, i) => {
      t.classList.toggle('active', t.textContent.trim().endsWith(TEAMS.find(x => x.id === teamId).shortName));
    });
    renderXISetup();
  }

  function renderXISetup() {
    if (!currentXITeam) return;
    const teamId = currentXITeam;
    const ts = AuctionEngine.getTeamData(teamId);
    if (!ts) return;
    const squad = ts.squad.map(s => s.player);
    const sel = userXISelections[teamId];

    // Starters panel
    const startersGrid = document.getElementById('xi-starters-grid');
    const starterPlayers = sel.starters.map(id => squad.find(p => p.id === id)).filter(Boolean);
    startersGrid.innerHTML = starterPlayers.length === 0
      ? '<p style="color:var(--text-dim);font-size:12px;text-align:center">No players selected</p>'
      : starterPlayers.map(p => renderXIPlayerRow(p, 'selected', teamId)).join('');

    // Impact player panel — show 4 substitutes, highlight selected impact
    const impactGrid = document.getElementById('xi-impact-grid');
    // Show ALL non-starters as potential impact picks (was limited to 4)
    const subs = squad.filter(p => !sel.starters.includes(p.id));
    const overseasInXI = starterPlayers.filter(p => p.isOverseas).length;

    impactGrid.innerHTML = subs.length === 0
      ? '<p style="color:var(--text-dim);font-size:12px;text-align:center">No substitutes available</p>'
      : subs.map(p => {
          const isImpact = p.id === sel.impactPlayer;
          const canBeImpact = !(overseasInXI >= 4 && p.isOverseas);
          return `<div class="xi-player-row ${isImpact ? 'impact' : ''}" ${canBeImpact ? `onclick="App.toggleImpact('${p.id}')"` : ''} style="${canBeImpact ? '' : 'opacity:0.4;cursor:not-allowed'}">
            <div class="player-info">
              <span class="player-name">${p.name} ${isImpact ? '⭐' : ''} ${p.isOverseas ? '<span class="overseas-badge">✈</span>' : ''}</span>
              <span class="player-meta">${p.role}${!canBeImpact ? ' — blocked (4 overseas already in XI)' : ''}</span>
            </div>
            <span class="role-tag ${p.role}">${p.role.substring(0, 3).toUpperCase()}</span>
          </div>`;
        }).join('');

    // Squad panel
    const squadGrid = document.getElementById('xi-squad-grid');
    squadGrid.innerHTML = squad.map(p => {
      const inXI = sel.starters.includes(p.id);
      return `<div class="xi-player-row ${inXI ? 'selected' : ''}" onclick="App.toggleXIPlayer('${p.id}')">
        <div class="player-info">
          <span class="player-name">${p.name} ${p.isOverseas ? '<span class="overseas-badge">✈</span>' : ''}</span>
          <span class="player-meta">${p.role} ${inXI ? '✓ In XI' : ''}</span>
        </div>
        <span class="role-tag ${p.role}">${p.role.substring(0, 3).toUpperCase()}</span>
      </div>`;
    }).join('');

    // Update counts and rules
    document.getElementById('xi-count').textContent = `${sel.starters.length}/11`;
    renderXIRules(starterPlayers, squad, sel);
    validateXI(sel, starterPlayers);
  }

  function renderXIPlayerRow(p, cls, teamId) {
    const team = TEAMS.find(t => t.id === teamId);
    return `<div class="xi-player-row ${cls}" onclick="App.toggleXIPlayer('${p.id}')">
      <div class="player-info">
        <span class="player-name">${p.name} ${p.isOverseas ? '<span class="overseas-badge">✈</span>' : ''}</span>
        <span class="player-meta">${p.role}</span>
      </div>
      <span class="role-tag ${p.role}">${p.role.substring(0, 3).toUpperCase()}</span>
    </div>`;
  }

  function renderXIRules(starters, squad, sel) {
    const rules = document.getElementById('xi-rules');
    const overseas = starters.filter(p => p.isOverseas).length;
    const wk = starters.filter(p => p.role === 'wicketkeeper').length;
    const bowlers = starters.filter(p => p.role === 'bowler' || p.role === 'allRounder').length;

    const rule = (ok, txt) => `<span class="${ok ? 'rule-ok' : 'rule-fail'}">${ok ? '✓' : '✗'} ${txt}</span>`;

    rules.innerHTML = [
      rule(starters.length === 11, `Exactly 11 starters (${starters.length}/11)`),
      rule(overseas <= 4, `Max 4 overseas (${overseas}/4)`),
      rule(wk >= 1, `At least 1 wicketkeeper (${wk})`),
      rule(bowlers >= 5, `At least 5 bowlers/allrounders (${bowlers})`),
      rule(sel.impactPlayer !== null, `Impact player selected`)
    ].join('<br>');
  }

  function validateXI(sel, starters) {
    const btn = document.getElementById('btn-confirm-xi');
    const overseas = starters.filter(p => p.isOverseas).length;
    const wk = starters.filter(p => p.role === 'wicketkeeper').length;
    const bowlers = starters.filter(p => p.role === 'bowler' || p.role === 'allRounder').length;
    const valid = starters.length === 11 && overseas <= 4 && wk >= 1 && bowlers >= 5 && sel.impactPlayer !== null;
    btn.disabled = !valid;
  }

  function toggleXIPlayer(playerId) {
    const sel = userXISelections[currentXITeam];
    if (!sel) return;
    const idx = sel.starters.indexOf(playerId);
    if (idx >= 0) {
      sel.starters.splice(idx, 1);
      // If this was impact player, clear it
      if (sel.impactPlayer === playerId) sel.impactPlayer = null;
    } else {
      if (sel.starters.length >= 11) return; // max 11
      sel.starters.push(playerId);
      // If it was impact, move it to starters (can't be both)
      if (sel.impactPlayer === playerId) sel.impactPlayer = null;
    }
    renderXISetup();
  }

  function toggleImpact(playerId) {
    const sel = userXISelections[currentXITeam];
    if (!sel) return;
    sel.impactPlayer = sel.impactPlayer === playerId ? null : playerId;
    renderXISetup();
  }

  function autoSelectXI() {
    userXISelections[currentXITeam] = autoSelectXIForTeam(currentXITeam);
    renderXISetup();
  }

  function confirmXI() {
    // Pass XI selections to simulation engine
    window.userXISelections = userXISelections;
    saveGame('tournament');
    startTournamentWithXI();
  }

  function startTournamentWithXI() {
    startTournament();
  }

  // ===== TOURNAMENT =====
  function startTournament() {
    const states = AuctionEngine.getAllTeamStates();

    // In online mode, only HOST initializes the schedule
    if (window.onlineMode && window.Lobby && !Lobby.isHost()) {
      console.log('Non-host: waiting for host to start tournament');
      showScreen('tournament');
      hideSimButtonsForNonHost();
      const cont = document.getElementById('match-counter');
      if (cont) cont.textContent = 'Waiting for host to start...';
      return;
    }

    SimulationEngine.init(states);
    showScreen('tournament');
    renderPointsTable();

    // HOST: broadcast the tournament initialization
    if (window.onlineMode && window.Lobby && Lobby.isHost()) {
      const simState = SimulationEngine.getState();
      Lobby.broadcastGameState('sim_init', {
        schedule: simState.schedule,
        standings: simState.standings,
        playerForms: simState.playerForms,
        teamStates: states
      });
    }
  }

  // Hide simulate buttons in tournament screen for non-host players
  function hideSimButtonsForNonHost() {
    if (!window.onlineMode || !window.Lobby) return;
    if (Lobby.isHost()) return;
    ['btn-sim-next', 'btn-sim-five', 'btn-sim-all'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // Show waiting message instead
    const controls = document.querySelector('.sim-controls');
    if (controls && !document.getElementById('non-host-sim-msg')) {
      const msg = document.createElement('div');
      msg.id = 'non-host-sim-msg';
      msg.style.cssText = 'color:var(--text-dim);font-style:italic;padding:8px';
      msg.textContent = '⏳ Waiting for host to advance the tournament...';
      controls.appendChild(msg);
    }
  }

  function simNext() {
    // In online mode, only host can advance the sim; non-host waits for broadcasts
    if (window.onlineMode && window.Lobby && !Lobby.isHost()) {
      console.log('Non-host: waiting for host to advance simulation');
      return;
    }

    const state = SimulationEngine.getState();
    if (SimulationEngine.isLeagueComplete()) {
      // Check if playoffs started
      if (!state.playoffs) {
        SimulationEngine.setupPlayoffs();
        renderPlayoffs();
        if (window.onlineMode) Lobby.broadcastGameState('sim_playoffs_setup', { playoffs: state.playoffs });
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
      saveGame('tournament');

      // Broadcast match result to non-host clients
      if (window.onlineMode && window.Lobby) {
        Lobby.broadcastGameState('sim_match_result', {
          result: result,
          standings: state.standings,
          currentMatch: state.currentMatch
        });
      }
    }
  }

  function simFive() {
    if (window.onlineMode && window.Lobby && !Lobby.isHost()) {
      console.log('Non-host: cannot advance simulation');
      return;
    }
    for (let i = 0; i < 5; i++) {
      if (SimulationEngine.isLeagueComplete()) break;
      const result = SimulationEngine.simulateNextMatch();
      // Broadcast each match result in online mode
      if (result && window.onlineMode && window.Lobby) {
        const st = SimulationEngine.getState();
        Lobby.broadcastGameState('sim_match_result', {
          result: result,
          standings: st.standings,
          currentMatch: st.currentMatch
        });
      }
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
    if (window.onlineMode && window.Lobby && !Lobby.isHost()) {
      console.log('Non-host: cannot advance simulation');
      return;
    }
    const state = SimulationEngine.getState();
    if (SimulationEngine.isLeagueComplete()) {
      if (!state.playoffs) {
        SimulationEngine.setupPlayoffs();
        renderPlayoffs();
        if (window.onlineMode && window.Lobby) {
          Lobby.broadcastGameState('sim_playoffs_setup', { playoffs: state.playoffs });
        }
      }
      return;
    }

    while (!SimulationEngine.isLeagueComplete()) {
      const result = SimulationEngine.simulateNextMatch();
      // Broadcast every match in online mode
      if (result && window.onlineMode && window.Lobby) {
        Lobby.broadcastGameState('sim_match_result', {
          result: result,
          standings: state.standings,
          currentMatch: state.currentMatch
        });
      }
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
        <div>${battingFirstTeam.shortName}: <strong>${result.innings1.totalRuns}/${result.innings1.wickets}</strong> (${SimulationEngine.formatOvers(result.innings1.ballsBowled)} ov)</div>
        <div>${bowlingFirstTeam.shortName}: <strong>${result.innings2.totalRuns}/${result.innings2.wickets}</strong> (${SimulationEngine.formatOvers(result.innings2.ballsBowled)} ov)</div>
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
    let html = `<div class="scorecard-section"><h4>${teamName} Innings: ${innings.totalRuns}/${innings.wickets} (${SimulationEngine.formatOvers(innings.ballsBowled)} ov)</h4>`;

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
    if (window.onlineMode && window.Lobby && !Lobby.isHost()) {
      console.log('Non-host: cannot advance playoffs');
      return;
    }
    if (playoffIdx >= playoffOrder.length) return;

    const key = playoffOrder[playoffIdx];
    const result = SimulationEngine.simulatePlayoffMatch(key);
    if (result) {
      renderMatchResult(result);
      playoffIdx++;
      updateBracketUI();

      const state = SimulationEngine.getState();

      // Broadcast playoff result + bracket state to non-host clients
      if (window.onlineMode && window.Lobby) {
        Lobby.broadcastGameState('sim_playoff_result', {
          key, result, playoffs: state.playoffs, playoffIdx
        });
      }

      if (state.champion) {
        // Broadcast champion to non-host clients
        if (window.onlineMode && window.Lobby) {
          Lobby.broadcastGameState('sim_champion', { champion: state.champion });
        }
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
    // Tournament complete — clear saved game
    clearSavedGame();

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

  // Track last received index to ignore stale/duplicate events
  let lastReceivedIdx = -1;

  // Handle online broadcast events from host (non-host players)
  function handleOnlineEvent(event, payload) {
    // Update progress display from any event that has index info
    if (payload && payload.idx !== undefined) {
      document.getElementById('auction-player-num').textContent = (payload.idx || 0) + 1;
    }
    if (payload && payload.total) {
      document.getElementById('auction-total-players').textContent = payload.total;
    }
    if (payload && payload.phase) {
      document.getElementById('auction-phase').textContent = payload.phase;
    }

    switch (event) {
      case 'new_player':
        if (payload.player) {
          // Skip if we've already seen a newer player
          if (payload.currentIndex !== undefined && payload.currentIndex < lastReceivedIdx) break;
          lastReceivedIdx = payload.currentIndex || 0;

          AuctionEngine.syncState({
            currentPlayer: payload.player,
            currentIndex: payload.currentIndex,
            phase: payload.phase,
            currentBid: payload.player.basePrice,
            currentBidder: null,
            isActive: true
          });
          renderAuctionPlayer(payload.player);
          document.getElementById('auction-player-num').textContent = (payload.currentIndex || 0) + 1;
        }
        break;
      case 'bid_update':
        if (payload.teamId && payload.amount) {
          AuctionEngine.syncState({ currentBid: payload.amount, currentBidder: payload.teamId });
          onBid(payload.teamId, payload.amount);
        }
        break;
      case 'sold':
        if (payload.player && payload.teamId) {
          AuctionEngine.syncSold(payload.player, payload.teamId, payload.price);
          onSold(payload.player, payload.teamId, payload.price);
        }
        break;
      case 'unsold':
        if (payload.player) onUnsold(payload.player);
        break;
      case 'timer_update':
        if (payload.remaining !== undefined) onTimerUpdate(payload.remaining);
        break;
      case 'log':
        if (payload.msg) addAuctionLog(payload.msg, payload.type || '');
        break;
      case 'human_turn':
        if (payload.humanTeamIds) onHumanTurn(payload.humanTeamIds);
        break;
      case 'auction_end':
        onAuctionEnd();
        break;
      case 'sim_init':
        // Non-host receives the tournament schedule from host
        if (payload.schedule) {
          // Initialize SimulationEngine with HOST's data (same schedule for everyone)
          const localStates = AuctionEngine.getAllTeamStates();
          // Merge team states from host (so squads match)
          if (payload.teamStates) {
            Object.entries(payload.teamStates).forEach(([tid, saved]) => {
              if (localStates[tid]) {
                localStates[tid].budget = saved.budget;
                localStates[tid].squad = saved.squad;
                localStates[tid].filled = saved.filled;
                localStates[tid].roleCount = saved.roleCount;
                localStates[tid].subRoleCount = saved.subRoleCount;
                localStates[tid].overseasCount = saved.overseasCount;
              }
            });
          }
          SimulationEngine.init(localStates);
          // Override schedule and initial state with host's
          const simState = SimulationEngine.getState();
          if (simState) {
            simState.schedule = payload.schedule;
            simState.standings = payload.standings;
            simState.playerForms = payload.playerForms;
            simState.completedMatches = [];
            simState.currentMatch = 0;
          }
          renderPointsTable();
          const matchCounter = document.getElementById('match-counter');
          if (matchCounter) matchCounter.textContent = `Match 1 of ${payload.schedule.length}`;
          console.log('[SIM] Tournament initialized from host');
        }
        break;
      case 'sim_match_result':
        // Non-host receives a simulated match from host
        if (payload.result) {
          const simState = SimulationEngine.getState();
          if (simState) {
            simState.completedMatches = simState.completedMatches || [];
            simState.completedMatches.push(payload.result);
            simState.currentMatch = payload.currentMatch;
            if (payload.standings) {
              // Replace standings entirely (not merge) to stay in sync
              Object.keys(payload.standings).forEach(tid => {
                simState.standings[tid] = payload.standings[tid];
              });
            }
          }
          if (typeof renderMatchResult === 'function') renderMatchResult(payload.result);
          if (typeof renderPointsTable === 'function') renderPointsTable();
        }
        break;
      case 'sim_playoffs_setup':
        if (payload.playoffs) {
          const simState = SimulationEngine.getState();
          if (simState) simState.playoffs = payload.playoffs;
          if (typeof renderPlayoffs === 'function') renderPlayoffs();
        }
        break;
      case 'sim_playoff_result':
        if (payload.result) {
          const simState = SimulationEngine.getState();
          if (simState) {
            if (payload.playoffs) simState.playoffs = payload.playoffs;
            if (payload.playoffIdx !== undefined) playoffIdx = payload.playoffIdx;
          }
          if (typeof renderMatchResult === 'function') renderMatchResult(payload.result);
          if (typeof updateBracketUI === 'function') updateBracketUI();
        }
        break;
      case 'sim_champion':
        if (payload.champion) {
          const simState = SimulationEngine.getState();
          if (simState) simState.champion = payload.champion;
          if (typeof showResult === 'function') setTimeout(() => showResult(), 1000);
        }
        break;
    }
  }

  function simulateAuction() {
    if (!confirm('This will simulate the entire remaining auction instantly (all AI). Continue?')) return;

    // Hide bid controls and disable simulate button
    document.getElementById('bid-controls').classList.add('hidden');
    document.getElementById('btn-simulate').disabled = true;
    document.getElementById('btn-simulate').textContent = 'Simulating...';

    // Run the simulation
    setTimeout(() => {
      AuctionEngine.simulateAll();
      // UI will be updated by the onAuctionEnd callback
    }, 100);
  }

  return {
    showScreen, renamePlayer, startAuction, startAuctionWithTeams, placeBid, passBid,
    placeBidFor, passBidFor, togglePause, simulateAuction, handleOnlineEvent,
    viewSquad, showReviewTeam, startTournament,
    showPlayingXISetup, switchXITeam, toggleXIPlayer, toggleImpact, autoSelectXI, confirmXI,
    simNext, simFive, simAll,
    resumeOfflineGame, checkForSavedGame, clearSavedGame
  };
})();
