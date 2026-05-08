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
import { preconfiguredTemplates } from './templates/preconfiguredTemplates';
import useAuthStore from '../../store/useAuthStore';

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
  const fileInputRef = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('INITIATING DEPLOYMENT SEQUENCE...');
  const [flowId, setFlowId] = useState(null);

  const { user } = useAuthStore();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [upgradeAlert, setUpgradeAlert] = useState(null);

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

  const checkTierCompatibility = (userTier, requiredTier) => {
    if (requiredTier === 'FREE') return true;
    if (requiredTier === 'STANDARD') {
      return userTier === 'STANDARD' || userTier === 'VIP';
    }
    if (requiredTier === 'VIP') {
      return userTier === 'VIP';
    }
    return true;
  };

  const handleExportFlow = () => {
    if (!reactFlowInstance) return;
    const flowObject = reactFlowInstance.toObject();

    // Auto-detect tier requirement based on node types
    let tierRequirement = 'FREE';
    const hasInteractive = flowObject.nodes.some(n => n.type === 'interactive');
    const hasMedia = flowObject.nodes.some(n => n.type === 'media');

    if (hasInteractive) {
      tierRequirement = 'VIP';
    } else if (hasMedia) {
      tierRequirement = 'STANDARD';
    }

    const exportData = {
      appName: 'RedWire System',
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      tierRequirement,
      flowData: flowObject
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `redwire_flow_template_${botId}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFlow = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validation check
        if (!data.flowData || !data.flowData.nodes) {
          alert('Error: El archivo JSON cargado no tiene un formato válido de RedWire System.');
          return;
        }

        // Tier validation
        const requiredTier = data.tierRequirement || 'FREE';
        const userTier = user?.subscriptionTier || 'FREE';

        // Check compatibility
        const isCompatible = checkTierCompatibility(userTier, requiredTier);
        if (!isCompatible) {
          setUpgradeAlert({ requiredTier, actionType: 'importar' });
          return;
        }

        // Load flow
        takeSnapshot();
        setNodes(data.flowData.nodes);
        setEdges(data.flowData.edges || []);
        
        // Force file input reset
        event.target.value = null;
        alert('¡Plantilla importada con éxito! 🎉 Guarda los cambios para desplegarlos.');
      } catch (err) {
        console.error('Failed to parse import JSON', err);
        alert('Error: No se pudo descifrar el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadTemplate = (template) => {
    const userTier = user?.subscriptionTier || 'FREE';
    const isCompatible = checkTierCompatibility(userTier, template.tierRequirement);
    
    if (!isCompatible) {
      setUpgradeAlert({ requiredTier: template.tierRequirement, actionType: 'cargar plantilla' });
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas cargar la plantilla "${template.name}"? Esto reemplazará tu flujo actual en el lienzo.`)) {
      takeSnapshot();
      setNodes(template.nodes);
      setEdges(template.edges || []);
      setIsTemplateModalOpen(false);
    }
  };

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
          {/* Botón Importar */}
          <button 
            onClick={() => fileInputRef.current.click()}
            className="border border-dark-100 hover:border-primary/30 text-gray-400 hover:text-white bg-transparent px-4 py-2 rounded font-bold transition-all text-xs flex items-center gap-1.5"
            title="Importar un archivo de flujo .json"
          >
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Importar
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFlow} 
            accept=".json" 
            style={{ display: 'none' }} 
          />

          {/* Botón Exportar */}
          <button 
            onClick={handleExportFlow}
            className="border border-dark-100 hover:border-primary/30 text-gray-400 hover:text-white bg-transparent px-4 py-2 rounded font-bold transition-all text-xs flex items-center gap-1.5"
            title="Exportar flujo actual como .json"
          >
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar
          </button>

          {/* Botón Librería */}
          <button 
            onClick={() => setIsTemplateModalOpen(true)}
            className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 px-4 py-2 rounded font-bold transition-all text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/5"
            title="Librería de plantillas preconfiguradas"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Librería 💎
          </button>

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

      {/* Modal de Librería de Plantillas */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-300/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsTemplateModalOpen(false)}></div>
          
          <div className="bg-dark-200 border border-dark-100 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-dark-100 flex justify-between items-center bg-dark-100/30">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  LIBRERÍA DE PLANTILLAS DE FLUJO 💎
                </h2>
                <p className="text-gray-400 text-xs mt-1 font-medium">Lanza flujos conversacionales profesionales y de alta conversión en un solo clic.</p>
              </div>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {preconfiguredTemplates.map((template) => {
                const isVIP = template.tierRequirement === 'VIP';
                const isStandard = template.tierRequirement === 'STANDARD';
                return (
                  <div 
                    key={template.id} 
                    className="bg-dark-300/40 border border-dark-100 hover:border-primary/40 rounded-2xl p-5 flex flex-col justify-between group transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-3xl">{template.icon}</span>
                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold border ${
                          isVIP ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' :
                          isStandard ? 'text-blue-400 border-blue-400/30 bg-blue-400/5' :
                          'text-gray-400 border-gray-400/30 bg-gray-400/5'
                        }`}>
                          {template.tierRequirement}
                        </span>
                      </div>
                      <h3 className="text-white font-black text-sm mb-2">{template.name}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-medium mb-6">
                        {template.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        isVIP ? 'bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-dark-300 border border-yellow-500/20' :
                        isStandard ? 'bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-dark-300 border border-blue-500/20' :
                        'bg-primary/10 hover:bg-primary text-primary hover:text-dark-300 border border-primary/20'
                      }`}
                    >
                      🚀 Cargar Plantilla
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-dark-100/10 text-center border-t border-dark-100">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Las plantillas sobreescribirán cualquier nodo actual en pantalla. Usa deshacer (Ctrl+Z) si te equivocas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alerta de Membresía Insuficiente */}
      {upgradeAlert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-300/90 backdrop-blur-md animate-fade-in" onClick={() => setUpgradeAlert(null)}></div>
          
          <div className="bg-dark-200 border border-red-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-dark-100 text-center bg-dark-100/30 relative">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Plan Insuficiente</h2>
              <p className="text-gray-400 text-xs mt-1 font-medium">Requieres una membresía superior</p>
            </div>

            <div className="p-6 text-center space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed font-medium">
                La acción de <span className="text-white font-bold">{upgradeAlert.actionType}</span> requiere la membresía <span className={`font-black px-2 py-0.5 rounded ${
                  upgradeAlert.requiredTier === 'VIP' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-400/10 text-blue-400'
                }`}>{upgradeAlert.requiredTier} 💎</span>.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Tu plan actual es <span className="text-white font-bold">{user?.subscriptionTier || 'FREE'}</span>. Mejora hoy para desbloquear el uso ilimitado de plantillas conversacionales, multimedia y flujos interactivos de alto nivel.
              </p>
            </div>

            <div className="p-6 bg-dark-100/10 border-t border-dark-100 flex gap-3">
              <button
                onClick={() => setUpgradeAlert(null)}
                className="flex-1 py-3 bg-dark-100 hover:bg-dark-100/80 text-gray-400 hover:text-white font-bold rounded-xl text-sm transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setUpgradeAlert(null);
                  setIsTemplateModalOpen(false);
                  alert("Por favor, ve al Dashboard y haz clic en el botón de Mejorar Plan para ascender tu suscripción de inmediato. ¡Te esperamos!");
                }}
                className={`flex-1 py-3 font-black rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  upgradeAlert.requiredTier === 'VIP' 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-dark-300 shadow-yellow-500/10' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/10'
                }`}
              >
                💎 Mejorar Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowBuilder;
