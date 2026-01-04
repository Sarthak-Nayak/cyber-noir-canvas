import { AnimatePresence } from 'framer-motion';
import GhostCursor from './GhostCursor';

interface CursorData {
  oddsId: string;
  username: string;
  color: string;
  cursor: { x: number; y: number };
}

interface GhostCursorsLayerProps {
  cursors: CursorData[];
}

const GhostCursorsLayer = ({ cursors }: GhostCursorsLayerProps) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {cursors.map((cursor) => (
          <GhostCursor
            key={cursor.oddsId}
            x={cursor.cursor.x}
            y={cursor.cursor.y}
            color={cursor.color}
            username={cursor.username}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GhostCursorsLayer;
