import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

const TriggerNode = ({ id, data }) => {
  const { setNodes } = useReactFlow();

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, triggerType: newType };
        }
        return node;
      })
    );
  };

  const handleKeywordChange = (e) => {
    const newKeywords = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, keywords: newKeywords };
        }
        return node;
      })
    );
  };

  return (
    <div className="bg-dark-200 border-2 border-primary rounded-lg shadow-xl w-64 text-white overflow-hidden" style={{ pointerEvents: 'auto' }}>
      <div className="bg-primary/20 px-4 py-2 border-b border-primary/50 flex items-center cursor-grab active:cursor-grabbing custom-drag-handle">
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse mr-2"></div>
        <h3 className="font-bold text-sm tracking-wider uppercase">Trigger</h3>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-mono">TRIGGER TYPE:</label>
          <select 
            className="w-full bg-dark-100 border border-dark-100 rounded p-2 text-sm focus:outline-none focus:border-primary transition-colors text-white nodrag"
            value={data.triggerType || 'all'}
            onChange={handleTypeChange}
          >
            <option value="all">Any Message</option>
            <option value="exact">Exact Match</option>
            <option value="contains">Contains</option>
            <option value="regex">Regex</option>
          </select>
        </div>

        {(data.triggerType === 'exact' || data.triggerType === 'contains' || data.triggerType === 'regex') && (
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-mono">KEYWORDS:</label>
            <input 
              type="text" 
              value={data.keywords || ''} 
              onChange={handleKeywordChange}
              placeholder="e.g. hola, ayuda..."
              className="w-full bg-dark-100 border border-dark-100 rounded p-2 text-sm focus:outline-none focus:border-primary transition-colors placeholder-gray-600 nodrag"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Separated by commas</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary border-2 !border-dark-200"
      />
    </div>
  );
};

export default TriggerNode;
