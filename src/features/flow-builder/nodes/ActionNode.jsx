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
    // Set default variables based on action type to make it super easy for user
    if (actionType === 'generate_beta_code') {
      updateNodeData({
        actionType,
        pioneerNameVar: 'pioneer_name',
        generatedCodeVar: 'generated_code'
      });
    } else if (actionType === 'validate_beta_code') {
      updateNodeData({
        actionType,
        clientNameVar: 'client_name',
        clientCodeVar: 'client_code',
        isValidVar: 'is_valid'
      });
    } else if (actionType === 'register_user') {
      updateNodeData({
        actionType,
        clientNameVar: 'client_name',
        clientEmailVar: 'client_email',
        clientPasswordVar: 'client_password',
        clientCodeVar: 'client_code'
      });
    } else if (actionType === 'webhook') {
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

  const actionType = data.actionType || 'register_user';

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
            <option value="register_pioneer" disabled>Selecciona una opción...</option>
            <option value="generate_beta_code">🔑 Generar Código Beta</option>
            <option value="validate_beta_code">🛡️ Validar Código Beta</option>
            <option value="register_user">🚀 Registrar Pionero Beta</option>
            <option value="webhook">🌐 Webhook (Petición HTTP)</option>
            <option value="set_variable">💾 Set Variable (Estado)</option>
          </select>
        </div>

        {actionType === 'generate_beta_code' && (
          <div className="space-y-3 pt-1 border-t border-dark-100/30">
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Var. Nombre Pionero:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="pioneer_name"
                value={data.pioneerNameVar || 'pioneer_name'}
                onChange={(e) => handleFieldChange('pioneerNameVar', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Guardar Código en Var:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="generated_code"
                value={data.generatedCodeVar || 'generated_code'}
                onChange={(e) => handleFieldChange('generatedCodeVar', e.target.value)}
              />
            </div>
          </div>
        )}

        {actionType === 'validate_beta_code' && (
          <div className="space-y-3 pt-1 border-t border-dark-100/30">
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Var. Nombre Cliente:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="client_name"
                value={data.clientNameVar || 'client_name'}
                onChange={(e) => handleFieldChange('clientNameVar', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Var. Código Acceso:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="client_code"
                value={data.clientCodeVar || 'client_code'}
                onChange={(e) => handleFieldChange('clientCodeVar', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Guardar Resultado en Var:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="is_valid"
                value={data.isValidVar || 'is_valid'}
                onChange={(e) => handleFieldChange('isValidVar', e.target.value)}
              />
            </div>
          </div>
        )}

        {actionType === 'register_user' && (
          <div className="space-y-3 pt-1 border-t border-dark-100/30">
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Var. Nombre:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="client_name"
                value={data.clientNameVar || 'client_name'}
                onChange={(e) => handleFieldChange('clientNameVar', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Var. Correo:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="client_email"
                value={data.clientEmailVar || 'client_email'}
                onChange={(e) => handleFieldChange('clientEmailVar', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Var. Contraseña:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="client_password"
                value={data.clientPasswordVar || 'client_password'}
                onChange={(e) => handleFieldChange('clientPasswordVar', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Var. Código:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-mono font-bold"
                placeholder="client_code"
                value={data.clientCodeVar || 'client_code'}
                onChange={(e) => handleFieldChange('clientCodeVar', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">URL de Login (Personalizada):</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors nodrag font-bold"
                placeholder="https://redwire-bot.onrender.com/login"
                value={data.clientLoginUrl || ''}
                onChange={(e) => updateNodeData({ clientLoginUrl: e.target.value })}
              />
            </div>
            <p className="text-[8px] text-amber-500/80 font-mono font-bold leading-normal pt-1.5 border-t border-dark-100/20">
              Genera variables <span className="text-white">{"{{pioneer_status}}"}</span> y <span className="text-white">{"{{pioneer_login_url}}"}</span> automáticamente.
            </p>
          </div>
        )}

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

      {['generate_beta_code', 'set_variable'].includes(actionType) ? (
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
