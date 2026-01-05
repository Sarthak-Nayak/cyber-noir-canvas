import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { X, Users, Zap, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRaid } from '@/contexts/RaidContext';
import { toast } from 'sonner';

const RaidModal = () => {
  const { 
    isRaidTriggered, 
    currentRaid, 
    raidParticipants, 
    submitRaidSolution,
    leaveNode 
  } = useRaid();
  
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentRaid?.challengeCode) {
      setCode(currentRaid.challengeCode);
    }
  }, [currentRaid?.challengeCode]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsSubmitting(true);
    const success = await submitRaidSolution(code);
    setIsSubmitting(false);

    if (success) {
      toast.success('🎉 Challenge completed! +100 XP for all raiders!');
    } else {
      toast.error('Failed to submit solution');
    }
  };

  const handleClose = () => {
    leaveNode();
  };

  return (
    <AnimatePresence>
      {isRaidTriggered && currentRaid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl h-[80vh] glass-panel overflow-hidden"
          >
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-[-2px] bg-gradient-to-r from-primary via-accent to-secondary animate-pulse opacity-50" />
              <div className="absolute inset-[1px] bg-card rounded-2xl" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-accent animate-pulse" />
                    <h2 className="text-xl font-bold text-glow">RAID ACTIVE</h2>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{raidParticipants.length} Raiders</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="hover:bg-destructive/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-2 p-3 bg-card/50 border-b border-border/30">
                <span className="text-xs text-muted-foreground">PARTY:</span>
                <div className="flex items-center gap-2">
                  {raidParticipants.map((participant) => (
                    <div
                      key={participant.userId}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${participant.color}20`,
                        borderColor: participant.color,
                        borderWidth: 1
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: participant.color }}
                      />
                      {participant.username}
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: 'JetBrains Mono, monospace',
                    fontLigatures: true,
                  }}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-border/50 bg-card/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span>Complete the challenge to earn +100 XP for all raiders!</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="border-border/50"
                  >
                    Leave Raid
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Submit Solution
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RaidModal;
