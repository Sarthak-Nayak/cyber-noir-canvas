-- Create relics table with theme properties
CREATE TABLE public.relics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  icon TEXT,
  theme_primary TEXT,
  theme_secondary TEXT,
  theme_accent TEXT,
  theme_glow TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user inventory table
CREATE TABLE public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  relic_id UUID NOT NULL REFERENCES public.relics(id) ON DELETE CASCADE,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, relic_id)
);

-- Enable RLS
ALTER TABLE public.relics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Relics are viewable by everyone (catalog)
CREATE POLICY "Relics are viewable by everyone"
ON public.relics FOR SELECT
USING (true);

-- Users can view their own inventory
CREATE POLICY "Users can view their own inventory"
ON public.user_inventory FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their own inventory
CREATE POLICY "Users can add to their own inventory"
ON public.user_inventory FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own inventory (equip/unequip)
CREATE POLICY "Users can update their own inventory"
ON public.user_inventory FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete from their own inventory
CREATE POLICY "Users can delete from their own inventory"
ON public.user_inventory FOR DELETE
USING (auth.uid() = user_id);

-- Insert some starter relics with theme properties
INSERT INTO public.relics (name, description, rarity, icon, theme_primary, theme_secondary, theme_accent, theme_glow) VALUES
('Neon Relic', 'A pulsing cyan crystal that bathes everything in electric light', 'rare', '💎', '180 100% 50%', '200 100% 60%', '190 100% 55%', '180 100% 70%'),
('Crimson Core', 'An ancient artifact radiating dangerous crimson energy', 'epic', '🔴', '0 100% 50%', '15 100% 55%', '350 100% 45%', '0 100% 60%'),
('Void Shard', 'A fragment of pure darkness from the digital abyss', 'legendary', '🌑', '270 50% 30%', '280 60% 40%', '260 40% 25%', '270 80% 50%'),
('Solar Ember', 'Captured sunlight compressed into crystalline form', 'rare', '☀️', '45 100% 50%', '35 100% 55%', '55 90% 45%', '45 100% 70%'),
('Toxic Matrix', 'A corrupted data fragment emitting sickly green radiation', 'epic', '☢️', '120 100% 40%', '130 80% 50%', '110 100% 35%', '120 100% 60%'),
('Frost Prism', 'An icy relic that freezes the air around it', 'common', '❄️', '200 80% 60%', '210 70% 70%', '190 90% 55%', '200 90% 75%');

-- Enable realtime for inventory changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_inventory;