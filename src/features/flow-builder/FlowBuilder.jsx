import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import TriggerNode from './nodes/TriggerNode';
import MessageNode from './nodes/MessageNode';
import ConditionNode from './nodes/ConditionNode';
import DelayNode from './nodes/DelayNode';
import InteractiveNode from './nodes/InteractiveNode';
import MediaNode from './nodes/MediaNode';
import api from '../../config/axios';

const initialNodes = [
  {
    id: '1',
    type: 'trigger',
    data: { label: 'Inbound Message' },
    position: { x: 250, y: 50 },
  },
];

const nodeTypes = {
  trigger: TriggerNode,
  message: MessageNode,
  condition: ConditionNode,
  delay: DelayNode,
  interactive: InteractiveNode,
  media: MediaNode,
};

const getId = () => `dndnode_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

const FlowBuilder = () => {
  const { id: botId } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('INITIATING DEPLOYMENT SEQUENCE...');
  const [flowId, setFlowId] = useState(null);

  // Historial para deshacer / rehacer
  const [history, setHistory] = useState({
    past: [],
    future: []
  });

  // Capturar una instantánea del estado antes de un cambio
  const takeSnapshot = useCallback(() => {
    setHistory((prev) => ({
      past: [...prev.past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
      future: [] // Limpiar rehacer cuando se hace una nueva acción
    }));
  }, [nodes, edges]);

  // Deshacer (Undo)
  const undo = useCallback(() => {
    if (history.past.length === 0) return;
    setHistory((prev) => {
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      const currentSnapshot = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };

      setNodes(previous.nodes);
      setEdges(previous.edges);

      return {
        past: newPast,
        future: [currentSnapshot, ...prev.future]
      };
    });
  }, [history.past, nodes, edges, setNodes, setEdges]);

  // Rehacer (Redo)
  const redo = useCallback(() => {
    if (history.future.length === 0) return;
    setHistory((prev) => {
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      const currentSnapshot = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };

      setNodes(next.nodes);
      setEdges(next.edges);

      return {
        past: [...prev.past, currentSnapshot],
        future: newFuture
      };
    });
  }, [history.future, nodes, edges, setNodes, setEdges]);

  // Atajos de teclado para deshacer/rehacer (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar si el usuario está escribiendo en un input o textarea
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const loadFlow = async () => {
      try {
        const response = await api.get(`/flows/bot/${botId}`);
        if (response.data && response.data.length > 0) {
          const flow = response.data[0];
          setFlowId(flow.id);
          if (flow.flowData && flow.flowData.nodes) {
            setNodes(flow.flowData.nodes);
            setEdges(flow.flowData.edges || []);
          }
        }
      } catch (error) {
        console.error("Error loading flow", error);
      }
    };
    loadFlow();
  }, [botId, setNodes, setEdges]);

  // Capturar arrastre finalizado, conexión de nodo, o eliminación para el historial
  const onNodeDragStop = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodesDelete = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onEdgesDelete = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onConnect = useCallback(
    (params) => {
      takeSnapshot();
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } }, eds));
    },
    [setEdges, takeSnapshot]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      takeSnapshot();
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, takeSnapshot]
  );

  const handleSave = async () => {
    if (!reactFlowInstance) return;
    setIsSaving(true);
    setSaveStatus('INITIATING DEPLOYMENT SEQUENCE...');

    // Simulaciones técnicas dinámicas
    const statusSteps = [
      { text: 'COMPILING CONVERSATIONAL NODE SCHEMA...', delay: 600 },
      { text: 'VALIDATING CORE ROUTING RULES...', delay: 1200 },
      { text: 'SYNCHRONIZING RECIPIENT TRIGGERS IN REDIS...', delay: 1800 },
      { text: 'UPLOADING WORKER CONFIGURATION PROTOCOLS...', delay: 2400 }
    ];

    statusSteps.forEach(step => {
      setTimeout(() => {
        setSaveStatus(step.text);
      }, step.delay);
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 2800));

      const flowData = reactFlowInstance.toObject();
      const payload = {
        name: "Main Flow",
        botId: botId,
        flowData: flowData,
        isActive: true
      };

      if (flowId) {
        await api.put(`/flows/${flowId}`, payload);
      } else {
        const response = await api.post('/flows', payload);
        setFlowId(response.data.id);
      }

      setSaveStatus('FLOW CONFIGURATION DEPLOYED SUCCESSFULLY!');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to save flow", error);
      setSaveStatus('DEPLOYMENT ERROR: COMPILATION FAILED!');
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-300 relative -m-8">
      {/* High-tech Deployment Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-dark-300/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-fade-in">
          <div className="w-24 h-24 relative mb-6">
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-pulse"></div>
            <div className="absolute inset-4 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin duration-1000"></div>
            <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-primary text-xl">
              SYS
            </div>
          </div>
          <p className="text-xs font-mono tracking-[0.2em] font-black text-primary animate-pulse uppercase">
            {saveStatus}
          </p>
          <div className="w-64 h-1.5 bg-dark-100 rounded-full mt-4 overflow-hidden relative border border-dark-100">
            <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary to-purple-600 rounded-full animate-loading-bar" style={{ width: '100%' }}></div>
          </div>
          <p className="text-[9px] text-gray-500 font-mono mt-2.5 uppercase tracking-widest animate-pulse">
            RedWire Core API v1.0.0
          </p>
        </div>
      )}

      <div className="bg-dark-200 border-b border-dark-100 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-white font-bold text-lg font-mono">Flow Editor</h2>
          <p className="text-gray-400 text-xs">Design your conversational logic</p>
        </div>

        {/* Controles de Historial (Deshacer/Rehacer) */}
        <div className="flex items-center space-x-2 bg-dark-100 p-1.5 rounded-lg border border-dark-100/30">
          <button
            onClick={undo}
            disabled={history.past.length === 0}
            className={`p-2 rounded hover:bg-dark-300 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent`}
            title="Deshacer (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
          </button>
          
          <button
            onClick={redo}
            disabled={history.future.length === 0}
            className={`p-2 rounded hover:bg-dark-300 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent`}
            title="Rehacer (Ctrl+Y)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" /></svg>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="border border-dark-100 hover:border-red-500/30 text-gray-400 hover:text-red-500 bg-transparent hover:bg-red-500/5 px-5 py-2 rounded font-bold transition-all text-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Cancelar
          </button>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded font-bold text-xs transition-all shadow-lg shadow-primary/10 ${isSaving ? 'opacity-50' : ''}`}
          >
            Save & Deploy
          </button>
        </div>
      </div>
      
      <div className="flex flex-grow overflow-hidden">
        <ReactFlowProvider>
          <div className="flex-grow h-full" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStop={onNodeDragStop}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="bg-dark-300"
            >
              <Background color="#333" gap={16} />
              <Controls className="bg-dark-200 border-dark-100 fill-white" />
            </ReactFlow>
          </div>
          <Sidebar />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default FlowBuilder;
