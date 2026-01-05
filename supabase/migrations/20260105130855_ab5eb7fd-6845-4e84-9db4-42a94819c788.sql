-- Create node_presence table for tracking users on nodes
CREATE TABLE public.node_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(node_id, user_id)
);

-- Enable RLS
ALTER TABLE public.node_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Node presence is viewable by everyone"
ON public.node_presence FOR SELECT USING (true);

CREATE POLICY "Users can insert their own presence"
ON public.node_presence FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presence"
ON public.node_presence FOR DELETE USING (auth.uid() = user_id);

-- Create raid_sessions table for tracking active raids
CREATE TABLE public.raid_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id TEXT NOT NULL,
  challenge_code TEXT NOT NULL,
  solution_code TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.raid_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Raid sessions are viewable by everyone"
ON public.raid_sessions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create raids"
ON public.raid_sessions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update raids"
ON public.raid_sessions FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create user_progress table if not exists
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  node_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  xp_earned INTEGER NOT NULL DEFAULT 100,
  UNIQUE(user_id, node_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User progress is viewable by everyone"
ON public.user_progress FOR SELECT USING (true);

CREATE POLICY "Users can insert their own progress"
ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.node_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.raid_sessions;