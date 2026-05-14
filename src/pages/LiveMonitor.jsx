import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import useAuthStore from '../store/useAuthStore';

const LiveMonitor = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedJid, setSelectedJid] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [selectedBotId, setSelectedBotId] = useState(null);
  const [showChatsList, setShowChatsList] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchBots();
  }, []);

  useEffect(() => {
    if (selectedBotId) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedBotId]);

  useEffect(() => {
    if (selectedJid && selectedBotId) {
      fetchHistory();
      const interval = setInterval(fetchHistory, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedJid, selectedBotId]);

  const fetchBots = async () => {
    try {
      const response = await api.get('/bots');
      setBots(response.data);
      if (response.data.length > 0) {
        setSelectedBotId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching bots", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get(`/chat/bot/${selectedBotId}/conversations`);
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/chat/bot/${selectedBotId}/history/${selectedJid}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching history", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] bg-dark-200 rounded-2xl md:rounded-3xl border border-dark-100 overflow-hidden shadow-2xl">
      {/* Sidebar de Chats */}
      <div className={`
        flex flex-col bg-dark-200/50 transition-all duration-300 ease-in-out
        ${showChatsList ? 'md:w-80 md:border-r md:border-dark-100' : 'md:w-0 md:overflow-hidden md:border-r-0'}
        ${selectedJid ? 'hidden md:flex' : 'w-full flex'}
      `}>
        <div className="p-4 md:p-6 border-b border-dark-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase">LIVE MONITOR</h2>
            
            {/* Desktop Close Chats list button */}
            <button
              onClick={() => setShowChatsList(false)}
              className="hidden md:flex text-gray-500 hover:text-white hover:bg-dark-100 p-1.5 rounded-lg transition-all"
              title="Ocultar Chats"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <select 
            value={selectedBotId || ''} 
            onChange={(e) => setSelectedBotId(e.target.value)}
            className="w-full mt-3 md:mt-4 bg-dark-100 border border-dark-100 rounded-lg px-3 py-2 text-xs font-bold text-primary focus:outline-none"
          >
            {bots.map(bot => (
              <option key={bot.id} value={bot.id}>{bot.phoneNumber || 'Bot sin número'}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-40">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center mb-4">
                 <span className="text-gray-600 text-lg">💤</span>
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] text-center">Sin actividad reciente</p>
            </div>
          ) : conversations.map(conv => {
            let lastText = conv.lastMessage;
            if (lastText && lastText.includes('||btn:')) {
              lastText = lastText.split('||btn:')[0];
            }
            if (lastText && lastText.startsWith('Menú: ')) {
              lastText = lastText.substring(6);
            }

            const isActive = selectedJid === conv.remoteJid;

            return (
              <div 
                key={conv.remoteJid}
                onClick={() => setSelectedJid(conv.remoteJid)}
                className={`p-4 border-b border-dark-100 cursor-pointer transition-all hover:bg-dark-100/50 ${isActive ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-black text-gray-200 truncate w-32">{conv.remoteJid.split('@')[0]}</span>
                  <span className="text-[10px] text-gray-500 font-bold">{new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-[11px] text-gray-500 truncate italic font-semibold">
                  {conv.type === 'OUTGOING' ? '🤖 ' : '👤 '}{lastText || 'Mensaje interactivo'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ventana de Chat */}
      <div className={`
        flex-1 flex flex-col bg-dark-300/30 transition-all duration-300
        ${selectedJid ? 'flex w-full' : 'hidden md:flex'}
      `}>
        {selectedJid ? (
          <>
            <div className="p-4 md:p-6 border-b border-dark-100 bg-dark-200/30 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center min-w-0">
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedJid(null)}
                  className="p-1.5 rounded-lg border border-dark-100/50 text-gray-400 hover:text-white hover:bg-dark-100 transition-all mr-3 md:hidden flex flex-shrink-0 animate-fade-in"
                  title="Volver a los chats"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Hamburger button to toggle sidebar on desktop */}
                <button
                  onClick={() => setShowChatsList(!showChatsList)}
                  className={`p-1.5 rounded-lg border transition-all mr-3 md:flex hidden flex-shrink-0 ${
                    showChatsList 
                      ? 'bg-primary/5 border-primary/20 text-primary' 
                      : 'bg-dark-100 border-dark-100 text-gray-400 hover:text-white'
                  }`}
                  title={showChatsList ? "Ocultar lista de chats" : "Mostrar lista de chats"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black mr-4 border border-primary/20 flex-shrink-0">
                  {selectedJid.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white truncate max-w-[150px] md:max-w-[300px]">{selectedJid.split('@')[0]}</h3>
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest block leading-tight mt-0.5">En Línea con Bot</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messages.map((msg, i) => {
                // Parseo de botones si contiene el delimitador '||btn:'
                let cleanText = msg.text || '';
                let buttons = [];
                if (cleanText.includes('||btn:')) {
                  const parts = cleanText.split('||btn:');
                  cleanText = parts[0];
                  buttons = parts.slice(1);
                }
                
                // Quitar prefijo "Menú: " si existe
                if (cleanText.startsWith('Menú: ')) {
                  cleanText = cleanText.substring(6);
                }

                // Detectar tipo de multimedia
                let isImage = false;
                let isVideo = false;
                let mediaCaption = '';

                if (msg.mediaUrl) {
                  const lowerUrl = msg.mediaUrl.toLowerCase();
                  const isVideoFile = lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.avi');
                  const isVideoText = cleanText.toLowerCase().includes('video');
                  
                  if (isVideoFile || isVideoText) {
                    isVideo = true;
                  } else {
                    isImage = true;
                  }

                  if (cleanText.startsWith('Media: ')) {
                    const dashIndex = cleanText.indexOf(' - ');
                    if (dashIndex !== -1) {
                      mediaCaption = cleanText.substring(dashIndex + 3);
                    }
                  } else {
                    mediaCaption = cleanText;
                  }
                }

                const isOutgoing = msg.type === 'OUTGOING';
                const hasInteractive = msg.mediaUrl || buttons.length > 0;

                return (
                  <div key={i} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] md:max-w-[75%] p-3.5 md:p-4 rounded-2xl text-sm shadow-xl transition-all ${
                        isOutgoing 
                          ? hasInteractive
                            ? 'bg-dark-100 text-gray-200 rounded-tr-none border border-primary/40 shadow-[0_0_30px_rgba(var(--color-primary),0.02)]' 
                            : 'bg-primary text-dark-300 font-black rounded-tr-none'
                          : 'bg-dark-100 text-gray-200 rounded-tl-none border border-white/5'
                      }`}
                    >
                      {/* Renderizado de Multimedia (Imágenes, Videos o Archivos) */}
                      {msg.mediaUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-white/10 bg-black/20 relative group max-w-xs">
                          {isImage ? (
                            <a href={msg.mediaUrl} target="_blank" rel="noreferrer">
                              <img 
                                src={msg.mediaUrl} 
                                alt="Sent Media" 
                                className="max-h-60 w-full object-cover rounded-xl transition-transform hover:scale-105 duration-300 cursor-pointer"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://placehold.co/300x200/121212/ef4444?text=Archivo+No+Encontrado";
                                }}
                              />
                            </a>
                          ) : isVideo ? (
                            <video 
                              src={msg.mediaUrl} 
                              controls 
                              className="max-h-60 w-full rounded-xl"
                              preload="metadata"
                            />
                          ) : (
                            <div className="p-4 flex items-center gap-3">
                              <span className="p-3 bg-white/5 rounded-xl text-primary border border-white/10">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </span>
                              <div className="text-left">
                                <p className="text-xs font-mono font-bold text-gray-200 truncate max-w-[150px]">Documento</p>
                                <a 
                                  href={msg.mediaUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider block mt-0.5"
                                >
                                  Descargar Archivo
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Texto Principal o Pie de Foto */}
                      {msg.mediaUrl ? (
                        mediaCaption && (
                          <p className="text-xs font-bold text-gray-300 leading-relaxed mt-1.5 px-1">
                            {mediaCaption}
                          </p>
                        )
                      ) : (
                        <p className="leading-relaxed font-bold whitespace-pre-wrap">{cleanText}</p>
                      )}

                      {/* Renderizado de Botones Interactivos */}
                      {buttons.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                          <div className="flex items-center gap-1.5 text-[8px] text-primary font-mono font-black uppercase tracking-wider mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                            Botones Interactivos
                          </div>
                          <div className="flex flex-col gap-2">
                            {buttons.map((btn, idx) => (
                              <div 
                                key={idx} 
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 text-white text-xs font-black font-mono px-4 py-2.5 rounded-xl text-center transition-all cursor-default flex items-center justify-center gap-2 shadow-sm"
                              >
                                <span className="text-[10px] opacity-60">🔘</span>
                                {btn}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hora */}
                      <div className={`text-[9px] mt-1.5 opacity-50 ${isOutgoing && !hasInteractive ? 'text-dark-300' : 'text-gray-500'} font-bold text-right`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-dark-300/20">
            {/* Elementos Decorativos de Fondo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col items-center max-w-sm">
              <div className="w-20 h-20 rounded-3xl bg-dark-100 border border-white/5 flex items-center justify-center mb-8 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-3">
                CENTRO DE <span className="text-primary">OPERACIONES</span>
              </h3>
              
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                <span className="text-[10px] font-black text-green-500/80 uppercase tracking-widest font-mono">En espera de actividad en vivo...</span>
              </div>
              
              <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-tight">
                Selecciona una conversación del panel izquierdo para visualizar la interacción del bot en tiempo real.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                <div className="p-4 bg-dark-100/50 border border-white/5 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-primary font-black uppercase mb-1">Privacidad</span>
                  <p className="text-[9px] text-gray-600 font-bold uppercase leading-tight">Monitoreo Seguro SSL</p>
                </div>
                <div className="p-4 bg-dark-100/50 border border-white/5 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-blue-400 font-black uppercase mb-1">Velocidad</span>
                  <p className="text-[9px] text-gray-600 font-bold uppercase leading-tight">Sync en Tiempo Real</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMonitor;
