import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

interface GhostCursorProps {
  x: number;
  y: number;
  color: string;
  username: string;
}

const GhostCursor = ({ x, y, color, username }: GhostCursorProps) => {
  return (
    <motion.div
      className="pointer-events-none fixed z-50"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 0.8, 
        scale: 1,
        x: x,
        y: y,
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 400,
        mass: 0.5,
      }}
      style={{
        left: 0,
        top: 0,
      }}
    >
      {/* Cursor glow effect */}
      <div 
        className="absolute -inset-2 rounded-full blur-md opacity-50"
        style={{ backgroundColor: color }}
      />
      
      {/* Cursor icon */}
      <MousePointer2 
        className="relative drop-shadow-lg"
        size={24}
        style={{ 
          color: color,
          filter: `drop-shadow(0 0 8px ${color})`,
        }}
      />
      
      {/* Username label */}
      <motion.div
        className="absolute left-6 top-4 px-2 py-0.5 rounded-md text-xs font-mono whitespace-nowrap"
        style={{
          backgroundColor: `${color}20`,
          borderColor: color,
          borderWidth: 1,
          color: color,
          textShadow: `0 0 10px ${color}`,
        }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {username}
      </motion.div>
    </motion.div>
  );
};

export default GhostCursor;
