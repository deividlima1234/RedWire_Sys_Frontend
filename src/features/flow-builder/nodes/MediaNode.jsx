import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

const MediaNode = ({ id, data, isConnectable }) => {
  const { setNodes } = useReactFlow();

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, mediaType: newType };
        }
        return node;
      })
    );
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, url: newUrl };
        }
        return node;
      })
    );
  };

  const handleCaptionChange = (e) => {
    const newCaption = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, caption: newCaption };
        }
        return node;
      })
    );
  };

  return (
    <div className="bg-dark-200 border border-dark-100 hover:border-pink-500 rounded-lg shadow-lg w-64 transition-colors group" style={{ pointerEvents: 'auto' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-pink-500"
      />
      
      <div className="bg-pink-600/20 p-2 rounded-t-lg border-b border-pink-500/30 text-xs font-bold text-pink-400 uppercase flex items-center cursor-grab active:cursor-grabbing custom-drag-handle">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        Media Message
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-mono">MEDIA TYPE:</label>
          <select 
            className="w-full bg-dark-100 border border-dark-100 rounded p-2 text-sm focus:outline-none focus:border-pink-500 transition-colors text-white nodrag"
            value={data.mediaType || 'image'}
            onChange={handleTypeChange}
          >
            <option value="image">Image</option>
            <option value="audio">Audio (Voice Note)</option>
            <option value="video">Video</option>
            <option value="document">Document (PDF)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 font-mono">FILE URL:</label>
          <input 
            type="text" 
            value={data.url || ''} 
            onChange={handleUrlChange}
            placeholder="https://example.com/file.jpg"
            className="w-full bg-dark-300 border border-dark-100 rounded p-2 text-sm focus:outline-none focus:border-pink-500 transition-colors text-white nodrag"
          />
        </div>

        {data.mediaType !== 'audio' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-mono">CAPTION (Optional):</label>
            <textarea
              className="w-full bg-dark-300 border border-dark-100 rounded text-sm text-white p-2 focus:outline-none focus:border-pink-500 resize-none nodrag"
              value={data.caption || ''}
              placeholder="Add a message..."
              rows={2}
              onChange={handleCaptionChange}
            />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-white border-2 !border-dark-200 group-hover:!bg-pink-500"
      />
    </div>
  );
};

export default MediaNode;
