-- ===== IPL AUCTION - SUPABASE SCHEMA =====
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Player',
  avatar_emoji TEXT DEFAULT '🏏',
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT 'IPL Auction Room',
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_players INTEGER DEFAULT 10 CHECK (max_players >= 1 AND max_players <= 10),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'picking_teams', 'auction', 'simulation', 'finished')),
  settings JSONB DEFAULT '{"budget": 12500, "min_players": 18, "max_players_per_team": 25, "timer_seconds": 5}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Room players table
CREATE TABLE IF NOT EXISTS room_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Player',
  team_id TEXT, -- e.g. 'MI', 'CSK', etc.
  is_ready BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id),
  UNIQUE(room_id, team_id) -- one team per player per room
);

-- 4. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Profiles: users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Rooms: anyone can read, authenticated users can create
CREATE POLICY "Rooms are viewable by everyone"
  ON rooms FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Host can update their room"
  ON rooms FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Host can delete their room"
  ON rooms FOR DELETE USING (auth.uid() = host_id);

-- Room players: anyone can read, authenticated users can join/leave
CREATE POLICY "Room players are viewable by everyone"
  ON room_players FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join rooms"
  ON room_players FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own room player entry"
  ON room_players FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON room_players FOR DELETE USING (auth.uid() = user_id);

-- 6. Enable Realtime for rooms and room_players
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;

-- 7. Auto-cleanup: delete rooms older than 24 hours (optional cron)
-- You can set this up via Supabase Dashboard > Database > Extensions > pg_cron
-- SELECT cron.schedule('cleanup-old-rooms', '0 */6 * * *', $$DELETE FROM rooms WHERE created_at < NOW() - INTERVAL '24 hours'$$);
