import { motion } from 'framer-motion';
import { 
  Hexagon,
  Settings,
  Share2,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 left-0 right-0 z-10"
    >
      <div className="glass border-b border-border/30 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Hexagon 
                size={32} 
                className="text-primary fill-primary/20 animate-glow-pulse" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-wider text-foreground">
                NEXUS<span className="text-primary">FLOW</span>
              </h1>
              <p className="text-[10px] font-body text-muted-foreground tracking-widest">
                SPATIAL INTERFACE v2.0
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 font-body"
            >
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 font-body"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <div className="w-px h-6 bg-border/50 mx-2" />
            <Button 
              variant="ghost" 
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
