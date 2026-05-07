import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

const InteractiveNode = ({ id, data, isConnectable }) => {
  const { setNodes } = useReactFlow();

  const buttons = data.buttons || [];

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

  const handleAddButton = () => {
    if (buttons.length >= 3) return;
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const newButtons = [...(node.data.buttons || []), { id: `btn-${Date.now()}`, text: `Button ${buttons.length + 1}` }];
          node.data = { ...node.data, buttons: newButtons };
        }
        return node;
      })
    );
  };

  const handleButtonTextChange = (btnId, newText) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const newButtons = node.data.buttons.map(b => b.id === btnId ? { ...b, text: newText } : b);
          node.data = { ...node.data, buttons: newButtons };
        }
        return node;
      })
    );
  };

  const handleRemoveButton = (btnId) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const newButtons = node.data.buttons.filter(b => b.id !== btnId);
          node.data = { ...node.data, buttons: newButtons };
        }
        return node;
      })
    );
  };

  return (
    <div className="bg-dark-200 border border-dark-100 hover:border-purple-500 rounded-lg shadow-lg min-w-[280px] transition-colors group" style={{ pointerEvents: 'auto' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-purple-500"
      />
      
      <div className="bg-purple-600/20 p-2 rounded-t-lg border-b border-purple-500/30 text-xs font-bold text-purple-400 uppercase flex items-center cursor-grab active:cursor-grabbing custom-drag-handle">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        Interactive Menu (Lists)
      </div>
      
      <div className="p-4 space-y-4 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-mono">MESSAGE TEXT:</label>
          <textarea
            className="w-full bg-dark-300 border border-dark-100 rounded text-sm text-white p-2 focus:outline-none focus:border-purple-500 resize-none nodrag"
            value={data.message || ''}
            placeholder="Choose an option below..."
            rows={2}
            onChange={handleMessageChange}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs text-gray-400 font-mono">MENU OPTIONS:</label>
            {buttons.length < 3 && (
              <button 
                onClick={handleAddButton}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center nodrag"
              >
                + Add
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {buttons.map((btn, index) => (
              <div key={btn.id} className="relative flex items-center">
                <input
                  type="text"
                  value={btn.text}
                  onChange={(e) => handleButtonTextChange(btn.id, e.target.value)}
                  className="w-full bg-dark-100 border border-dark-100 rounded text-xs text-white p-2 pr-8 focus:outline-none focus:border-purple-500 nodrag"
                  maxLength={20}
                  placeholder="Button Text"
                />
                <button 
                  onClick={() => handleRemoveButton(btn.id)}
                  className="absolute right-2 text-gray-500 hover:text-red-500 nodrag"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {buttons.length === 0 && (
              <div className="text-center text-xs text-gray-600 py-2 border border-dashed border-dark-100 rounded">
                No buttons added yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary source handle for flow continuation (if no button is pressed or general flow) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-gray-500 border-2 !border-dark-200"
        style={{ left: '10%' }}
      />
      <div className="absolute bottom-[-20px] left-[10%] -translate-x-1/2 text-[9px] text-gray-500">Default</div>

      {/* Dynamic handles for each button */}
      {buttons.map((btn, index) => {
        const leftPos = buttons.length === 1 ? '50%' : `${30 + (index * (60 / (buttons.length - 1)))}%`;
        return (
          <React.Fragment key={`handle-${btn.id}`}>
            <Handle
              type="source"
              position={Position.Bottom}
              id={btn.id}
              isConnectable={isConnectable}
              className="w-3 h-3 !bg-purple-500 border-2 !border-dark-200"
              style={{ left: leftPos }}
            />
            <div 
              className="absolute bottom-[-20px] -translate-x-1/2 text-[9px] text-purple-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px]"
              style={{ left: leftPos }}
            >
              {btn.text}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default InteractiveNode;
