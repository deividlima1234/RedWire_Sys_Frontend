import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../config/axios';

const GetStartedWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [useCase, setUseCase] = useState('sales');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [betaCode, setBetaCode] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isBetaRegistrationClosed, setIsBetaRegistrationClosed] = useState(false);
  const [showYapeModal, setShowYapeModal] = useState(false);
  const [prices, setPrices] = useState({
    standard: { amount: 29, currency: 'USD' },
    vip: { amount: 99, currency: 'USD' }
  });

  // Cargar el plan de la URL si viene configurado y consultar precios reales
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && ['free', 'standard', 'vip'].includes(planParam.toLowerCase())) {
      setSelectedPlan(planParam.toLowerCase());
    } else {
      setSelectedPlan('standard');
    }

    const stepParam = searchParams.get('step');
    if (stepParam === 'authorize') {
      setStep(4);
    }

    const checkBetaStatus = async () => {
      try {
        const response = await api.get('/auth/beta-status');
        setIsBetaRegistrationClosed(response.data.registrationClosed);
      } catch (err) {
        console.error("Error al verificar disponibilidad de la beta:", err);
      }
    };
    checkBetaStatus();

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
      await api.post('/auth/register', { 
        email, 
        password, 
        acceptPrivacyPolicy: acceptPolicy,
        intendedPlan: selectedPlan 
      });
      
      // 2. Autologin transparente
      const loginResponse = await api.post('/auth/login', { email, password });
      const { token, id, email: userEmail, role, subscriptionTier, betaAuthorized } = loginResponse.data;
      
      // Guardar sesión - por defecto no autorizada
      setAuth(token, { id, email: userEmail, role, subscriptionTier, betaAuthorized: betaAuthorized || false });
      
      // En la fase beta, todos los registros son redirigidos obligatoriamente al muro de verificación
      setStep(4);
    } catch (err) {
      console.error("Error en onboarding:", err);
      setError(err.response?.data?.message || err.response?.data || 'Error en el servidor. Revisa los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!betaCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-beta-code', { code: betaCode });
      if (response.data && response.data.betaAuthorized) {
        setVerificationSuccess(true);
        
        // Actualizar el estado en el store global
        const currentToken = useAuthStore.getState().token;
        const currentUser = useAuthStore.getState().user;
        setAuth(currentToken, {
          ...currentUser,
          betaAuthorized: true,
          subscriptionTier: 'STANDARD'
        });

        // Transición visual triunfante
        setTimeout(() => {
          navigate('/dashboard');
        }, 2200);
      }
    } catch (err) {
      console.error("Error al verificar código beta:", err);
      setError(err.response?.data?.message || err.response?.data || 'Código de autorización inválido o error en la verificación.');
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
      price: '$0 USD (Beta Pioneros)',
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

  if (isBetaRegistrationClosed) {
    return (
      <div className="min-h-screen bg-dark-300 text-gray-200 flex flex-col justify-center items-center px-6 relative font-sans overflow-hidden">
        {/* Círculos de resplandor */}
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none"></div>

        <div className="max-w-md w-full bg-dark-200 border border-white/5 rounded-3xl p-8 text-center shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-3xl mx-auto mb-6 shadow-lg shadow-red-500/5 animate-pulse">
            🔒
          </div>
          <span className="text-[10px] font-black tracking-widest text-red-500 font-mono uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            Fase Beta Completada
          </span>
          <h2 className="text-2xl font-black text-white mt-5 uppercase tracking-tight font-mono">REGISTRO DE PIONEROS CERRADO</h2>
          <p className="text-xs text-gray-400 font-bold mt-3 leading-relaxed">
            Actualmente hemos alcanzado el límite máximo de workspaces para esta fase beta privada y el proceso de selección de nuevos pioneros se encuentra cerrado.
          </p>
          <p className="text-[11px] text-gray-500 font-bold mt-4 leading-relaxed border-t border-white/5 pt-4">
            Agradecemos enormemente tu interés en RedWire System. Reabriremos el registro para el lanzamiento público general próximamente.
          </p>
          
          <div className="mt-8">
            <Link 
              to="/" 
              className="inline-block w-full py-4 bg-primary hover:bg-primary-dark text-white text-xs font-black uppercase tracking-widest text-center rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
            >
              Volver al Inicio 🏠
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                const isDisabled = p.id === 'free';
                return (
                  <div 
                    key={p.id}
                    onClick={() => !isDisabled && setSelectedPlan(p.id)}
                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all relative overflow-hidden ${
                      isDisabled
                        ? 'border-white/5 bg-dark-200/40 opacity-40 cursor-not-allowed hover:scale-100'
                        : isSelected 
                          ? p.id === 'vip' 
                            ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/5' 
                            : 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                          : 'border-white/5 bg-dark-200 hover:border-white/20 hover:scale-105'
                    }`}
                  >
                    {isDisabled && (
                      <div className="absolute inset-0 bg-dark-300/60 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-10">
                        <span className="text-[8px] font-black tracking-widest text-white font-mono uppercase bg-red-500/80 px-2 py-0.5 rounded border border-red-500/20 shadow-md">
                          {p.id === 'free' ? 'Inhabilitado' : 'En Desarrollo'}
                        </span>
                        <p className="text-[9px] text-gray-300 font-bold mt-1.5 leading-tight max-w-[130px]">
                          {p.id === 'free' 
                            ? 'Foco exclusivo en Plan Standard' 
                            : 'Canal Meta API próximamente'}
                        </p>
                      </div>
                    )}

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
                    <div className="text-[10px] text-gray-500 font-mono font-bold uppercase mt-1">
                      {p.id === 'standard' ? 'Gratis de por vida (Pionero)' : 'mensual'}
                    </div>
                    
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

              <div className="flex items-start py-2">
                <div className="flex items-center h-5">
                  <input
                    id="privacy-policy"
                    type="checkbox"
                    required
                    className="w-4 h-4 bg-dark-100 border-dark-100 rounded focus:ring-primary text-primary accent-primary"
                    checked={acceptPolicy}
                    onChange={(e) => setAcceptPolicy(e.target.checked)}
                  />
                </div>
                <div className="ml-3 text-[10px] text-gray-500 text-left">
                  <label htmlFor="privacy-policy" className="font-medium cursor-pointer">
                    He leído y acepto explícitamente los <Link to="/terms" target="_blank" className="text-primary hover:underline">Términos de Servicio</Link> y <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline">Políticas de Privacidad</Link>.
                  </label>
                </div>
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

        {/* CONTENIDO DE PASO 4: MURO DE AUTORIZACIÓN BETA */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-300 w-full max-w-4xl mx-auto">
            <div className="space-y-2 text-center">
              <span className="text-[10px] font-black tracking-widest uppercase text-primary font-mono bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                ✨ PROGRAMA DE PIONEROS • REDWIRE
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-mono mt-2">DESBLOQUEA TU WORKSPACE</h2>
              <p className="text-xs text-gray-400 font-semibold max-w-lg mx-auto">
                Tu cuenta ha sido creada. Para comenzar a automatizar con RedWire System, selecciona cómo deseas ingresar.
              </p>
            </div>

            {verificationSuccess ? (
              <div className="max-w-md mx-auto bg-dark-200 border border-green-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-500 text-3xl flex items-center justify-center rounded-full mx-auto animate-bounce mb-6">
                  🎉
                </div>
                <h3 className="text-xl font-black text-white uppercase font-mono">¡ACCESO AUTORIZADO!</h3>
                <p className="text-xs text-gray-400 font-semibold mt-4">
                  Tu plan ha sido activado exitosamente. Redireccionando a tu espacio de trabajo...
                </p>
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-6"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* Opción 1: Tengo Código */}
                <div className="bg-dark-200 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-white/10 transition-colors">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl text-2xl mb-6 shadow-inner">🔑</div>
                    <h3 className="text-xl font-black text-white uppercase font-mono tracking-tight">Tengo un Código</h3>
                    <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                      Si el equipo de EddamCore ya te proporcionó un código de invitación pionero para acceder, ingrésalo aquí.
                    </p>
                  </div>
                  
                  <form onSubmit={handleVerifyCode} className="space-y-4 mt-8">
                    <input 
                      type="text"
                      required
                      placeholder="RW-BETA-XXXX"
                      value={betaCode}
                      onChange={(e) => setBetaCode(e.target.value.toUpperCase())}
                      className="w-full bg-dark-100 border border-white/5 focus:border-primary rounded-xl px-4 py-3.5 text-sm text-white text-center font-mono focus:outline-none transition-all tracking-widest placeholder:opacity-30"
                      disabled={isLoading}
                      maxLength={12}
                    />
                    {error && <div className="text-[10px] text-red-500 font-bold bg-red-500/10 p-2 rounded-lg text-center">{error}</div>}
                    <button
                      type="submit"
                      disabled={isLoading || !betaCode.trim()}
                      className="w-full py-3.5 bg-dark-100 hover:bg-dark-200 border border-primary/20 hover:border-primary/50 text-primary font-black uppercase tracking-widest text-xs rounded-xl transition-all flex justify-center items-center gap-2"
                    >
                      {isLoading ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : 'Autorizar Código'}
                    </button>
                  </form>
                </div>

                {/* Opción 2: Saltar Fila / Comprar Plan */}
                <div className={`border rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all ${
                  selectedPlan === 'vip' 
                    ? 'bg-gradient-to-b from-dark-200 to-dark-200 border-yellow-500/30 hover:border-yellow-500/50' 
                    : 'bg-gradient-to-b from-dark-200 to-dark-200 border-amber-500/20 hover:border-amber-500/40'
                }`}>
                  <div className={`absolute top-0 right-0 text-dark-300 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-md ${
                    selectedPlan === 'vip' ? 'bg-yellow-500' : 'bg-amber-500'
                  }`}>
                    {selectedPlan === 'vip' ? 'Acceso Prioritario' : 'Recomendado'}
                  </div>
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-3xl rounded-full pointer-events-none ${
                    selectedPlan === 'vip' ? 'bg-yellow-500/10' : 'bg-amber-500/5'
                  }`}></div>

                  <div className="space-y-4 relative z-10">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl mb-6 shadow-inner ${
                      selectedPlan === 'vip' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      {selectedPlan === 'vip' ? '💎' : '⚡'}
                    </div>
                    <h3 className="text-xl font-black text-white uppercase font-mono tracking-tight">
                      {selectedPlan === 'vip' ? 'Activar Infraestructura VIP' : 'Saltar la fila'}
                    </h3>
                    <p className="text-xs text-gray-300 font-semibold leading-relaxed">
                      {selectedPlan === 'vip' 
                        ? 'Obtén integración directa con la API oficial de Meta Cloud y despliegue prioritario de tu bot empresarial.' 
                        : 'No esperes por un código gratuito. Adquiere tu plan directamente y obtén acceso inmediato a tu workspace.'}
                    </p>
                    
                    <div className="bg-dark-300/80 rounded-xl p-4 border border-white/5 mt-6 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Plan Seleccionado</span>
                        <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded ${
                          selectedPlan === 'vip' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-white/10 text-white'
                        }`}>
                          {selectedPlan}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inversión</span>
                        <span className={`text-xl font-black font-mono ${
                          selectedPlan === 'vip' ? 'text-yellow-500' : 'text-amber-500'
                        }`}>
                          {selectedPlan === 'vip' ? `$${prices.vip.amount}` : `$${prices.standard.amount}`} USD
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowYapeModal(true)}
                    className={`w-full py-4 text-dark-300 font-black uppercase tracking-widest text-xs rounded-xl transition-all hover:scale-[1.02] mt-6 relative z-10 ${
                      selectedPlan === 'vip' 
                        ? 'bg-yellow-500 hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]' 
                        : 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                    }`}
                  >
                    Contactar Soporte y Activar 🚀
                  </button>
                </div>
              </div>
            )}
            
            {!verificationSuccess && (
              <p className="text-center text-[9px] text-gray-600 font-mono font-bold uppercase tracking-wider mt-8">
                EddamCore © RedWire System Pioneers Program • Beta Limitada Privada
              </p>
            )}
          </div>
        )}

        {/* MODAL YAPE */}
        {showYapeModal && (
          <div className="fixed inset-0 bg-dark-300/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-dark-200 border border-white/10 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setShowYapeModal(false)} 
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-dark-100 hover:bg-dark-300 text-gray-400 hover:text-white rounded-full transition-colors"
              >
                ✕
              </button>
              
              <div className="text-center space-y-5">
                <div className="w-16 h-16 bg-[#7408B1] text-white rounded-2xl flex items-center justify-center mx-auto text-3xl font-black shadow-lg shadow-[#7408B1]/30">
                  Y
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase font-mono tracking-tight">Pago vía Yape</h3>
                  <p className="text-xs text-gray-400 mt-2 font-semibold px-2">Escanea el código QR y envíanos el comprobante para habilitar tu Plan {selectedPlan.toUpperCase()}.</p>
                </div>
                
                <div className="bg-white p-2 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center border-4 border-[#7408B1]/20 shadow-inner">
                  <div className="text-gray-400 text-[10px] font-bold text-center border-2 border-dashed border-gray-200 w-full h-full rounded-xl flex flex-col items-center justify-center">
                    <span className="text-2xl mb-2">📱</span>
                    Coloca tu QR de Yape aquí
                  </div>
                </div>

                <div className="bg-dark-300 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Monto Total</div>
                  <div className="text-3xl font-black text-[#7408B1] font-mono mt-1">
                    {selectedPlan === 'vip' ? `$${prices.vip.amount}` : `$${prices.standard.amount}`} USD
                  </div>
                  <div className="text-[9px] text-gray-400 mt-2 uppercase font-bold">* Convierte a Soles (PEN) según el tipo de cambio del día</div>
                </div>

                <a
                  href={`https://wa.me/51983032706?text=${encodeURIComponent(
                    `Hola EddamCore, acabo de pagar por el Plan ${selectedPlan.toUpperCase()} de RedWire. Adjunto mi comprobante para recibir mi código de acceso. Correo: ${user?.email || email || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#7408B1] hover:bg-[#5a068a] text-white font-black uppercase tracking-widest text-[11px] rounded-xl transition-all shadow-lg hover:shadow-[#7408B1]/30 hover:-translate-y-1 flex items-center justify-center gap-2 mt-6"
                >
                  💬 Enviar Comprobante a WhatsApp
                </a>
              </div>
            </div>
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
