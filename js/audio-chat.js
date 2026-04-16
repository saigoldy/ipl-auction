// ===== AUDIO CHAT (WebRTC + Supabase Realtime signaling) =====
window.AudioChat = (function() {
  let localStream = null;
  let peers = {}; // userId -> RTCPeerConnection
  let remoteAudios = {}; // userId -> HTMLAudioElement
  let isMuted = false; // start UNMUTED (user explicitly enabled mic)
  let isActive = false;
  let signalChannel = null;
  let myId = null;
  let reannounceInterval = null;

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Free public TURN (Twilio-style fallback for restrictive networks)
      { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
    ]
  };

  // Start audio chat for the current room
  async function start(roomId, userId) {
    if (isActive) return;
    myId = userId;
    isActive = true;

    try {
      // Get microphone (start UNMUTED — user explicitly enabled chat)
      console.log('[audio] Requesting microphone...');
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false
      });
      localStream.getAudioTracks().forEach(t => t.enabled = true); // start unmuted
      console.log('[audio] Microphone acquired (UNMUTED)');

      // Set up signaling channel
      const sb = window.supabaseClient;
      signalChannel = sb.channel(`audio:${roomId}`, {
        config: { broadcast: { self: false } }
      });

      signalChannel.on('broadcast', { event: 'webrtc_offer' }, ({ payload }) => handleOffer(payload));
      signalChannel.on('broadcast', { event: 'webrtc_answer' }, ({ payload }) => handleAnswer(payload));
      signalChannel.on('broadcast', { event: 'webrtc_ice' }, ({ payload }) => handleIce(payload));
      signalChannel.on('broadcast', { event: 'webrtc_join' }, ({ payload }) => handleJoin(payload));
      signalChannel.on('broadcast', { event: 'webrtc_leave' }, ({ payload }) => handleLeave(payload));

      await signalChannel.subscribe();
      console.log('[audio] Signaling channel subscribed');

      // Announce arrival immediately + re-announce every 3 seconds for first 15s
      // This handles the case where peers subscribe at slightly different times
      const announce = () => {
        signalChannel.send({
          type: 'broadcast',
          event: 'webrtc_join',
          payload: { from: myId }
        });
        console.log('[audio] Announced join to room');
      };

      // Initial announce
      setTimeout(announce, 200);

      // Re-announce every 3s for 15s, then stop
      let rounds = 0;
      reannounceInterval = setInterval(() => {
        rounds++;
        if (rounds >= 5 || Object.keys(peers).length > 0) {
          clearInterval(reannounceInterval);
          reannounceInterval = null;
          return;
        }
        announce();
      }, 3000);

      updateUI();
      return true;
    } catch (e) {
      console.error('[audio] Failed:', e);
      isActive = false;
      alert('Microphone permission denied or unavailable. Audio chat needs mic access.');
      return false;
    }
  }

  function stop() {
    if (!isActive) return;
    if (reannounceInterval) {
      clearInterval(reannounceInterval);
      reannounceInterval = null;
    }
    if (signalChannel) {
      signalChannel.send({
        type: 'broadcast',
        event: 'webrtc_leave',
        payload: { from: myId }
      });
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    Object.values(peers).forEach(pc => pc.close());
    peers = {};
    Object.keys(remoteAudios).forEach(id => cleanupRemote(id));
    if (signalChannel) {
      const sb = window.supabaseClient;
      sb.removeChannel(signalChannel);
      signalChannel = null;
    }
    isActive = false;
    isMuted = true;
    updateUI();
    console.log('[audio] Stopped');
  }

  function toggleMute() {
    if (!isActive || !localStream) return;
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
    console.log('[audio] Mute toggled:', isMuted);
    updateUI();
  }

  // ===== WebRTC Signaling =====

  // When a new peer joins, the existing peer creates an offer
  // Use deterministic offerer: the LOWER userId creates the offer
  const _seenJoinFrom = new Set();
  async function handleJoin({ from }) {
    if (from === myId) return;
    if (peers[from]) return;
    console.log('[audio] Peer joined:', from);
    // Lower userId = offerer (deterministic to avoid race conditions)
    if (myId < from) {
      await createPeerAndOffer(from);
    } else if (!_seenJoinFrom.has(from)) {
      // First time seeing this peer — send ONE join back so they know I'm here
      _seenJoinFrom.add(from);
      signalChannel.send({
        type: 'broadcast',
        event: 'webrtc_join',
        payload: { from: myId }
      });
    }
    // else: already responded, just wait for offer
  }

  function handleLeave({ from }) {
    if (from === myId) return;
    console.log('[audio] Peer left:', from);
    if (peers[from]) {
      peers[from].close();
      delete peers[from];
    }
    cleanupRemote(from);
    updateUI();
  }

  function cleanupRemote(userId) {
    const r = remoteAudios[userId];
    if (!r) return;
    try { if (r.source) r.source.disconnect(); } catch (e) {}
    try { if (r.gain) r.gain.disconnect(); } catch (e) {}
    try { if (r.audio) r.audio.remove(); } catch (e) {}
    try { if (r.card) r.card.remove(); } catch (e) {}
    try { if (r.remove) r.remove(); } catch (e) {}
    delete remoteAudios[userId];
  }

  // Shared AudioContext for gain boost + level metering. Many browsers start
  // the context in 'suspended' state until a user gesture — we resume it on
  // any click. We also show a persistent unlock banner if output is blocked.
  let sharedCtx = null;
  const DEFAULT_GAIN = 1.8; // 180% default — WebRTC output is often quiet
  function ensureAudioCtx() {
    if (!sharedCtx) {
      try {
        sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('[audio] AudioContext unsupported:', e);
        return null;
      }
    }
    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume().catch(e => console.warn('[audio] ctx resume:', e));
    }
    return sharedCtx;
  }
  // Resume context on any user gesture (click/touch/keypress)
  ['click', 'touchstart', 'keydown'].forEach(evt => {
    document.addEventListener(evt, () => {
      if (sharedCtx && sharedCtx.state === 'suspended') sharedCtx.resume();
      const banner = document.getElementById('audio-unlock-banner');
      if (banner) banner.style.display = 'none';
    }, { passive: true });
  });

  function showUnlockBanner() {
    if (document.getElementById('audio-unlock-banner')) return;
    const b = document.createElement('div');
    b.id = 'audio-unlock-banner';
    b.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);background:#ff9800;color:#000;padding:10px 18px;border-radius:8px;font:600 13px system-ui;z-index:10001;box-shadow:0 2px 12px rgba(0,0,0,.4);cursor:pointer';
    b.textContent = '🔊 Click anywhere to enable voice chat audio';
    b.addEventListener('click', () => b.remove());
    document.body.appendChild(b);
  }

  async function createPeerAndOffer(targetId) {
    console.log('[audio] Creating offer to', targetId);
    const pc = createPeerConnection(targetId);
    peers[targetId] = pc;

    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      signalChannel.send({
        type: 'broadcast',
        event: 'webrtc_offer',
        payload: { from: myId, to: targetId, sdp: pc.localDescription }
      });
    } catch (e) {
      console.error('[audio] Offer error:', e);
    }
  }

  function createPeerConnection(targetId) {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    }

    // Remote stream handler
    pc.ontrack = (e) => {
      console.log('[audio] Received remote track from', targetId);
      attachRemoteAudio(targetId, e.streams[0]);
    };

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signalChannel.send({
          type: 'broadcast',
          event: 'webrtc_ice',
          payload: { from: myId, to: targetId, candidate: e.candidate.toJSON() }
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[audio] ICE state for', targetId, ':', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        // Try to restart ICE
        try { pc.restartIce(); } catch (e) {}
      }
    };

    return pc;
  }

  async function handleOffer({ from, to, sdp }) {
    if (to !== myId) return;
    console.log('[audio] Received offer from', from);

    // If we already have a connection, replace it (e.g. after disconnect/reconnect)
    if (peers[from]) {
      peers[from].close();
      delete peers[from];
    }

    const pc = createPeerConnection(from);
    peers[from] = pc;

    try {
      await pc.setRemoteDescription(sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signalChannel.send({
        type: 'broadcast',
        event: 'webrtc_answer',
        payload: { from: myId, to: from, sdp: pc.localDescription }
      });
      console.log('[audio] Sent answer to', from);
    } catch (e) {
      console.error('[audio] Answer error:', e);
    }
  }

  async function handleAnswer({ from, to, sdp }) {
    if (to !== myId) return;
    console.log('[audio] Received answer from', from);
    const pc = peers[from];
    if (!pc) {
      console.warn('[audio] No peer connection for answer from', from);
      return;
    }
    try {
      await pc.setRemoteDescription(sdp);
      console.log('[audio] Connection established with', from);
    } catch (e) {
      console.error('[audio] setRemoteDescription error:', e);
    }
  }

  async function handleIce({ from, to, candidate }) {
    if (to !== myId) return;
    const pc = peers[from];
    if (!pc) return;
    try {
      await pc.addIceCandidate(candidate);
    } catch (e) {
      // ICE candidate errors are common during setup, only log if connection is up
      if (pc.iceConnectionState === 'connected') {
        console.error('[audio] ICE error:', e);
      }
    }
  }

  function attachRemoteAudio(userId, stream) {
    cleanupRemote(userId);

    const tracks = stream.getAudioTracks();
    console.log('[audio] Remote stream from', userId, '— audio tracks:', tracks.length);
    if (tracks.length === 0) {
      console.error('[audio] Remote stream has NO audio tracks!');
      return;
    }

    const ctx = ensureAudioCtx();
    const slot = Object.keys(remoteAudios).length;

    // Hidden HTML audio element — required by Chromium so the remote track
    // keeps flowing. Muted because WebAudio will do the actual playback.
    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.muted = true;
    audio.playsInline = true;
    audio.style.display = 'none';
    audio.id = 'audio-' + userId;
    document.body.appendChild(audio);
    audio.play().catch(() => {});

    let source = null, gain = null, analyser = null;
    if (ctx) {
      try {
        source = ctx.createMediaStreamSource(stream);
        gain = ctx.createGain();
        gain.gain.value = DEFAULT_GAIN;
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.connect(analyser);
      } catch (e) {
        console.error('[audio] WebAudio setup failed, falling back to HTML audio:', e);
        audio.muted = false;
        audio.volume = 1.0;
        source = null;
      }
    } else {
      audio.muted = false;
      audio.volume = 1.0;
    }

    if (ctx && ctx.state === 'suspended') showUnlockBanner();

    // Visible UI card — volume slider + speaking indicator
    const card = document.createElement('div');
    card.id = 'audio-card-' + userId;
    card.style.cssText = 'position:fixed;bottom:8px;right:' + (8 + slot * 190) + 'px;width:175px;padding:8px 10px;z-index:9999;background:#1a1a2e;color:#fff;border:2px solid #7C4DFF;border-radius:8px;font:12px system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.3)';
    const shortId = String(userId).slice(0, 6);
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span>🎙️ ${shortId}</span>
        <span class="dot" style="width:10px;height:10px;border-radius:50%;background:#444;transition:all 0.15s"></span>
      </div>
      <input type="range" min="0" max="3" step="0.05" value="${DEFAULT_GAIN}" class="vol" style="width:100%">
      <div class="vol-label" style="font-size:10px;color:#aaa;margin-top:4px">Volume: ${Math.round(DEFAULT_GAIN * 100)}%</div>
    `;
    document.body.appendChild(card);
    const dot = card.querySelector('.dot');
    const volInput = card.querySelector('.vol');
    const volLabel = card.querySelector('.vol-label');
    volInput.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      if (gain) gain.gain.value = v;
      else audio.volume = Math.min(1, v);
      volLabel.textContent = 'Volume: ' + Math.round(v * 100) + '%';
    });

    remoteAudios[userId] = { audio, card, gain, source, analyser, dot, stream };

    // Level meter using same shared context
    if (analyser) runLevelMeter(userId);

    updateUI();
  }

  function runLevelMeter(userId) {
    const r = remoteAudios[userId];
    if (!r || !r.analyser) return;
    const data = new Uint8Array(r.analyser.frequencyBinCount);
    function tick() {
      if (!remoteAudios[userId]) return;
      r.analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      if (avg > 10) {
        r.dot.style.background = '#4CAF50';
        r.dot.style.boxShadow = '0 0 ' + Math.min(12, avg / 4) + 'px #4CAF50';
      } else {
        r.dot.style.background = '#444';
        r.dot.style.boxShadow = 'none';
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  function updateUI() {
    const btn = document.getElementById('btn-audio-chat');
    if (!btn) return;
    if (!isActive) {
      btn.textContent = '🎙️ Join Voice';
      btn.style.background = '#7C4DFF';
    } else if (isMuted) {
      btn.textContent = '🔇 Unmute';
      btn.style.background = '#888';
    } else {
      btn.textContent = '🎙️ Mute';
      btn.style.background = '#4CAF50';
    }
    const count = Object.keys(remoteAudios).length;
    const status = document.getElementById('audio-status');
    if (status) {
      if (!isActive) {
        status.textContent = '';
      } else if (count === 0) {
        status.textContent = '⏳ Waiting for others to join voice...';
        status.style.color = '#ffa726';
      } else {
        status.textContent = `🔊 ${count} other(s) on voice ${isMuted ? '(you muted)' : '(LIVE)'}`;
        status.style.color = isMuted ? '#888' : '#4CAF50';
      }
    }
  }

  // Notify others when leaving the page
  window.addEventListener('beforeunload', () => {
    if (isActive) stop();
  });

  return { start, stop, toggleMute, isActive: () => isActive, isMuted: () => isMuted };
})();
