import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

const RouterNode = ({ id, data, isConnectable }) => {
  const { setNodes } = useReactFlow();

  const handleFieldChange = (field, val) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, [field]: val };
          
          // Mantener la estructura de routes para el backend
          if (field === 'variable' || field === 'expectedValue') {
            const variable = field === 'variable' ? val : (node.data.variable || '');
            const expectedValue = field === 'expectedValue' ? val : (node.data.expectedValue || '');
            
            node.data.routes = [
              { condition: 'equals', variable: variable, value: expectedValue, label: 'Coincide' },
              { condition: 'fallback', label: 'No coincide' }
            ];
          }
        }
        return node;
      })
    );
  };

  const routerType = data.routerType || 'recipient';

  return (
    <div className="bg-dark-200 border border-dark-100 hover:border-cyan-500 rounded-lg shadow-lg w-72 transition-colors group" style={{ pointerEvents: 'auto' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-cyan-500"
      />
      
      <div className="bg-cyan-600/20 p-2 rounded-t-lg border-b border-cyan-500/30 text-xs font-bold text-cyan-400 uppercase flex items-center cursor-grab active:cursor-grabbing custom-drag-handle">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Smart Router 🔀
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1 font-mono uppercase tracking-wider font-bold">Tipo de Router:</label>
          <select
            className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white p-2 focus:outline-none focus:border-cyan-500 transition-colors nodrag font-bold"
            value={routerType}
            onChange={(e) => handleFieldChange('routerType', e.target.value)}
          >
            <option value="recipient">📱 Filtrar por Teléfono</option>
            <option value="variable">🧠 Enrutador por Variable</option>
          </select>
        </div>

        {routerType === 'recipient' ? (
          <>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-mono uppercase tracking-wider font-bold">🟢 Solo a estos (Whitelist):</label>
              <textarea
                className="w-full bg-dark-300 border border-dark-100 rounded text-[11px] text-white p-2 h-12 focus:outline-none focus:border-cyan-500 transition-colors nodrag resize-none font-mono"
                placeholder="e.g. 51983032706, 51983032707"
                value={data.onlyTheseNumbers || ''}
                onChange={(e) => handleFieldChange('onlyTheseNumbers', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-mono uppercase tracking-wider font-bold">🟡 Todos menos estos (Blacklist):</label>
              <textarea
                className="w-full bg-dark-300 border border-dark-100 rounded text-[11px] text-white p-2 h-12 focus:outline-none focus:border-cyan-500 transition-colors nodrag resize-none font-mono"
                placeholder="e.g. 51999999999, 51988888888"
                value={data.exceptTheseNumbers || ''}
                onChange={(e) => handleFieldChange('exceptTheseNumbers', e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Si la variable:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors nodrag font-mono font-bold"
                placeholder="ej. lead_status"
                value={data.variable || ''}
                onChange={(e) => handleFieldChange('variable', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase font-bold">Es IGUAL a:</label>
              <input
                type="text"
                className="w-full bg-dark-300 border border-dark-100 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors nodrag font-mono font-bold"
                placeholder="ej. waiting_agent"
                value={data.expectedValue || ''}
                onChange={(e) => handleFieldChange('expectedValue', e.target.value)}
              />
            </div>
          </>
        )}

        {/* Visual Outputs Representation */}
        <div className="border-t border-dark-100/30 pt-3 space-y-2.5 pb-2">
          {routerType === 'recipient' ? (
            <>
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono font-bold">
                <span className="text-green-400">🟢 Whitelist</span>
                <span className="text-yellow-400">🟡 Except</span>
                <span className="text-blue-400">🔵 Fallback</span>
              </div>
              <div className="relative h-4 mt-1">
                <Handle type="source" position={Position.Bottom} id="only_these" isConnectable={isConnectable} className="w-3.5 h-3.5 !bg-green-500 border-2 !border-dark-200 hover:scale-125 transition-transform" style={{ left: '15%' }} />
                <Handle type="source" position={Position.Bottom} id="except_these" isConnectable={isConnectable} className="w-3.5 h-3.5 !bg-yellow-500 border-2 !border-dark-200 hover:scale-125 transition-transform" style={{ left: '50%' }} />
                <Handle type="source" position={Position.Bottom} id="everyone" isConnectable={isConnectable} className="w-3.5 h-3.5 !bg-blue-500 border-2 !border-dark-200 hover:scale-125 transition-transform" style={{ left: '85%' }} />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono font-bold px-2">
                <span className="text-green-400">🟢 Coincide</span>
                <span className="text-red-400">❌ No Coincide</span>
              </div>
              <div className="relative h-4 mt-1">
                <Handle type="source" position={Position.Bottom} id="route_0" isConnectable={isConnectable} className="w-3.5 h-3.5 !bg-green-500 border-2 !border-dark-200 hover:scale-125 transition-transform" style={{ left: '25%' }} title="Si se cumple la condición" />
                <Handle type="source" position={Position.Bottom} id="route_1" isConnectable={isConnectable} className="w-3.5 h-3.5 !bg-red-500 border-2 !border-dark-200 hover:scale-125 transition-transform" style={{ left: '75%' }} title="Fallback" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouterNode;
