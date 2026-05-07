import { useState, useEffect } from 'react';
import api from '../config/axios';

const DeleteConfirmModal = ({ isOpen, onClose, bot, onDeleted, onMetaUnlinked }) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmInput('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !bot) return null;

  const isBaileysActive = bot.status === 'CONNECTED' && !bot.phoneNumberId;

  // Identificador esperado para confirmar: el número de teléfono o el ID
  const expectedIdentifier = bot.phoneNumber ? bot.phoneNumber : bot.id;
  const expectedText = `DELETE ${expectedIdentifier}`;
  const isMatch = confirmInput.trim() === expectedText;

  const handleDelete = async () => {
    if (!isMatch) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.delete(`/bots/${bot.id}`);
      onDeleted(bot.id);
      onClose();
    } catch (err) {
      console.error('Error deleting bot:', err);
      const errMsg = err.response?.data || 'Error al eliminar el bot.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMetaUnlink = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.put(`/bots/${bot.id}/meta-unlink`);
      onMetaUnlinked(response.data);
      onClose();
    } catch (err) {
      console.error('Error unlinking Meta:', err);
      const errMsg = err.response?.data || 'Error al desvincular Meta.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div 
        className={`bg-dark-200 border rounded-3xl max-w-md w-full overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] transform transition-transform duration-300 ${shake ? 'animate-bounce' : ''} ${isBaileysActive ? 'border-red-500/30' : 'border-red-500/40'}`}
        style={{ animationDuration: '0.4s' }}
      >
        {isBaileysActive ? (
          <>
            {/* Cabecera de Acción Bloqueada */}
            <div className="bg-gradient-to-r from-red-950 to-red-900 border-b border-red-500/30 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-red-500/10 text-red-500 animate-pulse border border-red-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter font-mono">Acción Bloqueada</h3>
                  <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Instancia Activa</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-white hover:bg-dark-100 p-1.5 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Contenido de Advertencia de Conexión Activa */}
            <div className="p-6 space-y-6">
              <div className="bg-red-500/5 rounded-2xl p-5 border border-red-500/15 text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 text-red-500">
                  <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-white text-base font-black uppercase tracking-tight font-mono">Conexión Baileys Activa</h4>
                  <p className="text-xs text-gray-400">
                    No puedes eliminar una instancia activa de Baileys. La conexión persistente con WhatsApp está encendida.
                  </p>
                </div>
              </div>

              <div className="bg-dark-100/50 rounded-2xl p-4 border border-dark-100 space-y-3">
                <span className="text-[10px] text-primary font-black uppercase tracking-wider block">¿Cómo proceder?</span>
                <ul className="text-xs text-gray-300 space-y-2.5 font-semibold">
                  <li className="flex gap-2">
                    <span className="text-primary font-mono font-bold">1.</span>
                    Cierra esta ventana de advertencia.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-mono font-bold">2.</span>
                    Haz clic en el botón <strong className="text-red-400">"Desvincular"</strong> en la tarjeta del bot.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-mono font-bold">3.</span>
                    Espera unos segundos a que el estado cambie a <strong className="text-gray-400 font-mono">"DISCONNECTED"</strong>.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-mono font-bold">4.</span>
                    Vuelve a pulsar el botón de eliminar para destruirlo por completo.
                  </li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-dark-300 font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-primary/20"
              >
                Entendido, Cerrar
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Cabecera de Peligro */}
            <div className="bg-gradient-to-r from-red-950 to-red-900 border-b border-red-500/30 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-red-500/10 text-red-500 animate-pulse border border-red-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter font-mono">Peligro Crítico</h3>
                  <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Eliminar Instancia</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-white hover:bg-dark-100 p-1.5 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-5">
              <div className="bg-red-500/5 rounded-2xl p-4 border border-red-500/10 text-xs text-gray-300 leading-relaxed font-semibold">
                <span className="text-red-500 font-bold uppercase block mb-1">¡Esta acción es irreversible!</span>
                Se eliminarán permanentemente todos los flujos conversacionales creados, el historial de mensajes de chat y la base de datos de contactos asociados a este bot.
              </div>

              {/* Sección informativa para Bots con Meta Oficial */}
              {bot.phoneNumberId && (
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 text-xs text-gray-300 space-y-2">
                  <div className="flex items-center gap-1.5 text-primary font-black uppercase tracking-wider text-[10px]">
                    <span>⭐ Bot Meta Oficial</span>
                  </div>
                  <p className="leading-relaxed">
                    Este bot tiene credenciales activas del canal oficial de Meta. Si solo deseas limpiar estas credenciales y convertir este bot en uno de plan Standard (Baileys), puedes pulsar el botón de desvinculación oficial.
                  </p>
                  <button
                    type="button"
                    onClick={handleMetaUnlink}
                    disabled={loading}
                    className="w-full mt-2 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all"
                  >
                    {loading ? 'Procesando...' : 'Desvincular Credenciales Meta'}
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider font-bold">
                  Para confirmar la eliminación total, escribe la frase:
                  <span className="block mt-1 text-white bg-dark-100 px-3 py-2 rounded-lg font-mono text-xs border border-dark-100 select-all select-none">
                    {expectedText}
                  </span>
                </label>
                <input 
                  type="text"
                  placeholder={`DELETE ${expectedIdentifier}`}
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="w-full bg-dark-100 border border-dark-100 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none transition-all"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-xs text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center font-bold font-mono">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 bg-dark-100 hover:bg-dark-300 text-gray-400 hover:text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading || !isMatch}
                  className={`flex-1 py-3 font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg ${
                    isMatch && !loading 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                      : 'bg-dark-100 text-gray-600 cursor-not-allowed border border-dark-100'
                  }`}
                >
                  {loading ? 'Eliminando...' : 'Eliminar Bot'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
