import React, { useState, useEffect } from 'react';
import api from '../config/axios';

const MetaCredentialsModal = ({ isOpen, onClose, bot, onSaved }) => {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [webhookVerifyToken, setWebhookVerifyToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (bot) {
      setPhoneNumberId(bot.phoneNumberId || '');
      setWabaId(bot.wabaId || '');
      setMetaAccessToken(bot.metaAccessToken || '');
      setWebhookVerifyToken(bot.webhookVerifyToken || '');
    } else {
      setPhoneNumberId('');
      setWabaId('');
      setMetaAccessToken('');
      setWebhookVerifyToken('');
    }
    setError('');
    setSuccess('');
  }, [bot, isOpen]);

  if (!isOpen || !bot) return null;

  // Generador de tokens aleatorios seguros para verificación de Webhooks
  const generateRandomToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let token = '';
    for (let i = 0; i < 24; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setWebhookVerifyToken(token);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await api.put(`/bots/${bot.id}/meta-credentials`, {
        phoneNumberId,
        wabaId,
        metaAccessToken,
        webhookVerifyToken
      });
      setSuccess('¡Credenciales oficiales de Meta Cloud guardadas con éxito!');
      if (onSaved) {
        onSaved(response.data);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data || 'Error al guardar las credenciales. Verifica los campos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-300/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-xl w-full bg-dark-200 border border-primary/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Encabezado VIP */}
        <div className="p-6 border-b border-dark-100 bg-gradient-to-r from-primary/10 via-purple-600/5 to-transparent flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
              ⭐
            </div>
            <div>
              <h3 className="text-lg font-black font-mono text-white flex items-center gap-2">
                CONFIGURACIÓN <span className="text-primary font-mono font-black">VIP</span>
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">API Oficial de Meta Cloud</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg bg-dark-100 hover:bg-dark-100/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-900/30 border border-primary text-primary text-xs font-bold text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3.5 rounded-xl bg-green-900/30 border border-green-500 text-green-400 text-xs font-bold text-center">
              {success}
            </div>
          )}

          <div className="bg-dark-300/50 p-4 rounded-xl border border-dark-100 text-xs text-gray-400 space-y-2 leading-relaxed">
            <p className="font-bold text-white flex items-center gap-1">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              Instrucciones de Configuración
            </p>
            <p>
              Obtén estas credenciales en tu panel de <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Meta Developers</a> en la sección de WhatsApp. Configura la URL del Webhook de tu bot apuntando a:
            </p>
            <div className="bg-dark-300 p-2.5 rounded font-mono text-[11px] text-gray-300 select-all border border-dark-100 break-all">
              http://localhost:8080/api/v1/webhooks/meta/{bot.id}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-mono font-bold mb-1 uppercase tracking-wider">ID de Teléfono de Meta (Phone Number ID):</label>
            <input
              type="text"
              required
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-300 border border-dark-100 rounded-xl text-sm text-white focus:outline-none focus:border-primary transition-colors font-mono"
              placeholder="Ej: 104845185934502"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-mono font-bold mb-1 uppercase tracking-wider">ID de Cuenta Comercial (WABA ID):</label>
            <input
              type="text"
              required
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-300 border border-dark-100 rounded-xl text-sm text-white focus:outline-none focus:border-primary transition-colors font-mono"
              placeholder="Ej: 102435183921501"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-mono font-bold mb-1 uppercase tracking-wider">Token de Acceso Permanente (Meta Access Token):</label>
            <textarea
              required
              rows={3}
              value={metaAccessToken}
              onChange={(e) => setMetaAccessToken(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-300 border border-dark-100 rounded-xl text-sm text-white focus:outline-none focus:border-primary transition-colors font-mono custom-scrollbar resize-none"
              placeholder="Ingresa el token de acceso permanente de Meta..."
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-mono font-bold mb-1 uppercase tracking-wider">Token de Verificación del Webhook (Verify Token):</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={webhookVerifyToken}
                onChange={(e) => setWebhookVerifyToken(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-dark-300 border border-dark-100 rounded-xl text-sm text-white focus:outline-none focus:border-primary transition-colors font-mono"
                placeholder="Ingresa un token o genera uno..."
              />
              <button
                type="button"
                onClick={generateRandomToken}
                className="px-4 py-2 bg-dark-100 hover:bg-dark-100/80 border border-dark-100 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all font-mono"
              >
                AUTOGENERAR
              </button>
            </div>
            <p className="text-[9px] text-gray-500 mt-1">Este es el token que deberás ingresar en la consola de Meta para validar el webhook.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3.5 bg-primary hover:bg-primary-dark text-dark-300 font-black rounded-xl transition-all shadow-lg shadow-primary/20 uppercase tracking-widest text-xs mt-4 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Guardando Credenciales...' : 'Guardar Credenciales Oficiales'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MetaCredentialsModal;
