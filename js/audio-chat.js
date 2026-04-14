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
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Start audio chat for the current room
  async function start(roomId, userId) {
    if (isActive) return;
    myId = userId;
    isActive = true;

    try {
      // Get microphone (start muted)
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.getAudioTracks().forEach(t => t.enabled = false); // muted by default

      // Set up signaling channel
      const sb = window.supabaseClient;
      signalChannel = sb.channel(`audio:${roomId}`);

      signalChannel.on('broadcast', { event: 'webrtc_offer' }, ({ payload }) => handleOffer(payload));
      signalChannel.on('broadcast', { event: 'webrtc_answer' }, ({ payload }) => handleAnswer(payload));
      signalChannel.on('broadcast', { event: 'webrtc_ice' }, ({ payload }) => handleIce(payload));
      signalChannel.on('broadcast', { event: 'webrtc_join' }, ({ payload }) => handleJoin(payload));

      await signalChannel.subscribe();

      // Announce my arrival
      signalChannel.send({
        type: 'broadcast',
        event: 'webrtc_join',
        payload: { from: myId }
      });

      console.log('Audio chat started');
      updateUI();
      return true;
    } catch (e) {
      console.error('Audio chat failed:', e);
      isActive = false;
      alert('Microphone permission denied. Audio chat unavailable.');
      return false;
    }
  }

  function stop() {
    if (!isActive) return;
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
    console.log('Audio chat stopped');
  }

  function toggleMute() {
    if (!isActive || !localStream) return;
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
    updateUI();
  }

  // When a new peer joins, the existing peer creates an offer
  async function handleJoin({ from }) {
    if (from === myId) return;
    if (peers[from]) return;
    await createPeerAndOffer(from);
  }

  async function createPeerAndOffer(targetId) {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peers[targetId] = pc;

    // Add local stream
    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

    // Remote stream handler
    pc.ontrack = (e) => attachRemoteAudio(targetId, e.streams[0]);

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signalChannel.send({
          type: 'broadcast',
          event: 'webrtc_ice',
          payload: { from: myId, to: targetId, candidate: e.candidate }
        });
      }
    };

    // Create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signalChannel.send({
      type: 'broadcast',
      event: 'webrtc_offer',
      payload: { from: myId, to: targetId, sdp: offer }
    });
  }

  async function handleOffer({ from, to, sdp }) {
    if (to !== myId) return;
    if (peers[from]) return; // already connected

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peers[from] = pc;

    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    pc.ontrack = (e) => attachRemoteAudio(from, e.streams[0]);
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signalChannel.send({
          type: 'broadcast',
          event: 'webrtc_ice',
          payload: { from: myId, to: from, candidate: e.candidate }
        });
      }
    };

    await pc.setRemoteDescription(sdp);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    signalChannel.send({
      type: 'broadcast',
      event: 'webrtc_answer',
      payload: { from: myId, to: from, sdp: answer }
    });
  }

  async function handleAnswer({ from, to, sdp }) {
    if (to !== myId) return;
    const pc = peers[from];
    if (!pc) return;
    await pc.setRemoteDescription(sdp);
  }

  async function handleIce({ from, to, candidate }) {
    if (to !== myId) return;
    const pc = peers[from];
    if (!pc) return;
    try { await pc.addIceCandidate(candidate); } catch (e) {}
  }

  function attachRemoteAudio(userId, stream) {
    if (remoteAudios[userId]) remoteAudios[userId].remove();
    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.id = 'audio-' + userId;
    document.body.appendChild(audio);
    remoteAudios[userId] = audio;
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
    if (status) status.textContent = isActive ? `${count} other player(s) connected` : '';
  }

  return { start, stop, toggleMute, isActive: () => isActive, isMuted: () => isMuted };
})();
