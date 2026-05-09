import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import PricingModal from './PricingModal';
import api from '../config/axios';

const SubscriptionStatus = ({ isCollapsed }) => {
  const { user, refreshUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  
  React.useEffect(() => {
    refreshUser();
    // Refresh every 30 seconds to keep the counter updated
    const interval = setInterval(refreshUser, 30000);
    return () => clearInterval(interval);
  }, [refreshUser]);

  const tier = user?.subscriptionTier || 'FREE';
  const messageCount = user?.totalMessages || 0;
  const maxMessages = 20;
  
  const isFree = tier === 'FREE';
  const percentage = Math.min((messageCount / maxMessages) * 100, 100);

  const getTierColor = () => {
    switch (tier) {
      case 'VIP': return 'text-yellow-400 border-yellow-400';
      case 'STANDARD': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center justify-center py-2 border-t border-dark-100/30">
        <button 
          onClick={() => setIsModalOpen(true)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-lg active:scale-95 ${
            tier === 'VIP' 
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20' 
              : tier === 'STANDARD' 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' 
                : 'bg-dark-100 border-dark-100 text-gray-400 hover:text-white'
          }`}
          title={`Plan: ${tier} - Ver Planes`}
        >
          {tier === 'VIP' ? '💎' : tier === 'STANDARD' ? '⚡' : '🆓'}
        </button>
        <PricingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  }

  const handleManagePlan = async () => {
    if (tier === 'FREE') {
      setIsModalOpen(true);
      return;
    }
    
    setLoadingPortal(true);
    try {
      const response = await api.post('/subscription/portal-session');
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error al abrir portal de facturación", error);
      alert("Error al intentar abrir el portal de facturación de Stripe.");
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="bg-dark-300 p-4 rounded-lg border border-dark-100 shadow-inner">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Plan Actual</span>
        <span className={`text-[10px] px-2 py-0.5 rounded border ${getTierColor()} font-mono font-bold`}>
          {tier}
        </span>
      </div>

      {isFree && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 font-mono">{messageCount} / {maxMessages} mensajes</span>
              <span className={messageCount >= maxMessages ? "text-red-500 font-bold" : "text-primary"}>
                {Math.round(percentage)}%
              </span>
            </div>
            <div className="w-full bg-dark-100 h-1.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-1000 ${messageCount >= maxMessages ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-blue-500'}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 p-2 rounded text-[9px] text-primary/80 leading-tight">
            🚀 <strong>Tip:</strong> Pásate a <b>Standard</b> para enviar mensajes ilimitados y conectar más bots.
          </div>
          
          {messageCount >= maxMessages && (
            <div className="bg-red-500/10 border border-red-500/30 p-2 rounded text-[9px] text-red-400 leading-tight">
              ⚠️ <strong>Límite alcanzado:</strong> Tus flujos se han detenido. Actualiza para reactivarlos.
            </div>
          )}
        </div>
      )}

      {tier === 'STANDARD' && (
        <div className="space-y-3">
          <div className="bg-blue-500/5 border border-blue-500/20 p-2 rounded text-[9px] text-blue-300 leading-snug">
            ✅ <strong>Plan Standard Activo:</strong> Tienes mensajes ilimitados.
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
            <p className="text-[10px] text-yellow-500 font-black mb-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              SEGURIDAD Y RIESGOS
            </p>
            <div className="text-[9px] text-gray-400 leading-relaxed">
              Esta librería emula WhatsApp Web. Para evitar bloqueos:
              <ul className="list-disc ml-3 mt-1 space-y-0.5 text-gray-500">
                <li>No envíes spam masivo.</li>
                <li>Usa nombres reales en tus bots.</li>
              </ul>
              <div className="mt-2 pt-2 border-t border-yellow-500/10">
                <p className="text-yellow-500/80 font-bold uppercase text-[8px]">¿Quieres Cero Riesgo?</p>
                <p className="text-[8px] text-gray-500">Sube a <b>VIP</b> para usar la <b>API Oficial de Meta</b>.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tier === 'VIP' && (
        <div className="bg-yellow-500/5 border border-yellow-500/30 p-3 rounded-lg text-center">
          <p className="text-yellow-500 font-black text-[10px] tracking-widest uppercase">💎 Estatus VIP</p>
          <p className="text-[9px] text-gray-400 mt-1">Conectado vía API Oficial de Meta.</p>
          <p className="text-[9px] text-green-400 font-bold mt-1">Soporte Prioritario 24/7</p>
        </div>
      )}

      <button 
        onClick={handleManagePlan}
        disabled={loadingPortal}
        className={`w-full mt-4 py-2.5 text-[10px] font-black rounded-lg transition-all tracking-widest ${
        tier === 'FREE' 
        ? 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-lg hover:shadow-primary/30 active:scale-95 uppercase' 
        : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:shadow-lg hover:shadow-yellow-500/30 active:scale-95 uppercase'
      }`}>
        {loadingPortal ? 'Cargando...' : tier === 'FREE' ? 'Subir a Standard' : 'Gestionar Suscripción'}
      </button>

      <PricingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default SubscriptionStatus;
