import React from 'react';
import { createPortal } from 'react-dom';
import api from '../config/axios';
import useAuthStore from '../store/useAuthStore';

const PricingModal = ({ isOpen, onClose }) => {
  const { user, token, refreshUser } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [prices, setPrices] = React.useState({
    standard: { amount: 29, currency: 'USD' },
    vip: { amount: 99, currency: 'USD' }
  });

  React.useEffect(() => {
    if (!isOpen) return;

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
        console.error('Error fetching dynamic prices in modal', err);
      }
    };

    fetchPrices();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = (newTier) => {
    const amount = newTier === 'VIP' ? prices.vip.amount : prices.standard.amount;
    const text = `Hola EddamCore, deseo mejorar mi plan a ${newTier} de RedWire. Mi correo es: ${user?.email || ''}. ¿Podrían brindarme los datos de Yape para pagar los $${amount}?`;
    window.open(`https://wa.me/51983032706?text=${encodeURIComponent(text)}`, '_blank');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-dark-200 border border-dark-100 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-dark-100 flex justify-between items-center bg-dark-100/30">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">MEJORA TU PLAN</h2>
            <p className="text-gray-400 mt-1">Escala tu automatización con mayor potencia y seguridad.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-dark-200">
          {/* Plan Standard */}
          <div className={`p-8 rounded-3xl border-2 transition-all ${user?.subscriptionTier === 'FREE' ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-dark-100 opacity-50 cursor-not-allowed'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-white">STANDARD</h3>
                <p className="text-primary font-bold text-sm">Ideal para negocios locales</p>
              </div>
              <span className="bg-primary text-dark-300 text-[10px] font-black px-2 py-1 rounded uppercase">Más Popular</span>
            </div>
            
            <div className="text-4xl font-black text-white mb-8">${prices.standard.amount} {prices.standard.currency}<span className="text-lg text-gray-500 font-medium">/mes</span></div>
            
            <ul className="space-y-4 mb-8">
              {[
                'Mensajes Ilimitados',
                'Bots ilimitados',
                'Soporte Técnico',
                'Media (Fotos/Videos/PDF)',
                'Panel de Analytics'
              ].map((item, i) => (
                <li key={i} className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  {item}
                </li>
              ))}
            </ul>

            <button 
              disabled={loading || user?.subscriptionTier !== 'FREE'}
              onClick={() => handleUpgrade('STANDARD')}
              className={`w-full py-4 rounded-xl font-black transition-all ${user?.subscriptionTier === 'FREE' ? 'bg-primary text-dark-300 hover:opacity-90 shadow-lg shadow-primary/20' : 'bg-dark-100 text-gray-500'}`}
            >
              {loading ? 'PROCESANDO...' : user?.subscriptionTier === 'FREE' ? 'ACTIVAR ESTÁNDAR' : 'PLAN ACTUAL'}
            </button>
          </div>

          {/* Plan VIP */}
          <div className={`p-8 rounded-3xl border-2 transition-all ${user?.subscriptionTier === 'STANDARD' ? 'border-yellow-500 bg-yellow-500/5 shadow-xl shadow-yellow-500/10' : 'border-dark-100'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-white">VIP 💎</h3>
                <p className="text-yellow-500 font-bold text-sm">Máxima Seguridad y Escala</p>
              </div>
            </div>
            
            <div className="text-4xl font-black text-white mb-8">${prices.vip.amount} {prices.vip.currency}<span className="text-lg text-gray-500 font-medium">/mes</span></div>
            
            <ul className="space-y-4 mb-8">
              {[
                'API Oficial de Meta',
                'Cero Riesgo de Baneo',
                'Soporte Prioritario 24/7',
                'Integraciones CRM',
                'Inteligencia Artificial'
              ].map((item, i) => (
                <li key={i} className="flex items-center text-sm text-gray-300">
                  <svg className="w-5 h-5 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  {item}
                </li>
              ))}
            </ul>

            <button 
              disabled={loading || user?.subscriptionTier === 'VIP'}
              onClick={() => handleUpgrade('VIP')}
              className={`w-full py-4 rounded-xl font-black transition-all ${user?.subscriptionTier !== 'VIP' ? 'bg-yellow-500 text-dark-300 hover:opacity-90 shadow-lg shadow-yellow-500/20' : 'bg-dark-100 text-gray-500'}`}
            >
              {loading ? 'PROCESANDO...' : user?.subscriptionTier === 'VIP' ? 'PLAN ACTUAL' : 'ACTIVAR VIP'}
            </button>
          </div>
        </div>
        
        <div className="p-6 bg-dark-100/20 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Pago seguro procesado por RedWire Financial</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PricingModal;
