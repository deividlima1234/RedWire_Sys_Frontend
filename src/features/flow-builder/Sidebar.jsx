import React from 'react';

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-dark-200 border-l border-dark-100 p-4 flex flex-col">
      <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm border-b border-dark-100 pb-2">Nodes Library</h3>
      
      <div className="space-y-3">
        <div 
          className="border border-dark-100 bg-dark-100 hover:border-primary p-3 rounded cursor-grab transition-colors flex items-center"
          onDragStart={(event) => onDragStart(event, 'message')}
          draggable
        >
          <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="text-gray-300 text-sm font-medium">Message</span>
        </div>

        <div 
          className="border border-dark-100 bg-dark-100 hover:border-pink-500 p-3 rounded cursor-grab transition-colors flex items-center"
          onDragStart={(event) => onDragStart(event, 'media')}
          draggable
        >
          <svg className="w-5 h-5 mr-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-gray-300 text-sm font-medium">Media File</span>
        </div>

        <div 
          className="border border-dark-100 bg-dark-100 hover:border-purple-500 p-3 rounded cursor-grab transition-colors flex items-center"
          onDragStart={(event) => onDragStart(event, 'interactive')}
          draggable
        >
          <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
          <span className="text-gray-300 text-sm font-medium">Interactive (Buttons)</span>
        </div>
        
        <div 
          className="border border-dark-100 bg-dark-100 hover:border-yellow-500 p-3 rounded cursor-grab transition-colors flex items-center"
          onDragStart={(event) => onDragStart(event, 'condition')}
          draggable
        >
          <svg className="w-5 h-5 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          <span className="text-gray-300 text-sm font-medium">Condition (If/Else)</span>
        </div>

        <div 
          className="border border-dark-100 bg-dark-100 hover:border-blue-500 p-3 rounded cursor-grab transition-colors flex items-center"
          onDragStart={(event) => onDragStart(event, 'delay')}
          draggable
        >
          <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-gray-300 text-sm font-medium">Smart Delay</span>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-dark-100">
        <p className="text-xs text-gray-500">Drag and drop nodes to the canvas to build your flow.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
