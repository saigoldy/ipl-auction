// ===== DATA LOADER =====
// Fetches teams and players from Supabase, falls back to local JS files
window.DataLoader = (function() {

  async function loadFromSupabase() {
    if (!window.supabaseClient) return false;

    try {
      // Fetch teams
      const { data: teamsData, error: teamsError } = await window.supabaseClient
        .from('teams')
        .select('*');

      if (teamsError) throw teamsError;

      // Fetch players
      const { data: playersData, error: playersError } = await window.supabaseClient
        .from('players')
        .select('*');

      if (playersError) throw playersError;

      if (!teamsData || teamsData.length === 0 || !playersData || playersData.length === 0) {
        console.warn('Supabase returned empty data, falling back to local files');
        return false;
      }

      // Map snake_case DB columns back to camelCase JS properties
      window.TEAMS = teamsData.map(t => ({
        id: t.id,
        name: t.name,
        shortName: t.short_name,
        city: t.city,
        homeGround: t.home_ground,
        colors: t.colors,
        emoji: t.emoji,
        personality: t.personality,
        squadNeeds: t.squad_needs,
        playStyle: t.play_style,
        historicPlayers: t.historic_players || [],
        rivals: t.rivals || []
      }));

      window.PLAYERS = playersData.map(p => {
        const player = {
          id: p.id,
          name: p.name,
          nationality: p.nationality,
          isOverseas: p.is_overseas,
          age: p.age,
          role: p.role,
          subRole: p.sub_role,
          battingStyle: p.batting_style,
          bowlingStyle: p.bowling_style,
          stats: p.stats,
          basePrice: p.base_price,
          starPower: p.star_power,
          teamHistory: p.team_history || [],
          franchiseHistory: p.franchise_history || {},
          hiddenGem: p.hidden_gem
        };
        if (p.hidden_gem_ceiling != null) {
          player.hiddenGemCeiling = p.hidden_gem_ceiling;
        }
        return player;
      });

      console.log(`Loaded ${window.TEAMS.length} teams and ${window.PLAYERS.length} players from Supabase`);
      return true;
    } catch (err) {
      console.warn('Failed to load from Supabase, using local data:', err.message);
      return false;
    }
  }

  async function init() {
    const loaded = await loadFromSupabase();
    if (!loaded) {
      console.log('Using local data files (TEAMS:', window.TEAMS?.length || 0, ', PLAYERS:', window.PLAYERS?.length || 0, ')');
    }
  }

  return { init };
})();
