import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

const ActionNode = ({ id, data, isConnectable }) => {
  const { setNodes } = useReactFlow();

  const updateNodeData = (newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, ...newData };
        }
        return node;
      })
    );
  };

  const handleActionTypeChange = (e) => {
    const actionType = e.target.value;
    
    if (actionType === 'webhook') {
      updateNodeData({
        actionType,
        webhookUrl: '',
        method: 'POST'
      });
    } else if (actionType === 'set_variable') {
      updateNodeData({
        actionType,
        variableName: '',
        variableValue: ''
      });
    } else {
      updateNodeData({ actionType });
    }
  };

  const handleFieldChange = (field, val) => {
    const cleanVal = val.replace(/[^a-zA-Z0-9_]/g, ''); // alphanumeric and underscores
    updateNodeData({ [field]: cleanVal });
  };

  const actionType = data.actionType || 'webhook';

  return (
    <div className="bg-dark-200 border border-dark-100 hover:border-amber-500 rounded-lg shadow-lg w-64 transition-colors group" style={{ pointerEvents: 'auto' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-amber-500"
      />
      
      <div className="bg-amber-600/20 p-2 rounded-t-lg border-b border-amber-500/30 text-xs font-bold text-amber-400 uppercase flex items-center cursor-grab active:cursor-grabbing custom-drag-handle">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Database Action ⚡
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1 font-mono uppercase tracking-wider font-bold">Tipo de Acción:</label>
          <select
            className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white p-2 focus:outline-none focus:border-amber-500 transition-colors nodrag font-bold"
            value={actionType}
            onChange={handleActionTypeChange}
          >
            <option value="none" disabled>Selecciona una opción...</option>
            <option value="webhook">🌐 Webhook (Petición HTTP)</option>
            <option value="set_variable">💾 Set Variable (Estado)</option>
          </select>
        </div>

        {actionType === 'webhook' && (
          <div className="space-y-3 pt-1 border-t border-dark-100/30">
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Método HTTP:</label>
              <select
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white p-2 focus:outline-none focus:border-amber-500 transition-colors nodrag font-bold"
                value={data.method || 'POST'}
                onChange={(e) => updateNodeData({ method: e.target.value })}
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">URL del Webhook:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="https://hook.make.com/..."
                value={data.webhookUrl || ''}
                onChange={(e) => updateNodeData({ webhookUrl: e.target.value })}
              />
            </div>
            <p className="text-[8px] text-amber-500/80 font-mono font-bold leading-normal pt-1.5 border-t border-dark-100/20">
              Se enviarán todas las variables de la sesión automáticamente en el body.
            </p>
          </div>
        )}

        {actionType === 'set_variable' && (
          <div className="space-y-3 pt-1 border-t border-dark-100/30">
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Nombre de la Variable:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="ej. lead_status"
                value={data.variableName || ''}
                onChange={(e) => updateNodeData({ variableName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Valor (Value):</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="ej. waiting_agent"
                value={data.variableValue || ''}
                onChange={(e) => updateNodeData({ variableValue: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {['set_variable'].includes(actionType) ? (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          isConnectable={isConnectable}
          className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-amber-500"
        />
      ) : (
        <div className="border-t border-dark-100/30 pt-1 pb-3 relative">
          <div className="flex justify-between items-center text-[9px] px-4 font-mono font-bold">
            <span className="text-green-400">🟢 Éxito (match)</span>
            <span className="text-red-400">❌ Error (unmatch)</span>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="match"
            isConnectable={isConnectable}
            className="w-3.5 h-3.5 !bg-green-500 border-2 !border-dark-200 hover:scale-125 transition-transform"
            style={{ left: '25%' }}
            title="Sigue este camino en caso de Éxito"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="unmatch"
            isConnectable={isConnectable}
            className="w-3.5 h-3.5 !bg-red-500 border-2 !border-dark-200 hover:scale-125 transition-transform"
            style={{ left: '75%' }}
            title="Sigue este camino en caso de Error"
          />
        </div>
      )}
    </div>
  );
};

export default ActionNode;
