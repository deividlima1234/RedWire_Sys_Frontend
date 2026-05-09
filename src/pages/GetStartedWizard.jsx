import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../config/axios';

const GetStartedWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [useCase, setUseCase] = useState('sales');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prices, setPrices] = useState({
    standard: { amount: 29, currency: 'USD' },
    vip: { amount: 99, currency: 'USD' }
  });

  // Cargar el plan de la URL si viene configurado y consultar precios reales
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && ['free', 'standard', 'vip'].includes(planParam.toLowerCase())) {
      setSelectedPlan(planParam.toLowerCase());
    }

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
        console.error('Error fetching dynamic prices in onboarding', err);
      }
    };
    fetchPrices();
  }, [searchParams]);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Registrar Cuenta
      await api.post('/auth/register', { email, password });
      
      // 2. Autologin transparente
      const loginResponse = await api.post('/auth/login', { email, password });
      const { token, id, email: userEmail, role } = loginResponse.data;
      
      // Guardar sesión e ir directo al panel o pantalla de pago
      setAuth(token, { id, email: userEmail, role });
      
      if (selectedPlan === 'free') {
        navigate('/dashboard');
      } else {
        setStep(4);
      }
    } catch (err) {
      console.error("Error en onboarding:", err);
      setError(err.response?.data?.message || err.response?.data || 'Error en el servidor. Revisa los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Plan Free',
      accent: 'border-white/10 text-gray-400 bg-white/5',
      price: '$0 USD',
      features: ['1 Bot de WhatsApp', 'Constructor de flujos', 'Botones de acción', 'Límite 50 mensajes/mes', 'Solo Baileys QR']
    },
    {
      id: 'standard',
      name: 'Plan Standard',
      accent: 'border-primary/40 text-primary bg-primary/5 shadow-md shadow-primary/5',
      price: `$${prices.standard.amount} ${prices.standard.currency}`,
      features: ['Mensajes Ilimitados', 'Hasta 3 Bots activos', 'Constructor multimedia', 'Monitor en vivo', 'Solo Baileys QR']
    },
    {
      id: 'vip',
      name: 'Plan VIP',
      accent: 'border-amber-500/40 text-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/5',
      price: `$${prices.vip.amount} ${prices.vip.currency}`,
      features: ['Meta Cloud API Oficial', '100% en la nube (0 celular)', 'Hasta 10 Bots activos', 'Soporte Slack 24/7', 'Monitor multi-agente']
    }
  ];

  const useCases = [
    { id: 'sales', title: 'Ventas y Reservas', desc: 'Captura prospectos, envía ofertas y agenda citas de forma autónoma 24/7.', icon: '💰' },
    { id: 'support', title: 'Soporte Técnico', desc: 'Resuelve incidencias, dudas frecuentes y entrega enlaces técnicos.', icon: '🛠️' },
    { id: 'customer_service', title: 'Atención al Cliente', desc: 'Brinda respuestas institucionales inmediatas a cualquier hora del día.', icon: '🤝' },
    { id: 'marketing', title: 'Marketing y Campañas', desc: 'Nutre a tu audiencia enviando contenido interactivo y botones dinámicos.', icon: '📣' }
  ];

  return (
    <div className="min-h-screen bg-dark-300 text-gray-200 flex flex-col justify-between selection:bg-primary selection:text-white relative font-sans overflow-x-hidden">
      {/* Círculos de resplandor */}
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none"></div>

      {/* Header Fijo */}
      <header className="border-b border-white/5 bg-dark-300/60 backdrop-blur-md px-6 py-4 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-white text-base tracking-tighter">RW</span>
            <span className="text-lg font-black text-white tracking-tighter uppercase font-mono">
              RedWire<span className="text-primary">Sys</span>
            </span>
          </Link>
          <Link to="/" className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">
            ✕ Cancelar Onboarding
          </Link>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto px-6 py-12 z-10">
        
        {/* Barra de Progreso del Wizard */}
        <div className="mb-12">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 font-mono">
            <span className={step >= 1 ? 'text-primary' : ''}>1. Configura tu Plan</span>
            <span className={step >= 2 ? 'text-primary' : ''}>2. Selecciona Enfoque</span>
            <span className={step >= 3 ? 'text-primary' : ''}>{step === 4 ? '3. Completar Pago' : '3. Crea tu Cuenta'}</span>
          </div>
          <div className="h-1 bg-dark-100 rounded-full relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${Math.min((step / 3) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* CONTENIDO DE PASO 1: SELECCIÓN DE PLAN */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-mono">CONFIGURA TU PLAN DESTINO</h2>
              <p className="text-xs text-gray-400 font-semibold">Elige el plan ideal para tu workspace. Podrás migrar de nivel cuando desees.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all hover:scale-105 ${
                      isSelected 
                        ? p.id === 'vip' 
                          ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/5' 
                          : 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                        : 'border-white/5 bg-dark-200 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                        isSelected 
                          ? p.id === 'vip' ? 'bg-amber-500 text-dark-300' : 'bg-primary text-white'
                          : 'bg-white/5 text-gray-400'
                      }`}>
                        {p.name}
                      </span>
                      {isSelected && <span className={p.id === 'vip' ? 'text-amber-500' : 'text-primary'}>✓</span>}
                    </div>
                    <div className="text-xl font-black text-white font-mono">{p.price}</div>
                    <div className="text-[10px] text-gray-500 font-mono font-bold uppercase mt-1">mensual</div>
                    
                    <ul className="mt-4 text-[11px] text-gray-400 space-y-1.5 font-bold border-t border-white/5 pt-3">
                      {p.features.map((f, i) => (
                        <li key={i} className="truncate">▪ {f}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleNextStep}
                className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
              >
                Siguiente Paso
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO DE PASO 2: ENFOQUE O CASO DE USO */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-mono">¿CUÁL SERÁ TU ENFOQUE?</h2>
              <p className="text-xs text-gray-400 font-semibold">Personalizaremos tu workspace según tus intenciones de automatización conversacional.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {useCases.map((u) => {
                const isSelected = useCase === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setUseCase(u.id)}
                    className={`p-5 border-2 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] text-left flex gap-4 items-start ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                        : 'border-white/5 bg-dark-200 hover:border-white/20'
                    }`}
                  >
                    <span className="text-3xl p-2 bg-white/5 rounded-xl border border-white/10">{u.icon}</span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-tight font-mono">{u.title}</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">{u.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={handlePrevStep}
                className="px-6 py-3.5 bg-dark-100 hover:bg-dark-200 border border-white/5 text-gray-400 hover:text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all"
              >
                Atrás
              </button>
              <button
                onClick={handleNextStep}
                className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
              >
                Siguiente Paso
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO DE PASO 3: REGISTRO DE CUENTA */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-mono">CREA TU WORKSPACE</h2>
              <p className="text-xs text-gray-400 font-semibold">Configura tu correo electrónico y clave de acceso para crear el entorno de bots.</p>
            </div>

            <form onSubmit={handleRegister} className="max-w-md mx-auto w-full pt-4 space-y-5">
              
              {/* Resumen del Plan Seleccionado */}
              <div className="bg-dark-200 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase font-black">Plan Seleccionado</span>
                  <div className="text-xs font-black text-white uppercase font-mono tracking-tight mt-0.5">
                    {selectedPlan === 'free' && '🎁 Plan Free (Gratuito)'}
                    {selectedPlan === 'standard' && '⚡ Plan Standard (Mensajes Ilimitados)'}
                    {selectedPlan === 'vip' && '💎 Plan VIP (Canal Meta Oficial)'}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-[10px] font-mono font-black text-primary hover:underline uppercase"
                >
                  Cambiar
                </button>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider font-bold">Correo Electrónico</label>
                <input 
                  type="email"
                  required
                  placeholder="admin@tuempresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-100 border border-dark-100 focus:border-primary rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-mono"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider font-bold">Contraseña</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-100 border border-dark-100 focus:border-primary rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-mono"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-xs text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center font-bold font-mono">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  className="px-6 py-3.5 bg-dark-100 hover:bg-dark-200 border border-white/5 text-gray-400 hover:text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Configurando Entorno...' : 'Crear Workspace y Entrar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CONTENIDO DE PASO 4: MURO DE PAGO SEGURO STRIPE */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2 text-center">
              <span className="text-[10px] font-black tracking-widest uppercase text-primary font-mono bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                🚀 ¡Registro Completo!
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-mono mt-2">ACTIVA TU ENTORNO PREMIUM</h2>
              <p className="text-xs text-gray-400 font-semibold max-w-md mx-auto">
                Para activar tu piloto automático sin límites de mensajes y bots, completa tu suscripción segura.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-dark-200 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              {/* Resplandor decorativo */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[9px] text-gray-500 font-mono uppercase font-black tracking-wider">Plan Elegido</span>
                  <h3 className="text-xl font-black text-white uppercase font-mono">
                    {selectedPlan === 'standard' ? '⚡ Plan Standard' : '💎 Plan VIP'}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-500 font-mono uppercase font-black tracking-wider">Precio Mensual</span>
                  <div className="text-2xl font-black text-primary font-mono">
                    {selectedPlan === 'standard' 
                      ? `$${prices.standard.amount} ${prices.standard.currency}` 
                      : `$${prices.vip.amount} ${prices.vip.currency}`}
                  </div>
                </div>
              </div>

              {/* Beneficios clave */}
              <ul className="space-y-3.5 mb-8 border-t border-b border-white/5 py-6">
                {selectedPlan === 'standard' ? (
                  <>
                    <li className="flex items-center text-xs text-gray-300 font-bold">
                      <span className="mr-3 text-primary">✔</span> Mensajes ilimitados hacia tus clientes
                    </li>
                    <li className="flex items-center text-xs text-gray-300 font-bold">
                      <span className="mr-3 text-primary">✔</span> Conecta hasta 3 bots de WhatsApp activos
                    </li>
                    <li className="flex items-center text-xs text-gray-300 font-bold">
                      <span className="mr-3 text-primary">✔</span> Consola de diagnóstico y monitor en vivo
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center text-xs text-amber-500 font-bold">
                      <span className="mr-3 text-amber-500">✔</span> API Oficial de Meta Cloud (Cero bloqueos)
                    </li>
                    <li className="flex items-center text-xs text-gray-300 font-bold">
                      <span className="mr-3 text-amber-500">✔</span> Conecta hasta 10 bots de WhatsApp activos
                    </li>
                    <li className="flex items-center text-xs text-gray-300 font-bold">
                      <span className="mr-3 text-amber-500">✔</span> Soporte prioritario Slack 24/7 de ingenieros
                    </li>
                  </>
                )}
              </ul>

              {error && (
                <div className="text-xs text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center font-bold font-mono mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    setError('');
                    try {
                      const response = await api.post('/subscription/checkout-session', { tier: selectedPlan });
                      if (response.data && response.data.url) {
                        window.location.href = response.data.url;
                      } else {
                        throw new Error("No se recibió la URL de Stripe.");
                      }
                    } catch (err) {
                      console.error("Error al iniciar checkout:", err);
                      setError(err.response?.data?.message || err.message || "Error al conectar con Stripe. Intenta de nuevo.");
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-dark-300 font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 animate-pulse"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-dark-300 border-t-transparent rounded-full animate-spin"></div>
                      <span>Cargando Pago Seguro...</span>
                    </>
                  ) : (
                    <span>Proceder al Pago Seguro 💳</span>
                  )}
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                  className="w-full py-3 bg-transparent border border-white/10 hover:border-white/20 text-gray-400 hover:text-white font-mono uppercase tracking-wider text-[10px] rounded-xl transition-all font-bold"
                >
                  Continuar con el Plan FREE por ahora
                </button>
              </div>
            </div>

            <p className="text-center text-[9px] text-gray-600 font-mono font-bold uppercase tracking-wider">
              🔒 Transacciones encriptadas de extremo a extremo procesadas por Stripe
            </p>
          </div>
        )}

      </main>

      {/* Footer Fijo */}
      <footer className="border-t border-white/5 bg-dark-300/40 py-6 text-center text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">
        RedWire System • Tu piloto automático inteligente para WhatsApp
      </footer>
    </div>
  );
};

export default GetStartedWizard;
