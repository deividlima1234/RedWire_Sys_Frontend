import React, { useState } from 'react';

const Sidebar = ({ isOpen, onClose, onAddNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-dark-300/80 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static top-0 right-0 h-full z-40 bg-dark-200 border-l border-dark-100 p-4 flex flex-col 
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20 w-64' : 'md:w-64 w-64'}
      `}>
        <div className={`flex items-center mb-4 border-b border-dark-100 pb-2 ${isCollapsed ? 'md:justify-center justify-between' : 'justify-between'}`}>
          {!isCollapsed && (
            <h3 className="text-white font-bold uppercase tracking-wider text-xs truncate animate-fade-in">
              Nodes Library
            </h3>
          )}
          {isCollapsed && (
            <h3 className="text-white font-bold uppercase tracking-wider text-[9px] md:hidden truncate">
              Nodes Library
            </h3>
          )}
          
          <div className="flex items-center gap-1.5">
            {/* Desktop Collapse/Expand Toggle button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex text-gray-500 hover:text-white hover:bg-dark-100 p-1.5 rounded transition-all"
              title={isCollapsed ? "Expandir panel" : "Contraer panel"}
            >
              {isCollapsed ? (
                <svg className="w-4 h-4 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400 hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {/* Node: Message */}
          <div 
            className={`border border-dark-100 bg-dark-100 hover:border-primary rounded-xl cursor-grab active:scale-95 transition-all flex items-center select-none ${
              isCollapsed ? 'md:p-3 p-3 md:justify-center' : 'p-3'
            }`}
            onDragStart={(event) => onDragStart(event, 'message')}
            onClick={() => onAddNode('message')}
            draggable
            title={isCollapsed ? "Message (Mensaje de Texto)" : "Haz clic o arrastra para añadir"}
          >
            <svg className={`w-5 h-5 text-primary ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            {(!isCollapsed || window.innerWidth < 768) && <span className="text-gray-300 text-sm font-medium">Message</span>}
          </div>

          {/* Node: Media */}
          <div 
            className={`border border-dark-100 bg-dark-100 hover:border-pink-500 rounded-xl cursor-grab active:scale-95 transition-all flex items-center select-none ${
              isCollapsed ? 'md:p-3 p-3 md:justify-center' : 'p-3'
            }`}
            onDragStart={(event) => onDragStart(event, 'media')}
            onClick={() => onAddNode('media')}
            draggable
            title={isCollapsed ? "Media File (Archivo Multimedia)" : "Haz clic o arrastra para añadir"}
          >
            <svg className={`w-5 h-5 text-pink-500 ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {(!isCollapsed || window.innerWidth < 768) && <span className="text-gray-300 text-sm font-medium">Media File</span>}
          </div>

          {/* Node: Interactive */}
          <div 
            className={`border border-dark-100 bg-dark-100 hover:border-purple-500 rounded-xl cursor-grab active:scale-95 transition-all flex items-center select-none ${
              isCollapsed ? 'md:p-3 p-3 md:justify-center' : 'p-3'
            }`}
            onDragStart={(event) => onDragStart(event, 'interactive')}
            onClick={() => onAddNode('interactive')}
            draggable
            title={isCollapsed ? "Interactive (Botones Oficiales)" : "Haz clic o arrastra para añadir"}
          >
            <svg className={`w-5 h-5 text-purple-500 ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
            {(!isCollapsed || window.innerWidth < 768) && <span className="text-gray-300 text-sm font-medium">Interactive (Buttons)</span>}
          </div>
          
          {/* Node: Condition */}
          <div 
            className={`border border-dark-100 bg-dark-100 hover:border-yellow-500 rounded-xl cursor-grab active:scale-95 transition-all flex items-center select-none ${
              isCollapsed ? 'md:p-3 p-3 md:justify-center' : 'p-3'
            }`}
            onDragStart={(event) => onDragStart(event, 'condition')}
            onClick={() => onAddNode('condition')}
            draggable
            title={isCollapsed ? "Condition (If / Else)" : "Haz clic o arrastra para añadir"}
          >
            <svg className={`w-5 h-5 text-yellow-500 ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            {(!isCollapsed || window.innerWidth < 768) && <span className="text-gray-300 text-sm font-medium">Condition (If/Else)</span>}
          </div>

          {/* Node: Delay */}
          <div 
            className={`border border-dark-100 bg-dark-100 hover:border-blue-500 rounded-xl cursor-grab active:scale-95 transition-all flex items-center select-none ${
              isCollapsed ? 'md:p-3 p-3 md:justify-center' : 'p-3'
            }`}
            onDragStart={(event) => onDragStart(event, 'delay')}
            onClick={() => onAddNode('delay')}
            draggable
            title={isCollapsed ? "Smart Delay (Retraso Humano)" : "Haz clic o arrastra para añadir"}
          >
            <svg className={`w-5 h-5 text-blue-500 ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {(!isCollapsed || window.innerWidth < 768) && <span className="text-gray-300 text-sm font-medium">Smart Delay</span>}
          </div>

          {/* Node: Capture Input */}
          <div 
            className={`border border-dark-100 bg-dark-100 hover:border-violet-500 rounded-xl cursor-grab active:scale-95 transition-all flex items-center select-none ${
              isCollapsed ? 'md:p-3 p-3 md:justify-center' : 'p-3'
            }`}
            onDragStart={(event) => onDragStart(event, 'capture')}
            onClick={() => onAddNode('capture')}
            draggable
            title={isCollapsed ? "Capture Input (Capturar Entrada)" : "Haz clic o arrastra para añadir"}
          >
            <svg className={`w-5 h-5 text-violet-500 ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {(!isCollapsed || window.innerWidth < 768) && <span className="text-gray-300 text-sm font-medium">Capture Input</span>}
          </div>

          {/* Node: Database Action */}
          <div 
            className={`border border-dark-100 bg-dark-100 hover:border-amber-500 rounded-xl cursor-grab active:scale-95 transition-all flex items-center select-none ${
              isCollapsed ? 'md:p-3 p-3 md:justify-center' : 'p-3'
            }`}
            onDragStart={(event) => onDragStart(event, 'action')}
            onClick={() => onAddNode('action')}
            draggable
            title={isCollapsed ? "Database Action (Acción DB / Registro)" : "Haz clic o arrastra para añadir"}
          >
            <svg className={`w-5 h-5 text-amber-500 ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {(!isCollapsed || window.innerWidth < 768) && <span className="text-gray-300 text-sm font-medium">Database Action</span>}
          </div>

          {/* Node: Recipient Router */}
          <div 
            className={`border border-dark-100 bg-dark-100 hover:border-cyan-500 rounded-xl cursor-grab active:scale-95 transition-all flex items-center select-none ${
              isCollapsed ? 'md:p-3 p-3 md:justify-center' : 'p-3'
            }`}
            onDragStart={(event) => onDragStart(event, 'router')}
            onClick={() => onAddNode('router')}
            draggable
            title={isCollapsed ? "Recipient Router (Enrutador de Destinatarios)" : "Haz clic o arrastra para añadir"}
          >
            <svg className={`w-5 h-5 text-cyan-500 ${isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {(!isCollapsed || window.innerWidth < 768) && <span className="text-gray-300 text-sm font-medium">Recipient Router</span>}
          </div>
        </div>
        
        {/* Footer info text */}
        {!isCollapsed && (
          <div className="mt-auto pt-4 border-t border-dark-100 hidden md:block">
            <p className="text-[11px] text-gray-500 leading-normal">
              Arrastra o haz clic en un nodo para añadirlo al editor.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
