import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

const DelayNode = ({ id, data, isConnectable }) => {
  const { setNodes } = useReactFlow();

  const handleTimeChange = (e) => {
    const newTime = parseInt(e.target.value, 10);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, delayTime: newTime };
        }
        return node;
      })
    );
  };

  const handleTypingChange = (e) => {
    const simulateTyping = e.target.checked;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, simulateTyping };
        }
        return node;
      })
    );
  };

  return (
    <div className="bg-dark-200 border border-dark-100 hover:border-blue-500 rounded-lg shadow-lg w-64 transition-colors group" style={{ pointerEvents: 'auto' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-blue-500"
      />
      
      <div className="bg-blue-600/20 p-2 rounded-t-lg border-b border-blue-500/30 text-xs font-bold text-blue-400 uppercase flex items-center cursor-grab active:cursor-grabbing custom-drag-handle">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Smart Delay
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-mono">WAIT FOR (SECONDS):</label>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              max="3600"
              className="w-full bg-dark-300 border border-dark-100 rounded text-sm text-white p-2 focus:outline-none focus:border-blue-500 transition-colors nodrag"
              value={data.delayTime || 3}
              onChange={handleTimeChange}
            />
            <span className="ml-2 text-xs text-gray-500">sec</span>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id={`typing-${id}`}
            className="w-4 h-4 rounded bg-dark-300 border-dark-100 text-blue-500 focus:ring-blue-500 focus:ring-opacity-25 nodrag"
            checked={data.simulateTyping !== false}
            onChange={handleTypingChange}
          />
          <label htmlFor={`typing-${id}`} className="ml-2 text-xs text-gray-300 cursor-pointer select-none nodrag">
            Simulate "typing..." & read
          </label>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-blue-500"
      />
    </div>
  );
};

export default DelayNode;
