// ===== AUDIO CHAT (WebRTC + Supabase Realtime signaling) =====
window.AudioChat = (function() {
  let localStream = null;
  let peers = {}; // userId -> RTCPeerConnection
  let remoteAudios = {}; // userId -> HTMLAudioElement
  let isMuted = true;
  let isActive = false;
  let signalChannel = null;
  let myId = null;

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' }
    ]
  };

  // Start audio chat for the current room
  async function start(roomId, userId) {
    if (isActive) return;
    myId = userId;
    isActive = true;

    try {
      // Get microphone (start muted)
      console.log('[audio] Requesting microphone...');
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.getAudioTracks().forEach(t => t.enabled = false); // muted by default
      console.log('[audio] Microphone acquired (muted)');

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

      // Wait a moment then announce arrival
      setTimeout(() => {
        signalChannel.send({
          type: 'broadcast',
          event: 'webrtc_join',
          payload: { from: myId }
        });
        console.log('[audio] Announced join to room');
      }, 500);

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
    Object.values(remoteAudios).forEach(a => a.remove());
    remoteAudios = {};
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
  // Use deterministic offerer: the LOWER userId creates the offer (avoids both creating offers)
  async function handleJoin({ from }) {
    if (from === myId) return;
    if (peers[from]) return;
    console.log('[audio] Peer joined:', from);
    // Lower userId = offerer (deterministic to avoid race conditions)
    if (myId < from) {
      await createPeerAndOffer(from);
    } else {
      // The other peer will offer; just wait for it
      // But also send a "join" back so they know I'm here (in case they joined before me)
      signalChannel.send({
        type: 'broadcast',
        event: 'webrtc_join',
        payload: { from: myId }
      });
    }
  }

  function handleLeave({ from }) {
    if (from === myId) return;
    console.log('[audio] Peer left:', from);
    if (peers[from]) {
      peers[from].close();
      delete peers[from];
    }
    if (remoteAudios[from]) {
      remoteAudios[from].remove();
      delete remoteAudios[from];
    }
    updateUI();
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
    if (remoteAudios[userId]) remoteAudios[userId].remove();
    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.controls = false;
    audio.playsInline = true;
    audio.id = 'audio-' + userId;
    document.body.appendChild(audio);
    remoteAudios[userId] = audio;

    // Explicitly call play() to bypass autoplay restrictions
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('[audio] Playing remote audio from', userId);
      }).catch(e => {
        console.error('[audio] Autoplay blocked:', e);
        // Show alert prompting user to interact
        alert('Audio playback was blocked by your browser. Click anywhere on the page to enable audio.');
        // Try again after user interaction
        document.addEventListener('click', () => audio.play(), { once: true });
      });
    }
    updateUI();
  }

  function updateUI() {
    const btn = document.getElementById('btn-audio-chat');
    if (!btn) return;
    if (!isActive) {
      btn.textContent = '🎙️ Join Voice';
      btn.style.background = '#7C4DFF';
    } else if (isMuted) {
      btn.textContent = '🎙️ Unmute';
      btn.style.background = '#666';
    } else {
      btn.textContent = '🔊 Mute';
      btn.style.background = 'var(--green)';
    }
    const count = Object.keys(remoteAudios).length;
    const status = document.getElementById('audio-status');
    if (status) {
      if (!isActive) {
        status.textContent = '';
      } else if (count === 0) {
        status.textContent = 'Waiting for others to join voice...';
        status.style.color = '#ffa726';
      } else {
        status.textContent = `🔊 ${count} player(s) connected`;
        status.style.color = 'var(--green)';
      }
    }
  }

  // Notify others when leaving the page
  window.addEventListener('beforeunload', () => {
    if (isActive) stop();
  });

  return { start, stop, toggleMute, isActive: () => isActive, isMuted: () => isMuted };
})();
