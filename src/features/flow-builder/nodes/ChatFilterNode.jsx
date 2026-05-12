import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

const ChatFilterNode = ({ id, data, isConnectable }) => {
  const { setNodes } = useReactFlow();

  const handleDataChange = (key, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, [key]: value };
        }
        return node;
      })
    );
  };

  const allowPrivate = data.allowPrivate !== undefined ? data.allowPrivate : true;
  const allowGroups = data.allowGroups !== undefined ? data.allowGroups : true;
  const groupFilterMode = data.groupFilterMode || 'all';
  const groupJids = data.groupJids || '';

  return (
    <div className="bg-dark-200 border border-dark-100 hover:border-emerald-500 rounded-lg shadow-lg w-72 transition-colors group" style={{ pointerEvents: 'auto' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-emerald-500"
      />
      
      <div className="bg-emerald-600/20 p-2 rounded-t-lg border-b border-emerald-500/30 text-xs font-bold text-emerald-400 uppercase flex items-center cursor-grab active:cursor-grabbing custom-drag-handle">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Chat Filter 💬
      </div>
      
      <div className="p-4 space-y-4">
        {/* Toggle Privados */}
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-gray-300 font-mono uppercase tracking-wider font-bold cursor-pointer">
            Permitir Chats Privados
          </label>
          <input 
            type="checkbox" 
            checked={allowPrivate}
            onChange={(e) => handleDataChange('allowPrivate', e.target.checked)}
            className="w-4 h-4 rounded border-dark-100 bg-dark-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-dark-200"
          />
        </div>

        {/* Toggle Grupos */}
        <div className="flex items-center justify-between border-t border-dark-100/50 pt-2">
          <label className="text-[10px] text-gray-300 font-mono uppercase tracking-wider font-bold cursor-pointer">
            Permitir Grupos
          </label>
          <input 
            type="checkbox" 
            checked={allowGroups}
            onChange={(e) => handleDataChange('allowGroups', e.target.checked)}
            className="w-4 h-4 rounded border-dark-100 bg-dark-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-dark-200"
          />
        </div>

        {/* Opciones de Grupos */}
        {allowGroups && (
          <div className="bg-dark-300 p-3 rounded-lg border border-dark-100 space-y-3">
            <div>
              <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase tracking-wider">Filtro de Grupos:</label>
              <select 
                value={groupFilterMode}
                onChange={(e) => handleDataChange('groupFilterMode', e.target.value)}
                className="w-full bg-dark-200 border border-dark-100 rounded text-xs text-white p-1.5 focus:outline-none focus:border-emerald-500 transition-colors nodrag font-mono"
              >
                <option value="all">Todos los Grupos</option>
                <option value="whitelist">Lista Blanca (Solo estos)</option>
                <option value="blacklist">Lista Negra (Todos menos estos)</option>
              </select>
            </div>

            {groupFilterMode !== 'all' && (
              <div>
                <label className="block text-[9px] text-gray-400 mb-1 font-mono uppercase tracking-wider">
                  IDs de Grupos (separados por coma):
                </label>
                <textarea
                  className="w-full bg-dark-200 border border-dark-100 rounded text-[10px] text-white p-2 h-16 focus:outline-none focus:border-emerald-500 transition-colors nodrag resize-none font-mono"
                  placeholder="ej. 123456789, 987654321"
                  value={groupJids}
                  onChange={(e) => handleDataChange('groupJids', e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Visual Outputs Representation */}
        <div className="border-t border-dark-100/30 pt-3 space-y-2.5 pb-2">
          <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono font-bold px-1">
            <span className="text-emerald-400 text-center w-1/3">👤 Privados</span>
            <span className="text-blue-400 text-center w-1/3">👥 Grupos</span>
            <span className="text-red-400 text-center w-1/3">⛔ Bloqueados</span>
          </div>
          
          <div className="relative h-4 mt-1">
            {/* Private Output Handle */}
            <Handle
              type="source"
              position={Position.Bottom}
              id="private_allowed"
              isConnectable={isConnectable}
              className="w-3.5 h-3.5 !bg-emerald-500 border-2 !border-dark-200 hover:scale-125 transition-transform"
              style={{ left: '16.66%' }}
              title="Chats Privados Permitidos"
            />
            
            {/* Group Output Handle */}
            <Handle
              type="source"
              position={Position.Bottom}
              id="group_allowed"
              isConnectable={isConnectable}
              className="w-3.5 h-3.5 !bg-blue-500 border-2 !border-dark-200 hover:scale-125 transition-transform"
              style={{ left: '50%' }}
              title="Grupos Permitidos"
            />
            
            {/* Blocked Output Handle */}
            <Handle
              type="source"
              position={Position.Bottom}
              id="blocked"
              isConnectable={isConnectable}
              className="w-3.5 h-3.5 !bg-red-500 border-2 !border-dark-200 hover:scale-125 transition-transform"
              style={{ left: '83.33%' }}
              title="Chats Bloqueados (Privados o Grupos)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatFilterNode;
