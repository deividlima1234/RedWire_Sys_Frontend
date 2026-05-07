import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

const ConditionNode = ({ id, data }) => {
  const { setNodes } = useReactFlow();

  const onChange = (evt) => {
    const newKeyword = evt.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, keyword: newKeyword };
        }
        return node;
      })
    );
  };

  return (
    <div className="bg-dark-200 border border-dark-100 rounded-lg shadow-xl w-64 text-white overflow-hidden">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-gray-400 border-2 border-dark-200" 
      />
      
      <div className="bg-yellow-600/20 px-4 py-2 border-b border-dark-100 flex items-center">
        <span className="mr-2 text-yellow-500">🔀</span>
        <h3 className="font-bold text-sm tracking-wider">CONDITION (IF/ELSE)</h3>
      </div>
      
      <div className="p-4">
        <label className="block text-xs text-gray-400 mb-2 font-mono">IF MESSAGE CONTAINS:</label>
        <input 
          type="text" 
          value={data.keyword || ''} 
          onChange={onChange}
          placeholder="e.g. precio, ayuda..."
          className="w-full bg-dark-100 border border-dark-100 rounded p-2 text-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder-gray-600 nodrag"
        />
      </div>
      
      <div className="flex border-t border-dark-100">
        <div className="flex-1 p-2 text-center border-r border-dark-100 relative bg-green-900/10">
          <span className="text-xs font-bold text-green-500">MATCH (TRUE)</span>
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="match"
            className="w-3 h-3 bg-green-500 border-2 border-dark-200 translate-x-[-50%]"
            style={{ left: '50%' }}
          />
        </div>
        <div className="flex-1 p-2 text-center relative bg-red-900/10">
          <span className="text-xs font-bold text-red-500">UNMATCH (FALSE)</span>
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="unmatch"
            className="w-3 h-3 bg-red-500 border-2 border-dark-200 translate-x-[-50%]"
            style={{ left: '50%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ConditionNode;
