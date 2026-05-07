import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  // Estados para modal de gestión
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('USER');
  const [selectedTier, setSelectedTier] = useState('FREE');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
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
      const response = await fetch(`http://localhost:8080/api/v1/admin/users/${selectedUser.id}/role-tier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: selectedRole,
          subscriptionTier: selectedTier
        })
      });

      if (response.ok) {
        // Actualizar lista de usuarios localmente
        setUsers(users.map(u => u.id === selectedUser.id ? {
          ...u,
          role: selectedRole,
          subscriptionTier: selectedTier
        } : u));
        setIsModalOpen(false);
      } else {
        alert('Error al actualizar el usuario');
      }
    } catch (error) {
      console.error('Error updating user', error);
      alert('Error en el servidor al actualizar el usuario');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ADMIN') return user.role.replace('ROLE_', '') === 'ADMIN';
    return user.subscriptionTier === activeFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">CENTRO DE CONTROL SaaS</h1>
          <p className="text-gray-400 mt-1 font-medium text-sm">Supervisión en tiempo real de clientes, planes e instancias de bots.</p>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-200 border border-dark-100 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Clientes Totales</p>
          <p className="text-3xl font-black text-white mt-2 font-mono">{users.length}</p>
          <p className="text-[10px] text-green-500 font-bold mt-2 flex items-center">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            En crecimiento activo
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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-200/50 p-4 rounded-xl border border-dark-100">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar usuario por correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-100 border border-dark-100 rounded-xl focus:outline-none focus:border-primary text-sm text-white placeholder-gray-500 transition-colors"
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
                  ? 'bg-primary text-dark-300 border-primary'
                  : 'bg-dark-100 text-gray-400 border-dark-100 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-dark-200 rounded-2xl border border-dark-100 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-100/50 text-[10px] text-gray-500 uppercase tracking-widest border-b border-dark-100">
              <th className="px-6 py-4 font-black">Usuario</th>
              <th className="px-6 py-4 font-black">Plan</th>
              <th className="px-6 py-4 font-black">Rol</th>
              <th className="px-6 py-4 font-black">Bots</th>
              <th className="px-6 py-4 font-black">Registro</th>
              <th className="px-6 py-4 font-black text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Cargando usuarios...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No se encontraron usuarios coincidiendo con los criterios.</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-dark-100/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center text-xs font-bold text-primary mr-3 border border-dark-100">
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

      {/* Modal de Gestión de Usuario */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-300/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-dark-200 border border-dark-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-dark-100 flex justify-between items-center bg-dark-100/30">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">GESTIONAR USUARIO</h2>
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
    </div>
  );
};

export default AdminUsers;
