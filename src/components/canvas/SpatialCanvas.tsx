import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  useReactFlow,
  ReactFlowProvider,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Brain, 
  Database, 
  Globe, 
  Lock, 
  Server, 
  Zap,
  Cpu,
  Cloud
} from 'lucide-react';
import GlassNode, { type GlassNodeType } from './GlassNode';
import ControlPanel from './ControlPanel';
import InfoPanel from './InfoPanel';
import Header from './Header';
import GhostCursorsLayer from './GhostCursorsLayer';
import TavernChat from '../tavern/TavernChat';
import { usePresence } from '@/hooks/usePresence';

const nodeTypes = {
  glass: GlassNode,
};

const initialNodes: GlassNodeType[] = [
  {
    id: '1',
    type: 'glass',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Neural Core', 
      description: 'Central processing unit for AI operations',
      icon: Brain,
      variant: 'primary'
    },
  },
  {
    id: '2',
    type: 'glass',
    position: { x: 400, y: 50 },
    data: { 
      label: 'Data Vault', 
      description: 'Encrypted storage matrix',
      icon: Database,
      variant: 'secondary'
    },
  },
  {
    id: '3',
    type: 'glass',
    position: { x: 400, y: 200 },
    data: { 
      label: 'Gateway Node', 
      description: 'External network interface',
      icon: Globe,
      variant: 'primary'
    },
  },
  {
    id: '4',
    type: 'glass',
    position: { x: 700, y: 100 },
    data: { 
      label: 'Security Layer', 
      description: 'Authentication & encryption protocols',
      icon: Lock,
      variant: 'accent'
    },
  },
  {
    id: '5',
    type: 'glass',
    position: { x: 250, y: 320 },
    data: { 
      label: 'Compute Cluster', 
      description: 'Distributed processing nodes',
      icon: Server,
      variant: 'primary'
    },
  },
  {
    id: '6',
    type: 'glass',
    position: { x: 550, y: 320 },
    data: { 
      label: 'Power Grid', 
      description: 'Energy management system',
      icon: Zap,
      variant: 'secondary'
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e1-5', source: '1', target: '5', animated: true },
  { id: 'e5-6', source: '5', target: '6' },
];

const availableIcons = [Brain, Database, Globe, Lock, Server, Zap, Cpu, Cloud];
const variants = ['primary', 'secondary', 'accent'] as const;

function SpatialCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  
  const { otherCursors, updateCursor, isConnected, myId, myColor, myUsername } = usePresence({
    channelName: 'skill-map-presence',
    throttleMs: 16, // ~60fps
  });

  // Track mouse movement for presence
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateCursor({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [updateCursor]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback(() => {
    const newId = `node-${Date.now()}`;
    const randomIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)];
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];
    
    const newNode: GlassNodeType = {
      id: newId,
      type: 'glass',
      position: { 
        x: Math.random() * 500 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label: 'New Node',
        description: 'Configure this node',
        icon: randomIcon,
        variant: randomVariant,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  return (
    <div className="relative w-full h-screen bg-background cyber-grid overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <Header />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1} 
          color="hsl(180 100% 50% / 0.15)"
        />
        <MiniMap 
          nodeColor={() => 'hsl(180 100% 50%)'}
          maskColor="hsl(230 25% 5% / 0.8)"
          className="!bg-card/60 !backdrop-blur-xl"
        />
      </ReactFlow>

      <ControlPanel 
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitView={() => fitView({ padding: 0.2 })}
        onAddNode={handleAddNode}
      />
      
      <InfoPanel />

      {/* Ghost Cursors Layer */}
      <GhostCursorsLayer cursors={otherCursors} />

      {/* Global Tavern Chat */}
      <TavernChat
        isConnected={isConnected}
        myId={myId}
        myUsername={myUsername}
        myColor={myColor}
        onlineCount={otherCursors.length + 1}
      />

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines" />
    </div>
  );
}

const SpatialCanvas = () => {
  return (
    <ReactFlowProvider>
      <SpatialCanvasInner />
    </ReactFlowProvider>
  );
};

export default SpatialCanvas;
