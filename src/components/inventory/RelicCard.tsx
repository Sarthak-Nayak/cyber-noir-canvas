import React from 'react';
import { motion } from 'framer-motion';
import { Relic, RARITY_COLORS, RARITY_BORDERS } from '@/types/relic';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RelicCardProps {
  relic: Relic;
  isOwned: boolean;
  isEquipped: boolean;
  onEquip?: () => void;
  onUnequip?: () => void;
  onAcquire?: () => void;
}

export const RelicCard: React.FC<RelicCardProps> = ({
  relic,
  isOwned,
  isEquipped,
  onEquip,
  onUnequip,
  onAcquire,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'glass-card p-4 rounded-lg border-2 transition-all duration-300 relative overflow-hidden',
        RARITY_BORDERS[relic.rarity],
        isEquipped && 'ring-2 ring-primary shadow-lg shadow-primary/30'
      )}
    >
      {/* Glow effect for equipped items */}
      {isEquipped && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
      )}
      
      {/* Relic icon */}
      <div className="text-4xl mb-3 text-center">
        {relic.icon || '🔮'}
      </div>
      
      {/* Relic info */}
      <h3 className="font-display text-lg text-foreground text-center mb-1">
        {relic.name}
      </h3>
      
      <p className={cn('text-xs text-center uppercase tracking-wider mb-2', RARITY_COLORS[relic.rarity])}>
        {relic.rarity}
      </p>
      
      <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
        {relic.description}
      </p>
      
      {/* Theme preview */}
      {relic.theme_primary && (
        <div className="flex justify-center gap-1 mb-4">
          <div 
            className="w-4 h-4 rounded-full border border-border/50"
            style={{ backgroundColor: `hsl(${relic.theme_primary})` }}
            title="Primary"
          />
          <div 
            className="w-4 h-4 rounded-full border border-border/50"
            style={{ backgroundColor: `hsl(${relic.theme_secondary})` }}
            title="Secondary"
          />
          <div 
            className="w-4 h-4 rounded-full border border-border/50"
            style={{ backgroundColor: `hsl(${relic.theme_accent})` }}
            title="Accent"
          />
        </div>
      )}
      
      {/* Action button */}
      <div className="flex justify-center">
        {isEquipped ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnequip}
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            Unequip
          </Button>
        ) : isOwned ? (
          <Button
            variant="default"
            size="sm"
            onClick={onEquip}
            className="bg-primary/80 hover:bg-primary"
          >
            Equip
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={onAcquire}
            className="bg-secondary/80 hover:bg-secondary"
          >
            Acquire
          </Button>
        )}
      </div>
      
      {/* Equipped badge */}
      {isEquipped && (
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full font-display">
            ACTIVE
          </span>
        </div>
      )}
    </motion.div>
  );
};
