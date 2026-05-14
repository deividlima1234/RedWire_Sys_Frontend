import React, { useState, useEffect } from 'react';
import api from '../../config/axios';

const AdminPricing = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Estados de configuración
  const [pricing, setPricing] = useState({
    standardPrice: '29.00',
    vipPrice: '99.00',
    yapePhone: '983032706',
    yapeName: 'EddamCore (RedWire)',
    yapeQrData: ''
  });

  useEffect(() => {
    fetchPricingSettings();
  }, []);

  const fetchPricingSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/pricing-settings');
      setPricing(response.data);
    } catch (error) {
      console.error('Error fetching pricing settings:', error);
      showStatus('Error al cargar la configuración.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.post('/admin/pricing-settings', pricing);
      setPricing(response.data);
      showStatus('¡Configuración guardada con éxito!', 'success');
    } catch (error) {
      console.error('Error saving pricing settings:', error);
      const errorMsg = error.response?.data?.details || error.response?.data?.message || 'Error al guardar los cambios.';
      showStatus(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showStatus('Por favor, selecciona un archivo de imagen válido.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar para evitar payloads gigantes
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a base64 con compresión
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPricing(prev => ({ ...prev, yapeQrData: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQr = () => {
    setPricing(prev => ({ ...prev, yapeQrData: '' }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-mono text-xs animate-pulse uppercase tracking-widest">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase font-mono">GESTIÓN DE PRECIOS & PAGOS v2</h1>
          <p className="text-gray-400 mt-1 font-medium text-sm">Configura los costos de suscripción y los datos de recepción de Yape.</p>
        </div>
        <div className="flex items-center gap-3">
           {message.text && (
             <div className={`px-4 py-2 rounded-lg text-xs font-bold animate-in fade-in zoom-in duration-300 ${
               message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
             }`}>
               {message.type === 'success' ? '✓' : '✗'} {message.text}
             </div>
           )}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Precios de Planes */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-dark-200 border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">💰</div>
              <div>
                <h2 className="text-lg font-black text-white uppercase font-mono tracking-tight">Costos de Suscripción</h2>
                <p className="text-xs text-gray-500 font-medium">Define los precios que verán los clientes en la plataforma.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Precio Plan STANDARD (USD)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="text"
                    value={pricing.standardPrice}
                    onChange={(e) => setPricing({...pricing, standardPrice: e.target.value})}
                    className="w-full pl-8 pr-4 py-4 bg-dark-100 border border-white/5 focus:border-primary rounded-2xl text-xl font-black text-white focus:outline-none transition-all font-mono"
                    placeholder="29.00"
                  />
                </div>
                <p className="text-[10px] text-gray-500 italic px-1">Se muestra en Landing y Onboarding.</p>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Precio Plan VIP (USD)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="text"
                    value={pricing.vipPrice}
                    onChange={(e) => setPricing({...pricing, vipPrice: e.target.value})}
                    className="w-full pl-8 pr-4 py-4 bg-dark-100 border border-white/5 focus:border-amber-500 rounded-2xl text-xl font-black text-white focus:outline-none transition-all font-mono"
                    placeholder="99.00"
                  />
                </div>
                <p className="text-[10px] text-gray-500 italic px-1">Orientado a empresas con API de Meta.</p>
              </div>
            </div>
          </section>

          <section className="bg-dark-200 border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-xl">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7408B1]/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#7408B1]/10 flex items-center justify-center text-[#7408B1] text-xl">📱</div>
              <div>
                <h2 className="text-lg font-black text-white uppercase font-mono tracking-tight">Pasarela Yape (Manual)</h2>
                <p className="text-xs text-gray-500 font-medium">Configura los datos para que los clientes en Perú paguen vía QR.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Número de Teléfono Yape</label>
                  <input
                    type="text"
                    value={pricing.yapePhone}
                    onChange={(e) => setPricing({...pricing, yapePhone: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-100 border border-white/5 focus:border-[#7408B1] rounded-xl text-sm font-bold text-white focus:outline-none transition-all font-mono"
                    placeholder="983032706"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Nombre del Titular</label>
                  <input
                    type="text"
                    value={pricing.yapeName}
                    onChange={(e) => setPricing({...pricing, yapeName: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-100 border border-white/5 focus:border-[#7408B1] rounded-xl text-sm font-bold text-white focus:outline-none transition-all font-mono"
                    placeholder="EddamCore (RedWire)"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Código QR de Yape</label>
                <div className={`relative group border-2 border-dashed rounded-3xl transition-all h-full min-h-[180px] flex flex-col items-center justify-center p-4 overflow-hidden ${
                  pricing.yapeQrData ? 'border-primary/20 bg-primary/5' : 'border-white/5 hover:border-white/10 bg-dark-100/50'
                }`}>
                  {pricing.yapeQrData ? (
                    <>
                      <img src={pricing.yapeQrData} alt="QR Yape" className="max-h-32 rounded-lg shadow-2xl" />
                      <button
                        type="button"
                        onClick={handleRemoveQr}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"
                        title="Quitar QR"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </>
                  ) : (
                    <div className="text-center space-y-2 cursor-pointer" onClick={() => document.getElementById('qr-upload').click()}>
                      <div className="text-3xl">📷</div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Subir Imagen QR</p>
                      <input
                        id="qr-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-10 py-4 bg-primary hover:bg-primary-dark text-dark-300 font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span>💾 Guardar Configuración Global</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Columna Derecha: Previsualización en Vivo para Clientes */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono ml-2">Vista previa para el cliente</h2>
          
          <div className="bg-dark-200 border border-white/10 rounded-[32px] p-8 relative shadow-2xl overflow-hidden animate-pulse-subtle">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#7408B1] text-white flex items-center justify-center rounded-bl-3xl text-xl font-black z-10">Y</div>
            
            <div className="text-center space-y-5 relative z-10">
              <div>
                <h3 className="text-lg font-black text-white uppercase font-mono tracking-tight">Pago vía Yape</h3>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">Escanea el código QR para pagar tu plan.</p>
              </div>
              
              <div className="bg-white p-2 rounded-2xl mx-auto w-44 h-44 flex items-center justify-center border-4 border-[#7408B1]/20 shadow-inner overflow-hidden">
                {pricing.yapeQrData ? (
                  <img src={pricing.yapeQrData} alt="QR Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-gray-300 text-[8px] font-bold text-center border-2 border-dashed border-gray-100 w-full h-full rounded-xl flex flex-col items-center justify-center p-4">
                    <span className="text-xl mb-1 opacity-20">📱</span>
                    <span className="opacity-40 uppercase tracking-widest">Sin QR configurado</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Número de Recepción</div>
                <div className="text-base font-black text-white font-mono">{pricing.yapePhone || '000 000 000'}</div>
                <div className="text-[9px] text-gray-500 font-bold truncate">{pricing.yapeName || 'Sin Titular'}</div>
              </div>

              <div className="bg-dark-300/50 p-4 rounded-2xl border border-white/5">
                <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Monto Estándar</div>
                <div className="text-2xl font-black text-[#7408B1] font-mono mt-0.5">${pricing.standardPrice} <span className="text-xs">USD</span></div>
              </div>

              <button disabled className="w-full py-3 bg-[#7408B1]/20 text-[#7408B1] border border-[#7408B1]/30 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-default opacity-50">
                💬 Enviar Comprobante
              </button>
            </div>
            
            {/* Ambient effects */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#7408B1]/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-dark-200/50 border border-white/5 rounded-2xl p-5">
             <div className="flex gap-3 items-start">
               <span className="text-lg">💡</span>
               <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                 Esta es una representación exacta de cómo verán los clientes el modal de pago durante su registro (Onboarding) o al mejorar su plan desde el Dashboard. Asegúrate de que el QR sea legible y el número sea correcto.
               </p>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminPricing;
