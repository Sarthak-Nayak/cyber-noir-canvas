import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RaidParticipant {
  userId: string;
  username: string;
  color: string;
}

interface RaidSession {
  id: string;
  nodeId: string;
  challengeCode: string;
  solutionCode: string | null;
  isActive: boolean;
  participants: RaidParticipant[];
}

interface RaidContextType {
  activeNodeId: string | null;
  setActiveNodeId: (nodeId: string | null) => void;
  nodePresenceCount: number;
  isRaidTriggered: boolean;
  currentRaid: RaidSession | null;
  joinNode: (nodeId: string) => Promise<void>;
  leaveNode: () => Promise<void>;
  submitRaidSolution: (code: string) => Promise<boolean>;
  raidParticipants: RaidParticipant[];
}

const RaidContext = createContext<RaidContextType | undefined>(undefined);

const RAID_THRESHOLD = 3;

const CODING_CHALLENGES = [
  {
    code: `// Challenge: Fix the bug in this function
// It should return the sum of all even numbers in the array

function sumEvenNumbers(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    if (arr[i] % 2 === 0) {
      sum += arr[i];
    }
  }
  return sum;
}

// Test: sumEvenNumbers([1, 2, 3, 4, 5, 6]) should return 12`,
    solution: 'i < arr.length'
  },
  {
    code: `// Challenge: Complete the function
// It should reverse a string without using .reverse()

function reverseString(str) {
  let reversed = '';
  // Your code here
  
  return reversed;
}

// Test: reverseString("hello") should return "olleh"`,
    solution: 'for'
  },
  {
    code: `// Challenge: Fix the async bug
// The function should wait for the data before returning

async function fetchUserData(userId) {
  const response = fetch(\`/api/users/\${userId}\`);
  const data = response.json();
  return data;
}

// Hint: Something is missing before fetch and response.json()`,
    solution: 'await'
  }
];

export function RaidProvider({ children }: { children: ReactNode }) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [nodePresenceCount, setNodePresenceCount] = useState(0);
  const [isRaidTriggered, setIsRaidTriggered] = useState(false);
  const [currentRaid, setCurrentRaid] = useState<RaidSession | null>(null);
  const [raidParticipants, setRaidParticipants] = useState<RaidParticipant[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to node presence changes
  useEffect(() => {
    if (!activeNodeId) {
      setNodePresenceCount(0);
      setRaidParticipants([]);
      return;
    }

    // Initial fetch
    const fetchPresence = async () => {
      const { data, error } = await supabase
        .from('node_presence')
        .select('user_id')
        .eq('node_id', activeNodeId);

      if (!error && data) {
        setNodePresenceCount(data.length);
        
        // Fetch participant details
        if (data.length > 0) {
          const userIds = data.map(p => p.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, username, cursor_color')
            .in('user_id', userIds);
          
          if (profiles) {
            setRaidParticipants(profiles.map(p => ({
              userId: p.user_id,
              username: p.username || 'Anonymous',
              color: p.cursor_color || '#00ffff'
            })));
          }
        }
      }
    };

    fetchPresence();

    // Realtime subscription
    const channel = supabase
      .channel(`node-presence-${activeNodeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'node_presence',
          filter: `node_id=eq.${activeNodeId}`
        },
        () => {
          fetchPresence();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeNodeId]);

  // Check for raid trigger
  useEffect(() => {
    if (nodePresenceCount >= RAID_THRESHOLD && !isRaidTriggered && activeNodeId) {
      setIsRaidTriggered(true);
      
      // Create or join raid session
      const initRaid = async () => {
        // Check for existing active raid
        const { data: existingRaid } = await supabase
          .from('raid_sessions')
          .select('*')
          .eq('node_id', activeNodeId)
          .eq('is_active', true)
          .single();

        if (existingRaid) {
          setCurrentRaid({
            id: existingRaid.id,
            nodeId: existingRaid.node_id,
            challengeCode: existingRaid.challenge_code,
            solutionCode: existingRaid.solution_code,
            isActive: existingRaid.is_active,
            participants: raidParticipants
          });
        } else {
          // Create new raid
          const challenge = CODING_CHALLENGES[Math.floor(Math.random() * CODING_CHALLENGES.length)];
          const { data: newRaid, error } = await supabase
            .from('raid_sessions')
            .insert({
              node_id: activeNodeId,
              challenge_code: challenge.code,
              is_active: true
            })
            .select()
            .single();

          if (!error && newRaid) {
            setCurrentRaid({
              id: newRaid.id,
              nodeId: newRaid.node_id,
              challengeCode: newRaid.challenge_code,
              solutionCode: null,
              isActive: true,
              participants: raidParticipants
            });
            toast.success('🎮 Raid Activated! Collaborative challenge started!');
          }
        }
      };

      initRaid();
    } else if (nodePresenceCount < RAID_THRESHOLD) {
      setIsRaidTriggered(false);
      setCurrentRaid(null);
    }
  }, [nodePresenceCount, isRaidTriggered, activeNodeId, raidParticipants]);

  // Subscribe to raid session updates
  useEffect(() => {
    if (!currentRaid?.id) return;

    const channel = supabase
      .channel(`raid-session-${currentRaid.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'raid_sessions',
          filter: `id=eq.${currentRaid.id}`
        },
        (payload) => {
          const updated = payload.new as any;
          if (!updated.is_active) {
            setIsRaidTriggered(false);
            setCurrentRaid(null);
            toast.success('🎉 Raid Complete! XP awarded to all participants!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRaid?.id]);

  const joinNode = useCallback(async (nodeId: string) => {
    if (!userId) {
      toast.error('Please sign in to join nodes');
      return;
    }

    // Leave current node first
    if (activeNodeId) {
      await supabase
        .from('node_presence')
        .delete()
        .eq('node_id', activeNodeId)
        .eq('user_id', userId);
    }

    // Join new node
    const { error } = await supabase
      .from('node_presence')
      .upsert({
        node_id: nodeId,
        user_id: userId
      });

    if (error) {
      console.error('Error joining node:', error);
      toast.error('Failed to join node');
      return;
    }

    setActiveNodeId(nodeId);
    toast.success(`Joined node: ${nodeId}`);
  }, [userId, activeNodeId]);

  const leaveNode = useCallback(async () => {
    if (!userId || !activeNodeId) return;

    await supabase
      .from('node_presence')
      .delete()
      .eq('node_id', activeNodeId)
      .eq('user_id', userId);

    setActiveNodeId(null);
    setIsRaidTriggered(false);
    setCurrentRaid(null);
  }, [userId, activeNodeId]);

  const submitRaidSolution = useCallback(async (code: string): Promise<boolean> => {
    if (!currentRaid || !userId) return false;

    // Update raid session with solution
    const { error: updateError } = await supabase
      .from('raid_sessions')
      .update({
        solution_code: code,
        completed_at: new Date().toISOString(),
        is_active: false
      })
      .eq('id', currentRaid.id);

    if (updateError) {
      console.error('Error updating raid:', updateError);
      return false;
    }

    // Award XP to all participants
    const participantInserts = raidParticipants.map(p => ({
      user_id: p.userId,
      node_id: currentRaid.nodeId,
      xp_earned: 100
    }));

    const { error: progressError } = await supabase
      .from('user_progress')
      .upsert(participantInserts, { onConflict: 'user_id,node_id' });

    if (progressError) {
      console.error('Error updating progress:', progressError);
    }

    return true;
  }, [currentRaid, userId, raidParticipants]);

  return (
    <RaidContext.Provider
      value={{
        activeNodeId,
        setActiveNodeId,
        nodePresenceCount,
        isRaidTriggered,
        currentRaid,
        joinNode,
        leaveNode,
        submitRaidSolution,
        raidParticipants
      }}
    >
      {children}
    </RaidContext.Provider>
  );
}

export function useRaid() {
  const context = useContext(RaidContext);
  if (context === undefined) {
    throw new Error('useRaid must be used within a RaidProvider');
  }
  return context;
}
