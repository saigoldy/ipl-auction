// ===== AUTHENTICATION MODULE =====
window.Auth = (function() {
  let currentUser = null;

  async function init() {
    const sb = window.supabaseClient;
    if (!sb) return null;

    // Check existing session
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      currentUser = session.user;
      await ensureProfile(currentUser);
    }

    // Track the original user ID for this tab
    const tabUserId = currentUser ? currentUser.id : null;

    // Listen for auth changes
    sb.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Detect if a DIFFERENT user logged in (another tab)
        if (tabUserId && session.user.id !== tabUserId) {
          // Another account logged in from another tab — don't switch this tab
          console.warn('Different account detected in another tab. Reload to switch.');
          const banner = document.getElementById('session-conflict-banner');
          if (banner) banner.style.display = 'block';
          return; // Don't update this tab's user
        }
        currentUser = session.user;
        await ensureProfile(currentUser);
        showApp();
      } else {
        currentUser = null;
        showAuthScreen();
      }
    });

    return currentUser;
  }

  async function ensureProfile(user) {
    const sb = window.supabaseClient;
    const { data } = await sb.from('profiles').select('*').eq('id', user.id).single();
    if (!data) {
      const username = user.email.split('@')[0];
      await sb.from('profiles').insert({
        id: user.id,
        username: username,
        display_name: user.user_metadata.display_name || username,
        avatar_emoji: '🏏'
      });
    }
  }

  async function signUp(email, password, displayName) {
    const sb = window.supabaseClient;
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const sb = window.supabaseClient;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signInWithGoogle() {
    const sb = window.supabaseClient;
    const { data, error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const sb = window.supabaseClient;
    await sb.auth.signOut();
    currentUser = null;
    showAuthScreen();
  }

  async function getProfile() {
    if (!currentUser) return null;
    const sb = window.supabaseClient;
    const { data } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
    return data;
  }

  function getUser() { return currentUser; }

  function showAuthScreen() {
    document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    const el = document.getElementById('screen-auth');
    el.classList.add('active');
    el.style.display = 'block';
  }

  function showApp() {
    document.getElementById('screen-auth').style.display = 'none';
    App.showScreen('home');
    updateUserDisplay();
  }

  function updateUserDisplay() {
    const userBar = document.getElementById('user-bar');
    if (userBar && currentUser) {
      const name = currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || 'Player';
      userBar.innerHTML = `
        <span class="user-name">🏏 ${name}</span>
        <button class="btn btn-small btn-secondary" onclick="Auth.signOut()">Logout</button>
      `;
      userBar.style.display = 'flex';
    }
  }

  return { init, signUp, signIn, signInWithGoogle, signOut, getUser, getProfile, showAuthScreen, showApp, updateUserDisplay };
})();
