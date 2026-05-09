import React, { useState } from 'react';

const AntiBlockGuide = () => {
  const [activeTab, setActiveTab] = useState('warmup');

  // Estados del Simulador de Calentamiento
  const [chipAge, setChipAge] = useState(1);

  // Estados del Checklist Profesional
  const [checkedBusiness, setCheckedBusiness] = useState(false);
  const [checkedPhoto, setCheckedPhoto] = useState(false);
  const [checkedCatalog, setCheckedCatalog] = useState(false);
  const [checkedAddress, setCheckedAddress] = useState(false);
  const [checkedFacebook, setCheckedFacebook] = useState(false);

  // Estados del Calculador de Riesgo
  const [usageType, setUsageType] = useState('inbound'); // 'inbound' o 'outbound'
  const [optOutOption, setOptOutOption] = useState('yes'); // 'yes' o 'no'
  
  // Feedback de copiado
  const [copiedTextId, setCopiedTextId] = useState(null);

  // Fórmulas dinámicas para el Simulador de Calentamiento
  const getWarmupRecommendation = (days) => {
    if (days <= 3) {
      return {
        stage: "Fase 1: Enfriamiento e Interacción Humana ❄️",
        maxChats: "5 a 10 chats diarios",
        recommendation: "Usa el chip SOLO de forma manual. Escríbele a familiares, agrégalos a tus contactos y pídeles que te respondan. No conectes ningún bot todavía.",
        riskLevel: "CRÍTICO si automatizas",
        progressColor: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
        percentage: 15
      };
    } else if (days <= 7) {
      return {
        stage: "Fase 2: Calentamiento Inicial 🔥",
        maxChats: "15 a 25 chats diarios",
        recommendation: "Puedes conectar tu primer bot en RedWire System. Configura respuestas simples a flujos Inbound de clientes que ya te conocen. Evita envíos masivos.",
        riskLevel: "MODERADO",
        progressColor: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]",
        percentage: 45
      };
    } else if (days <= 14) {
      return {
        stage: "Fase 3: Consolidación de Tráfico 🚀",
        maxChats: "40 a 60 chats diarios",
        recommendation: "Tu número ya tiene tráfico histórico en los servidores de Meta. Puedes implementar flujos interactivos más avanzados con botones y archivos multimedia.",
        riskLevel: "BAJO",
        progressColor: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]",
        percentage: 75
      };
    } else {
      return {
        stage: "Fase 4: Autopiloto Seguro 🛡️",
        maxChats: "Ilimitados (Tráfico de Negocios)",
        recommendation: "¡Número completamente maduro! El algoritmo de Meta lo considera una línea comercial real. Mantén siempre las buenas prácticas y ofrece salidas claras.",
        riskLevel: "SEGURO",
        progressColor: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]",
        percentage: 100
      };
    }
  };

  const warmup = getWarmupRecommendation(chipAge);

  // Cálculo del Score de Riesgo Dinámico
  const calculateRiskScore = () => {
    let score = 100; // Iniciamos en riesgo crítico

    // Deducciones de riesgo por buenas prácticas
    if (checkedBusiness) score -= 20;
    if (checkedPhoto) score -= 10;
    if (checkedCatalog) score -= 15;
    if (checkedAddress) score -= 10;
    if (checkedFacebook) score -= 15;
    
    if (chipAge > 3 && chipAge <= 7) score -= 15;
    if (chipAge > 7) score -= 30;

    if (optOutOption === 'yes') score -= 15;
    
    // Incremento extremo de riesgo por Outbound
    if (usageType === 'outbound') score += 40;

    // Asegurar límites del score entre 10% y 100%
    if (score < 10) score = 10;
    if (score > 100) score = 100;

    return score;
  };

  const riskScore = calculateRiskScore();

  const getRiskLabel = (score) => {
    if (score <= 35) return { text: "Riesgo Bajo 🟢", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", shadow: "shadow-green-500/10" };
    if (score <= 65) return { text: "Riesgo Moderado 🟡", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", shadow: "shadow-yellow-500/10" };
    return { text: "Riesgo Alto 🔴", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", shadow: "shadow-red-500/10" };
  };

  const riskLabel = getRiskLabel(riskScore);

  // Plantillas Opt-Out para copiar de un clic
  const optOutTemplates = [
    {
      id: 1,
      title: "Clásica con Botón de Acción",
      text: "Si deseas detener esta conversación, escribe en cualquier momento *'SALIR'* para suspender los mensajes automáticos. ❌"
    },
    {
      id: 2,
      title: "Profesional Corporativa",
      text: "En cumplimiento con nuestras políticas de privacidad, puedes desuscribirte de este canal respondiendo con la palabra *'CANCELAR'*. Que tengas un excelente día."
    },
    {
      id: 3,
      title: "Cercana y Amigable",
      text: "Pd: No quiero ser molesto. Si ya no deseas recibir mis respuestas automatizadas, solo dime *'PARAR'* y desactivaré el bot de inmediato. 😊"
    }
  ];

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* HEADER DE CENTRO DE SEGURIDAD */}
      <div className="p-6 bg-dark-200 border border-white/5 rounded-3xl relative overflow-hidden shadow-xl text-left">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">
                Cuidado del Canal / Antiban Suite
              </span>
            </div>
            <h1 className="text-2xl font-black text-white font-mono uppercase tracking-tight">Centro de Seguridad y Guía Anti-Bloqueo</h1>
            <p className="text-xs text-gray-400 font-semibold max-w-2xl leading-relaxed">
              Meta monitorea constantemente el comportamiento de las líneas de WhatsApp. Esta guía interactiva te ayuda a evaluar el riesgo de tu chip, calentarlo adecuadamente y mantener tus bots operativos en entornos de producción reales sin baneos.
            </p>
          </div>

          {/* INDICADOR DE RIESGO GLOWING GAUGE */}
          <div className={`p-5 rounded-2xl border ${riskLabel.bg} ${riskLabel.shadow} transition-all duration-300 w-full md:w-64 shrink-0 text-center`}>
            <span className="text-[10px] font-black font-mono uppercase tracking-widest text-gray-400">Nivel de Riesgo de Baneo</span>
            <div className="text-3xl font-black font-mono tracking-tighter mt-1 mb-1 text-white">
              {riskScore}%
            </div>
            <div className={`text-xs font-black font-mono uppercase ${riskLabel.color}`}>
              {riskLabel.text}
            </div>
            
            {/* Barra de Progreso Interna */}
            <div className="w-full h-1.5 bg-dark-100 rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  riskScore <= 35 ? 'bg-green-500' : riskScore <= 65 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${riskScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('warmup')}
          className={`px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'warmup' 
              ? 'bg-primary text-dark-300 font-black shadow-lg shadow-primary/10' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          🔥 Calentador de Números
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'profile' 
              ? 'bg-primary text-dark-300 font-black shadow-lg shadow-primary/10' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          📊 Checklist de Perfil
        </button>
        <button
          onClick={() => setActiveTab('optout')}
          className={`px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'optout' 
              ? 'bg-primary text-dark-300 font-black shadow-lg shadow-primary/10' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          🛑 Plantillas de Salida
        </button>
        <button
          onClick={() => setActiveTab('golden-rules')}
          className={`px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'golden-rules' 
              ? 'bg-primary text-dark-300 font-black shadow-lg shadow-primary/10' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          ⭐ 4 Reglas de Oro
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑAS */}
      <div className="space-y-6">

        {/* 1. TAB: WARMUP SIMULATOR */}
        {activeTab === 'warmup' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Control Deslizante */}
            <div className="lg:col-span-1 p-6 bg-dark-200 border border-white/5 rounded-3xl space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">Ajuste Dinámico</span>
                <h3 className="text-md font-black text-white font-mono uppercase">Edad de tu Chip / Línea</h3>
                <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
                  Desplaza la barra para seleccionar los días que lleva en uso la tarjeta SIM desde que fue comprada o activada.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center font-mono font-black text-xs">
                  <span className="text-gray-400">Tiempo de Uso:</span>
                  <span className="text-primary text-sm">{chipAge} {chipAge === 1 ? 'Día' : 'Días'}</span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="30"
                  value={chipAge}
                  onChange={(e) => setChipAge(parseInt(e.target.value))}
                  className="w-full accent-primary bg-dark-100 h-2 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[9px] font-black text-gray-500 font-mono">
                  <span>1 DÍA (NUEVO)</span>
                  <span>14 DÍAS</span>
                  <span>30 DÍAS+ (MADURO)</span>
                </div>
              </div>
            </div>

            {/* Recomendaciones Dinámicas */}
            <div className="lg:col-span-2 p-6 bg-dark-200 border border-white/5 rounded-3xl flex flex-col justify-between gap-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
              
              <div className="space-y-4 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-black font-mono uppercase tracking-widest text-gray-400">Etapa de Calentamiento</span>
                    <h2 className="text-lg font-black text-white font-mono uppercase tracking-tight">{warmup.stage}</h2>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-[10px] font-black font-mono uppercase tracking-widest text-gray-400">Riesgo de Automatización</span>
                    <div className="text-xs font-black font-mono uppercase text-primary">{warmup.riskLevel}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Volumen Diario Recomendado</label>
                    <div className="text-xl font-black text-white font-mono tracking-tight">{warmup.maxChats}</div>
                    <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                      Límite sugerido de interacciones automatizadas por día para evitar alertas de spam de Meta.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Pauta de Operación</label>
                    <p className="text-xs text-gray-300 font-semibold leading-relaxed">
                      {warmup.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Barra de Progreso Dinámica */}
              <div className="space-y-2 pt-4 border-t border-white/5 relative">
                <div className="flex justify-between items-center text-[10px] font-black font-mono text-gray-400 uppercase">
                  <span>Madurez del Chip</span>
                  <span>{warmup.percentage}% Completado</span>
                </div>
                <div className="w-full h-2.5 bg-dark-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${warmup.progressColor}`}
                    style={{ width: `${warmup.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB: CHECKLIST DE PERFIL */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Checklist interactivo */}
            <div className="p-6 bg-dark-200 border border-white/5 rounded-3xl space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">Meta Trust Factor</span>
                <h3 className="text-md font-black text-white font-mono uppercase">Optimización del Perfil de WhatsApp</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Marcar estos elementos simula un perfil legítimo y reduce significativamente el riesgo de bloqueo por comportamiento automatizado automatizado.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 bg-dark-100/50 hover:bg-dark-100 border border-white/5 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedBusiness}
                    onChange={(e) => setCheckedBusiness(e.target.checked)}
                    className="mt-1 accent-primary w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white font-mono uppercase">Usar WhatsApp Business</span>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                      Meta tolera la automatización principalmente en perfiles comerciales oficiales. Nunca uses bots en chips con WhatsApp personal.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-dark-100/50 hover:bg-dark-100 border border-white/5 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedPhoto}
                    onChange={(e) => setCheckedPhoto(e.target.checked)}
                    className="mt-1 accent-primary w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white font-mono uppercase">Foto de Perfil Profesional</span>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                      Sube el logo de tu empresa o una foto clara de atención al cliente. Un número sin foto es sinónimo de bot fraudulento.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-dark-100/50 hover:bg-dark-100 border border-white/5 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedCatalog}
                    onChange={(e) => setCheckedCatalog(e.target.checked)}
                    className="mt-1 accent-primary w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white font-mono uppercase">Catálogo de Productos Configurado</span>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                      Añade productos o servicios al catálogo nativo de WhatsApp Business. Esto asocia tu número con intenciones de comercio real.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-dark-100/50 hover:bg-dark-100 border border-white/5 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedAddress}
                    onChange={(e) => setCheckedAddress(e.target.checked)}
                    className="mt-1 accent-primary w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white font-mono uppercase">Perfil de Negocio Completo</span>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                      Configura el horario comercial, descripción física de la tienda, correo de soporte y sitio web en la información de perfil.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-dark-100/50 hover:bg-dark-100 border border-white/5 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedFacebook}
                    onChange={(e) => setCheckedFacebook(e.target.checked)}
                    className="mt-1 accent-primary w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white font-mono uppercase">Enlazado a Página de Facebook / Instagram</span>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                      Vincula el WhatsApp con tu FanPage oficial desde la suite de Meta Business. Esto consolida tu identidad comercial de por vida.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Calculador de Variables de Riesgo */}
            <div className="p-6 bg-dark-200 border border-white/5 rounded-3xl flex flex-col justify-between gap-6">
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">Análisis de Comportamiento</span>
                  <h3 className="text-md font-black text-white font-mono uppercase">Tipo de Uso del Canal</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    Cómo pretendes iniciar conversaciones con tus clientes. Las campañas directas masivas representan el mayor riesgo de bloqueo automático.
                  </p>
                </div>

                {/* Selección de Tipo de Tráfico */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setUsageType('inbound')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      usageType === 'inbound' 
                        ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' 
                        : 'bg-dark-100/50 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-lg">📥</span>
                    <div>
                      <span className="text-xs font-black text-white font-mono uppercase">Inbound Puro</span>
                      <p className="text-[9px] text-gray-400 font-semibold leading-tight mt-0.5">
                        Los clientes te escriben primero (desde ads, qr, enlaces de web).
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setUsageType('outbound')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                      usageType === 'outbound' 
                        ? 'bg-red-500/5 border-red-500/40 shadow-lg shadow-red-500/5' 
                        : 'bg-dark-100/50 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-lg">📤</span>
                    <div>
                      <span className="text-xs font-black text-white font-mono uppercase">Outbound Directo</span>
                      <p className="text-[9px] text-gray-400 font-semibold leading-tight mt-0.5">
                        El bot les envía mensajes masivos a agendas frías no registradas.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Cláusula de salida */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black font-mono uppercase tracking-widest text-gray-400">¿Ofreces opción de salida (Opt-out)?</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                      <input
                        type="radio"
                        name="optout"
                        value="yes"
                        checked={optOutOption === 'yes'}
                        onChange={() => setOptOutOption('yes')}
                        className="accent-primary"
                      />
                      Sí, indico cómo detener los mensajes automáticos.
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                      <input
                        type="radio"
                        name="optout"
                        value="no"
                        checked={optOutOption === 'no'}
                        onChange={() => setOptOutOption('no')}
                        className="accent-primary"
                      />
                      No, no lo incluyo en mis flujos.
                    </label>
                  </div>
                </div>
              </div>

              {/* Recomendación Final del Algoritmo */}
              <div className="p-4 bg-dark-100 border border-white/5 rounded-2xl text-left text-xs font-semibold">
                <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">Veredicto del Analista</span>
                <p className="text-gray-300 mt-1 leading-relaxed">
                  {riskScore <= 35 
                    ? "✓ Tu número presenta excelentes credenciales comerciales. Estás operando en un entorno sumamente seguro de bajo riesgo de baneo." 
                    : riskScore <= 65 
                    ? "⚠️ Estás operando en nivel moderado. Te sugerimos activar más checklist de perfil comercial y asegurar la madurez de tu chip para evitar cierres preventivos." 
                    : "🚫 Alerta: Tu perfil está en riesgo severo. El envío de mensajes masivos directos (outbound) en chips jóvenes sin calentamiento previo resultará en bloqueos recurrentes."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. TAB: PLANTILLAS OPT-OUT */}
        {activeTab === 'optout' && (
          <div className="p-6 bg-dark-200 border border-white/5 rounded-3xl text-left space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
              <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">La Opción de Salida</span>
              <h3 className="text-md font-black text-white font-mono uppercase">Plantillas de Desuscripción Recomendadas</h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed max-w-3xl">
                El motivo número uno de baneo en WhatsApp son los reportes manuales que los destinatarios hacen al ver un bot molesto. Si les das una salida rápida de texto (Opt-out), preferirán escribir esa palabra clave en lugar de presionar el botón de reporte.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {optOutTemplates.map((tmpl) => (
                <div 
                  key={tmpl.id} 
                  className="bg-dark-100 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-primary font-mono uppercase tracking-wider">{tmpl.title}</span>
                    <div className="p-3.5 bg-dark-200 border border-white/5 rounded-xl text-xs text-gray-300 font-mono select-all leading-relaxed break-words whitespace-pre-wrap">
                      {tmpl.text}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(tmpl.id, tmpl.text)}
                    className={`w-full py-2.5 font-mono font-black uppercase text-[10px] tracking-wider rounded-xl transition-all ${
                      copiedTextId === tmpl.id 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {copiedTextId === tmpl.id ? '✓ ¡Copiado con Éxito!' : '📋 Copiar Plantilla'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. TAB: GOLDEN RULES */}
        {activeTab === 'golden-rules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Regla 1 */}
            <div className="p-6 bg-dark-200 border border-white/5 rounded-3xl relative overflow-hidden flex flex-col justify-between gap-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
              <div className="space-y-2 relative">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 border border-primary/20 text-primary font-mono font-black w-6 h-6 rounded-full flex items-center justify-center">1</span>
                  <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">La Regla del Inbound</span>
                </div>
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-tight">Los Clientes Deben Escribirte Primero</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Asegúrate de que tus bot inicien la conversación porque el cliente vio un anuncio con enlace a tu WhatsApp, escaneó un código QR físico, o hizo clic en un botón de tu web. Si eres tú quien les habla primero con ofertas, los bots de Meta te detectarán por volumen no solicitado y suspenderán el número.
                </p>
              </div>
            </div>

            {/* Regla 2 */}
            <div className="p-6 bg-dark-200 border border-white/5 rounded-3xl relative overflow-hidden flex flex-col justify-between gap-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
              <div className="space-y-2 relative">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 border border-primary/20 text-primary font-mono font-black w-6 h-6 rounded-full flex items-center justify-center">2</span>
                  <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">El Calentamiento Mandatorio</span>
                </div>
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-tight">Nunca Automatices Chips Nuevos de un Día</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Un chip recién comprado que recibe 150 chats automáticos el primer día activa alarmas de fraude de Meta de manera fulminante. Dedica la primera semana de tu número a calentarlo: chatea manualmente, únete a grupos, habla con amigos, haz llamadas de voz convencionales. Desarrolla tráfico histórico normal.
                </p>
              </div>
            </div>

            {/* Regla 3 */}
            <div className="p-6 bg-dark-200 border border-white/5 rounded-3xl relative overflow-hidden flex flex-col justify-between gap-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
              <div className="space-y-2 relative">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 border border-primary/20 text-primary font-mono font-black w-6 h-6 rounded-full flex items-center justify-center">3</span>
                  <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">Perfil Comercial Completo</span>
                </div>
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-tight">Utiliza WhatsApp Business Oficial</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Meta confía en marcas que optimizan su identidad. Completa el catálogo, foto de perfil comercial, dirección de la oficina, horarios de atención, etc. El enlazado con tu FanPage oficial consolida tu identidad comercial de por vida.
                </p>
              </div>
            </div>

            {/* Regla 4 */}
            <div className="p-6 bg-dark-200 border border-white/5 rounded-3xl relative overflow-hidden flex flex-col justify-between gap-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
              <div className="space-y-2 relative">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 border border-primary/20 text-primary font-mono font-black w-6 h-6 rounded-full flex items-center justify-center">4</span>
                  <span className="text-[10px] font-black font-mono uppercase tracking-widest text-primary">La Desuscripción Obligatoria</span>
                </div>
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-tight">Ofrece Salidas Claras y Rápidas</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Es un millón de veces preferible que un cliente se dé de baja escribiendo una palabra clave (ej. SALIR) en tu chatbot a que presione el gran botón rojo de 'Reportar Spam'. Las opciones de opt-out son el escudo número uno en entornos reales de producción masiva.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default AntiBlockGuide;
