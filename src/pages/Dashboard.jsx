import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/axios';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import useAuthStore from '../store/useAuthStore';
import MetaCredentialsModal from '../components/MetaCredentialsModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import BotDiagnosticsModal from '../components/BotDiagnosticsModal';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBotPhone, setNewBotPhone] = useState('');
  const [creating, setCreating] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [selectedBotId, setSelectedBotId] = useState(null);
  const [socket, setSocket] = useState(null);

  // Estados para el Modal VIP de Meta
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [selectedBotForMeta, setSelectedBotForMeta] = useState(null);

  // Estados para el Modal de Eliminación Segura
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBotForDelete, setSelectedBotForDelete] = useState(null);

  // Estados para la Consola de Diagnóstico y Salud
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [selectedBotForDiagnostics, setSelectedBotForDiagnostics] = useState(null);

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
  const isVip = user?.subscriptionTier === 'VIP' || user?.subscriptionTier === 'VIP_TIER';

  useEffect(() => {
    fetchBots();
    
    const newSocket = io('http://localhost:3000', { autoConnect: false });
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('qr', (qrString) => {
        setQrCode(qrString);
      });
      socket.on('status', (status) => {
        if (status === 'CONNECTED') {
          setQrCode(null);
          setSelectedBotId(null);
          fetchBots();
          socket.disconnect(); // Desconectar el socket tras el enlace exitoso
        }
      });
      socket.on('connect_error', (error) => {
        console.warn("Socket.io worker offline. Conexión omitida de forma segura (normal para planes VIP):", error.message);
      });
    }
  }, [socket]);

  const fetchBots = async () => {
    try {
      const response = await api.get('/bots');
      setBots(response.data);
    } catch (error) {
      console.error("Error fetching bots", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/bots', { phoneNumber: newBotPhone });
      setNewBotPhone('');
      fetchBots();
    } catch (error) {
      console.error("Error creating bot", error);
    } finally {
      setCreating(false);
    }
  };

  const handleGetQr = async (botId) => {
    setSelectedBotId(botId);
    setQrCode(null);
    if (socket) {
      socket.connect(); // Conectar el socket bajo demanda al solicitar código QR
      socket.emit('join_bot_room', botId);
    }
    try {
      await api.get(`/bots/${botId}/qr`);
    } catch (error) {
      console.error("Error obteniendo QR", error);
      alert("Error al intentar iniciar la sesión de WhatsApp. Asegúrate de que el Worker de Node esté activo.");
      setSelectedBotId(null);
      if (socket) socket.disconnect();
    }
  };

  const handleLogoutBot = async (botId) => {
    if (!confirm('¿Estás seguro de que quieres desvincular esta cuenta de WhatsApp?')) return;
    try {
      await fetch(`http://localhost:3000/worker/bot/${botId}/logout`, { method: 'POST' });
      fetchBots();
    } catch (error) {
      console.error("Error logging out bot", error);
      alert("Error al desvincular el bot.");
    }
  };

  // Callback de guardado en el modal VIP
  const handleMetaCredentialsSaved = (updatedBot) => {
    // Actualizar el estado local para reflejar los cambios de inmediato
    setBots(prevBots => prevBots.map(b => b.id === updatedBot.id ? updatedBot : b));
  };

  const handleDeleteBotClick = (bot) => {
    setSelectedBotForDelete(bot);
    setIsDeleteModalOpen(true);
  };

  const handleBotDeleted = (botId) => {
    setBots(prevBots => prevBots.filter(b => b.id !== botId));
    if (selectedBotId === botId) {
      setSelectedBotId(null);
      setQrCode(null);
    }
  };

  const handleBotMetaUnlinked = (updatedBot) => {
    setBots(prevBots => prevBots.map(b => b.id === updatedBot.id ? updatedBot : b));
  };

  const handleMetaUnlinkDirect = async (botId) => {
    if (!confirm('¿Estás seguro de que deseas desvincular este canal oficial de Meta? El bot volverá al estado Standard desvinculado.')) return;
    try {
      const response = await api.put(`/bots/${botId}/meta-unlink`);
      handleBotMetaUnlinked(response.data);
    } catch (error) {
      console.error("Error direct unlinking Meta:", error);
      alert("Error al desvincular Meta.");
    }
  };

  return (
    <div className="text-white relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-black font-mono tracking-tighter italic">MY <span className="text-primary">BOTS</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-dark-200 border-2 border-dashed border-dark-100 rounded-3xl p-8 shadow-lg flex flex-col justify-center">
          <h3 className="text-lg text-white font-black mb-1 uppercase tracking-tighter">Crear Nueva Instancia</h3>
          <p className="text-[10px] text-gray-500 mb-6 font-bold uppercase tracking-widest">WhatsApp Multi-Device</p>
          <form onSubmit={handleCreateBot}>
            <input 
              type="text" 
              placeholder="Ej: +51983032706"
              className="w-full bg-dark-100 border border-dark-100 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-primary text-white transition-all font-mono"
              value={newBotPhone}
              onChange={(e) => setNewBotPhone(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={creating}
              className={`w-full py-4 bg-primary hover:bg-primary-dark text-dark-300 font-black rounded-xl transition-all shadow-lg shadow-primary/20 uppercase tracking-widest text-xs ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {creating ? 'CREANDO...' : 'Generar Instancia'}
            </button>
          </form>
        </div>

        {loading ? (
          <div className="col-span-2 text-gray-400 flex items-center justify-center font-bold animate-pulse uppercase tracking-widest text-xs">Sincronizando con Servidores...</div>
        ) : bots.length === 0 ? (
          <div className="col-span-2 bg-dark-200 border border-dark-100 rounded-3xl p-8 flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs">
            No hay instancias activas. Crea una para comenzar.
          </div>
        ) : (
          bots.map(bot => (
            <div key={bot.id} className="bg-dark-200 border border-dark-100 rounded-3xl p-8 flex flex-col justify-between shadow-xl hover:border-primary/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter">{bot.phoneNumber || 'Instancia Vacía'}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Status de Conexión</p>
                    
                    {/* Badge de Canal de Meta Oficial */}
                    {bot.phoneNumberId ? (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[8px] text-primary font-mono font-black uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          ⭐ Meta Oficial
                        </span>
                      </div>
                    ) : isVip ? (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[8px] text-yellow-500/80 font-mono font-black uppercase tracking-wider bg-yellow-500/5 px-2 py-0.5 rounded-full border border-yellow-500/20">
                          💎 Requiere Configurar Meta
                        </span>
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${bot.status === 'CONNECTED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {bot.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3 relative z-10">
                <Link to={`/bot/${bot.id}/flow`} className="w-full text-center bg-dark-100 text-gray-300 hover:bg-primary hover:text-dark-300 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest">
                  Configurar Flujos
                </Link>
                <div className="flex space-x-3">
                  {bot.phoneNumberId ? (
                    <button 
                      onClick={() => handleMetaUnlinkDirect(bot.id)}
                      className="flex-1 py-3 border border-primary/30 text-primary hover:bg-primary hover:text-dark-300 rounded-xl transition-all font-black uppercase tracking-widest text-xs"
                    >
                      Desvincular Meta
                    </button>
                  ) : isVip ? (
                    <button 
                      onClick={() => {
                        setSelectedBotForMeta(bot);
                        setIsMetaModalOpen(true);
                      }}
                      className="flex-1 py-3 bg-primary text-dark-300 hover:bg-primary-dark rounded-xl transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 animate-pulse"
                    >
                      Vincular Meta
                    </button>
                  ) : bot.status !== 'CONNECTED' ? (
                    <button 
                      onClick={() => handleGetQr(bot.id)}
                      className="flex-1 py-3 bg-primary text-dark-300 rounded-xl transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                    >
                      Escanear QR
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleLogoutBot(bot.id)}
                      className="flex-1 py-3 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all font-black uppercase tracking-widest text-xs"
                    >
                      Desvincular
                    </button>
                  )}
                </div>

                {/* NUEVO TOOLBAR AVANZADO RESPONSIVO */}
                <div className="pt-2.5 border-t border-dark-100/50 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* Consola de Diagnóstico */}
                  <button
                    onClick={() => {
                      setSelectedBotForDiagnostics(bot);
                      setIsDiagnosticsOpen(true);
                    }}
                    className="flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-dark-100 hover:bg-primary/10 text-gray-400 hover:text-primary transition-all text-[10px] font-black uppercase tracking-wider border border-white/5 active:scale-95"
                    title="Abrir Consola de Diagnóstico"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Consola</span>
                  </button>

                  {/* Ajustes de Meta para VIP/Admin */}
                  {(isVip || isAdmin) && (
                    <button
                      onClick={() => {
                        setSelectedBotForMeta(bot);
                        setIsMetaModalOpen(true);
                      }}
                      className="flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-dark-100 hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-500 transition-all text-[10px] font-black uppercase tracking-wider border border-white/5 active:scale-95"
                      title="Configurar Credenciales Oficiales de Meta"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Ajustes</span>
                    </button>
                  )}

                  {/* Eliminar Bot */}
                  <button
                    onClick={() => handleDeleteBotClick(bot)}
                    className="flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-dark-100 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all text-[10px] font-black uppercase tracking-wider border border-white/5 active:scale-95"
                    title="Eliminar Instancia"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Eliminar</span>
                  </button>

                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Modal */}
      {selectedBotId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-dark-200 border border-primary p-8 rounded-lg shadow-2xl flex flex-col items-center max-w-sm w-full relative">
            <button 
              onClick={() => {
                setSelectedBotId(null);
                if (socket) socket.disconnect(); // Desconectar socket al cerrar manualmente el modal de QR
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-6 font-mono">Vincular WhatsApp</h3>
            
            <div className="bg-white p-4 rounded-lg w-64 h-64 flex items-center justify-center mb-6">
              {qrCode ? (
                <QRCodeSVG value={qrCode} size={224} />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span className="text-dark-300 font-bold text-sm text-center">Generando QR con Baileys...</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-400 text-sm text-center">
              Abre WhatsApp en tu teléfono, ve a Dispositivos Vinculados y escanea este código.
            </p>
          </div>
        </div>
      )}

      {/* Modal de Configuración VIP de Meta Cloud */}
      <MetaCredentialsModal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        bot={selectedBotForMeta}
        onSaved={handleMetaCredentialsSaved}
      />

      {/* Modal de Eliminación Segura */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        bot={selectedBotForDelete}
        onDeleted={handleBotDeleted}
        onMetaUnlinked={handleBotMetaUnlinked}
      />

      {/* Modal de Consola de Diagnóstico */}
      {isDiagnosticsOpen && selectedBotForDiagnostics && (
        <BotDiagnosticsModal
          isOpen={isDiagnosticsOpen}
          onClose={() => {
            setIsDiagnosticsOpen(false);
            setSelectedBotForDiagnostics(null);
          }}
          bot={selectedBotForDiagnostics}
          onRefresh={fetchBots}
        />
      )}
    </div>
  );
};

export default Dashboard;
