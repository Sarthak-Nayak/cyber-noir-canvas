import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Relic, UserInventoryItem, RelicTheme, DEFAULT_THEME } from '@/types/relic';

interface RelicThemeContextType {
  currentTheme: RelicTheme;
  equippedRelic: Relic | null;
  inventory: UserInventoryItem[];
  allRelics: Relic[];
  isLoading: boolean;
  equipRelic: (relicId: string) => Promise<void>;
  unequipRelic: () => Promise<void>;
  acquireRelic: (relicId: string) => Promise<void>;
}

const RelicThemeContext = createContext<RelicThemeContextType | null>(null);

export const useRelicTheme = () => {
  const context = useContext(RelicThemeContext);
  if (!context) {
    throw new Error('useRelicTheme must be used within a RelicThemeProvider');
  }
  return context;
};

// Apply theme to document root
const applyThemeToRoot = (theme: RelicTheme) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--primary-glow', theme.glow);
  root.style.setProperty('--secondary-glow', theme.glow);
};

export const RelicThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<RelicTheme>(DEFAULT_THEME);
  const [equippedRelic, setEquippedRelic] = useState<Relic | null>(null);
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [allRelics, setAllRelics] = useState<Relic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch all available relics
  const fetchRelics = useCallback(async () => {
    const { data, error } = await supabase
      .from('relics')
      .select('*')
      .order('rarity');
    
    if (!error && data) {
      setAllRelics(data as Relic[]);
    }
  }, []);

  // Fetch user's inventory
  const fetchInventory = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('user_inventory')
      .select(`
        *,
        relic:relics(*)
      `)
      .eq('user_id', uid);
    
    if (!error && data) {
      const inventoryItems = data.map(item => ({
        ...item,
        relic: item.relic as unknown as Relic
      })) as UserInventoryItem[];
      
      setInventory(inventoryItems);
      
      // Find equipped relic
      const equipped = inventoryItems.find(item => item.is_equipped);
      if (equipped?.relic) {
        setEquippedRelic(equipped.relic);
        const newTheme: RelicTheme = {
          primary: equipped.relic.theme_primary || DEFAULT_THEME.primary,
          secondary: equipped.relic.theme_secondary || DEFAULT_THEME.secondary,
          accent: equipped.relic.theme_accent || DEFAULT_THEME.accent,
          glow: equipped.relic.theme_glow || DEFAULT_THEME.glow,
        };
        setCurrentTheme(newTheme);
        applyThemeToRoot(newTheme);
      } else {
        setEquippedRelic(null);
        setCurrentTheme(DEFAULT_THEME);
        applyThemeToRoot(DEFAULT_THEME);
      }
    }
  }, []);

  // Initialize and subscribe to auth changes
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchRelics();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchInventory(user.id);
      }
      setIsLoading(false);
    };

    init();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        await fetchInventory(session.user.id);
      } else {
        setUserId(null);
        setInventory([]);
        setEquippedRelic(null);
        setCurrentTheme(DEFAULT_THEME);
        applyThemeToRoot(DEFAULT_THEME);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRelics, fetchInventory]);

  // Subscribe to realtime inventory changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_inventory',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchInventory(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchInventory]);

  // Equip a relic
  const equipRelic = useCallback(async (relicId: string) => {
    if (!userId) return;

    // First unequip any currently equipped relic
    await supabase
      .from('user_inventory')
      .update({ is_equipped: false })
      .eq('user_id', userId)
      .eq('is_equipped', true);

    // Then equip the new relic
    await supabase
      .from('user_inventory')
      .update({ is_equipped: true })
      .eq('user_id', userId)
      .eq('relic_id', relicId);

    await fetchInventory(userId);
  }, [userId, fetchInventory]);

  // Unequip current relic
  const unequipRelic = useCallback(async () => {
    if (!userId) return;

    await supabase
      .from('user_inventory')
      .update({ is_equipped: false })
      .eq('user_id', userId)
      .eq('is_equipped', true);

    await fetchInventory(userId);
  }, [userId, fetchInventory]);

  // Acquire a new relic
  const acquireRelic = useCallback(async (relicId: string) => {
    if (!userId) return;

    await supabase
      .from('user_inventory')
      .insert({
        user_id: userId,
        relic_id: relicId,
        is_equipped: false,
      });

    await fetchInventory(userId);
  }, [userId, fetchInventory]);

  return (
    <RelicThemeContext.Provider
      value={{
        currentTheme,
        equippedRelic,
        inventory,
        allRelics,
        isLoading,
        equipRelic,
        unequipRelic,
        acquireRelic,
      }}
    >
      {children}
    </RelicThemeContext.Provider>
  );
};
