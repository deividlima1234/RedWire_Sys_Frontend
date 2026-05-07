import { Handle, Position, useReactFlow } from 'reactflow';

const MessageNode = ({ id, data, isConnectable }) => {
  const { setNodes } = useReactFlow();

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, message: newText };
        }
        return node;
      })
    );
  };
  return (
    <div className="bg-dark-200 border border-dark-100 hover:border-primary rounded-lg shadow-lg min-w-[250px] transition-colors group">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-primary"
      />
      
      <div className="bg-dark-100 p-2 rounded-t-lg border-b border-dark-100 text-xs font-bold text-gray-300 uppercase flex items-center">
        <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        Send Message
      </div>
      
      <div className="p-4">
        <textarea
          className="w-full bg-dark-300 border border-dark-100 rounded text-sm text-white p-2 focus:outline-none focus:border-primary resize-none nodrag"
          value={data.message || ''}
          placeholder="Type a message..."
          rows={3}
          onChange={handleTextChange}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-primary"
      />
    </div>
  );
};

export default MessageNode;
