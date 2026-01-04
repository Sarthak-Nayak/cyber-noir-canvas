import { motion } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid3X3, 
  Layers,
  MousePointer2,
  Move,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ControlPanelProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAddNode: () => void;
}

const ControlPanel = ({ onZoomIn, onZoomOut, onFitView, onAddNode }: ControlPanelProps) => {
  const controls = [
    { icon: Plus, label: 'Add Node', action: onAddNode },
    { icon: ZoomIn, label: 'Zoom In', action: onZoomIn },
    { icon: ZoomOut, label: 'Zoom Out', action: onZoomOut },
    { icon: Maximize2, label: 'Fit View', action: onFitView },
  ];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
    >
      <div className="glass-card flex flex-col gap-1 p-2">
        {controls.map((control, index) => (
          <Tooltip key={control.label}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={control.action}
                className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <control.icon size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="glass border-primary/30">
              <p className="font-body text-sm">{control.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        <Separator className="my-1 bg-border/50" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-primary hover:bg-primary/10 transition-all"
            >
              <MousePointer2 size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="glass border-primary/30">
            <p className="font-body text-sm">Select Mode</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            >
              <Move size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="glass border-primary/30">
            <p className="font-body text-sm">Pan Mode</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
