-- ===== IPL AUCTION v2: Room state persistence + saved games =====
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Add auction state columns to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS game_state JSONB DEFAULT NULL;
-- game_state stores: { currentIndex, currentBid, currentBidder, phase, teamStates, soldPlayers, unsoldPlayers, humanTeams, round, lastUpdated }

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS sim_state JSONB DEFAULT NULL;
-- sim_state stores: { schedule, currentMatch, standings, playoffs, champion, completedMatches }

-- 2. Saved games table (DB-backed offline saves for logged-in users)
CREATE TABLE IF NOT EXISTS saved_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phase TEXT NOT NULL,  -- 'squad_review', 'xi_setup', 'tournament', 'playoffs'
  team_states JSONB NOT NULL,
  team_ownership JSONB NOT NULL,
  user_xi_selections JSONB DEFAULT '{}',
  tournament JSONB DEFAULT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE saved_games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own saved games" ON saved_games;
CREATE POLICY "Users see own saved games"
  ON saved_games FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own saved games" ON saved_games;
CREATE POLICY "Users insert own saved games"
  ON saved_games FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own saved games" ON saved_games;
CREATE POLICY "Users update own saved games"
  ON saved_games FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own saved games" ON saved_games;
CREATE POLICY "Users delete own saved games"
  ON saved_games FOR DELETE USING (auth.uid() = user_id);

-- 3. Update rooms RLS to allow players in the room to update game_state
DROP POLICY IF EXISTS "Players in room can update game state" ON rooms;
CREATE POLICY "Players in room can update game state"
  ON rooms FOR UPDATE USING (
    auth.uid() = host_id OR
    EXISTS (SELECT 1 FROM room_players WHERE room_id = rooms.id AND user_id = auth.uid())
  );
