-- IPL Auction Supabase Data
-- Auto-generated from teams.js and players.js
-- 10 teams, 235 players

DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  city TEXT NOT NULL,
  home_ground TEXT NOT NULL,
  colors JSONB NOT NULL,
  emoji TEXT,
  personality JSONB NOT NULL,
  squad_needs JSONB NOT NULL,
  play_style JSONB NOT NULL,
  historic_players TEXT[] DEFAULT '{}',
  rivals TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  is_overseas BOOLEAN DEFAULT false,
  age INTEGER NOT NULL,
  role TEXT NOT NULL,
  sub_role TEXT,
  batting_style TEXT,
  bowling_style TEXT,
  stats JSONB NOT NULL,
  base_price INTEGER NOT NULL,
  star_power INTEGER NOT NULL,
  team_history TEXT[] DEFAULT '{}',
  franchise_history JSONB DEFAULT '{}',
  hidden_gem BOOLEAN DEFAULT false,
  hidden_gem_ceiling INTEGER
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Public read-only policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Players are viewable by everyone" ON players;
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);

-- Add to realtime publication (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- =============================================
-- INSERT TEAMS (10 teams)
-- =============================================

INSERT INTO teams (id, name, short_name, city, home_ground, colors, emoji, personality, squad_needs, play_style, historic_players, rivals) VALUES (
  'MI',
  'Mumbai Indians',
  'MI',
  'Mumbai',
  'Wankhede Stadium',
  '{"primary":"#004BA0","secondary":"#D4A843","bg":"#002D62"}'::jsonb,
  '🔵',
  '{"aggression":0.75,"sentimentality":0.85,"riskTolerance":0.6,"bluffFrequency":0.3,"rivalryIntensity":0.7}'::jsonb,
  '{"batters":{"min":5,"max":7},"bowlers":{"min":5,"max":7},"allRounders":{"min":3,"max":5},"wicketkeepers":{"min":2,"max":3},"overseas":{"min":5,"max":8}}'::jsonb,
  '{"pacePreference":0.7,"powerHittingValue":0.8,"deathBowlingValue":0.9}'::jsonb,
  ARRAY['RO_SHARMA','JAS_BUMRAH','SK_YADAV','HR_PANDYA','TIL_VARMA','TRE_BOULT','DL_CHAHAR','WIL_JACKS','NAMAN_DHIR'],
  ARRAY['CSK']
);

INSERT INTO teams (id, name, short_name, city, home_ground, colors, emoji, personality, squad_needs, play_style, historic_players, rivals) VALUES (
  'CSK',
  'Chennai Super Kings',
  'CSK',
  'Chennai',
  'MA Chidambaram Stadium',
  '{"primary":"#FCCA06","secondary":"#0081E9","bg":"#F4A100"}'::jsonb,
  '🦁',
  '{"aggression":0.5,"sentimentality":0.95,"riskTolerance":0.4,"bluffFrequency":0.2,"rivalryIntensity":0.6}'::jsonb,
  '{"batters":{"min":5,"max":7},"bowlers":{"min":5,"max":7},"allRounders":{"min":3,"max":5},"wicketkeepers":{"min":2,"max":3},"overseas":{"min":5,"max":8}}'::jsonb,
  '{"pacePreference":0.4,"powerHittingValue":0.6,"deathBowlingValue":0.7}'::jsonb,
  ARRAY['RUT_GAIK','SAN_SAMSON','SHI_DUBE','MS_DHONI','PRASHANT_VEER','KARTIK_SHARMA','AYUSH_MHATRE','DEWALD_BREVIS'],
  ARRAY['MI']
);

INSERT INTO teams (id, name, short_name, city, home_ground, colors, emoji, personality, squad_needs, play_style, historic_players, rivals) VALUES (
  'RCB',
  'Royal Challengers Bengaluru',
  'RCB',
  'Bengaluru',
  'M Chinnaswamy Stadium',
  '{"primary":"#EC1C24","secondary":"#2B2A29","bg":"#B71C1C"}'::jsonb,
  '🔴',
  '{"aggression":0.9,"sentimentality":0.6,"riskTolerance":0.9,"bluffFrequency":0.4,"rivalryIntensity":0.8}'::jsonb,
  '{"batters":{"min":5,"max":7},"bowlers":{"min":5,"max":7},"allRounders":{"min":3,"max":5},"wicketkeepers":{"min":2,"max":3},"overseas":{"min":5,"max":8}}'::jsonb,
  '{"pacePreference":0.5,"powerHittingValue":0.9,"deathBowlingValue":0.8}'::jsonb,
  ARRAY['VIR_KOHLI','RAJAT_PATIDAR','PHI_SALT','JOH_HAZLEWOOD','BHU_KUMAR','JACOB_BETHELL','JIT_SHARMA','VEN_IYER'],
  ARRAY['MI','CSK']
);

INSERT INTO teams (id, name, short_name, city, home_ground, colors, emoji, personality, squad_needs, play_style, historic_players, rivals) VALUES (
  'DC',
  'Delhi Capitals',
  'DC',
  'Delhi',
  'Arun Jaitley Stadium',
  '{"primary":"#004C93","secondary":"#EF1B23","bg":"#00337C"}'::jsonb,
  '🏛️',
  '{"aggression":0.6,"sentimentality":0.4,"riskTolerance":0.7,"bluffFrequency":0.3,"rivalryIntensity":0.5}'::jsonb,
  '{"batters":{"min":5,"max":7},"bowlers":{"min":5,"max":7},"allRounders":{"min":3,"max":5},"wicketkeepers":{"min":2,"max":3},"overseas":{"min":5,"max":8}}'::jsonb,
  '{"pacePreference":0.6,"powerHittingValue":0.7,"deathBowlingValue":0.8}'::jsonb,
  ARRAY['AX_PATEL','KL_RAHUL','KUL_YADAV','MIT_STARC','NAT_NATARA','TRISTAN_STUBBS','MUK_KUMAR','PATHUM_NISSANKA'],
  ARRAY['PBKS']
);

INSERT INTO teams (id, name, short_name, city, home_ground, colors, emoji, personality, squad_needs, play_style, historic_players, rivals) VALUES (
  'KKR',
  'Kolkata Knight Riders',
  'KKR',
  'Kolkata',
  'Eden Gardens',
  '{"primary":"#3A225D","secondary":"#D4A843","bg":"#2D1854"}'::jsonb,
  '💜',
  '{"aggression":0.7,"sentimentality":0.7,"riskTolerance":0.5,"bluffFrequency":0.5,"rivalryIntensity":0.6}'::jsonb,
  '{"batters":{"min":5,"max":7},"bowlers":{"min":5,"max":7},"allRounders":{"min":3,"max":5},"wicketkeepers":{"min":2,"max":3},"overseas":{"min":5,"max":8}}'::jsonb,
  '{"pacePreference":0.5,"powerHittingValue":0.8,"deathBowlingValue":0.7}'::jsonb,
  ARRAY['SUN_NARINE','AND_RUSSELL','RIN_SINGH','VAR_CHAKRA','HAR_RANA','CAM_GREEN','MAHI_THEEKSHANA','AM_RAHANE'],
  ARRAY['RCB']
);

INSERT INTO teams (id, name, short_name, city, home_ground, colors, emoji, personality, squad_needs, play_style, historic_players, rivals) VALUES (
  'SRH',
  'Sunrisers Hyderabad',
  'SRH',
  'Hyderabad',
  'Rajiv Gandhi Intl Stadium',
  '{"primary":"#FF822A","secondary":"#000000","bg":"#E65100"}'::jsonb,
  '🌅',
  '{"aggression":0.4,"sentimentality":0.5,"riskTolerance":0.3,"bluffFrequency":0.1,"rivalryIntensity":0.4}'::jsonb,
  '{"batters":{"min":5,"max":7},"bowlers":{"min":5,"max":7},"allRounders":{"min":3,"max":5},"wicketkeepers":{"min":2,"max":3},"overseas":{"min":5,"max":8}}'::jsonb,
  '{"pacePreference":0.8,"powerHittingValue":0.85,"deathBowlingValue":0.75}'::jsonb,
  ARRAY['HEI_KLAASEN','TRA_HEAD','PAT_CUMMINS','ABH_SHARMA','IS_KISHAN','HAR_PATEL','NITISH_REDDY','LIA_LIVINGSTONE'],
  ARRAY['RR']
);

INSERT INTO teams (id, name, short_name, city, home_ground, colors, emoji, personality, squad_needs, play_style, historic_players, rivals) VALUES (
  'PBKS',
  'Punjab Kings',
  'PBKS',
  'Mohali',
  'IS Bindra Stadium',
  '{"primary":"#ED1B24","secondary":"#A7A9AC","bg":"#C62828"}'::jsonb,
  '👑',
  '{"aggression":0.85,"sentimentality":0.3,"riskTolerance":0.95,"bluffFrequency":0.2,"rivalryIntensity":0.5}'::jsonb,
  '{"batters":{"min":5,"max":7},"bowlers":{"min":5,"max":7},"allRounders":{"min":3,"max":5},"wicketkeepers":{"min":2,"max":3},"overseas":{"min":5,"max":8}}'::jsonb,
  '{"pacePreference":0.6,"powerHittingValue":0.9,"deathBowlingValue":0.6}'::jsonb,
  ARRAY['SHR_IYER','ARS_SINGH','YUZ_CHAHAL','MAR_STOINIS','MARCO_JANSEN','LOC_FERGUSON','PRABHSIMRAN'],
  ARRAY['DC']
);

INSERT INTO teams (id, name, short_name, city, home_ground, colors, emoji, personality, squad_needs, play_style, historic_players, rivals) VALUES (
  'RR',
  'Rajasthan Royals',
  'RR',
  'Jaipur',
  'Sawai Mansingh Stadium',
  '{"primary":"#EA1A85","secondary":"#254AA5","bg":"#C2185B"}'::jsonb,
  '👒',
  '{"aggression":0.55,"sentimentality":0.6,"riskTolerance":0.5,"bluffFrequency":0.3,"rivalryIntensity":0.5}'::jsonb,
  '{"batters":{"min":5,"max":7},"bowlers":{"min":5,"max":7},"allRounders":{"min":3,"max":5},"wicketkeepers":{"min":2,"max":3},"overseas":{"min":5,"max":8}}'::jsonb,
  '{"pacePreference":0.5,"powerHittingValue":0.7,"deathBowlingValue":0.8}'::jsonb,
  ARRAY['YAS_JAISWAL','RIA_PARAG','RA_JADEJA','DH_JUREL','JOF_ARCHER','SHIM_HETMYER','SAM_CURRAN','RAVI_BISHNOI'],
  ARRAY['SRH']
);

INSERT INTO teams (id, name, short_name, city, home_ground, colors, emoji, personality, squad_needs, play_style, historic_players, rivals) VALUES (
  'GT',
  'Gujarat Titans',
  'GT',
  'Ahmedabad',
  'Narendra Modi Stadium',
  '{"primary":"#1C1C1C","secondary":"#A0D2DB","bg":"#0D1B2A"}'::jsonb,
  '🛡️',
  '{"aggression":0.65,"sentimentality":0.5,"riskTolerance":0.6,"bluffFrequency":0.25,"rivalryIntensity":0.55}'::jsonb,
  '{"batters":{"min":5,"max":7},"bowlers":{"min":5,"max":7},"allRounders":{"min":3,"max":5},"wicketkeepers":{"min":2,"max":3},"overseas":{"min":5,"max":8}}'::jsonb,
  '{"pacePreference":0.7,"powerHittingValue":0.65,"deathBowlingValue":0.85}'::jsonb,
  ARRAY['SHU_GILL','RAS_KHAN','JOS_BUTTLER','MO_SIRAJ','KAG_RABADA','PRA_KRISHNA','SAI_SUDHARSAN','WAS_SUNDAR'],
  ARRAY['LSG']
);

INSERT INTO teams (id, name, short_name, city, home_ground, colors, emoji, personality, squad_needs, play_style, historic_players, rivals) VALUES (
  'LSG',
  'Lucknow Super Giants',
  'LSG',
  'Lucknow',
  'BRSABV Ekana Stadium',
  '{"primary":"#A72056","secondary":"#FFCC00","bg":"#7B1642"}'::jsonb,
  '⚡',
  '{"aggression":0.7,"sentimentality":0.4,"riskTolerance":0.65,"bluffFrequency":0.35,"rivalryIntensity":0.6}'::jsonb,
  '{"batters":{"min":5,"max":7},"bowlers":{"min":5,"max":7},"allRounders":{"min":3,"max":5},"wicketkeepers":{"min":2,"max":3},"overseas":{"min":5,"max":8}}'::jsonb,
  '{"pacePreference":0.6,"powerHittingValue":0.75,"deathBowlingValue":0.8}'::jsonb,
  ARRAY['RIS_PANT','NIC_POORAN','MAY_YADAV','MOH_SHAMI','AVE_KHAN','AYU_BADONI','MIT_MARSH','JOSH_INGLIS'],
  ARRAY['GT']
);

-- =============================================
-- INSERT PLAYERS (235 players)
-- =============================================

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'VIR_KOHLI',
  'Virat Kohli',
  'IND',
  false,
  36,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":94,"bowling":5,"fielding":85,"fitness":75,"consistency":88,"clutch":92,"formCeiling":98,"formFloor":55}'::jsonb,
  200,
  98,
  ARRAY['RCB'],
  '{"RCB":{"seasons":17,"wasCaptain":true,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RO_SHARMA',
  'Rohit Sharma',
  'IND',
  false,
  37,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":90,"bowling":5,"fielding":70,"fitness":65,"consistency":82,"clutch":85,"formCeiling":95,"formFloor":45}'::jsonb,
  200,
  96,
  ARRAY['MI'],
  '{"MI":{"seasons":13,"wasCaptain":true,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SK_YADAV',
  'Suryakumar Yadav',
  'IND',
  false,
  34,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":89,"bowling":5,"fielding":78,"fitness":68,"consistency":75,"clutch":80,"formCeiling":96,"formFloor":50}'::jsonb,
  200,
  90,
  ARRAY['MI','KKR'],
  '{"MI":{"seasons":6,"wasCaptain":false,"wasIconic":true},"KKR":{"seasons":3,"wasCaptain":false,"wasIconic":false}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KL_RAHUL',
  'KL Rahul',
  'IND',
  false,
  32,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":87,"bowling":0,"fielding":75,"fitness":65,"consistency":80,"clutch":72,"formCeiling":93,"formFloor":50}'::jsonb,
  200,
  88,
  ARRAY['PBKS','LSG','RCB','DC'],
  '{"PBKS":{"seasons":4,"wasCaptain":true,"wasIconic":true},"LSG":{"seasons":2,"wasCaptain":true,"wasIconic":false},"RCB":{"seasons":3,"wasCaptain":false,"wasIconic":false}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SHU_GILL',
  'Shubman Gill',
  'IND',
  false,
  25,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":85,"bowling":5,"fielding":80,"fitness":85,"consistency":78,"clutch":75,"formCeiling":95,"formFloor":55}'::jsonb,
  200,
  86,
  ARRAY['GT','KKR'],
  '{"GT":{"seasons":3,"wasCaptain":true,"wasIconic":true},"KKR":{"seasons":3,"wasCaptain":false,"wasIconic":false}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RIS_PANT',
  'Rishabh Pant',
  'IND',
  false,
  27,
  'wicketkeeper',
  'wk-batter',
  'LHB',
  NULL,
  '{"batting":86,"bowling":0,"fielding":72,"fitness":70,"consistency":68,"clutch":88,"formCeiling":95,"formFloor":40}'::jsonb,
  200,
  92,
  ARRAY['DC','LSG'],
  '{"DC":{"seasons":7,"wasCaptain":true,"wasIconic":true},"LSG":{"seasons":1,"wasCaptain":true,"wasIconic":false}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SAN_SAMSON',
  'Sanju Samson',
  'IND',
  false,
  30,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":83,"bowling":0,"fielding":75,"fitness":78,"consistency":65,"clutch":78,"formCeiling":92,"formFloor":40}'::jsonb,
  200,
  82,
  ARRAY['RR','CSK'],
  '{"RR":{"seasons":10,"wasCaptain":true,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SHR_IYER',
  'Shreyas Iyer',
  'IND',
  false,
  30,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":82,"bowling":5,"fielding":75,"fitness":72,"consistency":76,"clutch":80,"formCeiling":90,"formFloor":50}'::jsonb,
  200,
  84,
  ARRAY['KKR','DC','PBKS'],
  '{"KKR":{"seasons":2,"wasCaptain":true,"wasIconic":true},"DC":{"seasons":5,"wasCaptain":true,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RUT_GAIK',
  'Ruturaj Gaikwad',
  'IND',
  false,
  27,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":82,"bowling":5,"fielding":72,"fitness":80,"consistency":76,"clutch":74,"formCeiling":92,"formFloor":50}'::jsonb,
  200,
  80,
  ARRAY['CSK'],
  '{"CSK":{"seasons":5,"wasCaptain":true,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'YAS_JAISWAL',
  'Yashasvi Jaiswal',
  'IND',
  false,
  23,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":84,"bowling":5,"fielding":78,"fitness":88,"consistency":72,"clutch":76,"formCeiling":95,"formFloor":48}'::jsonb,
  200,
  85,
  ARRAY['RR'],
  '{"RR":{"seasons":4,"wasCaptain":false,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'IS_KISHAN',
  'Ishan Kishan',
  'IND',
  false,
  26,
  'wicketkeeper',
  'wk-batter',
  'LHB',
  NULL,
  '{"batting":78,"bowling":0,"fielding":72,"fitness":78,"consistency":62,"clutch":68,"formCeiling":88,"formFloor":38}'::jsonb,
  200,
  76,
  ARRAY['MI','SRH'],
  '{"MI":{"seasons":5,"wasCaptain":false,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DEV_PADIK',
  'Devdutt Padikkal',
  'IND',
  false,
  24,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":75,"bowling":5,"fielding":72,"fitness":82,"consistency":68,"clutch":65,"formCeiling":88,"formFloor":45}'::jsonb,
  100,
  62,
  ARRAY['RR','RCB','LSG','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'TIL_VARMA',
  'Tilak Varma',
  'IND',
  false,
  22,
  'batter',
  'middle-order',
  'LHB',
  'SLA',
  '{"batting":78,"bowling":15,"fielding":75,"fitness":85,"consistency":70,"clutch":74,"formCeiling":92,"formFloor":48}'::jsonb,
  200,
  80,
  ARRAY['MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RIN_SINGH',
  'Rinku Singh',
  'IND',
  false,
  27,
  'batter',
  'finisher',
  'LHB',
  NULL,
  '{"batting":76,"bowling":5,"fielding":70,"fitness":80,"consistency":68,"clutch":90,"formCeiling":88,"formFloor":50}'::jsonb,
  200,
  78,
  ARRAY['KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ABH_SHARMA',
  'Abhishek Sharma',
  'IND',
  false,
  24,
  'allRounder',
  'batting-ar',
  'LHB',
  'SLA',
  '{"batting":76,"bowling":35,"fielding":70,"fitness":82,"consistency":62,"clutch":70,"formCeiling":88,"formFloor":42}'::jsonb,
  200,
  76,
  ARRAY['SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'PRI_SHAW',
  'Prithvi Shaw',
  'IND',
  false,
  25,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":72,"bowling":5,"fielding":55,"fitness":55,"consistency":50,"clutch":55,"formCeiling":90,"formFloor":30}'::jsonb,
  75,
  60,
  ARRAY['DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SAI_SUDHARSAN',
  'Sai Sudharsan',
  'IND',
  false,
  23,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":76,"bowling":5,"fielding":72,"fitness":84,"consistency":72,"clutch":68,"formCeiling":88,"formFloor":50}'::jsonb,
  150,
  70,
  ARRAY['GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DIN_KARTHIK',
  'Dinesh Karthik',
  'IND',
  false,
  39,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":68,"bowling":0,"fielding":72,"fitness":55,"consistency":60,"clutch":82,"formCeiling":78,"formFloor":35}'::jsonb,
  75,
  65,
  ARRAY['RCB','KKR','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AM_RAHANE',
  'Ajinkya Rahane',
  'IND',
  false,
  36,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":65,"bowling":5,"fielding":68,"fitness":60,"consistency":60,"clutch":62,"formCeiling":78,"formFloor":38}'::jsonb,
  50,
  55,
  ARRAY['CSK','RR','DC','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'NIT_RANA',
  'Nitish Rana',
  'IND',
  false,
  30,
  'batter',
  'middle-order',
  'LHB',
  'OB',
  '{"batting":72,"bowling":20,"fielding":65,"fitness":72,"consistency":64,"clutch":68,"formCeiling":82,"formFloor":42}'::jsonb,
  75,
  58,
  ARRAY['KKR','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JAS_BUMRAH',
  'Jasprit Bumrah',
  'IND',
  false,
  31,
  'bowler',
  'death-bowler',
  'RHB',
  'RF',
  '{"batting":10,"bowling":96,"fielding":65,"fitness":68,"consistency":90,"clutch":95,"formCeiling":99,"formFloor":70}'::jsonb,
  200,
  97,
  ARRAY['MI'],
  '{"MI":{"seasons":11,"wasCaptain":false,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MOH_SHAMI',
  'Mohammed Shami',
  'IND',
  false,
  34,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RFM',
  '{"batting":10,"bowling":88,"fielding":55,"fitness":50,"consistency":78,"clutch":82,"formCeiling":93,"formFloor":55}'::jsonb,
  200,
  85,
  ARRAY['GT','PBKS','SRH','LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MO_SIRAJ',
  'Mohammed Siraj',
  'IND',
  false,
  30,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":82,"fielding":60,"fitness":78,"consistency":70,"clutch":74,"formCeiling":90,"formFloor":50}'::jsonb,
  150,
  78,
  ARRAY['RCB','GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'YUZ_CHAHAL',
  'Yuzvendra Chahal',
  'IND',
  false,
  34,
  'bowler',
  'spin',
  'RHB',
  'LB',
  '{"batting":5,"bowling":84,"fielding":50,"fitness":72,"consistency":72,"clutch":78,"formCeiling":92,"formFloor":48}'::jsonb,
  150,
  80,
  ARRAY['RR','RCB','PBKS'],
  '{"RCB":{"seasons":8,"wasCaptain":false,"wasIconic":true},"RR":{"seasons":3,"wasCaptain":false,"wasIconic":false}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KUL_YADAV',
  'Kuldeep Yadav',
  'IND',
  false,
  30,
  'bowler',
  'spin',
  'LHB',
  'CLA',
  '{"batting":10,"bowling":83,"fielding":60,"fitness":70,"consistency":72,"clutch":76,"formCeiling":91,"formFloor":50}'::jsonb,
  200,
  78,
  ARRAY['DC','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ARS_SINGH',
  'Arshdeep Singh',
  'IND',
  false,
  25,
  'bowler',
  'death-bowler',
  'LHB',
  'LFM',
  '{"batting":5,"bowling":80,"fielding":58,"fitness":82,"consistency":72,"clutch":78,"formCeiling":90,"formFloor":52}'::jsonb,
  200,
  82,
  ARRAY['PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'R_ASHWIN',
  'Ravichandran Ashwin',
  'IND',
  false,
  38,
  'bowler',
  'spin',
  'RHB',
  'OB',
  '{"batting":30,"bowling":82,"fielding":55,"fitness":60,"consistency":78,"clutch":80,"formCeiling":88,"formFloor":55}'::jsonb,
  150,
  82,
  ARRAY['CSK','RR','DC','PBKS','CSK'],
  '{"CSK":{"seasons":7,"wasCaptain":false,"wasIconic":true},"PBKS":{"seasons":2,"wasCaptain":false,"wasIconic":false},"DC":{"seasons":2,"wasCaptain":false,"wasIconic":false},"RR":{"seasons":2,"wasCaptain":false,"wasIconic":false}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AVE_KHAN',
  'Avesh Khan',
  'IND',
  false,
  28,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":72,"fielding":55,"fitness":75,"consistency":60,"clutch":62,"formCeiling":82,"formFloor":42}'::jsonb,
  100,
  58,
  ARRAY['LSG','RCB','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'PRA_KRISHNA',
  'Prasidh Krishna',
  'IND',
  false,
  28,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":74,"fielding":55,"fitness":68,"consistency":62,"clutch":65,"formCeiling":85,"formFloor":45}'::jsonb,
  100,
  60,
  ARRAY['RR','GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MUK_KUMAR',
  'Mukesh Kumar',
  'IND',
  false,
  30,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":70,"fielding":55,"fitness":78,"consistency":65,"clutch":60,"formCeiling":80,"formFloor":48}'::jsonb,
  75,
  52,
  ARRAY['DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'UMR_MALIK',
  'Umran Malik',
  'IND',
  false,
  25,
  'bowler',
  'pace',
  'RHB',
  'RF',
  '{"batting":5,"bowling":68,"fielding":50,"fitness":72,"consistency":45,"clutch":55,"formCeiling":88,"formFloor":30}'::jsonb,
  75,
  65,
  ARRAY['SRH','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'NAT_NATARA',
  'T Natarajan',
  'IND',
  false,
  33,
  'bowler',
  'death-bowler',
  'LHB',
  'LFM',
  '{"batting":5,"bowling":72,"fielding":50,"fitness":58,"consistency":65,"clutch":72,"formCeiling":82,"formFloor":45}'::jsonb,
  75,
  58,
  ARRAY['SRH','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DL_CHAHAR',
  'Deepak Chahar',
  'IND',
  false,
  32,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RFM',
  '{"batting":35,"bowling":76,"fielding":55,"fitness":48,"consistency":62,"clutch":68,"formCeiling":85,"formFloor":42}'::jsonb,
  100,
  65,
  ARRAY['CSK','MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'HAR_PATEL',
  'Harshal Patel',
  'IND',
  false,
  34,
  'bowler',
  'death-bowler',
  'RHB',
  'RFM',
  '{"batting":25,"bowling":76,"fielding":58,"fitness":68,"consistency":68,"clutch":75,"formCeiling":86,"formFloor":48}'::jsonb,
  100,
  65,
  ARRAY['RCB','PBKS','SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'VAR_CHAKRA',
  'Varun Chakravarthy',
  'IND',
  false,
  33,
  'bowler',
  'spin',
  'RHB',
  'OB',
  '{"batting":5,"bowling":78,"fielding":50,"fitness":62,"consistency":68,"clutch":72,"formCeiling":88,"formFloor":40}'::jsonb,
  150,
  74,
  ARRAY['KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAH_CHAHAR',
  'Rahul Chahar',
  'IND',
  false,
  25,
  'bowler',
  'spin',
  'RHB',
  'LB',
  '{"batting":5,"bowling":70,"fielding":55,"fitness":75,"consistency":62,"clutch":60,"formCeiling":82,"formFloor":42}'::jsonb,
  75,
  55,
  ARRAY['MI','PBKS','RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SHA_THAKUR',
  'Shardul Thakur',
  'IND',
  false,
  33,
  'allRounder',
  'bowling-ar',
  'RHB',
  'RFM',
  '{"batting":45,"bowling":72,"fielding":60,"fitness":65,"consistency":58,"clutch":72,"formCeiling":82,"formFloor":38}'::jsonb,
  100,
  62,
  ARRAY['CSK','DC','KKR','MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'HR_PANDYA',
  'Hardik Pandya',
  'IND',
  false,
  31,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":82,"bowling":68,"fielding":75,"fitness":50,"consistency":68,"clutch":82,"formCeiling":92,"formFloor":40}'::jsonb,
  200,
  90,
  ARRAY['MI','GT','MI'],
  '{"MI":{"seasons":8,"wasCaptain":true,"wasIconic":true},"GT":{"seasons":2,"wasCaptain":true,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RA_JADEJA',
  'Ravindra Jadeja',
  'IND',
  false,
  36,
  'allRounder',
  'bowling-ar',
  'LHB',
  'SLA',
  '{"batting":72,"bowling":82,"fielding":95,"fitness":72,"consistency":78,"clutch":80,"formCeiling":90,"formFloor":52}'::jsonb,
  200,
  88,
  ARRAY['CSK','RR'],
  '{"CSK":{"seasons":13,"wasCaptain":true,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AX_PATEL',
  'Axar Patel',
  'IND',
  false,
  31,
  'allRounder',
  'bowling-ar',
  'LHB',
  'SLA',
  '{"batting":65,"bowling":78,"fielding":70,"fitness":78,"consistency":74,"clutch":72,"formCeiling":86,"formFloor":50}'::jsonb,
  200,
  72,
  ARRAY['DC','GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'WAS_SUNDAR',
  'Washington Sundar',
  'IND',
  false,
  25,
  'allRounder',
  'bowling-ar',
  'LHB',
  'OB',
  '{"batting":58,"bowling":72,"fielding":65,"fitness":80,"consistency":68,"clutch":65,"formCeiling":84,"formFloor":45}'::jsonb,
  100,
  62,
  ARRAY['SRH','RCB','GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'VEN_IYER',
  'Venkatesh Iyer',
  'IND',
  false,
  30,
  'allRounder',
  'batting-ar',
  'LHB',
  'RFM',
  '{"batting":70,"bowling":40,"fielding":65,"fitness":78,"consistency":58,"clutch":62,"formCeiling":82,"formFloor":38}'::jsonb,
  100,
  72,
  ARRAY['KKR','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KRU_PANDYA',
  'Krunal Pandya',
  'IND',
  false,
  33,
  'allRounder',
  'bowling-ar',
  'LHB',
  'SLA',
  '{"batting":62,"bowling":65,"fielding":62,"fitness":72,"consistency":62,"clutch":58,"formCeiling":78,"formFloor":40}'::jsonb,
  75,
  55,
  ARRAY['MI','LSG','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SHA_AHMED',
  'Shahbaz Ahmed',
  'IND',
  false,
  30,
  'allRounder',
  'bowling-ar',
  'LHB',
  'SLA',
  '{"batting":58,"bowling":62,"fielding":60,"fitness":75,"consistency":58,"clutch":55,"formCeiling":76,"formFloor":38}'::jsonb,
  50,
  45,
  ARRAY['RCB','SRH','LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAJ_TEWATIA',
  'Rahul Tewatia',
  'IND',
  false,
  31,
  'allRounder',
  'batting-ar',
  'LHB',
  'LB',
  '{"batting":68,"bowling":45,"fielding":62,"fitness":72,"consistency":58,"clutch":82,"formCeiling":82,"formFloor":38}'::jsonb,
  75,
  62,
  ARRAY['GT','RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'FAF_DUP',
  'Faf du Plessis',
  'SA',
  true,
  40,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":82,"bowling":5,"fielding":78,"fitness":60,"consistency":78,"clutch":80,"formCeiling":88,"formFloor":48}'::jsonb,
  150,
  78,
  ARRAY['RCB','CSK'],
  '{"RCB":{"seasons":3,"wasCaptain":true,"wasIconic":true},"CSK":{"seasons":4,"wasCaptain":false,"wasIconic":false}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DAV_WARNER',
  'David Warner',
  'AUS',
  true,
  38,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":86,"bowling":5,"fielding":75,"fitness":62,"consistency":80,"clutch":82,"formCeiling":92,"formFloor":48}'::jsonb,
  200,
  88,
  ARRAY['SRH','DC'],
  '{"SRH":{"seasons":8,"wasCaptain":true,"wasIconic":true},"DC":{"seasons":2,"wasCaptain":false,"wasIconic":false}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'TRA_HEAD',
  'Travis Head',
  'AUS',
  true,
  31,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":84,"bowling":10,"fielding":72,"fitness":80,"consistency":72,"clutch":82,"formCeiling":94,"formFloor":48}'::jsonb,
  200,
  88,
  ARRAY['SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JOS_BUTTLER',
  'Jos Buttler',
  'ENG',
  true,
  34,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":88,"bowling":0,"fielding":78,"fitness":72,"consistency":72,"clutch":88,"formCeiling":96,"formFloor":42}'::jsonb,
  200,
  90,
  ARRAY['RR','MI','GT'],
  '{"RR":{"seasons":7,"wasCaptain":false,"wasIconic":true},"MI":{"seasons":3,"wasCaptain":false,"wasIconic":false}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'QUI_DEKOK',
  'Quinton de Kock',
  'SA',
  true,
  32,
  'wicketkeeper',
  'wk-batter',
  'LHB',
  NULL,
  '{"batting":82,"bowling":0,"fielding":75,"fitness":75,"consistency":72,"clutch":74,"formCeiling":90,"formFloor":45}'::jsonb,
  200,
  80,
  ARRAY['LSG','MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'PHI_SALT',
  'Phil Salt',
  'ENG',
  true,
  28,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":82,"bowling":0,"fielding":72,"fitness":82,"consistency":68,"clutch":72,"formCeiling":92,"formFloor":42}'::jsonb,
  200,
  82,
  ARRAY['DC','KKR','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'HEI_KLAASEN',
  'Heinrich Klaasen',
  'SA',
  true,
  33,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":85,"bowling":0,"fielding":72,"fitness":78,"consistency":70,"clutch":88,"formCeiling":95,"formFloor":45}'::jsonb,
  200,
  90,
  ARRAY['SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DEV_CONWAY',
  'Devon Conway',
  'NZ',
  true,
  33,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":78,"bowling":5,"fielding":75,"fitness":78,"consistency":74,"clutch":70,"formCeiling":86,"formFloor":50}'::jsonb,
  150,
  70,
  ARRAY['CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DAV_MILLER',
  'David Miller',
  'SA',
  true,
  35,
  'batter',
  'finisher',
  'LHB',
  NULL,
  '{"batting":78,"bowling":5,"fielding":75,"fitness":72,"consistency":65,"clutch":85,"formCeiling":88,"formFloor":42}'::jsonb,
  150,
  72,
  ARRAY['GT','PBKS','RR','LSG','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'NIC_POORAN',
  'Nicholas Pooran',
  'WI',
  true,
  29,
  'wicketkeeper',
  'wk-batter',
  'LHB',
  NULL,
  '{"batting":78,"bowling":0,"fielding":70,"fitness":78,"consistency":58,"clutch":75,"formCeiling":90,"formFloor":35}'::jsonb,
  200,
  80,
  ARRAY['LSG','SRH','PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAC_RAVIN',
  'Rachin Ravindra',
  'NZ',
  true,
  25,
  'allRounder',
  'batting-ar',
  'LHB',
  'SLA',
  '{"batting":74,"bowling":45,"fielding":72,"fitness":85,"consistency":65,"clutch":68,"formCeiling":86,"formFloor":42}'::jsonb,
  150,
  70,
  ARRAY['CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'WIL_JACKS',
  'Will Jacks',
  'ENG',
  true,
  26,
  'allRounder',
  'batting-ar',
  'RHB',
  'OB',
  '{"batting":76,"bowling":42,"fielding":72,"fitness":82,"consistency":62,"clutch":68,"formCeiling":88,"formFloor":40}'::jsonb,
  150,
  72,
  ARRAY['RCB','MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SHIM_HETMYER',
  'Shimron Hetmyer',
  'WI',
  true,
  28,
  'batter',
  'finisher',
  'LHB',
  NULL,
  '{"batting":76,"bowling":5,"fielding":62,"fitness":58,"consistency":58,"clutch":78,"formCeiling":88,"formFloor":35}'::jsonb,
  150,
  65,
  ARRAY['RR','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'TIM_DAVID',
  'Tim David',
  'AUS',
  true,
  29,
  'batter',
  'finisher',
  'RHB',
  NULL,
  '{"batting":76,"bowling":5,"fielding":65,"fitness":80,"consistency":60,"clutch":78,"formCeiling":88,"formFloor":38}'::jsonb,
  100,
  68,
  ARRAY['MI','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'HAR_BROOK',
  'Harry Brook',
  'ENG',
  true,
  26,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":80,"bowling":10,"fielding":72,"fitness":84,"consistency":68,"clutch":72,"formCeiling":92,"formFloor":45}'::jsonb,
  200,
  78,
  ARRAY['SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JOE_ROOT',
  'Joe Root',
  'ENG',
  true,
  34,
  'batter',
  'top-order',
  'RHB',
  'OB',
  '{"batting":72,"bowling":25,"fielding":75,"fitness":78,"consistency":80,"clutch":75,"formCeiling":82,"formFloor":55}'::jsonb,
  100,
  72,
  ARRAY['RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MIT_STARC',
  'Mitchell Starc',
  'AUS',
  true,
  35,
  'bowler',
  'powerplay-bowler',
  'LHB',
  'LF',
  '{"batting":15,"bowling":90,"fielding":60,"fitness":65,"consistency":78,"clutch":85,"formCeiling":95,"formFloor":55}'::jsonb,
  200,
  92,
  ARRAY['KKR','RCB','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'PAT_CUMMINS',
  'Pat Cummins',
  'AUS',
  true,
  32,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RF',
  '{"batting":30,"bowling":86,"fielding":65,"fitness":75,"consistency":80,"clutch":85,"formCeiling":92,"formFloor":58}'::jsonb,
  200,
  88,
  ARRAY['SRH','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JOF_ARCHER',
  'Jofra Archer',
  'ENG',
  true,
  30,
  'bowler',
  'death-bowler',
  'RHB',
  'RF',
  '{"batting":20,"bowling":88,"fielding":62,"fitness":45,"consistency":72,"clutch":85,"formCeiling":95,"formFloor":50}'::jsonb,
  200,
  86,
  ARRAY['MI','RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KAG_RABADA',
  'Kagiso Rabada',
  'SA',
  true,
  30,
  'bowler',
  'death-bowler',
  'LHB',
  'RF',
  '{"batting":10,"bowling":88,"fielding":62,"fitness":78,"consistency":80,"clutch":84,"formCeiling":94,"formFloor":58}'::jsonb,
  200,
  86,
  ARRAY['PBKS','DC','GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ANR_NORTJE',
  'Anrich Nortje',
  'SA',
  true,
  31,
  'bowler',
  'pace',
  'RHB',
  'RF',
  '{"batting":5,"bowling":84,"fielding":55,"fitness":60,"consistency":68,"clutch":75,"formCeiling":92,"formFloor":48}'::jsonb,
  150,
  75,
  ARRAY['DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'TRE_BOULT',
  'Trent Boult',
  'NZ',
  true,
  35,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'LFM',
  '{"batting":10,"bowling":82,"fielding":58,"fitness":70,"consistency":76,"clutch":78,"formCeiling":88,"formFloor":52}'::jsonb,
  150,
  78,
  ARRAY['RR','MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'LOC_FERGUSON',
  'Lockie Ferguson',
  'NZ',
  true,
  34,
  'bowler',
  'death-bowler',
  'RHB',
  'RF',
  '{"batting":5,"bowling":80,"fielding":55,"fitness":72,"consistency":68,"clutch":72,"formCeiling":88,"formFloor":48}'::jsonb,
  150,
  72,
  ARRAY['GT','KKR','PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MAR_WOOD',
  'Mark Wood',
  'ENG',
  true,
  35,
  'bowler',
  'pace',
  'RHB',
  'RF',
  '{"batting":5,"bowling":78,"fielding":55,"fitness":55,"consistency":62,"clutch":68,"formCeiling":88,"formFloor":42}'::jsonb,
  150,
  70,
  ARRAY['LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JOH_HAZLEWOOD',
  'Josh Hazlewood',
  'AUS',
  true,
  34,
  'bowler',
  'powerplay-bowler',
  'LHB',
  'RFM',
  '{"batting":5,"bowling":82,"fielding":60,"fitness":68,"consistency":78,"clutch":78,"formCeiling":88,"formFloor":55}'::jsonb,
  150,
  74,
  ARRAY['RCB','CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'REC_TOPLEY',
  'Reece Topley',
  'ENG',
  true,
  31,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'LFM',
  '{"batting":5,"bowling":72,"fielding":55,"fitness":58,"consistency":62,"clutch":60,"formCeiling":80,"formFloor":42}'::jsonb,
  75,
  55,
  ARRAY['RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'CHR_WOAKES',
  'Chris Woakes',
  'ENG',
  true,
  36,
  'allRounder',
  'bowling-ar',
  'RHB',
  'RFM',
  '{"batting":35,"bowling":76,"fielding":65,"fitness":65,"consistency":72,"clutch":70,"formCeiling":82,"formFloor":48}'::jsonb,
  100,
  62,
  ARRAY['DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'GER_COETZEE',
  'Gerald Coetzee',
  'SA',
  true,
  24,
  'bowler',
  'pace',
  'RHB',
  'RF',
  '{"batting":10,"bowling":74,"fielding":55,"fitness":82,"consistency":58,"clutch":62,"formCeiling":88,"formFloor":40}'::jsonb,
  100,
  62,
  ARRAY['MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'NAT_ELLIS',
  'Nathan Ellis',
  'AUS',
  true,
  30,
  'bowler',
  'death-bowler',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":72,"fielding":55,"fitness":78,"consistency":65,"clutch":68,"formCeiling":82,"formFloor":45}'::jsonb,
  100,
  58,
  ARRAY['PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MUS_AHMED',
  'Mustafizur Rahman',
  'BAN',
  true,
  29,
  'bowler',
  'death-bowler',
  'LHB',
  'LFM',
  '{"batting":5,"bowling":74,"fielding":50,"fitness":72,"consistency":66,"clutch":68,"formCeiling":84,"formFloor":45}'::jsonb,
  100,
  60,
  ARRAY['CSK','SRH','DC','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAS_KHAN',
  'Rashid Khan',
  'AFG',
  true,
  26,
  'bowler',
  'spin',
  'RHB',
  'LB',
  '{"batting":40,"bowling":90,"fielding":72,"fitness":85,"consistency":82,"clutch":88,"formCeiling":95,"formFloor":62}'::jsonb,
  200,
  92,
  ARRAY['GT','SRH'],
  '{"GT":{"seasons":3,"wasCaptain":false,"wasIconic":true},"SRH":{"seasons":5,"wasCaptain":false,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SUN_NARINE',
  'Sunil Narine',
  'WI',
  true,
  36,
  'allRounder',
  'bowling-ar',
  'LHB',
  'OB',
  '{"batting":72,"bowling":85,"fielding":62,"fitness":68,"consistency":75,"clutch":82,"formCeiling":92,"formFloor":50}'::jsonb,
  200,
  88,
  ARRAY['KKR'],
  '{"KKR":{"seasons":13,"wasCaptain":false,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ADA_ZAMPA',
  'Adam Zampa',
  'AUS',
  true,
  33,
  'bowler',
  'spin',
  'RHB',
  'LB',
  '{"batting":5,"bowling":76,"fielding":58,"fitness":78,"consistency":72,"clutch":70,"formCeiling":84,"formFloor":50}'::jsonb,
  150,
  68,
  ARRAY['RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'WAN_HASARANGA',
  'Wanindu Hasaranga',
  'SL',
  true,
  28,
  'allRounder',
  'bowling-ar',
  'RHB',
  'LB',
  '{"batting":40,"bowling":80,"fielding":65,"fitness":78,"consistency":68,"clutch":72,"formCeiling":88,"formFloor":48}'::jsonb,
  150,
  72,
  ARRAY['RCB','SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MAT_THEEK',
  'Maheesh Theekshana',
  'SL',
  true,
  25,
  'bowler',
  'spin',
  'RHB',
  'OB',
  '{"batting":5,"bowling":74,"fielding":55,"fitness":80,"consistency":65,"clutch":68,"formCeiling":85,"formFloor":45}'::jsonb,
  100,
  60,
  ARRAY['CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MIT_SANTNER',
  'Mitchell Santner',
  'NZ',
  true,
  33,
  'allRounder',
  'bowling-ar',
  'LHB',
  'SLA',
  '{"batting":45,"bowling":72,"fielding":68,"fitness":78,"consistency":68,"clutch":65,"formCeiling":82,"formFloor":45}'::jsonb,
  100,
  60,
  ARRAY['CSK','MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'TAB_SHAMSI',
  'Tabraiz Shamsi',
  'SA',
  true,
  35,
  'bowler',
  'spin',
  'RHB',
  'CLA',
  '{"batting":5,"bowling":72,"fielding":50,"fitness":72,"consistency":62,"clutch":62,"formCeiling":82,"formFloor":42}'::jsonb,
  75,
  52,
  ARRAY['RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'BEN_STOKES',
  'Ben Stokes',
  'ENG',
  true,
  34,
  'allRounder',
  'batting-ar',
  'LHB',
  'RFM',
  '{"batting":80,"bowling":68,"fielding":78,"fitness":55,"consistency":72,"clutch":92,"formCeiling":92,"formFloor":42}'::jsonb,
  200,
  92,
  ARRAY['CSK','RR','LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'GLE_MAXWELL',
  'Glenn Maxwell',
  'AUS',
  true,
  36,
  'allRounder',
  'batting-ar',
  'RHB',
  'OB',
  '{"batting":78,"bowling":42,"fielding":75,"fitness":68,"consistency":55,"clutch":82,"formCeiling":95,"formFloor":30}'::jsonb,
  200,
  85,
  ARRAY['RCB','PBKS','DC','MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SAM_CURRAN',
  'Sam Curran',
  'ENG',
  true,
  27,
  'allRounder',
  'bowling-ar',
  'LHB',
  'LFM',
  '{"batting":60,"bowling":74,"fielding":72,"fitness":78,"consistency":68,"clutch":75,"formCeiling":86,"formFloor":45}'::jsonb,
  200,
  82,
  ARRAY['PBKS','CSK','RR'],
  '{"PBKS":{"seasons":3,"wasCaptain":false,"wasIconic":true},"CSK":{"seasons":2,"wasCaptain":false,"wasIconic":false}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AND_RUSSELL',
  'Andre Russell',
  'WI',
  true,
  36,
  'allRounder',
  'batting-ar',
  'RHB',
  'RF',
  '{"batting":82,"bowling":60,"fielding":68,"fitness":48,"consistency":55,"clutch":90,"formCeiling":95,"formFloor":35}'::jsonb,
  200,
  90,
  ARRAY['KKR'],
  '{"KKR":{"seasons":10,"wasCaptain":false,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'LIA_LIVINGSTONE',
  'Liam Livingstone',
  'ENG',
  true,
  32,
  'allRounder',
  'batting-ar',
  'RHB',
  'LB',
  '{"batting":78,"bowling":38,"fielding":68,"fitness":72,"consistency":58,"clutch":72,"formCeiling":90,"formFloor":38}'::jsonb,
  200,
  74,
  ARRAY['PBKS','RR','RCB','SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MAR_STOINIS',
  'Marcus Stoinis',
  'AUS',
  true,
  36,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":76,"bowling":45,"fielding":70,"fitness":72,"consistency":62,"clutch":72,"formCeiling":86,"formFloor":40}'::jsonb,
  150,
  72,
  ARRAY['LSG','DC','PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MIT_MARSH',
  'Mitchell Marsh',
  'AUS',
  true,
  34,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":75,"bowling":48,"fielding":68,"fitness":62,"consistency":62,"clutch":70,"formCeiling":86,"formFloor":40}'::jsonb,
  150,
  72,
  ARRAY['DC','SRH','LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MOE_ALI',
  'Moeen Ali',
  'ENG',
  true,
  37,
  'allRounder',
  'batting-ar',
  'LHB',
  'OB',
  '{"batting":68,"bowling":60,"fielding":65,"fitness":65,"consistency":65,"clutch":68,"formCeiling":82,"formFloor":42}'::jsonb,
  100,
  68,
  ARRAY['CSK','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ROM_POWELL',
  'Rovman Powell',
  'WI',
  true,
  31,
  'batter',
  'finisher',
  'RHB',
  NULL,
  '{"batting":72,"bowling":5,"fielding":65,"fitness":78,"consistency":55,"clutch":72,"formCeiling":86,"formFloor":35}'::jsonb,
  75,
  58,
  ARRAY['DC','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'CAM_GREEN',
  'Cameron Green',
  'AUS',
  true,
  26,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":72,"bowling":58,"fielding":70,"fitness":60,"consistency":60,"clutch":65,"formCeiling":86,"formFloor":38}'::jsonb,
  200,
  85,
  ARRAY['MI','RCB','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DH_JUREL',
  'Dhruv Jurel',
  'IND',
  false,
  24,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":62,"bowling":0,"fielding":72,"fitness":85,"consistency":58,"clutch":68,"formCeiling":82,"formFloor":38}'::jsonb,
  200,
  72,
  ARRAY['RR'],
  '{}'::jsonb,
  true,
  80
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JIT_SHARMA',
  'Jitesh Sharma',
  'IND',
  false,
  30,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":65,"bowling":0,"fielding":68,"fitness":78,"consistency":58,"clutch":72,"formCeiling":78,"formFloor":38}'::jsonb,
  150,
  42,
  ARRAY['PBKS','MI','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RIA_PARAG',
  'Riyan Parag',
  'IND',
  false,
  23,
  'allRounder',
  'batting-ar',
  'RHB',
  'OB',
  '{"batting":72,"bowling":25,"fielding":72,"fitness":85,"consistency":62,"clutch":70,"formCeiling":88,"formFloor":40}'::jsonb,
  200,
  78,
  ARRAY['RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SHI_DUBE',
  'Shivam Dube',
  'IND',
  false,
  31,
  'allRounder',
  'batting-ar',
  'LHB',
  'RFM',
  '{"batting":72,"bowling":30,"fielding":58,"fitness":72,"consistency":58,"clutch":72,"formCeiling":84,"formFloor":38}'::jsonb,
  100,
  62,
  ARRAY['CSK','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AYU_BADONI',
  'Ayush Badoni',
  'IND',
  false,
  25,
  'batter',
  'middle-order',
  'RHB',
  'LB',
  '{"batting":68,"bowling":18,"fielding":65,"fitness":82,"consistency":58,"clutch":68,"formCeiling":84,"formFloor":38}'::jsonb,
  50,
  52,
  ARRAY['LSG'],
  '{}'::jsonb,
  true,
  82
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAJ_SINGH',
  'Rajveer Singh',
  'IND',
  false,
  21,
  'allRounder',
  'batting-ar',
  'RHB',
  'OB',
  '{"batting":48,"bowling":32,"fielding":65,"fitness":90,"consistency":45,"clutch":50,"formCeiling":78,"formFloor":30}'::jsonb,
  20,
  15,
  '{}',
  '{}'::jsonb,
  true,
  78
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'NEH_KRUNAL',
  'Nehal Wadhera',
  'IND',
  false,
  24,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":65,"bowling":5,"fielding":60,"fitness":80,"consistency":55,"clutch":62,"formCeiling":80,"formFloor":35}'::jsonb,
  30,
  35,
  ARRAY['PBKS','MI'],
  '{}'::jsonb,
  true,
  78
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SAC_BABY',
  'Sachin Baby',
  'IND',
  false,
  35,
  'batter',
  'middle-order',
  'LHB',
  NULL,
  '{"batting":55,"bowling":5,"fielding":58,"fitness":62,"consistency":50,"clutch":52,"formCeiling":68,"formFloor":32}'::jsonb,
  20,
  20,
  ARRAY['RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'HAR_RANA',
  'Harshit Rana',
  'IND',
  false,
  23,
  'bowler',
  'pace',
  'RHB',
  'RFM',
  '{"batting":10,"bowling":70,"fielding":55,"fitness":85,"consistency":58,"clutch":62,"formCeiling":86,"formFloor":40}'::jsonb,
  75,
  55,
  ARRAY['KKR'],
  '{}'::jsonb,
  true,
  84
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MAY_YADAV',
  'Mayank Yadav',
  'IND',
  false,
  22,
  'bowler',
  'pace',
  'RHB',
  'RF',
  '{"batting":5,"bowling":68,"fielding":50,"fitness":45,"consistency":42,"clutch":58,"formCeiling":90,"formFloor":30}'::jsonb,
  150,
  70,
  ARRAY['LSG'],
  '{}'::jsonb,
  true,
  88
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'YAS_CHOUDHARY',
  'Yash Dayal',
  'IND',
  false,
  27,
  'bowler',
  'powerplay-bowler',
  'LHB',
  'LFM',
  '{"batting":5,"bowling":68,"fielding":55,"fitness":78,"consistency":60,"clutch":58,"formCeiling":80,"formFloor":42}'::jsonb,
  50,
  45,
  ARRAY['GT','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'NIS_SINDHU',
  'Nishant Sindhu',
  'IND',
  false,
  21,
  'allRounder',
  'bowling-ar',
  'LHB',
  'SLA',
  '{"batting":42,"bowling":48,"fielding":58,"fitness":85,"consistency":42,"clutch":45,"formCeiling":72,"formFloor":28}'::jsonb,
  20,
  18,
  ARRAY['CSK','GT'],
  '{}'::jsonb,
  true,
  72
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SAN_JHA',
  'Sandeep Jha',
  'IND',
  false,
  22,
  'bowler',
  'spin',
  'RHB',
  'OB',
  '{"batting":10,"bowling":45,"fielding":50,"fitness":82,"consistency":40,"clutch":42,"formCeiling":72,"formFloor":28}'::jsonb,
  20,
  12,
  '{}',
  '{}'::jsonb,
  true,
  74
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAVI_BISHNOI',
  'Ravi Bishnoi',
  'IND',
  false,
  24,
  'bowler',
  'spin',
  'RHB',
  'LB',
  '{"batting":5,"bowling":74,"fielding":68,"fitness":82,"consistency":65,"clutch":68,"formCeiling":86,"formFloor":45}'::jsonb,
  100,
  62,
  ARRAY['LSG','PBKS','GT','RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'NAZ_GHULAM',
  'Noor Ahmad',
  'AFG',
  true,
  20,
  'bowler',
  'spin',
  'LHB',
  'CLA',
  '{"batting":10,"bowling":72,"fielding":58,"fitness":85,"consistency":60,"clutch":62,"formCeiling":86,"formFloor":40}'::jsonb,
  75,
  55,
  ARRAY['GT'],
  '{}'::jsonb,
  true,
  84
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'FAZAL_FAROOQI',
  'Fazalhaq Farooqi',
  'AFG',
  true,
  24,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'LFM',
  '{"batting":5,"bowling":76,"fielding":52,"fitness":82,"consistency":65,"clutch":68,"formCeiling":88,"formFloor":42}'::jsonb,
  100,
  65,
  ARRAY['SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'BHU_KUMAR',
  'Bhuvneshwar Kumar',
  'IND',
  false,
  35,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RFM',
  '{"batting":25,"bowling":75,"fielding":58,"fitness":55,"consistency":70,"clutch":72,"formCeiling":82,"formFloor":48}'::jsonb,
  100,
  68,
  ARRAY['SRH','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ABH_POREL',
  'Akash Deep',
  'IND',
  false,
  27,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RFM',
  '{"batting":10,"bowling":68,"fielding":55,"fitness":78,"consistency":60,"clutch":58,"formCeiling":80,"formFloor":42}'::jsonb,
  50,
  42,
  ARRAY['RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'VIJ_SHANKAR',
  'Vijay Shankar',
  'IND',
  false,
  34,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":60,"bowling":42,"fielding":62,"fitness":68,"consistency":55,"clutch":55,"formCeiling":72,"formFloor":35}'::jsonb,
  50,
  40,
  ARRAY['GT','SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SAH_WRIDDHIMAN',
  'Wriddhiman Saha',
  'IND',
  false,
  40,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":55,"bowling":0,"fielding":80,"fitness":52,"consistency":58,"clutch":55,"formCeiling":68,"formFloor":35}'::jsonb,
  30,
  35,
  ARRAY['GT','SRH','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MAN_PANDEY',
  'Manish Pandey',
  'IND',
  false,
  35,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":62,"bowling":5,"fielding":68,"fitness":62,"consistency":60,"clutch":55,"formCeiling":75,"formFloor":38}'::jsonb,
  50,
  42,
  ARRAY['SRH','KKR','LSG','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KAR_AHMED',
  'Karim Janat',
  'AFG',
  true,
  27,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":58,"bowling":50,"fielding":60,"fitness":78,"consistency":50,"clutch":55,"formCeiling":75,"formFloor":32}'::jsonb,
  50,
  30,
  '{}',
  '{}'::jsonb,
  true,
  72
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAM_PAUDEL',
  'Kushal Bhurtel',
  'NEP',
  true,
  24,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":52,"bowling":5,"fielding":58,"fitness":80,"consistency":45,"clutch":48,"formCeiling":72,"formFloor":28}'::jsonb,
  30,
  20,
  '{}',
  '{}'::jsonb,
  true,
  72
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'NAM_OJHA',
  'Narayan Jagadeesan',
  'IND',
  false,
  28,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":58,"bowling":0,"fielding":68,"fitness":78,"consistency":52,"clutch":55,"formCeiling":75,"formFloor":32}'::jsonb,
  30,
  28,
  ARRAY['CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SUR_KUMAR',
  'Suryansh Shedge',
  'IND',
  false,
  19,
  'allRounder',
  'batting-ar',
  'LHB',
  'SLA',
  '{"batting":45,"bowling":28,"fielding":62,"fitness":88,"consistency":38,"clutch":42,"formCeiling":78,"formFloor":25}'::jsonb,
  20,
  22,
  ARRAY['PBKS'],
  '{}'::jsonb,
  true,
  78
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'VIS_JAISWAL',
  'Vishnu Vinod',
  'IND',
  false,
  28,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":55,"bowling":0,"fielding":65,"fitness":75,"consistency":48,"clutch":55,"formCeiling":70,"formFloor":30}'::jsonb,
  20,
  22,
  ARRAY['DC','RCB','PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SIM_SINGH',
  'Simerjeet Singh',
  'IND',
  false,
  26,
  'bowler',
  'pace',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":55,"fielding":50,"fitness":78,"consistency":48,"clutch":48,"formCeiling":72,"formFloor":30}'::jsonb,
  20,
  18,
  ARRAY['MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ARJUN_TENDULKAR',
  'Arjun Tendulkar',
  'IND',
  false,
  25,
  'allRounder',
  'bowling-ar',
  'LHB',
  'LFM',
  '{"batting":35,"bowling":48,"fielding":55,"fitness":78,"consistency":40,"clutch":42,"formCeiling":68,"formFloor":25}'::jsonb,
  30,
  45,
  ARRAY['MI','LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SAR_KHAN',
  'Sarfaraz Khan',
  'IND',
  false,
  27,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":72,"bowling":5,"fielding":58,"fitness":68,"consistency":62,"clutch":68,"formCeiling":85,"formFloor":42}'::jsonb,
  75,
  58,
  ARRAY['RCB','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SAI_KISHORE',
  'R Sai Kishore',
  'IND',
  false,
  28,
  'bowler',
  'spin',
  'LHB',
  'SLA',
  '{"batting":10,"bowling":66,"fielding":55,"fitness":78,"consistency":60,"clutch":55,"formCeiling":78,"formFloor":38}'::jsonb,
  30,
  32,
  ARRAY['GT','CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'PRY_DUBEY',
  'Piyush Chawla',
  'IND',
  false,
  36,
  'bowler',
  'spin',
  'RHB',
  'LB',
  '{"batting":20,"bowling":62,"fielding":50,"fitness":58,"consistency":58,"clutch":55,"formCeiling":72,"formFloor":38}'::jsonb,
  30,
  35,
  ARRAY['KKR','CSK','MI','PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'UME_CHAND',
  'Umed Chand',
  'IND',
  false,
  22,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":42,"bowling":5,"fielding":58,"fitness":85,"consistency":38,"clutch":40,"formCeiling":72,"formFloor":25}'::jsonb,
  20,
  12,
  '{}',
  '{}'::jsonb,
  true,
  72
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAJ_BAWA',
  'Raj Angad Bawa',
  'IND',
  false,
  22,
  'allRounder',
  'batting-ar',
  'LHB',
  'RFM',
  '{"batting":48,"bowling":42,"fielding":60,"fitness":82,"consistency":42,"clutch":48,"formCeiling":74,"formFloor":28}'::jsonb,
  30,
  28,
  ARRAY['PBKS','MI'],
  '{}'::jsonb,
  true,
  72
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KWE_AHMED',
  'Kwena Maphaka',
  'SA',
  true,
  19,
  'bowler',
  'pace',
  'LHB',
  'LF',
  '{"batting":5,"bowling":62,"fielding":50,"fitness":85,"consistency":45,"clutch":48,"formCeiling":85,"formFloor":28}'::jsonb,
  50,
  42,
  ARRAY['MI','RR'],
  '{}'::jsonb,
  true,
  82
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'TOM_CURRAN',
  'Tom Curran',
  'ENG',
  true,
  30,
  'allRounder',
  'bowling-ar',
  'RHB',
  'RFM',
  '{"batting":38,"bowling":65,"fielding":62,"fitness":72,"consistency":55,"clutch":58,"formCeiling":75,"formFloor":38}'::jsonb,
  50,
  40,
  ARRAY['DC','RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DWA_PRETORIUS',
  'Dwaine Pretorius',
  'SA',
  true,
  36,
  'allRounder',
  'bowling-ar',
  'RHB',
  'RFM',
  '{"batting":42,"bowling":62,"fielding":58,"fitness":65,"consistency":55,"clutch":58,"formCeiling":72,"formFloor":38}'::jsonb,
  50,
  38,
  ARRAY['CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'OBE_MCCOY',
  'Obed McCoy',
  'WI',
  true,
  28,
  'bowler',
  'death-bowler',
  'LHB',
  'LFM',
  '{"batting":5,"bowling":68,"fielding":50,"fitness":68,"consistency":55,"clutch":60,"formCeiling":80,"formFloor":35}'::jsonb,
  50,
  38,
  ARRAY['RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAH_TRIPATHI',
  'Rahul Tripathi',
  'IND',
  false,
  34,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":70,"bowling":5,"fielding":65,"fitness":68,"consistency":62,"clutch":72,"formCeiling":80,"formFloor":42}'::jsonb,
  75,
  52,
  ARRAY['SRH','KKR','CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RUS_MUTHIAH',
  'Tushar Deshpande',
  'IND',
  false,
  30,
  'bowler',
  'death-bowler',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":66,"fielding":52,"fitness":72,"consistency":58,"clutch":60,"formCeiling":76,"formFloor":38}'::jsonb,
  50,
  38,
  ARRAY['CSK','DC','RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MAHI_THEEKSHANA',
  'Matheesha Pathirana',
  'SL',
  true,
  22,
  'bowler',
  'death-bowler',
  'RHB',
  'RF',
  '{"batting":5,"bowling":78,"fielding":52,"fitness":68,"consistency":62,"clutch":72,"formCeiling":90,"formFloor":42}'::jsonb,
  200,
  72,
  ARRAY['CSK','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ABI_SAKARIA',
  'Chetan Sakariya',
  'IND',
  false,
  27,
  'bowler',
  'powerplay-bowler',
  'LHB',
  'LFM',
  '{"batting":10,"bowling":62,"fielding":52,"fitness":72,"consistency":52,"clutch":55,"formCeiling":76,"formFloor":35}'::jsonb,
  30,
  32,
  ARRAY['RR','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'WRI_PATEL',
  'Nandre Burger',
  'SA',
  true,
  31,
  'bowler',
  'pace',
  'RHB',
  'LFM',
  '{"batting":5,"bowling":68,"fielding":50,"fitness":72,"consistency":58,"clutch":58,"formCeiling":78,"formFloor":38}'::jsonb,
  50,
  35,
  ARRAY['GT','RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SIS_IYER',
  'Sameer Rizvi',
  'IND',
  false,
  21,
  'batter',
  'middle-order',
  'RHB',
  'OB',
  '{"batting":52,"bowling":18,"fielding":62,"fitness":85,"consistency":42,"clutch":48,"formCeiling":76,"formFloor":28}'::jsonb,
  20,
  22,
  ARRAY['CSK','DC'],
  '{}'::jsonb,
  true,
  75
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MHD_NABI',
  'Mohammad Nabi',
  'AFG',
  true,
  40,
  'allRounder',
  'bowling-ar',
  'RHB',
  'OB',
  '{"batting":55,"bowling":62,"fielding":62,"fitness":58,"consistency":60,"clutch":58,"formCeiling":72,"formFloor":40}'::jsonb,
  50,
  45,
  ARRAY['SRH','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAS_POWELL',
  'Alzarri Joseph',
  'WI',
  true,
  28,
  'bowler',
  'pace',
  'RHB',
  'RF',
  '{"batting":15,"bowling":74,"fielding":55,"fitness":72,"consistency":58,"clutch":65,"formCeiling":85,"formFloor":40}'::jsonb,
  100,
  58,
  ARRAY['MI','GT','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MUK_CHOUDHARY',
  'Mukesh Choudhary',
  'IND',
  false,
  27,
  'bowler',
  'powerplay-bowler',
  'LHB',
  'LFM',
  '{"batting":5,"bowling":60,"fielding":50,"fitness":75,"consistency":50,"clutch":50,"formCeiling":72,"formFloor":32}'::jsonb,
  30,
  28,
  ARRAY['CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ASH_NEHRA',
  'Ashutosh Sharma',
  'IND',
  false,
  24,
  'batter',
  'finisher',
  'RHB',
  NULL,
  '{"batting":62,"bowling":5,"fielding":60,"fitness":82,"consistency":48,"clutch":65,"formCeiling":80,"formFloor":30}'::jsonb,
  30,
  32,
  ARRAY['PBKS','DC'],
  '{}'::jsonb,
  true,
  76
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'LALIT_YADAV',
  'Lalit Yadav',
  'IND',
  false,
  27,
  'allRounder',
  'bowling-ar',
  'RHB',
  'OB',
  '{"batting":48,"bowling":52,"fielding":58,"fitness":78,"consistency":48,"clutch":50,"formCeiling":70,"formFloor":30}'::jsonb,
  30,
  25,
  ARRAY['DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KAN_DEB',
  'Anukul Roy',
  'IND',
  false,
  25,
  'allRounder',
  'bowling-ar',
  'LHB',
  'SLA',
  '{"batting":38,"bowling":50,"fielding":55,"fitness":78,"consistency":45,"clutch":42,"formCeiling":68,"formFloor":28}'::jsonb,
  20,
  18,
  ARRAY['MI','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SWAPNIL',
  'Swapnil Singh',
  'IND',
  false,
  28,
  'allRounder',
  'bowling-ar',
  'LHB',
  'SLA',
  '{"batting":42,"bowling":55,"fielding":55,"fitness":75,"consistency":48,"clutch":48,"formCeiling":68,"formFloor":30}'::jsonb,
  20,
  18,
  ARRAY['RR','RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SUYASH',
  'Suyash Sharma',
  'IND',
  false,
  20,
  'bowler',
  'spin',
  'RHB',
  'LB',
  '{"batting":5,"bowling":52,"fielding":50,"fitness":85,"consistency":42,"clutch":45,"formCeiling":76,"formFloor":28}'::jsonb,
  20,
  18,
  ARRAY['KKR','RCB'],
  '{}'::jsonb,
  true,
  74
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'GUR_SINGH',
  'Gurnoor Singh',
  'IND',
  false,
  21,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":50,"bowling":5,"fielding":60,"fitness":85,"consistency":42,"clutch":48,"formCeiling":76,"formFloor":28}'::jsonb,
  20,
  15,
  ARRAY['PBKS'],
  '{}'::jsonb,
  true,
  74
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'VIP_KUMAR',
  'Vijaykumar Vyshak',
  'IND',
  false,
  26,
  'bowler',
  'pace',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":62,"fielding":52,"fitness":78,"consistency":52,"clutch":52,"formCeiling":74,"formFloor":34}'::jsonb,
  30,
  25,
  ARRAY['RCB','PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SHLK_JACKSON',
  'Sheldon Jackson',
  'IND',
  false,
  37,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":52,"bowling":0,"fielding":70,"fitness":62,"consistency":50,"clutch":48,"formCeiling":65,"formFloor":30}'::jsonb,
  20,
  18,
  ARRAY['KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'LIT_NGIDI',
  'Lungi Ngidi',
  'SA',
  true,
  29,
  'bowler',
  'pace',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":76,"fielding":55,"fitness":62,"consistency":62,"clutch":65,"formCeiling":85,"formFloor":42}'::jsonb,
  100,
  62,
  ARRAY['CSK','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'WANINDU_TWO',
  'Charith Asalanka',
  'SL',
  true,
  28,
  'batter',
  'middle-order',
  'LHB',
  'OB',
  '{"batting":72,"bowling":22,"fielding":68,"fitness":80,"consistency":60,"clutch":65,"formCeiling":84,"formFloor":40}'::jsonb,
  75,
  55,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'GUDAKESH_MOTIE',
  'Gudakesh Motie',
  'WI',
  true,
  28,
  'bowler',
  'spin',
  'RHB',
  'SLA',
  '{"batting":10,"bowling":70,"fielding":52,"fitness":78,"consistency":62,"clutch":58,"formCeiling":80,"formFloor":42}'::jsonb,
  50,
  38,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DAS_RAJAPAKSHA',
  'Bhanuka Rajapaksha',
  'SL',
  true,
  33,
  'batter',
  'finisher',
  'LHB',
  NULL,
  '{"batting":68,"bowling":5,"fielding":55,"fitness":68,"consistency":52,"clutch":72,"formCeiling":82,"formFloor":35}'::jsonb,
  50,
  42,
  ARRAY['PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MITCH_SWEPSON',
  'Matt Short',
  'AUS',
  true,
  28,
  'allRounder',
  'batting-ar',
  'RHB',
  'OB',
  '{"batting":68,"bowling":35,"fielding":65,"fitness":80,"consistency":55,"clutch":58,"formCeiling":80,"formFloor":35}'::jsonb,
  50,
  38,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MANOR_WARRIORS',
  'Manor Singh',
  'IND',
  false,
  20,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":42,"bowling":5,"fielding":55,"fitness":88,"consistency":35,"clutch":40,"formCeiling":72,"formFloor":22}'::jsonb,
  20,
  10,
  '{}',
  '{}'::jsonb,
  true,
  70
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAM_MINNU',
  'Ramandeep Singh',
  'IND',
  false,
  27,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":55,"bowling":35,"fielding":65,"fitness":80,"consistency":48,"clutch":55,"formCeiling":72,"formFloor":30}'::jsonb,
  30,
  28,
  ARRAY['MI','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SHERFANE',
  'Sherfane Rutherford',
  'WI',
  true,
  26,
  'batter',
  'finisher',
  'LHB',
  NULL,
  '{"batting":65,"bowling":5,"fielding":58,"fitness":78,"consistency":50,"clutch":65,"formCeiling":80,"formFloor":32}'::jsonb,
  50,
  38,
  ARRAY['GT','DC','MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JOSH_LITTLE',
  'Josh Little',
  'IRE',
  true,
  25,
  'bowler',
  'powerplay-bowler',
  'LHB',
  'LFM',
  '{"batting":5,"bowling":68,"fielding":52,"fitness":80,"consistency":55,"clutch":58,"formCeiling":80,"formFloor":38}'::jsonb,
  50,
  38,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KAM_GHOSH',
  'Kumar Kartikeya',
  'IND',
  false,
  26,
  'bowler',
  'spin',
  'RHB',
  'CLA',
  '{"batting":5,"bowling":62,"fielding":50,"fitness":78,"consistency":52,"clutch":52,"formCeiling":76,"formFloor":32}'::jsonb,
  30,
  28,
  ARRAY['MI','LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DARSHAN_NALKANDE',
  'Darshan Nalkande',
  'IND',
  false,
  26,
  'allRounder',
  'bowling-ar',
  'RHB',
  'RFM',
  '{"batting":35,"bowling":55,"fielding":55,"fitness":78,"consistency":45,"clutch":45,"formCeiling":68,"formFloor":28}'::jsonb,
  20,
  15,
  ARRAY['SRH','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ABH_BANDEKAR',
  'Angkrish Raghuvanshi',
  'IND',
  false,
  20,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":48,"bowling":5,"fielding":58,"fitness":88,"consistency":38,"clutch":42,"formCeiling":76,"formFloor":25}'::jsonb,
  20,
  18,
  ARRAY['KKR'],
  '{}'::jsonb,
  true,
  74
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MITCH_OWEN',
  'Mitchell Owen',
  'AUS',
  true,
  24,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":68,"bowling":5,"fielding":65,"fitness":85,"consistency":48,"clutch":58,"formCeiling":85,"formFloor":32}'::jsonb,
  75,
  52,
  ARRAY['GT','PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'PRABHSIMRAN',
  'Prabhsimran Singh',
  'IND',
  false,
  24,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":58,"bowling":0,"fielding":62,"fitness":80,"consistency":45,"clutch":52,"formCeiling":76,"formFloor":28}'::jsonb,
  30,
  28,
  ARRAY['PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DOM_SIBLEY',
  'Donovan Ferreira',
  'SA',
  true,
  25,
  'allRounder',
  'batting-ar',
  'RHB',
  'OB',
  '{"batting":62,"bowling":28,"fielding":62,"fitness":80,"consistency":48,"clutch":55,"formCeiling":76,"formFloor":32}'::jsonb,
  30,
  25,
  ARRAY['RR'],
  '{}'::jsonb,
  true,
  72
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ABI_TOUCH',
  'Abhinav Manohar',
  'IND',
  false,
  30,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":58,"bowling":5,"fielding":58,"fitness":72,"consistency":48,"clutch":55,"formCeiling":72,"formFloor":30}'::jsonb,
  30,
  25,
  ARRAY['GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MOHSIN_KHAN',
  'Mohsin Khan',
  'IND',
  false,
  26,
  'bowler',
  'powerplay-bowler',
  'LHB',
  'LFM',
  '{"batting":5,"bowling":70,"fielding":50,"fitness":48,"consistency":55,"clutch":58,"formCeiling":82,"formFloor":38}'::jsonb,
  50,
  42,
  ARRAY['LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AZMATULLAH',
  'Azmatullah Omarzai',
  'AFG',
  true,
  25,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":65,"bowling":55,"fielding":62,"fitness":82,"consistency":52,"clutch":60,"formCeiling":80,"formFloor":35}'::jsonb,
  75,
  55,
  ARRAY['KKR','PBKS'],
  '{}'::jsonb,
  true,
  78
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'TANUSH_KOTIAN',
  'Tanush Kotian',
  'IND',
  false,
  26,
  'allRounder',
  'bowling-ar',
  'RHB',
  'OB',
  '{"batting":40,"bowling":55,"fielding":55,"fitness":78,"consistency":48,"clutch":48,"formCeiling":70,"formFloor":28}'::jsonb,
  20,
  18,
  ARRAY['MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ARSH_KHAN',
  'Arshad Khan',
  'IND',
  false,
  23,
  'bowler',
  'pace',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":52,"fielding":50,"fitness":82,"consistency":45,"clutch":45,"formCeiling":72,"formFloor":28}'::jsonb,
  20,
  12,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'HIMANSHU_S',
  'Himanshu Sharma',
  'IND',
  false,
  21,
  'bowler',
  'spin',
  'RHB',
  'LB',
  '{"batting":10,"bowling":50,"fielding":52,"fitness":85,"consistency":42,"clutch":42,"formCeiling":72,"formFloor":25}'::jsonb,
  20,
  10,
  '{}',
  '{}'::jsonb,
  true,
  72
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SANV_PATEL',
  'Sanvir Patel',
  'IND',
  false,
  24,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":48,"bowling":5,"fielding":58,"fitness":82,"consistency":42,"clutch":45,"formCeiling":72,"formFloor":25}'::jsonb,
  20,
  10,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'PRERAK_M',
  'Prerak Mankad',
  'IND',
  false,
  22,
  'allRounder',
  'batting-ar',
  'LHB',
  'SLA',
  '{"batting":45,"bowling":38,"fielding":55,"fitness":85,"consistency":40,"clutch":42,"formCeiling":72,"formFloor":25}'::jsonb,
  20,
  14,
  '{}',
  '{}'::jsonb,
  true,
  70
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KHRITHIK_SETH',
  'Khrithik Seth',
  'IND',
  false,
  20,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":42,"bowling":5,"fielding":55,"fitness":88,"consistency":38,"clutch":40,"formCeiling":70,"formFloor":22}'::jsonb,
  20,
  10,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AKASH_SINGH',
  'Akash Singh',
  'IND',
  false,
  23,
  'bowler',
  'pace',
  'LHB',
  'LFM',
  '{"batting":8,"bowling":55,"fielding":50,"fitness":80,"consistency":45,"clutch":48,"formCeiling":74,"formFloor":28}'::jsonb,
  20,
  15,
  ARRAY['RR','LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SAGAR_UDESHI',
  'Sagar Udeshi',
  'IND',
  false,
  25,
  'bowler',
  'pace',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":48,"fielding":50,"fitness":78,"consistency":42,"clutch":42,"formCeiling":68,"formFloor":25}'::jsonb,
  20,
  10,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'YASH_THAKUR',
  'Yash Thakur',
  'IND',
  false,
  25,
  'bowler',
  'death-bowler',
  'RHB',
  'RFM',
  '{"batting":8,"bowling":58,"fielding":52,"fitness":78,"consistency":48,"clutch":50,"formCeiling":72,"formFloor":30}'::jsonb,
  30,
  22,
  ARRAY['LSG','PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ANUJ_RAWAT',
  'Anuj Rawat',
  'IND',
  false,
  24,
  'wicketkeeper',
  'wk-batter',
  'LHB',
  NULL,
  '{"batting":52,"bowling":0,"fielding":65,"fitness":80,"consistency":42,"clutch":45,"formCeiling":72,"formFloor":28}'::jsonb,
  20,
  20,
  ARRAY['RCB','GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'VILL_IBADULLA',
  'Vyshak Vijay Kumar',
  'IND',
  false,
  27,
  'bowler',
  'pace',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":55,"fielding":50,"fitness":75,"consistency":48,"clutch":48,"formCeiling":70,"formFloor":30}'::jsonb,
  20,
  12,
  ARRAY['RCB'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AVIK_ANAND',
  'Avanish Rao Aravelly',
  'IND',
  false,
  20,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":42,"bowling":0,"fielding":62,"fitness":85,"consistency":38,"clutch":40,"formCeiling":68,"formFloor":22}'::jsonb,
  20,
  10,
  '{}',
  '{}'::jsonb,
  true,
  68
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RISHI_DHAWAN',
  'Rishi Dhawan',
  'IND',
  false,
  34,
  'allRounder',
  'bowling-ar',
  'RHB',
  'RFM',
  '{"batting":42,"bowling":52,"fielding":55,"fitness":62,"consistency":48,"clutch":50,"formCeiling":65,"formFloor":30}'::jsonb,
  20,
  18,
  ARRAY['PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SUMIT_KUMAR',
  'Sumit Kumar',
  'IND',
  false,
  23,
  'bowler',
  'pace',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":50,"fielding":48,"fitness":80,"consistency":42,"clutch":42,"formCeiling":70,"formFloor":25}'::jsonb,
  20,
  10,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MAYANK_DAGAR',
  'Mayank Dagar',
  'IND',
  false,
  24,
  'allRounder',
  'bowling-ar',
  'LHB',
  'SLA',
  '{"batting":38,"bowling":55,"fielding":55,"fitness":80,"consistency":45,"clutch":45,"formCeiling":72,"formFloor":28}'::jsonb,
  20,
  15,
  ARRAY['SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'HARPREET_BRAR',
  'Harpreet Brar',
  'IND',
  false,
  29,
  'allRounder',
  'bowling-ar',
  'LHB',
  'SLA',
  '{"batting":42,"bowling":60,"fielding":55,"fitness":72,"consistency":52,"clutch":55,"formCeiling":74,"formFloor":32}'::jsonb,
  30,
  28,
  ARRAY['PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DHRUV_KAPILA',
  'Dhruv Kapila',
  'IND',
  false,
  25,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":45,"bowling":5,"fielding":58,"fitness":82,"consistency":40,"clutch":42,"formCeiling":68,"formFloor":25}'::jsonb,
  20,
  10,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MURUGAN_ASHWIN',
  'Murugan Ashwin',
  'IND',
  false,
  34,
  'bowler',
  'spin',
  'RHB',
  'LB',
  '{"batting":8,"bowling":58,"fielding":48,"fitness":65,"consistency":52,"clutch":50,"formCeiling":70,"formFloor":32}'::jsonb,
  20,
  20,
  ARRAY['MI','PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JASH_SHAH',
  'Jash Shah',
  'IND',
  false,
  20,
  'bowler',
  'spin',
  'LHB',
  'SLA',
  '{"batting":10,"bowling":48,"fielding":50,"fitness":88,"consistency":38,"clutch":40,"formCeiling":70,"formFloor":25}'::jsonb,
  20,
  10,
  '{}',
  '{}'::jsonb,
  true,
  70
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'TEJAS_BAROKA',
  'Tejas Baroka',
  'IND',
  false,
  26,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":48,"bowling":5,"fielding":55,"fitness":78,"consistency":42,"clutch":42,"formCeiling":68,"formFloor":25}'::jsonb,
  20,
  10,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'NAMAN_DHIR',
  'Naman Dhir',
  'IND',
  false,
  22,
  'allRounder',
  'batting-ar',
  'RHB',
  'OB',
  '{"batting":45,"bowling":32,"fielding":58,"fitness":85,"consistency":40,"clutch":42,"formCeiling":70,"formFloor":25}'::jsonb,
  20,
  12,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RASIKH_SALAM',
  'Rasikh Salam',
  'IND',
  false,
  22,
  'bowler',
  'pace',
  'RHB',
  'RF',
  '{"batting":5,"bowling":60,"fielding":48,"fitness":78,"consistency":45,"clutch":48,"formCeiling":76,"formFloor":28}'::jsonb,
  20,
  18,
  ARRAY['MI','GT','RCB'],
  '{}'::jsonb,
  true,
  76
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DEWALD_BREVIS',
  'Dewald Brevis',
  'SA',
  true,
  22,
  'batter',
  'middle-order',
  'RHB',
  'LB',
  '{"batting":68,"bowling":18,"fielding":62,"fitness":85,"consistency":48,"clutch":58,"formCeiling":85,"formFloor":32}'::jsonb,
  75,
  55,
  ARRAY['MI','CSK'],
  '{}'::jsonb,
  true,
  82
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RAJAT_PATIDAR',
  'Rajat Patidar',
  'IND',
  false,
  32,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":80,"bowling":5,"fielding":72,"fitness":75,"consistency":72,"clutch":85,"formCeiling":90,"formFloor":48}'::jsonb,
  200,
  78,
  ARRAY['RCB'],
  '{"RCB":{"seasons":5,"wasCaptain":true,"wasIconic":true}}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'PRASHANT_VEER',
  'Prashant Veer',
  'IND',
  false,
  22,
  'bowler',
  'spin',
  'RHB',
  'SLA',
  '{"batting":15,"bowling":58,"fielding":55,"fitness":85,"consistency":45,"clutch":50,"formCeiling":82,"formFloor":28}'::jsonb,
  30,
  35,
  ARRAY['CSK'],
  '{}'::jsonb,
  true,
  80
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KARTIK_SHARMA',
  'Kartik Sharma',
  'IND',
  false,
  21,
  'bowler',
  'spin',
  'LHB',
  'SLA',
  '{"batting":10,"bowling":55,"fielding":52,"fitness":88,"consistency":42,"clutch":45,"formCeiling":80,"formFloor":25}'::jsonb,
  30,
  32,
  ARRAY['CSK'],
  '{}'::jsonb,
  true,
  78
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'NITISH_REDDY',
  'Nitish Kumar Reddy',
  'IND',
  false,
  22,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":72,"bowling":48,"fielding":68,"fitness":85,"consistency":58,"clutch":70,"formCeiling":88,"formFloor":38}'::jsonb,
  100,
  72,
  ARRAY['SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AYUSH_MHATRE',
  'Ayush Mhatre',
  'IND',
  false,
  19,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":55,"bowling":5,"fielding":62,"fitness":90,"consistency":40,"clutch":48,"formCeiling":82,"formFloor":25}'::jsonb,
  20,
  28,
  ARRAY['CSK'],
  '{}'::jsonb,
  true,
  78
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'GLENN_PHILLIPS',
  'Glenn Phillips',
  'NZ',
  true,
  30,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  'OB',
  '{"batting":74,"bowling":28,"fielding":72,"fitness":80,"consistency":60,"clutch":72,"formCeiling":86,"formFloor":38}'::jsonb,
  100,
  62,
  ARRAY['GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JOSH_INGLIS',
  'Josh Inglis',
  'AUS',
  true,
  30,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":72,"bowling":0,"fielding":75,"fitness":80,"consistency":62,"clutch":68,"formCeiling":84,"formFloor":38}'::jsonb,
  100,
  58,
  ARRAY['LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JASON_HOLDER',
  'Jason Holder',
  'WI',
  true,
  34,
  'allRounder',
  'bowling-ar',
  'RHB',
  'RFM',
  '{"batting":52,"bowling":72,"fielding":65,"fitness":72,"consistency":65,"clutch":68,"formCeiling":80,"formFloor":42}'::jsonb,
  100,
  58,
  ARRAY['GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AUQIB_NABI',
  'Auqib Nabi',
  'IND',
  false,
  23,
  'bowler',
  'pace',
  'RHB',
  'LFM',
  '{"batting":5,"bowling":62,"fielding":52,"fitness":82,"consistency":48,"clutch":52,"formCeiling":80,"formFloor":30}'::jsonb,
  50,
  35,
  ARRAY['DC'],
  '{}'::jsonb,
  true,
  78
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'PATHUM_NISSANKA',
  'Pathum Nissanka',
  'SL',
  true,
  28,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":76,"bowling":5,"fielding":72,"fitness":82,"consistency":68,"clutch":65,"formCeiling":86,"formFloor":42}'::jsonb,
  100,
  62,
  ARRAY['DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JACOB_BETHELL',
  'Jacob Bethell',
  'ENG',
  true,
  22,
  'allRounder',
  'batting-ar',
  'LHB',
  'SLA',
  '{"batting":70,"bowling":35,"fielding":68,"fitness":88,"consistency":55,"clutch":62,"formCeiling":88,"formFloor":35}'::jsonb,
  75,
  60,
  ARRAY['RCB'],
  '{}'::jsonb,
  true,
  82
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KARUN_NAIR',
  'Karun Nair',
  'IND',
  false,
  35,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":72,"bowling":5,"fielding":65,"fitness":68,"consistency":65,"clutch":68,"formCeiling":82,"formFloor":42}'::jsonb,
  50,
  55,
  ARRAY['DC','PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'VAIBHAV_SURYA',
  'Vaibhav Suryavanshi',
  'IND',
  false,
  15,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":42,"bowling":5,"fielding":55,"fitness":90,"consistency":32,"clutch":38,"formCeiling":82,"formFloor":20}'::jsonb,
  20,
  35,
  ARRAY['RR'],
  '{}'::jsonb,
  true,
  78
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MARCO_JANSEN',
  'Marco Jansen',
  'SA',
  true,
  26,
  'allRounder',
  'bowling-ar',
  'LHB',
  'LFM',
  '{"batting":45,"bowling":78,"fielding":62,"fitness":78,"consistency":65,"clutch":68,"formCeiling":88,"formFloor":42}'::jsonb,
  150,
  72,
  ARRAY['PBKS'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'TRISTAN_STUBBS',
  'Tristan Stubbs',
  'SA',
  true,
  25,
  'batter',
  'finisher',
  'RHB',
  NULL,
  '{"batting":72,"bowling":5,"fielding":68,"fitness":85,"consistency":58,"clutch":72,"formCeiling":86,"formFloor":35}'::jsonb,
  150,
  65,
  ARRAY['DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AIDEN_MARKRAM',
  'Aiden Markram',
  'SA',
  true,
  32,
  'batter',
  'top-order',
  'RHB',
  'OB',
  '{"batting":72,"bowling":22,"fielding":72,"fitness":78,"consistency":65,"clutch":62,"formCeiling":84,"formFloor":42}'::jsonb,
  75,
  58,
  ARRAY['SRH','LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KAMINDU_MENDIS',
  'Kamindu Mendis',
  'SL',
  true,
  26,
  'allRounder',
  'batting-ar',
  'LHB',
  'OB',
  '{"batting":72,"bowling":35,"fielding":65,"fitness":82,"consistency":62,"clutch":65,"formCeiling":86,"formFloor":38}'::jsonb,
  50,
  55,
  ARRAY['SRH'],
  '{}'::jsonb,
  true,
  82
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'COOPER_CONNOLLY',
  'Cooper Connolly',
  'AUS',
  true,
  22,
  'allRounder',
  'batting-ar',
  'LHB',
  'SLA',
  '{"batting":62,"bowling":38,"fielding":65,"fitness":85,"consistency":48,"clutch":55,"formCeiling":80,"formFloor":30}'::jsonb,
  50,
  38,
  ARRAY['PBKS'],
  '{}'::jsonb,
  true,
  76
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RYAN_RICKELTON',
  'Ryan Rickelton',
  'SA',
  true,
  29,
  'batter',
  'top-order',
  'LHB',
  NULL,
  '{"batting":70,"bowling":5,"fielding":68,"fitness":80,"consistency":60,"clutch":62,"formCeiling":84,"formFloor":38}'::jsonb,
  50,
  45,
  ARRAY['MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ALLAH_GHAZANFAR',
  'Allah Ghazanfar',
  'AFG',
  true,
  20,
  'bowler',
  'spin',
  'RHB',
  'OB',
  '{"batting":10,"bowling":65,"fielding":52,"fitness":85,"consistency":48,"clutch":52,"formCeiling":82,"formFloor":30}'::jsonb,
  50,
  45,
  ARRAY['MI'],
  '{}'::jsonb,
  true,
  80
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ABDUL_SAMAD',
  'Abdul Samad',
  'IND',
  false,
  23,
  'allRounder',
  'batting-ar',
  'RHB',
  'OB',
  '{"batting":65,"bowling":22,"fielding":58,"fitness":80,"consistency":48,"clutch":62,"formCeiling":80,"formFloor":32}'::jsonb,
  50,
  42,
  ARRAY['SRH','LSG'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'ROBIN_MINZ',
  'Robin Minz',
  'IND',
  false,
  22,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":52,"bowling":0,"fielding":68,"fitness":85,"consistency":42,"clutch":48,"formCeiling":74,"formFloor":25}'::jsonb,
  20,
  22,
  ARRAY['MI'],
  '{}'::jsonb,
  true,
  72
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SHAHRUKH_KHAN',
  'Shahrukh Khan',
  'IND',
  false,
  30,
  'batter',
  'finisher',
  'RHB',
  NULL,
  '{"batting":68,"bowling":5,"fielding":58,"fitness":72,"consistency":52,"clutch":72,"formCeiling":82,"formFloor":35}'::jsonb,
  50,
  48,
  ARRAY['PBKS','GT'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SANDEEP_SHARMA',
  'Sandeep Sharma',
  'IND',
  false,
  33,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":65,"fielding":50,"fitness":65,"consistency":62,"clutch":58,"formCeiling":75,"formFloor":38}'::jsonb,
  30,
  35,
  ARRAY['PBKS','SRH','RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'BRYDON_CARSE',
  'Brydon Carse',
  'ENG',
  true,
  30,
  'bowler',
  'pace',
  'RHB',
  'RFM',
  '{"batting":20,"bowling":72,"fielding":58,"fitness":72,"consistency":60,"clutch":62,"formCeiling":82,"formFloor":40}'::jsonb,
  75,
  55,
  ARRAY['SRH'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DUN_WELL',
  'Jake Fraser-McGurk',
  'AUS',
  true,
  23,
  'batter',
  'top-order',
  'RHB',
  NULL,
  '{"batting":72,"bowling":5,"fielding":68,"fitness":85,"consistency":48,"clutch":62,"formCeiling":92,"formFloor":32}'::jsonb,
  100,
  68,
  ARRAY['DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JONNY_BAIRSTOW',
  'Jonny Bairstow',
  'ENG',
  true,
  36,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":78,"bowling":0,"fielding":68,"fitness":62,"consistency":62,"clutch":72,"formCeiling":90,"formFloor":40}'::jsonb,
  100,
  72,
  ARRAY['SRH','PBKS','CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DARYL_MITCHELL',
  'Daryl Mitchell',
  'NZ',
  true,
  34,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":74,"bowling":32,"fielding":72,"fitness":78,"consistency":72,"clutch":75,"formCeiling":84,"formFloor":48}'::jsonb,
  100,
  68,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'GUS_ATKINSON',
  'Gus Atkinson',
  'ENG',
  true,
  27,
  'bowler',
  'pace',
  'RHB',
  'RFM',
  '{"batting":20,"bowling":76,"fielding":62,"fitness":80,"consistency":62,"clutch":65,"formCeiling":88,"formFloor":42}'::jsonb,
  150,
  68,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SPENCER_JOHNSON',
  'Spencer Johnson',
  'AUS',
  true,
  30,
  'bowler',
  'death-bowler',
  'LHB',
  'LFM',
  '{"batting":5,"bowling":74,"fielding":52,"fitness":75,"consistency":60,"clutch":68,"formCeiling":85,"formFloor":40}'::jsonb,
  100,
  62,
  ARRAY['GT','KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'GURBAZ',
  'Rahmanullah Gurbaz',
  'AFG',
  true,
  23,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":76,"bowling":0,"fielding":68,"fitness":82,"consistency":55,"clutch":68,"formCeiling":90,"formFloor":35}'::jsonb,
  100,
  68,
  ARRAY['KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JHYE_RICHARDSON',
  'Jhye Richardson',
  'AUS',
  true,
  30,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RFM',
  '{"batting":10,"bowling":74,"fielding":55,"fitness":55,"consistency":58,"clutch":62,"formCeiling":86,"formFloor":38}'::jsonb,
  100,
  58,
  ARRAY['PBKS','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'JAMIE_SMITH',
  'Jamie Smith',
  'ENG',
  true,
  25,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":72,"bowling":0,"fielding":75,"fitness":85,"consistency":58,"clutch":65,"formCeiling":86,"formFloor":38}'::jsonb,
  100,
  58,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DASUN_SHANAKA',
  'Dasun Shanaka',
  'SL',
  true,
  32,
  'allRounder',
  'batting-ar',
  'RHB',
  'RFM',
  '{"batting":65,"bowling":52,"fielding":68,"fitness":75,"consistency":55,"clutch":68,"formCeiling":80,"formFloor":35}'::jsonb,
  75,
  52,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MUJEEB_RAHMAN',
  'Mujeeb Ur Rahman',
  'AFG',
  true,
  25,
  'bowler',
  'spin',
  'RHB',
  'OB',
  '{"batting":5,"bowling":72,"fielding":52,"fitness":78,"consistency":60,"clutch":62,"formCeiling":84,"formFloor":40}'::jsonb,
  75,
  55,
  ARRAY['SRH','CSK'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'SEAN_ABBOTT',
  'Sean Abbott',
  'AUS',
  true,
  33,
  'allRounder',
  'bowling-ar',
  'RHB',
  'RFM',
  '{"batting":38,"bowling":68,"fielding":62,"fitness":72,"consistency":58,"clutch":60,"formCeiling":78,"formFloor":38}'::jsonb,
  75,
  48,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'DEEPAK_HOODA',
  'Deepak Hooda',
  'IND',
  false,
  30,
  'allRounder',
  'batting-ar',
  'RHB',
  'OB',
  '{"batting":68,"bowling":32,"fielding":60,"fitness":72,"consistency":55,"clutch":60,"formCeiling":80,"formFloor":38}'::jsonb,
  50,
  48,
  ARRAY['LSG','PBKS','SRH','RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'YASH_DHULL',
  'Yash Dhull',
  'IND',
  false,
  22,
  'batter',
  'middle-order',
  'RHB',
  NULL,
  '{"batting":58,"bowling":5,"fielding":62,"fitness":82,"consistency":45,"clutch":50,"formCeiling":80,"formFloor":28}'::jsonb,
  30,
  32,
  ARRAY['DC'],
  '{}'::jsonb,
  true,
  76
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'MAHIPAL_LOMROR',
  'Mahipal Lomror',
  'IND',
  false,
  25,
  'allRounder',
  'batting-ar',
  'LHB',
  'SLA',
  '{"batting":60,"bowling":35,"fielding":58,"fitness":78,"consistency":48,"clutch":52,"formCeiling":76,"formFloor":30}'::jsonb,
  30,
  28,
  ARRAY['RCB','RR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'AKASH_MADHWAL',
  'Akash Madhwal',
  'IND',
  false,
  31,
  'bowler',
  'death-bowler',
  'RHB',
  'RFM',
  '{"batting":5,"bowling":65,"fielding":52,"fitness":72,"consistency":55,"clutch":62,"formCeiling":78,"formFloor":35}'::jsonb,
  30,
  35,
  ARRAY['MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'TASKIN_AHMED',
  'Taskin Ahmed',
  'BAN',
  true,
  30,
  'bowler',
  'powerplay-bowler',
  'RHB',
  'RF',
  '{"batting":5,"bowling":70,"fielding":52,"fitness":72,"consistency":58,"clutch":60,"formCeiling":82,"formFloor":40}'::jsonb,
  50,
  50,
  ARRAY['KKR'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'RILEY_MEREDITH',
  'Riley Meredith',
  'AUS',
  true,
  30,
  'bowler',
  'pace',
  'RHB',
  'RF',
  '{"batting":5,"bowling":70,"fielding":50,"fitness":65,"consistency":52,"clutch":55,"formCeiling":82,"formFloor":35}'::jsonb,
  75,
  48,
  ARRAY['MI'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KS_BHARAT',
  'KS Bharat',
  'IND',
  false,
  32,
  'wicketkeeper',
  'wk-batter',
  'RHB',
  NULL,
  '{"batting":55,"bowling":0,"fielding":72,"fitness":70,"consistency":52,"clutch":50,"formCeiling":70,"formFloor":32}'::jsonb,
  30,
  28,
  ARRAY['RCB','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'KARN_SHARMA',
  'Karn Sharma',
  'IND',
  false,
  37,
  'bowler',
  'spin',
  'RHB',
  'LB',
  '{"batting":15,"bowling":58,"fielding":48,"fitness":58,"consistency":52,"clutch":50,"formCeiling":68,"formFloor":32}'::jsonb,
  20,
  25,
  ARRAY['SRH','RCB','MI','DC'],
  '{}'::jsonb,
  false,
  NULL
);

INSERT INTO players (id, name, nationality, is_overseas, age, role, sub_role, batting_style, bowling_style, stats, base_price, star_power, team_history, franchise_history, hidden_gem, hidden_gem_ceiling) VALUES (
  'BRACEWELL',
  'Michael Bracewell',
  'NZ',
  true,
  35,
  'allRounder',
  'batting-ar',
  'RHB',
  'OB',
  '{"batting":65,"bowling":48,"fielding":65,"fitness":72,"consistency":58,"clutch":62,"formCeiling":78,"formFloor":38}'::jsonb,
  75,
  52,
  '{}',
  '{}'::jsonb,
  false,
  NULL
);
