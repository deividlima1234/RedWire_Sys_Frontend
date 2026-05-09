import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

const CaptureNode = ({ id, data, isConnectable }) => {
  const { setNodes } = useReactFlow();

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, message: newMessage };
        }
        return node;
      })
    );
  };

  const handleVariableChange = (e) => {
    const newVar = e.target.value.replace(/[^a-zA-Z0-9_]/g, ''); // alphanumeric and underscores only
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, variableName: newVar };
        }
        return node;
      })
    );
  };

  return (
    <div className="bg-dark-200 border border-dark-100 hover:border-violet-500 rounded-lg shadow-lg w-64 transition-colors group" style={{ pointerEvents: 'auto' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-violet-500"
      />
      
      <div className="bg-violet-600/20 p-2 rounded-t-lg border-b border-violet-500/30 text-xs font-bold text-violet-400 uppercase flex items-center cursor-grab active:cursor-grabbing custom-drag-handle">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Capture Input 📥
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1 font-mono uppercase tracking-wider font-bold">Pregunta al Cliente (WhatsApp):</label>
          <textarea
            className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white p-2 h-16 focus:outline-none focus:border-violet-500 transition-colors nodrag resize-none font-medium leading-relaxed"
            placeholder="Ej: ¿Cuál es tu nombre completo?"
            value={data.message || ''}
            onChange={handleMessageChange}
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1 font-mono uppercase tracking-wider font-bold">Guardar en Variable:</label>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-xs text-violet-400 font-mono font-bold">{"{"}</span>
            <input
              type="text"
              className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white pl-5 pr-5 py-2 focus:outline-none focus:border-violet-500 transition-colors nodrag font-mono font-bold"
              placeholder="customerName"
              value={data.variableName || ''}
              onChange={handleVariableChange}
            />
            <span className="absolute right-2.5 text-xs text-violet-400 font-mono font-bold">{"}"}</span>
          </div>
          <p className="text-[9px] text-gray-500 font-bold mt-1.5 font-mono leading-normal">
            Puedes usar el dato en otros nodos escribiendo <span className="text-violet-400">{"{{variableName}}"}</span>
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-violet-500"
      />
    </div>
  );
};

export default CaptureNode;
