import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface CursorPosition {
  x: number;
  y: number;
}

interface PresenceState {
  oddsId: string;
  username: string;
  color: string;
  cursor: CursorPosition;
  lastSeen: number;
}

interface UsePresenceOptions {
  channelName?: string;
  throttleMs?: number;
}

export const usePresence = (options: UsePresenceOptions = {}) => {
  const { channelName = 'canvas-presence', throttleMs = 16 } = options; // 16ms ≈ 60fps
  
  const [presenceState, setPresenceState] = useState<Record<string, PresenceState[]>>({});
  const [myId] = useState(() => crypto.randomUUID());
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastBroadcastRef = useRef<number>(0);
  const pendingCursorRef = useRef<CursorPosition | null>(null);
  const rafIdRef = useRef<number | null>(null);
  
  // Generate a random neon color for this user
  const [myColor] = useState(() => {
    const colors = ['#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff6600', '#6600ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  });
  
  const [myUsername] = useState(() => `Ghost_${myId.slice(0, 4)}`);

  useEffect(() => {
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: myId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        setPresenceState(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({
            oddsId: myId,
            username: myUsername,
            color: myColor,
            cursor: { x: 0, y: 0 },
            lastSeen: Date.now(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [channelName, myId, myColor, myUsername]);

  const broadcastCursor = useCallback(() => {
    if (!channelRef.current || !pendingCursorRef.current) return;
    
    const now = Date.now();
    if (now - lastBroadcastRef.current < throttleMs) {
      // Schedule next broadcast
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          broadcastCursor();
        });
      }
      return;
    }
    
    lastBroadcastRef.current = now;
    
    channelRef.current.track({
      oddsId: myId,
      username: myUsername,
      color: myColor,
      cursor: pendingCursorRef.current,
      lastSeen: now,
    });
    
    pendingCursorRef.current = null;
  }, [throttleMs, myId, myColor, myUsername]);

  const updateCursor = useCallback((position: CursorPosition) => {
    pendingCursorRef.current = position;
    broadcastCursor();
  }, [broadcastCursor]);

  // Get other users' cursors (exclude self)
  const otherCursors = Object.entries(presenceState)
    .filter(([key]) => key !== myId)
    .flatMap(([, presences]) => presences)
    .filter((presence) => Date.now() - presence.lastSeen < 30000); // Only show cursors active in last 30s

  return {
    otherCursors,
    updateCursor,
    isConnected,
    myId,
    myColor,
    myUsername,
  };
};
