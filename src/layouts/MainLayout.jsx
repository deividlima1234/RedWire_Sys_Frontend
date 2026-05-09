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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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
    <div className="flex flex-col md:flex-row h-screen bg-dark-300 text-white overflow-hidden">
      {/* Backdrop overlay for mobile drawer */}
      {!isFlowEditor && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-dark-300/80 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Top Header Bar */}
      {!isFlowEditor && (
        <div className="md:hidden bg-dark-200 border-b border-dark-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="text-gray-400 hover:text-white p-1.5 hover:bg-dark-100 rounded-lg transition-all"
            title="Abrir Menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-black text-primary font-mono tracking-widest flex items-center">
            <div className="w-6 h-6 bg-primary rounded mr-1.5 flex items-center justify-center text-dark-300 text-xs font-bold font-mono">R</div>
            REDWIRE<span className="text-gray-400 font-light text-xs">SYS</span>
          </h1>
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-white text-xs cursor-pointer shadow-lg"
          >
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Main Left Navigation Sidebar */}
      {!isFlowEditor && (
        <aside className={`
          fixed md:static top-0 left-0 h-full z-40 bg-dark-200 border-r border-dark-100 flex flex-col shadow-2xl
          transform transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'}
        `}>
          {/* Sidebar Logo Header */}
          <div className={`p-5 border-b border-dark-100 flex items-center ${isSidebarCollapsed ? 'md:justify-center justify-between' : 'justify-between'}`}>
            {!isSidebarCollapsed ? (
              <h1 className="text-xl font-black text-primary font-mono tracking-widest flex items-center truncate animate-fade-in">
                <div className="w-8 h-8 bg-primary rounded mr-2 flex items-center justify-center text-dark-300 flex-shrink-0">R</div>
                REDWIRE<span className="text-gray-400 font-light">SYS</span>
              </h1>
            ) : (
              <div 
                className="w-8 h-8 bg-primary rounded flex items-center justify-center text-dark-300 font-bold font-mono animate-fade-in flex-shrink-0 cursor-pointer md:block hidden" 
                onClick={() => setIsSidebarCollapsed(false)}
                title="Expandir Menú"
              >
                R
              </div>
            )}
            
            {/* Mobile close button inside sidebar */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Desktop toggle collapse button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex text-gray-500 hover:text-white hover:bg-dark-100 p-1.5 rounded-lg transition-all"
              title={isSidebarCollapsed ? "Expandir Menú" : "Contraer Menú"}
            >
              {isSidebarCollapsed ? (
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400 hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Link group: General */}
            <div>
              {!isSidebarCollapsed ? (
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-4 ml-4 tracking-widest animate-fade-in">General</p>
              ) : (
                <div className="border-t border-dark-100/50 my-4 md:block hidden" />
              )}
              <ul className="space-y-1">
                <li>
                  <NavLink 
                    to="/dashboard" 
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) => `flex items-center rounded-lg transition-all ${
                      isSidebarCollapsed ? 'md:p-3 p-3 md:justify-center' : 'px-4 py-3'
                    } ${
                      isActive ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-gray-400 hover:bg-dark-100 hover:text-white'
                    }`}
                    title="Dashboard"
                  >
                    <svg className={`w-5 h-5 ${isSidebarCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    {(!isSidebarCollapsed || window.innerWidth < 768) && <span className="animate-fade-in">Dashboard</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/live-monitor" 
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) => `flex items-center rounded-lg transition-all ${
                      isSidebarCollapsed ? 'md:p-3 p-3 md:justify-center' : 'px-4 py-3'
                    } ${
                      isActive ? 'bg-green-500/10 text-green-400 border-l-4 border-green-500' : 'text-gray-400 hover:bg-dark-100 hover:text-white'
                    }`}
                    title="Monitor en Vivo"
                  >
                    <svg className={`w-5 h-5 ${isSidebarCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    {(!isSidebarCollapsed || window.innerWidth < 768) && <span className="animate-fade-in">Monitor en Vivo</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/security" 
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) => `flex items-center rounded-lg transition-all ${
                      isSidebarCollapsed ? 'md:p-3 p-3 md:justify-center' : 'px-4 py-3'
                    } ${
                      isActive ? 'bg-blue-500/10 text-blue-400 border-l-4 border-blue-500' : 'text-gray-400 hover:bg-dark-100 hover:text-white'
                    }`}
                    title="Guía Anti-Bloqueo"
                  >
                    <svg className={`w-5 h-5 ${isSidebarCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {(!isSidebarCollapsed || window.innerWidth < 768) && <span className="animate-fade-in">Guía Anti-Bloqueo</span>}
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Link group: Bots */}
            <div>
              {!isSidebarCollapsed ? (
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-4 ml-4 tracking-widest animate-fade-in">Mis Bots Activos</p>
              ) : (
                <div className="border-t border-dark-100/50 my-4 md:block hidden" />
              )}
              <ul className="space-y-1">
                {bots.map(bot => (
                  <li key={bot.id}>
                    <NavLink 
                      to={`/bot/${bot.id}/flow`} 
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) => `flex items-center rounded-lg transition-all ${
                        isSidebarCollapsed ? 'md:p-3 p-3 md:justify-center' : 'px-4 py-2 text-xs'
                      } ${
                        isActive ? 'text-primary bg-primary/5' : 'text-gray-400 hover:bg-dark-100'
                      }`}
                      title={bot.phoneNumber || 'Vincular ahora'}
                    >
                      <div className={`w-2 h-2 rounded-full ${isSidebarCollapsed ? 'md:mr-0 mr-3' : 'mr-3'} ${bot.status === 'CONNECTED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                      {(!isSidebarCollapsed || window.innerWidth < 768) && <span className="truncate">{bot.phoneNumber || 'Vincular ahora'}</span>}
                    </NavLink>
                  </li>
                ))}
                {bots.length === 0 && (
                  <li className={`italic ${isSidebarCollapsed ? 'text-center text-[8px] text-gray-600' : 'px-4 py-2 text-[10px] text-gray-600'}`}>
                    {isSidebarCollapsed ? 'Ø' : 'No hay bots'}
                  </li>
                )}
              </ul>
            </div>

            {/* Admin section */}
            {isAdmin && (
              <div>
                {!isSidebarCollapsed ? (
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-4 ml-4 tracking-widest animate-fade-in">Administración</p>
                ) : (
                  <div className="border-t border-dark-100/50 my-4 md:block hidden" />
                )}
                <ul className="space-y-1">
                  <li>
                    <NavLink 
                      to="/admin/users" 
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) => `flex items-center rounded-lg transition-all ${
                        isSidebarCollapsed ? 'md:p-3 p-3 md:justify-center' : 'px-4 py-3'
                      } ${
                        isActive ? 'bg-purple-500/10 text-purple-400 border-l-4 border-purple-500' : 'text-gray-400 hover:bg-dark-100 hover:text-white'
                      }`}
                      title="Usuarios"
                    >
                      <svg className={`w-5 h-5 ${isSidebarCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {(!isSidebarCollapsed || window.innerWidth < 768) && <span className="animate-fade-in">Usuarios</span>}
                    </NavLink>
                  </li>
                </ul>
              </div>
            )}

            {/* Subscription status adaptive card */}
            <div className="pt-4">
              <SubscriptionStatus isCollapsed={isSidebarCollapsed} />
            </div>
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-dark-100 bg-dark-300/50">
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className={`flex items-center cursor-pointer hover:bg-dark-100/40 rounded-xl transition-all group border border-transparent hover:border-dark-100/50 ${
                isSidebarCollapsed ? 'p-1 justify-center mb-0' : 'p-2 mb-4'
              }`}
              title={user?.email}
            >
              <div className={`rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-transform ${
                isSidebarCollapsed ? 'w-8 h-8 text-xs' : 'w-10 h-10 mr-3'
              }`}>
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{user?.email}</p>
                  <p className="text-[10px] text-gray-500 truncate">{isAdmin ? 'Administrador' : 'Cliente'}</p>
                </div>
              )}
              {!isSidebarCollapsed && (
                <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            
            {/* Logout button (icon when collapsed) */}
            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              className={`flex items-center justify-center bg-dark-100 text-gray-300 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all font-bold border border-transparent hover:border-red-500/20 ${
                isSidebarCollapsed ? 'w-10 h-10 p-0 mt-3 mx-auto' : 'w-full py-2.5 px-4 text-xs'
              }`}
              title="Cerrar Sesión"
            >
              {isSidebarCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              ) : (
                'Cerrar Sesión'
              )}
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

      {/* Modal de Confirmación de Cierre de Sesión */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="bg-dark-200 border border-dark-100 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative overflow-hidden animate-scale-in">
            {/* Ambient Accent Light */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
            
            {/* Red Warning Exit Icon */}
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            {/* Modal Title & Text */}
            <h3 className="text-white text-base font-bold text-center mb-2 uppercase tracking-wider font-mono">
              ¿Cerrar Sesión?
            </h3>
            <p className="text-gray-400 text-xs text-center leading-relaxed mb-6">
              ¿Estás seguro de que deseas salir de tu cuenta? Se detendrá tu sesión de administración actual en este navegador.
            </p>

            {/* Modal Action Triggers */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-dark-100 hover:bg-dark-100/80 border border-white/5 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-95 uppercase tracking-wider font-mono"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
