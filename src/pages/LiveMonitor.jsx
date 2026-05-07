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
    <div className="flex h-[calc(100vh-8rem)] bg-dark-200 rounded-3xl border border-dark-100 overflow-hidden shadow-2xl">
      {/* Sidebar de Chats */}
      <div className="w-80 border-r border-dark-100 flex flex-col bg-dark-200/50">
        <div className="p-6 border-b border-dark-100">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase">LIVE MONITOR</h2>
          <select 
            value={selectedBotId} 
            onChange={(e) => setSelectedBotId(e.target.value)}
            className="w-full mt-4 bg-dark-100 border border-dark-100 rounded-lg px-3 py-2 text-xs font-bold text-primary focus:outline-none"
          >
            {bots.map(bot => (
              <option key={bot.id} value={bot.id}>{bot.phoneNumber || 'Bot sin número'}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-xs font-semibold uppercase tracking-widest">Esperando mensajes...</div>
          ) : conversations.map(conv => {
            let lastText = conv.lastMessage;
            if (lastText && lastText.includes('||btn:')) {
              lastText = lastText.split('||btn:')[0];
            }
            if (lastText && lastText.startsWith('Menú: ')) {
              lastText = lastText.substring(6);
            }

            return (
              <div 
                key={conv.remoteJid}
                onClick={() => setSelectedJid(conv.remoteJid)}
                className={`p-4 border-b border-dark-100 cursor-pointer transition-all hover:bg-dark-100/50 ${selectedJid === conv.remoteJid ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
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
      <div className="flex-1 flex flex-col bg-dark-300/30">
        {selectedJid ? (
          <>
            <div className="p-6 border-b border-dark-100 bg-dark-200/30 flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black mr-4 border border-primary/20">
                {selectedJid.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{selectedJid}</h3>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">En Línea con Bot</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                      className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-xl transition-all ${
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
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <svg className="w-16 h-16 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p className="text-xs font-black uppercase tracking-widest text-gray-600">Selecciona una conversación</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMonitor;
