// ===== LOBBY & ROOM SYSTEM =====
window.Lobby = (function() {
  let currentRoom = null;
  let realtimeChannel = null;

  // Create a new auction room
  async function createRoom(roomName, maxPlayers) {
    const sb = window.supabaseClient;
    const user = Auth.getUser();
    if (!user) return null;

    const roomCode = generateRoomCode();
    const { data, error } = await sb.from('rooms').insert({
      code: roomCode,
      name: roomName || 'IPL Auction Room',
      host_id: user.id,
      max_players: maxPlayers || 10,
      status: 'waiting', // waiting, picking_teams, auction, simulation, finished
      settings: {
        budget: 12500, // 125 Cr in lakhs
        min_players: 18,
        max_players_per_team: 25,
        timer_seconds: 5
      }
    }).select().single();

    if (error) throw error;

    // Host joins as first player
    await joinRoom(roomCode);
    return data;
  }

  // Join an existing room by code
  async function joinRoom(code) {
    const sb = window.supabaseClient;
    const user = Auth.getUser();
    if (!user) return null;

    // Find room
    const { data: room, error: roomErr } = await sb.from('rooms').select('*').eq('code', code.toUpperCase()).single();
    if (roomErr || !room) throw new Error('Room not found');
    if (room.status !== 'waiting' && room.status !== 'picking_teams') throw new Error('Room already in progress');

    // Check if already in room
    const { data: existing } = await sb.from('room_players').select('*').eq('room_id', room.id).eq('user_id', user.id).single();
    if (!existing) {
      // Count current players
      const { count } = await sb.from('room_players').select('*', { count: 'exact' }).eq('room_id', room.id);
      if (count >= room.max_players) throw new Error('Room is full');

      const profile = await Auth.getProfile();
      await sb.from('room_players').insert({
        room_id: room.id,
        user_id: user.id,
        display_name: profile?.display_name || user.email.split('@')[0],
        team_id: null, // chosen later
        is_ready: false
      });
    }

    currentRoom = room;
    subscribeToRoom(room.id);
    return room;
  }

  // Leave room
  async function leaveRoom() {
    if (!currentRoom) return;
    const sb = window.supabaseClient;
    const user = Auth.getUser();

    await sb.from('room_players').delete().eq('room_id', currentRoom.id).eq('user_id', user.id);

    if (realtimeChannel) {
      sb.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
    currentRoom = null;
  }

  // Pick a team
  async function pickTeam(teamId) {
    if (!currentRoom) return;
    const sb = window.supabaseClient;
    const user = Auth.getUser();

    // Check if team is taken
    const { data: taken } = await sb.from('room_players').select('team_id').eq('room_id', currentRoom.id).eq('team_id', teamId);
    if (taken && taken.length > 0) throw new Error('Team already taken');

    await sb.from('room_players').update({ team_id: teamId }).eq('room_id', currentRoom.id).eq('user_id', user.id);

    // Broadcast team pick
    if (realtimeChannel) {
      realtimeChannel.send({
        type: 'broadcast',
        event: 'team_picked',
        payload: { userId: user.id, teamId }
      });
    }
  }

  // Toggle ready status
  async function toggleReady() {
    if (!currentRoom) return;
    const sb = window.supabaseClient;
    const user = Auth.getUser();

    const { data } = await sb.from('room_players').select('is_ready').eq('room_id', currentRoom.id).eq('user_id', user.id).single();
    const newReady = !data?.is_ready;

    await sb.from('room_players').update({ is_ready: newReady }).eq('room_id', currentRoom.id).eq('user_id', user.id);

    if (realtimeChannel) {
      realtimeChannel.send({
        type: 'broadcast',
        event: 'ready_changed',
        payload: { userId: user.id, isReady: newReady }
      });
    }
  }

  // Host starts the auction
  async function startAuction() {
    if (!currentRoom) return;
    const sb = window.supabaseClient;
    const user = Auth.getUser();
    if (currentRoom.host_id !== user.id) throw new Error('Only host can start');

    await sb.from('rooms').update({ status: 'auction' }).eq('id', currentRoom.id);

    if (realtimeChannel) {
      realtimeChannel.send({
        type: 'broadcast',
        event: 'auction_start',
        payload: {}
      });
    }
  }

  // Send a bid through realtime
  function sendBid(teamId, amount) {
    if (!realtimeChannel) return;
    const user = Auth.getUser();
    realtimeChannel.send({
      type: 'broadcast',
      event: 'bid',
      payload: { userId: user.id, teamId, amount, timestamp: Date.now() }
    });
  }

  // Send pass
  function sendPass(teamId) {
    if (!realtimeChannel) return;
    const user = Auth.getUser();
    realtimeChannel.send({
      type: 'broadcast',
      event: 'pass',
      payload: { userId: user.id, teamId }
    });
  }

  // Send pause request
  function sendPause() {
    if (!realtimeChannel) return;
    const user = Auth.getUser();
    realtimeChannel.send({
      type: 'broadcast',
      event: 'pause_request',
      payload: { userId: user.id }
    });
  }

  // Host broadcasts game state (new player, sold, unsold, etc.)
  function broadcastGameState(event, payload) {
    if (!realtimeChannel) return;
    realtimeChannel.send({
      type: 'broadcast',
      event: event,
      payload: payload
    });
  }

  // Subscribe to room realtime events
  function subscribeToRoom(roomId) {
    const sb = window.supabaseClient;
    if (realtimeChannel) sb.removeChannel(realtimeChannel);

    realtimeChannel = sb.channel(`room:${roomId}`, {
      config: { presence: { key: Auth.getUser().id } }
    });

    // Presence — track who's online
    realtimeChannel.on('presence', { event: 'sync' }, () => {
      const presenceState = realtimeChannel.presenceState();
      if (Lobby.callbacks.onPresenceSync) Lobby.callbacks.onPresenceSync(presenceState);
    });

    // Broadcast events
    realtimeChannel.on('broadcast', { event: 'team_picked' }, ({ payload }) => {
      if (Lobby.callbacks.onTeamPicked) Lobby.callbacks.onTeamPicked(payload);
    });

    realtimeChannel.on('broadcast', { event: 'ready_changed' }, ({ payload }) => {
      if (Lobby.callbacks.onReadyChanged) Lobby.callbacks.onReadyChanged(payload);
    });

    realtimeChannel.on('broadcast', { event: 'auction_start' }, () => {
      if (Lobby.callbacks.onAuctionStart) Lobby.callbacks.onAuctionStart();
    });

    realtimeChannel.on('broadcast', { event: 'bid' }, ({ payload }) => {
      if (Lobby.callbacks.onBid) Lobby.callbacks.onBid(payload);
    });

    realtimeChannel.on('broadcast', { event: 'pass' }, ({ payload }) => {
      if (Lobby.callbacks.onPass) Lobby.callbacks.onPass(payload);
    });

    realtimeChannel.on('broadcast', { event: 'pause_request' }, ({ payload }) => {
      if (Lobby.callbacks.onPauseRequest) Lobby.callbacks.onPauseRequest(payload);
    });

    realtimeChannel.on('broadcast', { event: 'new_player' }, ({ payload }) => {
      if (Lobby.callbacks.onNewPlayer) Lobby.callbacks.onNewPlayer(payload);
    });

    realtimeChannel.on('broadcast', { event: 'sold' }, ({ payload }) => {
      if (Lobby.callbacks.onSold) Lobby.callbacks.onSold(payload);
    });

    realtimeChannel.on('broadcast', { event: 'unsold' }, ({ payload }) => {
      if (Lobby.callbacks.onUnsold) Lobby.callbacks.onUnsold(payload);
    });

    realtimeChannel.on('broadcast', { event: 'timer_update' }, ({ payload }) => {
      if (Lobby.callbacks.onTimerUpdate) Lobby.callbacks.onTimerUpdate(payload);
    });

    realtimeChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await realtimeChannel.track({ user_id: Auth.getUser().id, online_at: new Date().toISOString() });
      }
    });
  }

  // Get room players
  async function getRoomPlayers() {
    if (!currentRoom) return [];
    const sb = window.supabaseClient;
    const { data } = await sb.from('room_players').select('*').eq('room_id', currentRoom.id);
    return data || [];
  }

  // Get active rooms
  async function getActiveRooms() {
    const sb = window.supabaseClient;
    const { data } = await sb.from('rooms')
      .select('*, room_players(count)')
      .in('status', ['waiting', 'picking_teams'])
      .order('created_at', { ascending: false })
      .limit(20);
    return data || [];
  }

  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function getRoom() { return currentRoom; }
  function isHost() { return currentRoom && currentRoom.host_id === Auth.getUser()?.id; }

  return {
    createRoom, joinRoom, leaveRoom, pickTeam, toggleReady, startAuction,
    sendBid, sendPass, sendPause, broadcastGameState,
    getRoomPlayers, getActiveRooms, getRoom, isHost,
    callbacks: {}
  };
})();
