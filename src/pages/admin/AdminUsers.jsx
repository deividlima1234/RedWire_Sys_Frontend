import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import useAuthStore from '../../store/useAuthStore';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  // Estados para modal de gestión de usuario estándar
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('USER');
  const [selectedTier, setSelectedTier] = useState('FREE');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de filtros y búsqueda de usuarios
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // NUEVOS ESTADOS: Fase Beta & Pioneros
  const [activeTab, setActiveTab] = useState('users'); // 'users' o 'beta'
  const [betaCodes, setBetaCodes] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [betaLoading, setBetaLoading] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualTargetTier, setManualTargetTier] = useState('STANDARD');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [betaClosed, setBetaClosed] = useState(false);
  const [workerUrl, setWorkerUrl] = useState('');
  const [isSavingServer, setIsSavingServer] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingStatus, setPingStatus] = useState(null);
  const [pingMessage, setPingMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchBetaData();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBetaData = async () => {
    setBetaLoading(true);
    try {
      const [codesRes, pendingRes, settingsRes, serverRes] = await Promise.all([
        api.get('/admin/beta-codes'),
        api.get('/admin/pending-users'),
        api.get('/admin/beta-settings'),
        api.get('/admin/server-settings')
      ]);
      setBetaCodes(codesRes.data || []);
      setPendingUsers(pendingRes.data || []);
      setBetaClosed(settingsRes.data?.registrationClosed || false);
      setWorkerUrl(serverRes.data?.workerUrl || '');
    } catch (error) {
      console.error('Error fetching beta data:', error);
    } finally {
      setBetaLoading(false);
    }
  };

  const handleToggleBetaRegistration = async () => {
    const nextState = !betaClosed;
    const confirmMsg = nextState 
      ? '¿Estás seguro de que deseas CERRAR el registro de la fase beta? Ningún cliente nuevo podrá crear una cuenta.' 
      : '¿Estás seguro de que deseas ABRIR el registro de la fase beta? Se reanudará la incorporación de nuevos clientes.';
    
    if (!confirm(confirmMsg)) return;

    try {
      const response = await api.post('/admin/beta-settings', { registrationClosed: nextState });
      setBetaClosed(response.data.registrationClosed);
    } catch (error) {
      console.error('Error toggling beta registration status:', error);
      alert('Error en el servidor al cambiar el estado de la beta.');
    }
  };

  const handleSaveServerSettings = async () => {
    if (!workerUrl.trim()) {
      alert('La URL del servidor Worker no puede estar vacía.');
      return;
    }
    setIsSavingServer(true);
    try {
      const response = await api.post('/admin/server-settings', { workerUrl: workerUrl.trim() });
      setWorkerUrl(response.data.workerUrl);
      alert('¡Configuración de servidores guardada con éxito!');
    } catch (error) {
      console.error('Error saving server settings:', error);
      alert('Error en el servidor al guardar la URL del Worker.');
    } finally {
      setIsSavingServer(false);
    }
  };

  const handlePingWorker = async () => {
    if (!workerUrl.trim()) {
      alert('Por favor, ingresa una URL antes de probar.');
      return;
    }
    setIsPinging(true);
    setPingStatus(null);
    setPingMessage('');
    try {
      const response = await api.post('/admin/server-settings/test-connection', { workerUrl: workerUrl.trim() });
      if (response.data.online) {
        setPingStatus('success');
        setPingMessage(response.data.message);
      } else {
        setPingStatus('error');
        setPingMessage(response.data.message);
      }
    } catch (error) {
      console.error('Ping proxy failed:', error);
      setPingStatus('error');
      setPingMessage('Error de red al intentar conectar con el servidor de backend core para realizar la prueba.');
    } finally {
      setIsPinging(false);
    }
  };

  const handleManage = (user) => {
    setSelectedUser(user);
    const roleClean = user.role.replace('ROLE_', '');
    setSelectedRole(roleClean);
    setSelectedTier(user.subscriptionTier);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await api.put(`/admin/users/${selectedUser.id}/role-tier`, {
        role: selectedRole,
        subscriptionTier: selectedTier
      });

      // Actualizar lista de usuarios localmente
      setUsers(users.map(u => u.id === selectedUser.id ? {
        ...u,
        role: selectedRole,
        subscriptionTier: selectedTier
      } : u));
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating user', error);
      alert('Error en el servidor al actualizar el usuario');
    } finally {
      setIsSaving(false);
    }
  };

  // NUEVOS CONTROLADORES: Fase Beta & Pioneros
  const handleGenerateCode = async (recipientEmail, targetTier = 'STANDARD') => {
    try {
      const response = await api.post('/admin/beta-codes/generate', { recipientEmail, targetTier });
      const newCode = response.data;
      
      // Alerta con estilo y copia al portapapeles
      navigator.clipboard.writeText(newCode.code);
      setCopiedCode(newCode.code);
      setTimeout(() => setCopiedCode(''), 3000);

      alert(`🚀 ¡CÓDIGO GENERADO CON ÉXITO!\n\nEmail vinculado: ${recipientEmail}\nCódigo: ${newCode.code}\n\nEl código ha sido copiado automáticamente al portapapeles.`);
      
      fetchBetaData();
    } catch (error) {
      console.error('Error generating beta code:', error);
      alert('Error en el servidor al generar el código beta.');
    }
  };

  const handleDeleteCode = async (id) => {
    if (!window.confirm('⚠️ ¿Estás completamente seguro de revocar este código? El usuario vinculado a este correo ya no podrá canjearlo para autorizar su cuenta.')) return;
    try {
      await api.delete(`/admin/beta-codes/${id}`);
      fetchBetaData();
    } catch (error) {
      console.error('Error deleting code:', error);
      alert('Error al revocar el código beta.');
    }
  };

  const handleCreateManualCode = async (e) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;
    await handleGenerateCode(manualEmail, manualTargetTier);
    setManualEmail('');
    setManualTargetTier('STANDARD');
    setIsManualModalOpen(false);
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Filtrado de usuarios estándar
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ADMIN') return user.role.replace('ROLE_', '') === 'ADMIN';
    return user.subscriptionTier === activeFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase font-mono">CENTRO DE CONTROL SaaS</h1>
          <p className="text-gray-400 mt-1 font-medium text-sm">Supervisión en tiempo real de clientes, planes, autorizaciones beta y códigos.</p>
        </div>
        {activeTab === 'beta' && (
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-5 py-3 bg-primary hover:bg-primary-dark text-white font-mono font-black uppercase text-xs rounded-xl transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 flex items-center gap-2 self-start md:self-auto"
          >
            <span>➕ Generar Código Manual</span>
          </button>
        )}
      </div>

      {/* Selector de Pestañas Premium */}
      <div className="flex border-b border-white/5 gap-6 font-mono text-xs uppercase tracking-widest pb-px">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3.5 font-black transition-all relative ${
            activeTab === 'users' ? 'text-primary' : 'text-gray-500 hover:text-white'
          }`}
        >
          Clientes Registrados
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('beta')}
          className={`pb-3.5 font-black transition-all relative flex items-center gap-2.5 ${
            activeTab === 'beta' ? 'text-primary' : 'text-gray-500 hover:text-white'
          }`}
        >
          Pioneros & Códigos Beta
          {pendingUsers.length > 0 && (
            <span className="w-5 h-5 bg-primary text-[9px] font-black text-white flex items-center justify-center rounded-full animate-pulse border border-dark-300">
              {pendingUsers.length}
            </span>
          )}
          {activeTab === 'beta' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>}
        </button>
      </div>

      {/* PESTAÑA 1: CLIENTES REGISTRADOS */}
      {activeTab === 'users' && (
        <>
          {/* Tarjetas de Estadísticas Globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-dark-200 border border-dark-100 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Clientes Totales</p>
              <p className="text-3xl font-black text-white mt-2 font-mono">{users.length}</p>
              <p className="text-[10px] text-green-500 font-bold mt-2 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                Crecimiento de la Beta
              </p>
            </div>
            
            <div className="bg-dark-200 border border-dark-100 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Bots Conectados</p>
              <p className="text-3xl font-black text-blue-400 mt-2 font-mono">
                {users.reduce((acc, user) => acc + (user.botCount || 0), 0)}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-2">Instancias WhatsApp activas</p>
            </div>

            <div className="bg-dark-200 border border-dark-100 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all"></div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Estimación de MRR</p>
              <p className="text-3xl font-black text-yellow-500 mt-2 font-mono">
                ${users.reduce((acc, user) => {
                  if (user.subscriptionTier === 'VIP') return acc + 99;
                  if (user.subscriptionTier === 'STANDARD') return acc + 29;
                  return acc;
                }, 0)}<span className="text-xs text-gray-500 font-medium">/mes</span>
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-2">Proyección de ingresos</p>
            </div>

            <div className="bg-dark-200 border border-dark-100 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all"></div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Administradores</p>
              <p className="text-3xl font-black text-purple-400 mt-2 font-mono">
                {users.filter(user => user.role.replace('ROLE_', '') === 'ADMIN').length}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-2">Personal con control de sistema</p>
            </div>
          </div>

          {/* Filtros de Búsqueda */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-200/50 p-4 rounded-xl border border-white/5">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Buscar usuario por correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-100 border border-white/5 rounded-xl focus:outline-none focus:border-primary text-sm text-white placeholder-gray-500 transition-colors"
              />
              <svg className="w-5 h-5 text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              {['ALL', 'FREE', 'STANDARD', 'VIP', 'ADMIN'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors border ${
                    activeFilter === filter
                      ? 'bg-primary text-white border-primary'
                      : 'bg-dark-100 text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="bg-dark-200 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-100/50 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-black">Usuario</th>
                  <th className="px-6 py-4 font-black">Plan</th>
                  <th className="px-6 py-4 font-black">Rol</th>
                  <th className="px-6 py-4 font-black">Beta</th>
                  <th className="px-6 py-4 font-black">Bots</th>
                  <th className="px-6 py-4 font-black">Registro</th>
                  <th className="px-6 py-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500 font-semibold">Cargando usuarios...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500 font-semibold">No se encontraron usuarios coincidiendo con los criterios.</td></tr>
                ) : filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-dark-100/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center text-xs font-bold text-primary mr-3 border border-white/5">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-200">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                        user.subscriptionTier === 'VIP' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5 shadow-lg shadow-yellow-500/5' :
                        user.subscriptionTier === 'STANDARD' ? 'text-blue-400 border-blue-400/30 bg-blue-400/5' :
                        'text-gray-400 border-gray-400/30 bg-gray-400/5'
                      }`}>
                        {user.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        user.role.replace('ROLE_', '') === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-gray-400'
                      }`}>
                        {user.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase font-mono px-2 py-1 rounded ${
                        user.betaAuthorized 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {user.betaAuthorized ? 'Autorizado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold font-mono text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/10">
                        {user.botCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleManage(user)}
                        className="text-[10px] font-bold text-primary hover:text-white bg-primary/5 hover:bg-primary border border-primary/20 hover:border-primary px-3 py-1.5 rounded-lg transition-all uppercase tracking-tighter"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* PESTAÑA 2: PIONEROS & CÓDIGOS BETA */}
      {activeTab === 'beta' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* CONTROL DEL ESTADO GLOBAL DE REGISTRO BETA */}
          <div className="p-6 bg-dark-200 border border-white/5 rounded-3xl relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${betaClosed ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'}`}></div>
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${betaClosed ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></span>
                <span className={`text-[10px] font-black font-mono uppercase tracking-widest ${betaClosed ? 'text-red-500' : 'text-green-500'}`}>
                  {betaClosed ? 'REGISTRO CERRADO 🔒' : 'REGISTRO ABIERTO 🟢'}
                </span>
              </div>
              <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">Control de Registro de Fase Beta</h3>
              <p className="text-xs text-gray-400 font-semibold max-w-2xl leading-relaxed">
                {betaClosed 
                  ? 'El acceso a nuevos clientes está cerrado temporalmente. Nadie podrá registrarse a través del formulario de Onboarding hasta que decidas reabrirlo.' 
                  : 'El registro para el Programa de Pioneros está activo y abierto. Los nuevos clientes pueden registrarse, configurar su plan y solicitar su código.'}
              </p>
            </div>
            
            <button
              onClick={handleToggleBetaRegistration}
              className={`px-6 py-3.5 rounded-xl font-mono font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:scale-95 shrink-0 shadow-lg ${
                betaClosed 
                  ? 'bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-dark-300 border border-green-500/20 shadow-green-500/5' 
                  : 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 shadow-red-500/5'
              }`}
            >
              {betaClosed ? '🔓 Abrir Registros' : '🔒 Cerrar Registros'}
            </button>
          </div>

          {/* CONFIGURACIÓN DE VARIABLES DE SERVIDORES */}
          <div className="p-6 bg-dark-200 border border-white/5 rounded-3xl relative overflow-hidden shadow-xl space-y-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
            
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs">⚙️</span>
                <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">
                  Variables de Sistema
                </span>
              </div>
              <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">Servidor de Conexión (Worker WhatsApp)</h3>
              <p className="text-xs text-gray-400 font-semibold max-w-2xl leading-relaxed">
                Define la URL del microservicio encargado de conectarse con la librería Baileys. Esta dirección se utilizará de forma global para generar códigos QR y despachar flujos a todos los bots en los planes <strong className="text-white">Free y Standard</strong>.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
                  URL del Worker Server
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={workerUrl}
                    onChange={(e) => {
                      setWorkerUrl(e.target.value);
                      setPingStatus(null);
                    }}
                    placeholder="https://redwire-worker.onrender.com"
                    className="w-full pl-4 pr-12 py-3 bg-dark-100 border border-white/5 rounded-xl focus:outline-none focus:border-primary text-xs font-mono text-white placeholder-gray-600 transition-colors"
                  />
                  {pingStatus && (
                    <span className="absolute right-4 top-3 text-sm animate-pulse">
                      {pingStatus === 'success' ? '🟢' : '🔴'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handlePingWorker}
                  disabled={isPinging}
                  className="w-1/2 md:w-auto px-4 py-3 bg-dark-100 hover:bg-dark-100/80 text-gray-300 font-mono font-black uppercase text-[10px] tracking-wider rounded-xl border border-white/5 transition-all disabled:opacity-50"
                >
                  {isPinging ? 'Probando...' : '🔌 Probar Conexión'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveServerSettings}
                  disabled={isSavingServer}
                  className="w-1/2 md:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-dark-300 font-mono font-black uppercase text-[10px] tracking-wider rounded-xl border border-primary/10 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isSavingServer ? 'Guardando...' : '💾 Guardar URL'}
                </button>
              </div>
            </div>

            {pingStatus && (
              <div className={`p-4 rounded-xl border text-xs font-mono font-semibold text-left animate-in fade-in slide-in-from-top-2 duration-300 ${
                pingStatus === 'success' 
                  ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                  : 'bg-red-500/5 border-red-500/20 text-red-400'
              }`}>
                {pingStatus === 'success' 
                  ? `✓ ¡Conexión exitosa! El microservicio Worker está en línea y es accesible desde el servidor central: ${pingMessage}` 
                  : `✗ Conexión fallida: ${pingMessage}`}
              </div>
            )}
          </div>

          {/* PANEL DE NOTIFICACIONES: SOLICITUDES PENDIENTES */}
          <div>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 font-mono">🚨 Solicitudes y Clientes en Espera ({pendingUsers.length})</h2>
            
            {pendingUsers.length === 0 ? (
              <div className="bg-dark-200 border border-white/5 rounded-2xl p-6 text-center text-gray-500 font-mono text-xs">
                🌿 No hay clientes registrados esperando en el muro. ¡Todo al día!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingUsers.map((pUser) => (
                  <div 
                    key={pUser.id} 
                    className="bg-dark-200 border border-primary/20 hover:border-primary/40 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between gap-4 transition-all"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] font-black text-primary font-mono uppercase tracking-wider">Nuevo Cliente en Espera</span>
                      </div>
                      <h4 className="text-sm font-black text-white font-mono break-all">{pUser.email}</h4>
                      <p className="text-[10px] text-gray-500 font-mono font-medium">Registrado el: {new Date(pUser.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                      {pUser.hasCodeGenerated ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="bg-dark-100 border border-white/5 rounded-xl px-3.5 py-2 font-mono text-xs text-white font-black tracking-widest select-all">
                            {pUser.generatedCode}
                          </div>
                          <button
                            onClick={() => handleCopyText(pUser.generatedCode)}
                            className="px-3.5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-mono font-bold uppercase text-[10px] rounded-xl transition-all"
                          >
                            {copiedCode === pUser.generatedCode ? '¡Copiado!' : '📋 Copiar'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateCode(pUser.email)}
                          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-mono font-black uppercase text-[10px] rounded-xl transition-all shadow-md shadow-primary/10"
                        >
                          ⚡ Generar Código Exclusivo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TABLA BASE DE DATOS DE CÓDIGOS */}
          <div>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 font-mono">📋 Base de Datos de Códigos Generados ({betaCodes.length})</h2>
            
            <div className="bg-dark-200 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-dark-100/50 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4 font-black">Código de Acceso</th>
                    <th className="px-6 py-4 font-black">Correo Vinculado</th>
                    <th className="px-6 py-4 font-black">Estado</th>
                    <th className="px-6 py-4 font-black">Fecha Creación</th>
                    <th className="px-6 py-4 font-black">Canjeado Por / Fecha</th>
                    <th className="px-6 py-4 font-black text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-xs">
                  {betaLoading && betaCodes.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500 font-semibold font-sans">Cargando códigos beta...</td></tr>
                  ) : betaCodes.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500 font-semibold font-sans">No se ha generado ningún código aún.</td></tr>
                  ) : betaCodes.map((codeObj) => (
                    <tr key={codeObj.id} className="hover:bg-dark-100/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm tracking-wider select-all">{codeObj.code}</span>
                          <button 
                            onClick={() => handleCopyText(codeObj.code)} 
                            className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-primary transition-colors"
                            title="Copiar código"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 break-all select-all font-sans font-medium">
                        {codeObj.recipientEmail}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border ${
                          codeObj.used 
                            ? 'text-green-400 border-green-500/20 bg-green-500/5' 
                            : 'text-blue-400 border-blue-500/20 bg-blue-500/5'
                        }`}>
                          {codeObj.used ? 'Canjeado' : 'Disponible'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-sans font-medium text-[11px]">
                        {new Date(codeObj.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-sans font-medium">
                        {codeObj.used ? (
                          <div className="space-y-0.5">
                            <span className="text-gray-300 block break-all text-xs select-all font-mono">{codeObj.usedByEmail}</span>
                            <span className="text-[10px] text-gray-500 block">{new Date(codeObj.usedAt).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600 italic">No canjeado aún</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-sans">
                        <button
                          onClick={() => handleDeleteCode(codeObj.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-500 border border-red-500/20 rounded-lg transition-all"
                          title="Revocar Código"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: GESTIÓN DE ROL Y PLAN (USUARIO ESTÁNDAR) */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-300/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-dark-200 border border-dark-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-dark-100 flex justify-between items-center bg-dark-100/30">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight font-mono uppercase">GESTIONAR USUARIO</h2>
                <p className="text-gray-400 text-xs mt-1 truncate max-w-[280px] font-medium">{selectedUser.email}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Selección de Rol */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Rol del Sistema</label>
                <div className="grid grid-cols-2 gap-3">
                  {['USER', 'ADMIN'].map((roleOpt) => (
                    <button
                      key={roleOpt}
                      type="button"
                      onClick={() => setSelectedRole(roleOpt)}
                      className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                        selectedRole === roleOpt
                          ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5'
                          : 'border-dark-100 bg-dark-100/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      {roleOpt === 'ADMIN' ? 'Administrador' : 'Cliente / Usuario'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selección de Plan */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Nivel de Suscripción</label>
                <div className="space-y-2">
                  {[
                    { key: 'FREE', name: 'FREE', desc: 'Acceso básico con límites estándar', activeClass: 'border-gray-500 bg-gray-500/10 text-gray-200' },
                    { key: 'STANDARD', name: 'STANDARD', desc: 'Mensajes ilimitados para negocios', activeClass: 'border-blue-500 bg-blue-500/10 text-blue-200' },
                    { key: 'VIP', name: 'VIP 💎', desc: 'Máxima escala y API oficial sin baneo', activeClass: 'border-yellow-500 bg-yellow-500/10 text-yellow-200' }
                  ].map((tierOpt) => (
                    <button
                      key={tierOpt.key}
                      type="button"
                      onClick={() => setSelectedTier(tierOpt.key)}
                      className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                        selectedTier === tierOpt.key
                          ? tierOpt.activeClass + ' shadow-lg'
                          : 'border-dark-100 bg-dark-100/10 text-gray-400 hover:border-dark-100/50'
                      }`}
                    >
                      <div>
                        <span className="font-black text-sm block">{tierOpt.name}</span>
                        <span className="text-[10px] text-gray-500 font-medium block mt-0.5">{tierOpt.desc}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedTier === tierOpt.key ? 'border-current' : 'border-dark-100'
                      }`}>
                        {selectedTier === tierOpt.key && <div className="w-2.5 h-2.5 rounded-full bg-current"></div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-dark-100/10 border-t border-dark-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-dark-100 text-gray-400 hover:text-white font-bold rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark text-dark-300 font-black rounded-xl text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERACIÓN DE CÓDIGO MANUAL PRE-EMITIDO */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-300/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsManualModalOpen(false)}></div>
          
          <form onSubmit={handleCreateManualCode} className="bg-dark-200 border border-dark-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-dark-100 flex justify-between items-center bg-dark-100/30">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight font-mono uppercase">EMITIR CÓDIGO MANUAL</h2>
                <p className="text-gray-400 text-xs mt-1 font-medium">Vincula un código de pionero a un correo antes de su registro.</p>
              </div>
              <button type="button" onClick={() => setIsManualModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2 text-left">
                <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider font-black">Correo Electrónico del Negocio</label>
                <input 
                  type="email"
                  required
                  placeholder="cliente-interesado@gmail.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full bg-dark-100 border border-white/5 focus:border-primary rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-mono"
                />
                <span className="text-[10px] text-gray-500 font-sans font-medium block mt-1 leading-relaxed">
                  ⚠️ El cliente deberá registrarse exactamente con este correo electrónico para que el sistema le permita canjear el código de autorización generado.
                </span>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider font-black">Nivel de Plan a Otorgar</label>
                <div className="grid grid-cols-2 gap-3">
                  {['STANDARD', 'VIP'].map((tierOpt) => (
                    <button
                      key={tierOpt}
                      type="button"
                      onClick={() => setManualTargetTier(tierOpt)}
                      className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                        manualTargetTier === tierOpt
                          ? (tierOpt === 'VIP' ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/5' : 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5')
                          : 'border-dark-100 bg-dark-100/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      {tierOpt === 'VIP' ? 'VIP 💎' : 'STANDARD'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-dark-100/10 border-t border-dark-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="flex-1 py-3 bg-dark-100 text-gray-400 hover:text-white font-bold rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!manualEmail.trim()}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                ⚡ Generar y Copiar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
