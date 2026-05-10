import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../config/axios';

const SessionTimeoutHandler = () => {
  const { isAuthenticated, logout, token, user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 segundos para responder al modal
  
  const lastActivityRef = useRef(Date.now());
  const tokenRefreshIntervalRef = useRef(null);
  const inactivityCheckIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Umbrales de tiempo (en milisegundos)
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos de inactividad para mostrar el modal
  const REFRESH_INTERVAL = 4 * 60 * 1000;    // Refrescar token cada 4 minutos si hay actividad

  // Registrar actividad del usuario
  const recordActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Función para refrescar el token silenciosamente
  const refreshSessionToken = async () => {
    const currentToken = useAuthStore.getState().token;
    if (!currentToken) return;

    try {
      const response = await api.post('/auth/refresh', { token: currentToken });
      if (response.data && response.data.token) {
        useAuthStore.getState().setAuth(response.data.token, useAuthStore.getState().user);
        console.log("[SESSION-HANDLER] Token de acceso renovado exitosamente.");
      }
    } catch (err) {
      console.error("[SESSION-HANDLER] Error renovando token por inactividad/firma.", err);
      // Si la renovación falla por completo (e.g. token totalmente inválido), desloguear
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    clearIntervals();
    logout();
    window.location.href = '/login';
  };

  const handleKeepWorking = async () => {
    setShowModal(false);
    recordActivity();
    await refreshSessionToken();
  };

  const clearIntervals = () => {
    if (tokenRefreshIntervalRef.current) clearInterval(tokenRefreshIntervalRef.current);
    if (inactivityCheckIntervalRef.current) clearInterval(inactivityCheckIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      clearIntervals();
      setShowModal(false);
      return;
    }

    // Guardar actividad inicial
    recordActivity();

    // 1. Escuchar eventos de interacción del usuario
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, recordActivity);
    });

    // 2. Intervalo para refresco automático de token (si hay actividad)
    tokenRefreshIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      // Si el usuario ha interactuado recientemente (dentro del rango de refresco)
      if (timeSinceLastActivity < REFRESH_INTERVAL) {
        refreshSessionToken();
      }
    }, REFRESH_INTERVAL);

    // 3. Intervalo para comprobar inactividad y detonar modal
    inactivityCheckIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT && !showModal) {
        setShowModal(true);
        setCountdown(60); // Iniciar cuenta regresiva
      }
    }, 1000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, recordActivity);
      });
      clearIntervals();
    };
  }, [isAuthenticated, showModal]);

  // Manejar el conteo regresivo del modal
  useEffect(() => {
    if (showModal) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark-300/80 backdrop-blur-md animate-fade-in">
      <div className="bg-dark-200 border-2 border-primary/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-primary/10 relative z-10 animate-in fade-in zoom-in duration-300">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="p-6 text-center">
          {/* Immersive high-tech warning icon */}
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5 relative">
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping"></div>
            <span className="text-3xl animate-pulse">⏳</span>
          </div>

          <h3 className="text-white font-black text-xl tracking-tight uppercase mb-2">
            ¿Sigues trabajando?
          </h3>
          
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Por tu seguridad y para proteger la integridad de tus flujos en <strong className="text-primary">RedWire System</strong>, la sesión se cerrará automáticamente por inactividad.
          </p>

          {/* Dynamic Progress Bar */}
          <div className="w-full h-2 bg-dark-100 rounded-full mb-6 overflow-hidden relative border border-dark-100">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-all duration-1000" 
              style={{ width: `${(countdown / 60) * 100}%` }}
            ></div>
          </div>

          <div className="bg-dark-300/60 rounded-2xl p-3 border border-dark-100/50 mb-6 font-mono text-center">
            <span className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Cierre de sesión en:</span>
            <span className="text-2xl font-black text-primary animate-pulse">{countdown} segundos</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 border border-dark-100 hover:border-red-500/30 text-gray-400 hover:text-red-500 bg-transparent hover:bg-red-500/5 py-3 rounded-xl font-bold transition-all text-xs"
            >
              🚪 Cerrar Sesión
            </button>
            <button
              onClick={handleKeepWorking}
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              ⚡ Seguir Trabajando
            </button>
          </div>
        </div>

        <div className="p-3 bg-dark-100/10 text-center border-t border-dark-100">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
            RedWire Security Shield v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutHandler;
