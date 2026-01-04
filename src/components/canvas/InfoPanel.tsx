import { motion } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  Database, 
  Network,
  Signal,
  Zap
} from 'lucide-react';

const InfoPanel = () => {
  const stats = [
    { icon: Cpu, label: 'NODES', value: '6', color: 'text-primary' },
    { icon: Network, label: 'EDGES', value: '5', color: 'text-secondary' },
    { icon: Signal, label: 'SIGNAL', value: '98%', color: 'text-primary' },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
    >
      <div className="glass-card flex items-center gap-6 px-6 py-3">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className={`${stat.color}`}>
              <stat.icon size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-display tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              <span className={`text-sm font-display font-bold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            {index < stats.length - 1 && (
              <div className="w-px h-8 bg-border/50 ml-3" />
            )}
          </div>
        ))}
        
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border/50">
          <Activity size={14} className="text-primary animate-pulse" />
          <span className="text-xs font-body text-muted-foreground">LIVE</span>
        </div>
      </div>
    </motion.div>
  );
};

export default InfoPanel;
