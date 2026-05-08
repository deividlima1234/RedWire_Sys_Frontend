import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import SubscriptionStatus from '../components/SubscriptionStatus';
import UserProfileModal from '../components/UserProfileModal';
import api from '../config/axios';

const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const [bots, setBots] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isFlowEditor = location.pathname.includes('/flow');
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  useEffect(() => {
    fetchBots();
    // Refresh bot status every 10 seconds
    const interval = setInterval(fetchBots, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchBots = async () => {
    try {
      const response = await api.get('/bots');
      setBots(response.data);
    } catch (error) {
      console.error("Error fetching bots", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-dark-300 text-white">
      {!isFlowEditor && (
        <aside className="w-72 bg-dark-200 border-r border-dark-100 flex flex-col shadow-2xl relative z-20">
          <div className="p-6 border-b border-dark-100">
            <h1 className="text-2xl font-black text-primary font-mono tracking-widest flex items-center">
              <div className="w-8 h-8 bg-primary rounded mr-2 flex items-center justify-center text-dark-300">R</div>
              REDWIRE<span className="text-gray-400 font-light">SYS</span>
            </h1>
          </div>
        
        <nav className="flex-1 p-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-4 ml-4 tracking-widest">General</p>
            <ul className="space-y-1">
              <li>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-gray-400 hover:bg-dark-100 hover:text-white'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/live-monitor" 
                  className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-green-500/10 text-green-400 border-l-4 border-green-500' : 'text-gray-400 hover:bg-dark-100 hover:text-white'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Monitor en Vivo
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-4 ml-4 tracking-widest">Mis Bots Activos</p>
            <ul className="space-y-1">
              {bots.map(bot => (
                <li key={bot.id}>
                  <NavLink 
                    to={`/bot/${bot.id}/flow`} 
                    className={({ isActive }) => `flex items-center px-4 py-2 text-xs rounded-lg transition-all ${isActive ? 'text-primary bg-primary/5' : 'text-gray-400 hover:bg-dark-100'}`}
                  >
                    <div className={`w-2 h-2 rounded-full mr-3 ${bot.status === 'CONNECTED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                    <span className="truncate">{bot.phoneNumber || 'Vincular ahora'}</span>
                  </NavLink>
                </li>
              ))}
              {bots.length === 0 && (
                <li className="px-4 py-2 text-[10px] text-gray-600 italic">No hay bots creados</li>
              )}
            </ul>
          </div>

          {isAdmin && (
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-4 ml-4 tracking-widest">Administración</p>
              <ul className="space-y-1">
                <li>
                  <NavLink 
                    to="/admin/users" 
                    className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-purple-500/10 text-purple-400 border-l-4 border-purple-500' : 'text-gray-400 hover:bg-dark-100 hover:text-white'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Usuarios
                  </NavLink>
                </li>
              </ul>
            </div>
          )}

          <div className="pt-4">
            <SubscriptionStatus />
          </div>
        </nav>

        <div className="p-4 border-t border-dark-100 bg-dark-300/50">
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center mb-4 px-2 cursor-pointer hover:bg-dark-100/40 p-2 rounded-xl transition-all group border border-transparent hover:border-dark-100/50"
            title="Ver y configurar perfil"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-white shadow-lg mr-3 group-hover:scale-105 transition-transform">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{user?.email}</p>
              <p className="text-[10px] text-gray-500 truncate">{isAdmin ? 'Administrador' : 'Cliente'}</p>
            </div>
            <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-dark-100 text-gray-300 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all text-xs font-bold border border-transparent hover:border-red-500/20"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative bg-dark-300">
        <div className={`${isFlowEditor ? 'p-0' : 'p-8'} overflow-auto h-full w-full`}>
            <Outlet />
        </div>
      </main>

      {/* Modal de Perfil de Usuario */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};

export default MainLayout;
