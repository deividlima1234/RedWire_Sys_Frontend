import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../config/axios';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeFaq, setActiveFaq] = useState(null);
  const [prices, setPrices] = useState({
    standard: { amount: 29, currency: 'USD' },
    vip: { amount: 99, currency: 'USD' }
  });

  // Estados de la simulación dinámica del Constructor de Flujos
  const [simStep, setSimStep] = useState(0);

  useEffect(() => {
    // Sincronizar precios dinámicos desde Stripe
    const fetchPrices = async () => {
      try {
        const response = await api.get('/subscription/prices');
        if (response.data) {
          setPrices({
            standard: {
              amount: response.data.standard?.amount ?? 29,
              currency: response.data.standard?.currency ?? 'USD'
            },
            vip: {
              amount: response.data.vip?.amount ?? 99,
              currency: response.data.vip?.currency ?? 'USD'
            }
          });
        }
      } catch (err) {
        console.error('Error fetching dynamic prices', err);
      }
    };
    fetchPrices();

    // Secuencia de simulación con tiempos realistas de conversación
    const interval = setInterval(() => {
      setSimStep((prev) => (prev + 1) % 6);
    }, 4000); // Avanzar cada 4 segundos para que se asimile la secuencia

    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handlePlanSelect = (planName) => {
    navigate(`/get-started?plan=${planName}`);
  };

  const faqs = [
    {
      q: "¿Qué diferencia al Plan Standard de Baileys del Plan VIP de Meta?",
      a: "El Plan Standard utiliza Baileys, lo que emula una conexión web mediante código QR; es económico, pero requiere que mantengas tu teléfono encendido y con conexión a internet estable. El Plan VIP de Meta se conecta directamente con los servidores oficiales de Facebook (Meta Cloud API). No depende de ningún teléfono físico, es 100% en la nube, más rápido, estable y cuenta con aprobación oficial."
    },
    {
      q: "¿Hay algún límite de mensajes en los planes de pago?",
      a: "No. Tanto el Plan Standard como el Plan VIP disfrutan de mensajería saliente y entrante totalmente ilimitada. El Plan Free es una versión de prueba de 15 días con un límite de entre 20 y 50 mensajes para testear la plataforma."
    },
    {
      q: "¿Puedo cambiar de plan o cancelar en cualquier momento?",
      a: "Por supuesto. Puedes migrar de plan en cualquier momento desde tu panel de administración. Si decides pasar de VIP a Standard, las credenciales de Meta se conservarán por si deseas volver en el futuro, y se habilitará el lector de código QR de forma transparente."
    },
    {
      q: "¿Qué necesito para configurar el Plan VIP con Meta Oficial?",
      a: "Necesitas una cuenta de Meta Developer y una cuenta de WhatsApp Business. En el panel te brindamos un token de verificación generado de forma segura para enlazar tu Webhook oficial en menos de 5 minutos, acompañado de una guía guiada paso a paso."
    }
  ];

  return (
    <div className="min-h-screen bg-dark-300 text-gray-200 selection:bg-primary selection:text-white font-sans overflow-x-hidden relative">
      {/* Círculos de Resplandor Neon de Fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/3 blur-[120px] pointer-events-none"></div>

      {/* Header Sticky */}
      <header className="sticky top-0 z-50 bg-dark-300/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/redwire-favicon.png" alt="RedWire Logo" className="w-9 h-9 rounded-lg shadow-lg shadow-primary/20" />
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
              <span className="text-xl font-black text-white tracking-tighter uppercase font-mono">
                RedWire<span className="text-primary">Sys</span>
              </span>
              <span className="text-[8px] border border-white/10 px-2 py-0.5 rounded font-mono text-gray-500 font-bold uppercase tracking-widest bg-dark-200/50">
                EddamCore Corp
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-400">
            <a href="#features" className="hover:text-primary transition-colors">Características</a>
            <a href="#plans" className="hover:text-primary transition-colors">Planes</a>
            <a href="#faq" className="hover:text-primary transition-colors">Preguntas Frecuentes</a>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-primary/10 hover:bg-primary/25 text-primary border border-primary/40 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-primary/5"
              >
                Ir al Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-xs text-gray-300 hover:text-white font-bold uppercase tracking-widest transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/get-started"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                >
                  Empezar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] text-primary font-mono font-black uppercase tracking-widest shadow-lg shadow-primary/5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          🚀 PROGRAMA DE PIONEROS • ENTORNO BETA LIMITADO
        </div>
        
        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight uppercase max-w-5xl mx-auto font-mono">
          CONSTRUYE BOTS DE <span className="text-primary bg-clip-text">WHATSAPP</span> A NIVEL INDUSTRIAL
        </h1>
        
        <p className="text-sm md:text-base text-gray-400 max-w-3xl mx-auto leading-relaxed font-semibold">
          Diseña flujos conversacionales dinámicos mediante nuestro potente constructor visual drag & drop. Elige entre la conectividad económica de Baileys QR o el canal VIP con Meta Cloud API Oficial. Actualmente lanzando la Fase Beta Cerrada. Únete gratis como pionero y disfruta del Plan Standard sin costo.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handlePlanSelect('free')}
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
          >
            Crear cuenta gratuita
          </button>
          <a
            href="#plans"
            className="w-full sm:w-auto px-8 py-4 bg-dark-100 hover:bg-dark-200 border border-white/5 text-gray-300 hover:text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all"
          >
            Ver Planes y Precios
          </a>
        </div>

        {/* Maqueta del Editor de Flujos como demostración visual INTERACTIVA Y ANIMADA */}
        <div className="pt-16 max-w-6xl mx-auto">
          <div className="bg-dark-200 rounded-3xl border border-white/5 p-4 shadow-2xl relative overflow-hidden group">
            <div className="h-1 flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/40"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/40"></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-bold">Estado Simulación:</span>
                <span className="text-[9px] font-mono font-black text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md animate-pulse">
                  {simStep === 0 && 'En Espera de Mensaje...'}
                  {simStep === 1 && 'Cliente Envia Mensaje'}
                  {simStep === 2 && 'Disparador Activo'}
                  {simStep === 3 && 'Tipeando Respuesta...'}
                  {simStep === 4 && 'Bot Responde'}
                  {simStep === 5 && 'Menú Desplegado'}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">LIVE_FLOW_ENGINE.JSX</span>
            </div>
            
            {/* Contenedor Split Screen: Canvas (Izquierda) vs WhatsApp (Derecha) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative">
              
              {/* PANEL IZQUIERDO: Canvas de Flujos con Nodos Reales Recreados en Columna Secuencial Unida de forma PERFECTA */}
              <div className="lg:col-span-7 bg-dark-300/50 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center gap-0 relative min-h-[580px] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                
                {/* RECREACIÓN NODO 1: TRIGGER NODE (ESTILO FIEL AL REAL) */}
                <div 
                  className={`bg-dark-200 rounded-lg shadow-2xl w-64 text-white overflow-hidden border-2 transition-all duration-500 relative z-20 ${
                    simStep === 2
                      ? 'border-primary shadow-[0_0_25px_rgba(255,0,51,0.25)] scale-105'
                      : 'border-primary/30 opacity-50 scale-95'
                  }`}
                >
                  <div className="bg-primary/20 px-3.5 py-2 border-b border-primary/50 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse mr-2"></div>
                      <h3 className="font-bold text-xs tracking-wider uppercase font-mono">Trigger (Disparador)</h3>
                    </div>
                    <span className="text-[10px]">⚡</span>
                  </div>
                  
                  <div className="p-3 space-y-2 text-left">
                    <div>
                      <label className="block text-[8px] text-gray-500 font-mono">TRIGGER TYPE:</label>
                      <div className="w-full bg-dark-100 border border-dark-100 rounded px-2.5 py-1.5 text-[10px] text-white font-mono font-bold">
                        Contains
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] text-gray-500 font-mono">KEYWORDS:</label>
                      <div className="w-full bg-dark-100 border border-dark-100 rounded px-2.5 py-1.5 text-[10px] text-white font-mono font-bold">
                        hola, buenas
                      </div>
                    </div>
                  </div>

                  {/* Handle visual inferior */}
                  <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-dark-200 absolute bottom-[-5px] left-1/2 -translate-x-1/2"></div>
                </div>

                {/* CONECTOR 1 A 2 (UNIDO DE FORMA PERFECTA E ININTERRUMPIDA) */}
                <div className="w-0.5 h-8 relative flex items-center justify-center z-10">
                  <div className={`w-0.5 h-full transition-all duration-500 ${simStep >= 2 ? 'bg-primary shadow-[0_0_10px_#FF0033]' : 'bg-white/10'}`}></div>
                  {simStep === 2 && (
                    <span className="absolute top-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                  )}
                </div>

                {/* RECREACIÓN NODO 2: DELAY NODE (ESTILO FIEL AL REAL) */}
                <div 
                  className={`bg-dark-200 rounded-lg shadow-2xl w-64 text-white overflow-hidden border transition-all duration-500 relative z-20 ${
                    simStep === 3
                      ? 'border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.25)] scale-105'
                      : 'border-white/5 opacity-50 scale-95'
                  }`}
                >
                  {/* Handle visual superior */}
                  <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-dark-200 absolute top-[-5px] left-1/2 -translate-x-1/2"></div>

                  <div className="bg-blue-600/20 p-2 border-b border-blue-500/30 text-[10px] font-bold text-blue-400 uppercase flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Smart Delay (Espera)
                  </div>
                  
                  <div className="p-3 space-y-2 text-left">
                    <div>
                      <label className="block text-[8px] text-gray-500 font-mono">WAIT FOR (SECONDS):</label>
                      <div className="w-full bg-dark-300 border border-dark-100 rounded px-2.5 py-1.5 text-[10px] text-white font-mono font-bold flex justify-between items-center">
                        <span>1.5</span>
                        <span className="text-gray-500">sec</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked readOnly className="w-3 h-3 rounded bg-dark-300 border-dark-100 text-blue-500" />
                      <span className="text-[9px] text-gray-400 font-mono">Simulate typing...</span>
                    </div>
                  </div>

                  {/* Handle visual inferior */}
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-dark-200 absolute bottom-[-5px] left-1/2 -translate-x-1/2"></div>
                </div>

                {/* CONECTOR 2 A 3 (UNIDO DE FORMA PERFECTA E ININTERRUMPIDA) */}
                <div className="w-0.5 h-8 relative flex items-center justify-center z-10">
                  <div className={`w-0.5 h-full transition-all duration-500 ${simStep >= 3 ? 'bg-primary shadow-[0_0_10px_#FF0033]' : 'bg-white/10'}`}></div>
                  {simStep === 3 && (
                    <span className="absolute top-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                  )}
                </div>

                {/* RECREACIÓN NODO 3: INTERACTIVE NODE (ESTILO FIEL AL REAL) */}
                <div 
                  className={`bg-dark-200 rounded-lg shadow-2xl w-64 text-white overflow-hidden border transition-all duration-500 relative z-20 ${
                    simStep >= 4
                      ? 'border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.25)] scale-105'
                      : 'border-white/5 opacity-50 scale-95'
                  }`}
                >
                  {/* Handle visual superior */}
                  <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-dark-200 absolute top-[-5px] left-1/2 -translate-x-1/2"></div>

                  <div className="bg-purple-600/20 p-2 border-b border-purple-500/30 text-[10px] font-bold text-purple-400 uppercase flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    Interactive Menu
                  </div>
                  
                  <div className="p-3 space-y-3 text-left">
                    <div>
                      <label className="block text-[8px] text-gray-500 font-mono">MESSAGE TEXT:</label>
                      <div className="w-full bg-dark-300 border border-dark-100 rounded px-2 py-1.5 text-[9px] text-gray-300 font-semibold leading-relaxed">
                        Hola, soy el asistente digital de Corporación EddamCore...
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] text-gray-500 font-mono uppercase">Menu Options:</label>
                      <div className="space-y-1 mt-1">
                        <div className="w-full bg-dark-300 border border-dark-100 rounded px-2 py-1 text-[8px] text-white flex items-center gap-1">
                          <span className="text-purple-400 font-bold">🔘</span> Ver Catálogo
                        </div>
                        <div className="w-full bg-dark-300 border border-dark-100 rounded px-2 py-1 text-[8px] text-white flex items-center gap-1">
                          <span className="text-purple-400 font-bold">🔘</span> Soporte Técnico
                        </div>
                        <div className="w-full bg-dark-300 border border-dark-100 rounded px-2 py-1 text-[8px] text-white flex items-center gap-1">
                          <span className="text-purple-400 font-bold">🔘</span> Hablar con Asesor
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Handle visual inferior */}
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-dark-200 absolute bottom-[-5px] left-1/2 -translate-x-1/2"></div>
                </div>

              </div>

              {/* PANEL DERECHO: Teléfono Móvil Mockup (5 de 12 columnas) */}
              <div className="lg:col-span-5 bg-dark-300/40 rounded-2xl border border-white/5 p-4 flex flex-col h-[580px] relative overflow-hidden justify-between">
                
                {/* Barra superior de conversación */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-black text-xs text-primary font-mono border border-primary/20">🤖</div>
                    <div className="text-left">
                      <h4 className="text-[11px] font-black text-white font-mono uppercase leading-none">EddamCore Bot</h4>
                      <span className="text-[8px] text-green-500 font-bold uppercase tracking-wider">En Línea</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">•••</span>
                </div>

                {/* Área de mensajes de chat */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 py-4 justify-start">
                  
                  {/* Mensaje Entrante (Cliente) */}
                  {simStep >= 1 && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="max-w-[85%] bg-dark-100 text-gray-200 px-3.5 py-2 rounded-2xl rounded-tl-none border border-white/5 text-xs text-left shadow-md">
                        <p className="font-bold leading-relaxed">Hola buenas</p>
                        <div className="text-[8px] text-gray-500 text-right mt-1 font-mono">10:15</div>
                      </div>
                    </div>
                  )}

                  {/* Typing Indicator (Tipeando...) */}
                  {simStep === 3 && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="bg-dark-100 text-gray-400 px-4 py-2.5 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}

                  {/* Mensaje Saliente (Bot) */}
                  {simStep >= 4 && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="max-w-[90%] bg-dark-100 border border-primary/20 text-gray-200 px-3.5 py-2.5 rounded-2xl rounded-tl-none text-xs text-left shadow-lg">
                        <p className="font-bold leading-relaxed">
                          Hola, soy el asistente digital de <strong className="text-primary">Corporación EddamCore</strong>. ¿En qué puedo ayudarte hoy?
                        </p>
                        <div className="text-[8px] text-gray-500 text-right mt-1 font-mono">10:15</div>
                      </div>
                    </div>
                  )}

                  {/* Botones Interactivos de WhatsApp */}
                  {simStep >= 5 && (
                    <div className="flex flex-col gap-1.5 w-full max-w-[90%] pl-2 animate-fade-in">
                      <div className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black font-mono px-3.5 py-2 rounded-xl text-center transition-all cursor-default flex items-center justify-center gap-1.5 shadow-sm">
                        <span>🔘</span> Ver Catálogo
                      </div>
                      <div className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black font-mono px-3.5 py-2 rounded-xl text-center transition-all cursor-default flex items-center justify-center gap-1.5 shadow-sm">
                        <span>🔘</span> Soporte Técnico
                      </div>
                      <div className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black font-mono px-3.5 py-2 rounded-xl text-center transition-all cursor-default flex items-center justify-center gap-1.5 shadow-sm">
                        <span>🔘</span> Hablar con Asesor
                      </div>
                    </div>
                  )}

                </div>

                {/* Input falso inferior */}
                <div className="border-t border-white/5 pt-3 flex items-center gap-2">
                  <div className="flex-1 bg-dark-100 border border-white/5 rounded-full px-4 py-1.5 text-[10px] text-gray-500 text-left font-mono">
                    Escribe un mensaje...
                  </div>
                  <span className="p-2 bg-primary rounded-full text-[10px] text-white shadow-md">➤</span>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Características Clave */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] text-primary font-mono font-black uppercase tracking-widest">Pila de Funcionalidades</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase font-mono">TECNOLOGÍA DE AUTOMATIZACIÓN DE CHAT</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-dark-200/50 rounded-2xl border border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1 duration-300 space-y-4">
            <span className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary text-xl">✏️</span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-mono">Constructor de Flujos</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-semibold">
              Crea complejas ramas de conversación en segundos con arrastrar y soltar. Soporta nodos de texto, imágenes, videos, retardos inteligentes de tipeo y condiciones lógicas de palabras clave.
            </p>
          </div>

          <div className="p-8 bg-dark-200/50 rounded-2xl border border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1 duration-300 space-y-4">
            <span className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary text-xl">👁️</span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-mono">Monitor en Vivo</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-semibold">
              Supervisa las conversaciones automáticas en tiempo real. Intervén de forma interactiva en chats y visualiza imágenes, videos y botones enviados tal cual ocurren en los teléfonos de tus clientes.
            </p>
          </div>

          <div className="p-8 bg-dark-200/50 rounded-2xl border border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1 duration-300 space-y-4">
            <span className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary text-xl">☁️</span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-mono">Meta Cloud Oficial</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-semibold">
              Conexión directa con la API oficial de Facebook Developer. Una solución corporativa libre de fallos de desconexión, 100% en la nube y sin depender de la batería o encendido de tu smartphone.
            </p>
          </div>
        </div>
      </section>

      {/* Planes de Precios Detallados */}
      <section id="plans" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] text-primary font-mono font-black uppercase tracking-widest">Nuestras Tarifas</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase font-mono">PLANES ADAPTADOS A TU ESCALA</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Plan Free */}
          <div className="p-8 bg-dark-200 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300 relative overflow-hidden">
            
            {/* Capa de Bloqueo Glassmorphism - Inhabilitado Temporalmente */}
            <div className="absolute inset-0 z-10 backdrop-blur-md bg-dark-300/80 rounded-3xl p-6 flex flex-col justify-center items-center text-center border border-white/5 shadow-2xl">
              <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 text-lg mb-3 shadow-lg">
                ⏳
              </span>
              <span className="text-[9px] font-black tracking-widest text-gray-500 font-mono uppercase bg-white/5 px-2.5 py-1 rounded border border-white/10">
                INHABILITADO TEMPORALMENTE
              </span>
              <h4 className="text-xs font-black text-white mt-2.5 uppercase tracking-tight font-mono">BETA CERRADA ACTIVA</h4>
              <p className="text-[10px] text-gray-500 font-bold mt-1.5 leading-relaxed max-w-[190px]">
                Actualmente todos los recursos de la plataforma se han destinado exclusivamente para el Plan Standard en el Programa de Pioneros.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] text-gray-500 font-mono font-black uppercase tracking-widest">PRUEBA INICIAL</span>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase font-mono mt-1">PLAN FREE</h3>
                <p className="text-xs text-gray-400 mt-2 font-semibold">Para probar nuestra plataforma e iniciar de forma básica.</p>
              </div>

              <div className="flex items-baseline gap-1.5 py-4 border-y border-white/5">
                <span className="text-3xl font-black text-white uppercase tracking-tight font-mono">$0 USD</span>
                <span className="text-[10px] text-gray-500 font-mono uppercase font-black">/ 15 días de prueba</span>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] text-green-500 font-mono uppercase font-black tracking-wider block">✓ Ventajas (PROS):</span>
                <ul className="text-xs text-gray-300 space-y-2.5 font-bold">
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> 1 Bot activo (Prueba 15 días)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> Constructor de flujos completo
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> Soporte de botones interactivos
                  </li>
                </ul>

                <span className="text-[9px] text-red-500 font-mono uppercase font-black tracking-wider block pt-2">❌ Restricciones (CONS):</span>
                <ul className="text-xs text-gray-400 space-y-2.5 font-bold">
                  <li className="flex items-center gap-2.5">
                    <span className="text-red-500">✘</span> Límite de <strong>20-50 mensajes</strong> totales
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-red-500">✘</span> Conexión por Baileys QR únicamente
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-red-500">✘</span> Soporte de baja prioridad (72 horas)
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => handlePlanSelect('free')}
              className="w-full mt-8 py-3.5 bg-dark-100 hover:bg-dark-100/80 text-gray-300 hover:text-white border border-white/5 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
            >
              Comenzar Gratis
            </button>
          </div>

          {/* Plan Standard */}
          <div className="p-8 bg-dark-200 rounded-3xl border border-primary/30 shadow-[0_0_50px_rgba(255,0,51,0.02)] flex flex-col justify-between hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
            
            {/* Capa de Bloqueo Glassmorphism - Programa de Pioneros */}
            <div className="absolute inset-0 z-10 backdrop-blur-md bg-dark-300/80 rounded-3xl p-6 flex flex-col justify-center items-center text-center border-2 border-primary/40 shadow-2xl">
              <span className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xl mb-4 shadow-lg shadow-primary/5 animate-bounce">
                🔐
              </span>
              <span className="text-[9px] font-black tracking-widest text-primary font-mono uppercase bg-primary/10 px-2.5 py-1 rounded border border-primary/20">
                PIONEROS CLOSED BETA
              </span>
              <h4 className="text-sm font-black text-white mt-3 uppercase tracking-tight font-mono">PLAN TOTALMENTE GRATIS</h4>
              <p className="text-[10px] text-gray-400 font-bold mt-2 leading-relaxed max-w-[210px]">
                Actualmente estamos seleccionando a un grupo exclusivo de negocios para probar RedWire en producción real a cambio de feedback de uso.
              </p>
              <button
                onClick={() => handlePlanSelect('standard')}
                className="mt-5 w-full py-3 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
              >
                Solicitar Acceso Beta 🚀
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <span className="text-[10px] text-primary font-mono font-black uppercase tracking-widest">MÁXIMA EFICIENCIA</span>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase font-mono mt-1">PLAN STANDARD</h3>
                <p className="text-xs text-gray-400 mt-2 font-semibold">Perfecto para pymes y negocios que quieren masividad sin límites.</p>
              </div>

              <div className="flex items-baseline gap-1.5 py-4 border-y border-white/5">
                <span className="text-3xl font-black text-white uppercase tracking-tight font-mono">${prices.standard.amount} {prices.standard.currency}</span>
                <span className="text-[10px] text-gray-500 font-mono uppercase font-black">/ mensual</span>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] text-green-500 font-mono uppercase font-black tracking-wider block">✓ Ventajas (PROS):</span>
                <ul className="text-xs text-gray-300 space-y-2.5 font-bold">
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> <strong>Mensajes Ilimitados</strong>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> 1 Bot activo (Ilimitado)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> Bots adicionales con 50% de descuento
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> Constructor de flujos multimedia
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> Monitor en vivo y chat interactivo
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> Soporte por correo prioritario (24h)
                  </li>
                </ul>

                <span className="text-[9px] text-red-500 font-mono uppercase font-black tracking-wider block pt-2">❌ Restricciones (CONS):</span>
                <ul className="text-xs text-gray-400 space-y-2.5 font-bold">
                  <li className="flex items-center gap-2.5">
                    <span className="text-red-500">✘</span> Conexión por Baileys QR únicamente
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-red-500">✘</span> Requiere mantener celular conectado
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-red-500">✘</span> Sin soporte multi-agente en vivo
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => handlePlanSelect('standard')}
              className="w-full mt-8 py-3.5 bg-primary hover:bg-primary-dark text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-primary/10 hover:scale-105 active:scale-95"
            >
              Adquirir Standard
            </button>
          </div>

          {/* Plan VIP */}
          <div className="p-8 bg-dark-200 rounded-3xl border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.05)] flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden">
            


            <div className="absolute top-0 right-0 bg-amber-500 text-dark-300 text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl font-mono">
              ⭐ RECOMENDADO
            </div>
            
            <div className="space-y-6">
              <div>
                <span className="text-[10px] text-amber-500 font-mono font-black uppercase tracking-widest">NIVEL INDUSTRIAL</span>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase font-mono mt-1">PLAN VIP</h3>
                <p className="text-xs text-gray-400 mt-2 font-semibold">Para empresas que exigen redundancia oficial, 100% en la nube.</p>
              </div>

              <div className="flex items-baseline gap-1.5 py-4 border-y border-white/5">
                <span className="text-3xl font-black text-white uppercase tracking-tight font-mono">${prices.vip.amount} {prices.vip.currency}</span>
                <span className="text-[10px] text-gray-500 font-mono uppercase font-black">/ mensual</span>
              </div>

              <div className="space-y-4">
                <span className="text-[9px] text-green-500 font-mono uppercase font-black tracking-wider block">✓ Ventajas (PROS):</span>
                <ul className="text-xs text-gray-300 space-y-2.5 font-bold">
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> <strong>Conexión Oficial de Meta Cloud API</strong>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-amber-500">✔</span> <strong>100% en la Nube</strong> (0 dependencia de celular)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> 2 Bots activos (Ilimitados)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> Bots adicionales con 50% de descuento
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> Monitor avanzado con soporte multi-agente
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> Servidor y recursos garantizados
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-green-500">✔</span> Soporte 24/7 vía canal de Slack dedicado
                  </li>
                </ul>

                <span className="text-[9px] text-red-500 font-mono uppercase font-black tracking-wider block pt-2">❌ Restricciones (CONS):</span>
                <ul className="text-xs text-gray-400 space-y-2.5 font-bold">
                  <li className="flex items-center gap-2.5">
                    <span className="text-red-500">✘</span> Requiere registrarse en Facebook Developer
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => handlePlanSelect('vip')}
              className="w-full mt-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-dark-300 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-amber-500/10 hover:scale-105 active:scale-95"
            >
              Adquirir Plan VIP
            </button>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] text-primary font-mono font-black uppercase tracking-widest">Soporte y Respuestas</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase font-mono">PREGUNTAS FRECUENTES</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-dark-200 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="text-xs md:text-sm font-black text-white uppercase font-mono tracking-tight">{faq.q}</span>
                <span className="text-primary font-bold text-sm">{activeFaq === idx ? '▲' : '▼'}</span>
              </button>
              
              <div 
                className={`transition-all duration-300 overflow-hidden ${activeFaq === idx ? 'max-h-60 border-t border-white/5' : 'max-h-0'}`}
              >
                <p className="p-6 text-xs md:text-sm text-gray-400 leading-relaxed font-semibold bg-dark-300/20">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-dark-300/50 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/redwire-favicon.png" alt="RedWire Logo" className="w-8 h-8 rounded shadow-lg shadow-primary/20" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-black text-white uppercase tracking-wider font-mono">
                RedWire<span className="text-primary">Sys</span>
              </span>
              <span className="text-[9px] text-gray-500 font-mono font-semibold">Impulsado por Corporación EddamCore</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider text-center">
              © {new Date().getFullYear()} RedWire System. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">Políticas de Privacidad</Link>
              <span className="hidden sm:inline text-white/10">|</span>
              <Link to="/terms" className="hover:text-primary transition-colors">Términos de Servicio</Link>
            </div>
          </div>

          <p className="text-[9px] text-primary font-mono font-black uppercase tracking-widest">
            🛡️ SEGURIDAD INDUSTRIAL GARANTIZADA
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
