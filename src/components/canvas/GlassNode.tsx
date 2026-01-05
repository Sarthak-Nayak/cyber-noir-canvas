import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { motion } from 'framer-motion';
import { LucideIcon, Users } from 'lucide-react';
import { useRaid } from '@/contexts/RaidContext';

interface GlassNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'accent';
}

type GlassNodeType = Node<GlassNodeData, 'glass'>;

const GlassNode = memo(({ id, data, selected }: NodeProps<GlassNodeType>) => {
  const { label, description, icon: Icon, variant = 'primary' } = data;
  const { activeNodeId, nodePresenceCount, joinNode } = useRaid();
  
  const isActive = activeNodeId === id;

  const handleDoubleClick = () => {
    joinNode(id);
  };
  
  const variantStyles = {
    primary: 'border-primary/40 hover:border-primary/60',
    secondary: 'border-secondary/40 hover:border-secondary/60',
    accent: 'border-accent/40 hover:border-accent/60',
  };

  const glowStyles = {
    primary: 'shadow-[0_0_20px_hsl(180_100%_50%_/_0.3)]',
    secondary: 'shadow-[0_0_20px_hsl(320_100%_55%_/_0.3)]',
    accent: 'shadow-[0_0_20px_hsl(260_80%_60%_/_0.3)]',
  };

  const iconColors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onDoubleClick={handleDoubleClick}
      className={`
        relative min-w-[180px] max-w-[280px] px-5 py-4
        backdrop-blur-xl rounded-xl border
        bg-card/60
        ${variantStyles[variant]}
        ${selected || isActive ? glowStyles[variant] : ''}
        ${isActive ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}
        transition-all duration-300 cursor-pointer
      `}
    >
      {/* Active node indicator with presence count */}
      {isActive && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-accent rounded-full text-xs font-bold text-accent-foreground">
          <Users className="w-3 h-3" />
          {nodePresenceCount}
        </div>
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-cyber opacity-50 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 flex items-start gap-3">
        {Icon && (
          <div className={`p-2 rounded-lg bg-muted/50 ${iconColors[variant]}`}>
            <Icon size={20} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-semibold text-foreground truncate">
            {label}
          </h3>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-primary !border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-primary !border-background"
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60 rounded-br-xl" />
    </motion.div>
  );
});

GlassNode.displayName = 'GlassNode';

export default GlassNode;
export type { GlassNodeData, GlassNodeType };
