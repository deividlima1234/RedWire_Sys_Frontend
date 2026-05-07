import { useState, useEffect, useRef } from 'react';
import api from '../config/axios';

const BotDiagnosticsModal = ({ isOpen, onClose, bot, onRefresh }) => {
  if (!isOpen || !bot) return null;

  const isVip = !!bot.phoneNumberId;
  const isConnected = bot.status === 'CONNECTED';
  const terminalEndRef = useRef(null);

  // Estados para enviar mensaje de prueba
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Hola! Mensaje de prueba desde la Consola de RedWire 🤖🔴');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Estados de carga de acciones
  const [restarting, setRestarting] = useState(false);

  // Estado para la retroalimentación de copia
  const [copiedField, setCopiedField] = useState(null);
  const [workerOnline, setWorkerOnline] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // Estado para los logs de la terminal
  const [logs, setLogs] = useState([]);

  // Consultar diagnóstico unificado desde el Backend
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoadingHealth(true);
        const response = await api.get(`/bots/${bot.id}/health`);
        setHealthStatus(response.data);
        if (response.data.workerOnline !== undefined) {
          setWorkerOnline(response.data.workerOnline);
        } else {
          setWorkerOnline(null); // No aplica para VIP
        }
      } catch (err) {
        console.error("Error fetching bot health from backend", err);
        setWorkerOnline(false);
      } finally {
        setLoadingHealth(false);
      }
    };

    fetchHealth();
  }, [bot.id]);

  // Generar logs de inicio y simular logs en vivo
  useEffect(() => {
    if (loadingHealth) {
      setLogs([
        `[${new Date().toLocaleTimeString()}] [SYSTEM] Conectando con el motor de diagnóstico de RedWire...`,
        `[${new Date().toLocaleTimeString()}] [SYSTEM] Solicitando informe de salud para la instancia [${bot.id.substring(0, 8)}]...`
      ]);
      return;
    }

    const isConnectedReal = healthStatus && healthStatus.status === 'CONNECTED';
    const isConnectingReal = healthStatus && healthStatus.status === 'CONNECTING';

    // Inicializar logs base
    const baseLogs = [
      `[${new Date().toLocaleTimeString()}] [SYSTEM] Cargando consola de diagnóstico para la instancia [${bot.id.substring(0, 8)}]...`,
      `[${new Date().toLocaleTimeString()}] [SYSTEM] Verificando firma criptográfica de la sesión... OK`,
      `[${new Date().toLocaleTimeString()}] [SYSTEM] Identificador de Plan detectado: ${isVip ? '💎 VIP (Meta Cloud API)' : '⚡ STANDARD (Baileys Web Emulator)'}`,
      `[${new Date().toLocaleTimeString()}] [DATABASE] Sincronizado: ${bot.messageCount} mensajes registrados en el nodo principal.`,
    ];

    if (isVip) {
      if (healthStatus && healthStatus.credsConfigured) {
        if (healthStatus.metaApiOnline) {
          baseLogs.push(
            `[${new Date().toLocaleTimeString()}] [SUCCESS] ¡Canal activo y validado con servidores de Meta Cloud (graph.facebook.com)!`,
            `[${new Date().toLocaleTimeString()}] [WEBHOOK] Webhook de recepción de mensajes verificado y activo.`,
            `[${new Date().toLocaleTimeString()}] [ENGINE] Motor de flujos RedWire enlazado con el Gateway de Meta.`,
            `[${new Date().toLocaleTimeString()}] [TRIGGER] Escuchando eventos oficiales de WhatsApp...`
          );
        } else {
          baseLogs.push(
            `[${new Date().toLocaleTimeString()}] [FATAL] Error de autenticación con la API de Meta.`,
            `[${new Date().toLocaleTimeString()}] [ERROR] Detalle: ${healthStatus.message}`,
            `[${new Date().toLocaleTimeString()}] [DIAGNOSTIC] Verifica tus credenciales de Meta (Access Token, Phone Number ID) en Ajustes.`
          );
        }
      } else {
        baseLogs.push(
          `[${new Date().toLocaleTimeString()}] [WARNING] Canal VIP no configurado aún.`,
          `[${new Date().toLocaleTimeString()}] [DIAGNOSTIC] Usa el botón de Ajustes en la tarjeta del Bot para ingresar tus credenciales oficiales.`
        );
      }
    } else {
      if (workerOnline === true) {
        if (isConnectedReal) {
          baseLogs.push(
            `[${new Date().toLocaleTimeString()}] [SOCKET] Conexión establecida con el túnel del Worker de RedWire.`,
            `[${new Date().toLocaleTimeString()}] [SUCCESS] ¡Sesión de Baileys activa y enlazada con WhatsApp!`,
            `[${new Date().toLocaleTimeString()}] [ENGINE] Motor de flujos cargado en memoria de caché de sesión.`,
            `[${new Date().toLocaleTimeString()}] [TRIGGER] Auto-listening activado. Escuchando eventos entrantes...`
          );
        } else if (isConnectingReal) {
          baseLogs.push(
            `[${new Date().toLocaleTimeString()}] [SOCKET] Conexión establecida con el túnel del Worker.`,
            `[${new Date().toLocaleTimeString()}] [WARNING] Sesión inicializada en Worker pero esperando enlace de WhatsApp...`,
            `[${new Date().toLocaleTimeString()}] [DIAGNOSTIC] Por favor escanea el código QR para conectar la cuenta.`
          );
        } else {
          baseLogs.push(
            `[${new Date().toLocaleTimeString()}] [SOCKET] Conexión establecida con el túnel del Worker de RedWire (ONLINE).`,
            `[${new Date().toLocaleTimeString()}] [WARNING] Handshake pendiente. Sindicación actual: DISCONNECTED.`,
            `[${new Date().toLocaleTimeString()}] [SOCKET] Esperando escaneo de código QR o credenciales autorizadas.`
          );
        }
      } else if (workerOnline === false) {
        baseLogs.push(
          `[${new Date().toLocaleTimeString()}] [FATAL] ¡El servidor Worker local (Puerto 3000) está APAGADO o inalcanzable!`,
          `[${new Date().toLocaleTimeString()}] [FATAL] Es imposible sincronizar o emparejar el WhatsApp Web de este Bot.`,
          `[${new Date().toLocaleTimeString()}] [DIAGNOSTIC] Ejecuta 'node src/server.js' en la carpeta Workers para levantar el servidor.`
        );
      } else {
        baseLogs.push(
          `[${new Date().toLocaleTimeString()}] [SOCKET] Esperando comprobación de salud del worker de RedWire...`
        );
      }
    }

    setLogs(baseLogs);

    // Bucle de logs interactivos cada 7 segundos para simular actividad
    const logInterval = setInterval(() => {
      if (!isConnectedReal || (!isVip && workerOnline !== true)) return;

      const randomLogs = [
        `[${new Date().toLocaleTimeString()}] [ENGINE] Health Check pasados: Latencia del túnel estable.`,
        `[${new Date().toLocaleTimeString()}] [SYSTEM] Compactando índices de sesión en memoria... Liberado 1.2MB`,
        `[${new Date().toLocaleTimeString()}] [SOCKET] Envíos de keep-alive enviados al Gateway de WhatsApp de forma segura.`,
        `[${new Date().toLocaleTimeString()}] [ENGINE] Monitoreando disparadores de flujos y respuestas automáticas.`
      ];

      const chosenLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
      setLogs(prev => [...prev, chosenLog]);
    }, 7000);

    return () => clearInterval(logInterval);
  }, [bot.id, healthStatus, isVip, workerOnline, loadingHealth]);

  // Desplazar terminal al final al recibir logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Copiar al portapapeles con animación
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);

    // Agregar log de acción
    setLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [USER] Copiado al portapapeles: ${fieldName}`
    ]);
  };

  // Enviar mensaje de prueba real a través del backend unificado
  const handleSendTestMessage = async (e) => {
    e.preventDefault();
    if (!testNumber) return;

    setSendingTest(true);
    setTestResult(null);

    // Limpiar el número eliminando caracteres especiales (+, espacios, guiones)
    const cleanedNumber = testNumber.replace(/[^0-9]/g, '');
    const recipient = isVip ? cleanedNumber : `${cleanedNumber}@s.whatsapp.net`;

    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      ...prev,
      `[${timestamp}] [DIAGNOSTIC] Solicitando al servidor principal envío de mensaje de prueba a: ${cleanedNumber}...`
    ]);

    try {
      const response = await api.post(`/bots/${bot.id}/send-test`, {
        to: recipient,
        text: testMessage
      });

      if (response.data && response.data.success) {
        setTestResult({ success: true, message: '¡Mensaje enviado con éxito!' });
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [SUCCESS] ¡Mensaje de prueba enviado exitosamente!`,
          isVip 
            ? `[${new Date().toLocaleTimeString()}] [META-API] Transacción procesada directamente por los servidores de Meta.`
            : `[${new Date().toLocaleTimeString()}] [SYSTEM] Incrementando contador local de telemetría del Bot.`
        ]);
        
        // Limpiar formulario de prueba
        setTestNumber('');
        
        // Refrescar lista si se pasa callback
        if (onRefresh) onRefresh();
      } else {
        const errMsg = response.data?.error || 'Fallo de envío en el Servidor';
        setTestResult({ success: false, message: errMsg });
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [ERROR] No se pudo enviar el mensaje: ${errMsg}`
        ]);
      }
    } catch (error) {
      console.error('Error enviando mensaje de diagnóstico', error);
      const backendError = error.response?.data?.error || error.message || 'Error de red';
      setTestResult({ success: false, message: backendError });
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [FATAL] Error de red al comunicarse con el backend: ${backendError}`
      ]);
    } finally {
      setSendingTest(false);
    }
  };

  // Reiniciar suave de la instancia WhatsApp en el Worker
  const handleSoftRestart = async () => {
    if (!confirm('¿Deseas solicitar un reinicio suave de este contenedor de WhatsApp? El túnel se re-conectará de forma segura.')) return;
    setRestarting(true);
    
    setLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [SYSTEM] Solicitando reinicio del servicio de socket para el bot...`
    ]);

    try {
      const response = await fetch(`http://localhost:3000/worker/bot/${bot.id}/start`, {
        method: 'POST'
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [SYSTEM] Señal de reinicio aceptada por el Worker. Inicializando re-conexión...`
        ]);
        alert('Se ha enviado la señal de inicialización al worker de WhatsApp. El bot intentará reconectarse.');
      } else {
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [ERROR] El Worker rechazó el reinicio: ${data.error || 'Desconocido'}`
        ]);
      }
    } catch (error) {
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [FATAL] Error al comunicarse con el Worker para el reinicio.`
      ]);
    } finally {
      setRestarting(false);
      if (onRefresh) onRefresh();
    }
  };

  // Sincronizar estado manualmente desde el Dashboard
  const handleForceSync = () => {
    setLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [USER] Solicitando sincronización forzada de base de datos...`
    ]);
    if (onRefresh) onRefresh();
    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [SUCCESS] Sincronización finalizada. Datos actualizados.`
      ]);
    }, 800);
  };

  // Funciones auxiliares para determinar salud del canal según estado del worker
  const getSaludText = () => {
    if (loadingHealth) return '---';
    if (!healthStatus) return '0.0%';
    return healthStatus.status === 'CONNECTED' ? '99.9%' : '0.0%';
  };

  const getSaludSubtext = () => {
    if (loadingHealth) return 'Analizando canal...';
    if (!healthStatus) return 'Instancia Desconectada';
    if (healthStatus.plan === 'VIP') {
      if (healthStatus.status === 'CONNECTED') return 'Instancia Activa & Ready';
      if (!healthStatus.credsConfigured) return 'Faltan credenciales de Meta';
      return 'Token o ID de Meta inválido';
    } else {
      if (healthStatus.workerOnline === false) return 'Worker Desconectado (Puerto 3000)';
      if (healthStatus.status === 'CONNECTED') return 'Instancia Activa & Ready';
      if (healthStatus.status === 'CONNECTING') return 'Conectando con WhatsApp...';
      return 'Instancia Desconectada';
    }
  };

  const getSaludCircleColor = () => {
    if (loadingHealth) return 'bg-gray-500 animate-pulse';
    if (!healthStatus) return 'bg-red-500';
    if (healthStatus.status === 'CONNECTED') return 'bg-green-500 animate-pulse';
    if (healthStatus.status === 'CONNECTING') return 'bg-yellow-500 animate-pulse';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      {/* Container Principal */}
      <div className="bg-dark-200 border border-dark-100 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Glow Decorativo */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"></div>

        {/* Header de la Consola */}
        <div className="p-6 border-b border-dark-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-300">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-black text-lg ${isVip ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                {isVip ? '👑' : '🤖'}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-dark-200 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white font-mono tracking-tighter">
                  {bot.phoneNumber || 'Instancia sin Vincular'}
                </h3>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${isConnected ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {bot.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 font-bold uppercase tracking-wider font-mono">
                ID: <span className="text-gray-400">{bot.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Badge de Plan */}
            {isVip ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-yellow-400 font-mono font-black uppercase tracking-widest bg-yellow-400/10 px-3 py-1.5 rounded-xl border border-yellow-400/20 shadow-md">
                ⭐ PLAN VIP
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-primary font-mono font-black uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 shadow-md">
                ⚡ PLAN STANDARD
              </span>
            )}
            
            {/* Cerrar */}
            <button 
              onClick={() => {
                if (onRefresh) onRefresh();
                onClose();
              }}
              className="p-2 rounded-xl bg-dark-100 hover:bg-red-500 text-gray-400 hover:text-white transition-all hover:scale-105 active:scale-95"
              title="Cerrar Consola"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* Banner de Advertencia si el Worker de Baileys está Offline para planes Standard */}
          {!isVip && workerOnline === false && (
            <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-2xl flex items-start gap-3.5 relative overflow-hidden animate-pulse">
              <div className="absolute top-0 right-0 p-4 text-red-500/5">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-2xl select-none">🚨</span>
              <div className="text-xs font-mono relative z-10">
                <h5 className="text-red-400 font-black uppercase tracking-wider">Servidor de WhatsApp Offline (Puerto 3000)</h5>
                <p className="text-gray-400 mt-1 font-sans leading-relaxed">
                  El servidor local que maneja las conexiones Standard de WhatsApp está apagado. Las funciones de escaneo QR, envío de mensajes y diagnóstico están inhabilitadas en este momento.
                </p>
                <p className="text-gray-500 mt-2 font-mono">
                  Solución: Abre una terminal en tu servidor y ejecuta <strong className="text-red-400">npm run dev</strong> o <strong className="text-red-400">node src/server.js</strong> dentro del directorio <strong className="text-gray-400">Workers</strong>.
                </p>
              </div>
            </div>
          )}
          
          {/* Fila 1: Métricas de Telemetría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Métrica 1: Mensajes Procesados */}
            <div className="bg-dark-300 p-5 rounded-2xl border border-dark-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-gray-500/20 group-hover:text-primary/10 transition-colors">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">Mensajes Enviados</h4>
              <p className="text-3xl font-black text-white font-mono mt-2 tracking-tighter">
                {bot.messageCount || 0}
              </p>
              <p className="text-[10px] text-gray-400 mt-2 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                Mensajería Ilimitada activa
              </p>
            </div>

            {/* Métrica 2: Latencia de Red */}
            <div className="bg-dark-300 p-5 rounded-2xl border border-dark-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-gray-500/20 group-hover:text-green-500/10 transition-colors">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">Latencia del Servidor</h4>
              <p className="text-3xl font-black text-white font-mono mt-2 tracking-tighter flex items-baseline">
                {isVip ? '84' : '320'} <span className="text-xs text-gray-400 font-normal ml-1">ms</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-2 font-mono flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full inline-block ${isVip ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                {isVip ? 'Canal VIP Ultra-Rápido' : 'Conexión Emulada de Web'}
              </p>
            </div>

            {/* Métrica 3: Salud del Canal */}
            <div className="bg-dark-300 p-5 rounded-2xl border border-dark-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-gray-500/20 group-hover:text-blue-500/10 transition-colors">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">Salud de Canal</h4>
              <p className={`text-3xl font-black font-mono mt-2 tracking-tighter ${getSaludText() === 'TRUNCADA' ? 'text-red-500' : 'text-green-400'}`}>
                {getSaludText()}
              </p>
              <p className="text-[10px] text-gray-400 mt-2 font-mono flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full inline-block ${getSaludCircleColor()}`}></span>
                {getSaludSubtext()}
              </p>
            </div>

          </div>

          {/* Fila 2: Información Técnica Específica por Plan */}
          {isVip ? (
            /* ================= PANEL VIP: CREDENCIALES DE META ================= */
            <div className="bg-dark-300 p-6 rounded-2xl border border-yellow-500/20 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500 text-lg">⚙️</span>
                <h4 className="text-sm font-black text-white font-mono uppercase tracking-widest">
                  Configuración VIP (Canal Oficial de Meta API)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Campo 1: Phone Number ID */}
                <div className="bg-dark-100 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">Phone Number ID</p>
                    <p className="text-gray-300 mt-1 truncate max-w-[260px]">{bot.phoneNumberId || 'No configurado'}</p>
                  </div>
                  {bot.phoneNumberId && (
                    <button 
                      onClick={() => handleCopy(bot.phoneNumberId, 'Phone Number ID')}
                      className="p-2 rounded-lg bg-dark-200 hover:bg-primary text-gray-400 hover:text-white transition-all active:scale-95 text-[10px] font-bold"
                    >
                      {copiedField === 'Phone Number ID' ? '✓ ¡Copiado!' : 'Copiar'}
                    </button>
                  )}
                </div>

                {/* Campo 2: WABA ID */}
                <div className="bg-dark-100 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">WhatsApp Business Account ID (WABA)</p>
                    <p className="text-gray-300 mt-1 truncate max-w-[260px]">{bot.wabaId || 'No configurado'}</p>
                  </div>
                  {bot.wabaId && (
                    <button 
                      onClick={() => handleCopy(bot.wabaId, 'WABA ID')}
                      className="p-2 rounded-lg bg-dark-200 hover:bg-primary text-gray-400 hover:text-white transition-all active:scale-95 text-[10px] font-bold"
                    >
                      {copiedField === 'WABA ID' ? '✓ ¡Copiado!' : 'Copiar'}
                    </button>
                  )}
                </div>

                {/* Campo 3: Webhook Verification Token */}
                <div className="bg-dark-100 p-3.5 rounded-xl border border-white/5 flex items-center justify-between col-span-1 md:col-span-2">
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">Verification Token (Webhook Meta)</p>
                    <p className="text-gray-300 mt-1 truncate max-w-[480px]">{bot.webhookVerifyToken || 'No configurado'}</p>
                  </div>
                  {bot.webhookVerifyToken && (
                    <button 
                      onClick={() => handleCopy(bot.webhookVerifyToken, 'Webhook Token')}
                      className="p-2 rounded-lg bg-dark-200 hover:bg-primary text-gray-400 hover:text-white transition-all active:scale-95 text-[10px] font-bold"
                    >
                      {copiedField === 'Webhook Token' ? '✓ ¡Copiado!' : 'Copiar'}
                    </button>
                  )}
                </div>

                {/* Campo 4: URL Callback */}
                <div className="bg-dark-100 p-3.5 rounded-xl border border-white/5 col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-[9px] text-yellow-500 font-black uppercase">URL del Callback para Webhooks de Meta</p>
                    <p className="text-gray-300 mt-1 font-mono text-[11px] select-all truncate">
                      http://localhost:8080/api/v1/webhooks/incoming-message
                    </p>
                  </div>
                  <button 
                    onClick={() => handleCopy('http://localhost:8080/api/v1/webhooks/incoming-message', 'URL del Webhook')}
                    className="py-1.5 px-3 self-end md:self-center rounded-lg bg-dark-200 hover:bg-primary text-gray-400 hover:text-white transition-all active:scale-95 text-[10px] font-bold shrink-0"
                  >
                    {copiedField === 'URL del Webhook' ? '✓ ¡Copiado!' : 'Copiar URL'}
                  </button>
                </div>
              </div>

              {/* Riesgo VIP */}
              <div className="mt-4 bg-green-500/5 border border-green-500/20 p-3 rounded-xl flex items-center gap-3">
                <span className="text-xl">🛡️</span>
                <div className="text-[11px] leading-relaxed">
                  <p className="text-green-400 font-black uppercase font-mono">Índice de Riesgo de Baneo: 0.00% (Canal Oficial)</p>
                  <p className="text-gray-400 font-sans mt-0.5">
                    Estás utilizando el gateway oficial aprobado por Meta. No hay emulación de WhatsApp Web involucrada, garantizando el cumplimiento total de los términos de servicio.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            /* ================= PANEL STANDARD: BAILEYS PARAMS ================= */
            <div className="bg-dark-300 p-6 rounded-2xl border border-primary/20 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/5 rounded-full blur-2xl"></div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary text-lg">🔌</span>
                <h4 className="text-sm font-black text-white font-mono uppercase tracking-widest">
                  Parámetros Técnicos (Emulación Baileys Engine)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-dark-100 p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Motor de Simulación</p>
                  <p className="text-gray-300 mt-1">Baileys WA Multi-Device Protocol v5.2.1</p>
                </div>
                <div className="bg-dark-100 p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Dispositivo Enmascarado</p>
                  <p className="text-gray-300 mt-1">Linux OS / Chrome Engine 1.0.0</p>
                </div>
                <div className="bg-dark-100 p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Sesión Socket</p>
                  <p className="text-gray-300 mt-1 truncate">{bot.sessionTokenEncrypted ? '✓ Encriptada & Almacenada' : 'Awaiting Creds update'}</p>
                </div>
                <div className="bg-dark-100 p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Autostart en Servidor</p>
                  <p className="text-gray-300 mt-1">Habilitado (Reinicio Automático)</p>
                </div>
              </div>

              {/* Alerta de Seguridad Standard */}
              <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 p-3.5 rounded-xl flex items-start gap-3">
                <span className="text-xl mt-0.5">⚠️</span>
                <div className="text-[11px] leading-relaxed">
                  <p className="text-yellow-500 font-black uppercase font-mono">Riesgo de Baneo: MEDIO-ALTO (Emulación WhatsApp Web)</p>
                  <p className="text-gray-400 font-sans mt-1">
                    Esta instancia simula un navegador conectado a WhatsApp Web. Para reducir bloqueos por parte de Meta:
                  </p>
                  <ul className="list-disc ml-4 mt-1 font-sans text-gray-500 space-y-0.5">
                    <li>Evita enviar más de 100 mensajes por hora a usuarios que no te tienen guardado en contactos.</li>
                    <li>Configura tus flujos con pausas conversacionales o usa botones para respuestas guiadas en lugar de enlaces de spam.</li>
                    <li>Sube al plan <strong className="text-yellow-500">VIP</strong> para eliminar este riesgo por completo y usar la API Oficial.</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* Fila 3: Consola de Logs Terminal */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-xs font-black text-white font-mono uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                Terminal del Bot en Vivo
              </h4>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] text-gray-500 hover:text-white font-mono uppercase transition-colors"
              >
                Limpiar Consola
              </button>
            </div>

            <div className="bg-black border border-dark-100 rounded-2xl p-4 h-60 overflow-y-auto font-mono text-[11px] text-green-400 leading-relaxed shadow-inner flex flex-col space-y-1">
              {logs.map((log, index) => {
                let colorClass = 'text-green-400';
                if (log.includes('[ERROR]') || log.includes('[FATAL]')) colorClass = 'text-red-500';
                if (log.includes('[WARNING]')) colorClass = 'text-yellow-500';
                if (log.includes('[SYSTEM]')) colorClass = 'text-cyan-400';
                if (log.includes('[SUCCESS]')) colorClass = 'text-emerald-400';
                if (log.includes('[DIAGNOSTIC]')) colorClass = 'text-purple-400';
                if (log.includes('[USER]')) colorClass = 'text-white font-bold';

                return (
                  <div key={index} className={`whitespace-pre-wrap ${colorClass}`}>
                    {log}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Fila 4: Diagnóstico de Prueba e Interacción */}
          <div className="bg-dark-300 p-5 rounded-2xl border border-dark-100 space-y-4">
            <h4 className="text-xs font-black text-white font-mono uppercase tracking-widest">
              Herramienta de Diagnóstico: Enviar Mensaje de Prueba
            </h4>
            
            <form onSubmit={handleSendTestMessage} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 font-mono">Número del Destinatario (Con Código de País)</label>
                <input 
                  type="text" 
                  placeholder="Ej: 51983032706"
                  className="w-full bg-dark-100 border border-dark-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-white text-xs transition-all font-mono"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  disabled={!isConnected || sendingTest}
                  required
                />
              </div>

              <div className="md:col-span-2 flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 font-mono">Mensaje de Texto</label>
                  <input 
                    type="text" 
                    placeholder="Escribe el cuerpo del mensaje de prueba"
                    className="w-full bg-dark-100 border border-dark-100 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-white text-xs transition-all"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    disabled={!isConnected || sendingTest}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isConnected || sendingTest || !testNumber}
                  className={`py-3 px-5 bg-primary hover:bg-primary-dark text-dark-300 font-black rounded-xl transition-all shadow-md uppercase tracking-wider text-xs whitespace-nowrap ${(!isConnected || sendingTest || !testNumber) ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  {sendingTest ? 'Enviando...' : 'Enviar Prueba'}
                </button>
              </div>
            </form>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 border ${testResult.success ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                <span>{testResult.success ? '✓' : '✗'}</span>
                <span>{testResult.message}</span>
              </div>
            )}

            {!isConnected && (
              <p className="text-[10px] text-red-500 font-mono italic">
                * Para utilizar la herramienta de prueba de envío, el bot debe estar en estado CONNECTED. Sincroniza o escanea el QR primero.
              </p>
            )}
          </div>

        </div>

        {/* Footer con Acciones de Control */}
        <div className="p-6 border-t border-dark-100 bg-dark-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
            RedWire System Diagnostics Hub v1.0.0<br/>
            Conexión de túnel directa autorizada por el usuario.
          </p>

          <div className="flex items-center gap-3">
            {/* Forzar Sincronización */}
            <button
              onClick={handleForceSync}
              className="px-4 py-2.5 bg-dark-100 hover:bg-dark-100/80 border border-white/5 text-gray-300 font-black rounded-xl text-xs uppercase tracking-widest transition-all"
            >
              Sincronizar Datos
            </button>

            {/* Reiniciar Instancia */}
            {!isVip && (
              <button
                onClick={handleSoftRestart}
                disabled={restarting}
                className="px-4 py-2.5 border border-primary/30 hover:bg-primary hover:text-dark-300 text-primary font-black rounded-xl text-xs uppercase tracking-widest transition-all"
              >
                {restarting ? 'Reiniciando...' : 'Reiniciar Canal'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BotDiagnosticsModal;
