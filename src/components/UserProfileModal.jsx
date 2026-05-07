import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../config/axios';

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info'); // 'info' o 'security'
  
  // Estados para info de cuenta
  const [email, setEmail] = useState('');
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');
  const [isInfoSaving, setIsInfoSaving] = useState(false);

  // Estados para contraseña
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secError, setSecError] = useState('');
  const [secSuccess, setSecSuccess] = useState('');
  const [isSecSaving, setIsSecSaving] = useState(false);

  // Cargar email inicial
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess('');
    setIsInfoSaving(true);

    try {
      const response = await api.put('/auth/profile', { email });
      // Actualizar datos locales de autenticación
      setAuth(localStorage.getItem('token'), response.data);
      setInfoSuccess('¡Correo electrónico actualizado con éxito!');
    } catch (err) {
      setInfoError(err.response?.data || 'No se pudo actualizar el correo electrónico.');
    } finally {
      setIsInfoSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSecError('');
    setSecSuccess('');

    if (newPassword !== confirmPassword) {
      setSecError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setSecError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSecSaving(true);

    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      setSecSuccess('¡Contraseña cambiada con éxito!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSecError(err.response?.data || 'Error al cambiar la contraseña. Verifica tu contraseña actual.');
    } finally {
      setIsSecSaving(false);
    }
  };

  // Formatear fechas
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-300/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-2xl w-full bg-dark-200 border border-dark-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh]">
        
        {/* Panel Izquierdo: Resumen Visual */}
        <div className="md:w-2/5 bg-gradient-to-br from-primary/10 via-purple-600/5 to-transparent p-6 border-b md:border-b-0 md:border-r border-dark-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-black text-white text-3xl shadow-xl mb-4 ring-4 ring-primary/20 animate-pulse">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-white font-mono font-bold text-lg truncate w-full mb-1">{user?.email}</h3>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold mb-4 font-mono uppercase tracking-wider">
            {user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
          </div>

          {/* Estadísticas de la Cuenta */}
          <div className="w-full space-y-3 mt-4 text-left">
            <div className="bg-dark-300/50 border border-dark-100 p-3 rounded-lg">
              <p className="text-[10px] text-gray-500 uppercase font-mono">Plan de Suscripción</p>
              <p className="text-sm font-bold text-white font-mono tracking-wide">{user?.subscriptionTier || 'FREE'}</p>
            </div>

            <div className="bg-dark-300/50 border border-dark-100 p-3 rounded-lg">
              <p className="text-[10px] text-gray-500 uppercase font-mono">Mensajes Enviados</p>
              <p className="text-sm font-bold text-white font-mono tracking-wide">
                {user?.totalMessages !== undefined ? user.totalMessages.toLocaleString() : '0'} msg
              </p>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Detalles e Interacción */}
        <div className="md:w-3/5 p-6 flex flex-col overflow-y-auto">
          {/* Header del Formulario */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex space-x-1 bg-dark-300 p-1 rounded-lg border border-dark-100">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-1.5 rounded-md font-bold text-xs transition-all ${activeTab === 'info' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Información
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-1.5 rounded-md font-bold text-xs transition-all ${activeTab === 'security' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Seguridad
              </button>
            </div>
            
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded bg-dark-100 hover:bg-dark-100/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Tab 1: Info e Historial */}
          {activeTab === 'info' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider font-mono border-b border-dark-100 pb-2">Editar Datos</h4>
                
                {infoError && (
                  <div className="p-3 rounded bg-red-900/30 border border-primary text-primary text-xs text-center">
                    {infoError}
                  </div>
                )}
                {infoSuccess && (
                  <div className="p-3 rounded bg-green-900/30 border border-green-500 text-green-400 text-xs text-center">
                    {infoSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1">CORREO ELECTRÓNICO:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-300 border border-dark-100 rounded text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isInfoSaving}
                  className={`w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-primary/10 ${isInfoSaving ? 'opacity-50' : ''}`}
                >
                  {isInfoSaving ? 'Guardando...' : 'Actualizar Correo'}
                </button>
              </form>

              {/* Auditoría de fechas */}
              <div className="pt-6 border-t border-dark-100 mt-6 text-xs text-gray-500 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span>Miembro desde:</span>
                  <span className="text-gray-300">{formatDate(user?.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Última actualización:</span>
                  <span className="text-gray-300">{formatDate(user?.updatedAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Cambio de Contraseña */}
          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4 flex-1">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider font-mono border-b border-dark-100 pb-2">Cambiar Contraseña</h4>

              {secError && (
                <div className="p-3 rounded bg-red-900/30 border border-primary text-primary text-xs text-center">
                  {secError}
                </div>
              )}
              {secSuccess && (
                <div className="p-3 rounded bg-green-900/30 border border-green-500 text-green-400 text-xs text-center">
                  {secSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 font-mono mb-1">CONTRASEÑA ACTUAL:</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-300 border border-dark-100 rounded text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-mono mb-1">NUEVA CONTRASEÑA:</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-300 border border-dark-100 rounded text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="Min. 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-mono mb-1">CONFIRMAR NUEVA CONTRASEÑA:</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-300 border border-dark-100 rounded text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="Repite la contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={isSecSaving}
                className={`w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-primary/10 ${isSecSaving ? 'opacity-50' : ''}`}
              >
                {isSecSaving ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
