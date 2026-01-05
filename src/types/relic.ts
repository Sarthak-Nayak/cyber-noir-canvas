// TypeScript Interface for Relics
export type RelicRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Relic {
  id: string;
  name: string;
  description: string | null;
  rarity: RelicRarity;
  icon: string | null;
  theme_primary: string | null;
  theme_secondary: string | null;
  theme_accent: string | null;
  theme_glow: string | null;
  created_at: string;
}

export interface UserInventoryItem {
  id: string;
  user_id: string;
  relic_id: string;
  is_equipped: boolean;
  acquired_at: string;
  relic?: Relic;
}

export interface RelicTheme {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

// Default Cyber-Noir theme values
export const DEFAULT_THEME: RelicTheme = {
  primary: '180 100% 50%',
  secondary: '280 100% 60%',
  accent: '45 100% 50%',
  glow: '180 100% 70%',
};

// Rarity color mappings for UI
export const RARITY_COLORS: Record<RelicRarity, string> = {
  common: 'text-muted-foreground',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
};

export const RARITY_BORDERS: Record<RelicRarity, string> = {
  common: 'border-muted',
  rare: 'border-blue-500/50',
  epic: 'border-purple-500/50',
  legendary: 'border-amber-500/50 animate-glow-pulse',
};
