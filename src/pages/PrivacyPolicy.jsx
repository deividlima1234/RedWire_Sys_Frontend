import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-dark-300 text-gray-200 selection:bg-primary selection:text-white font-sans overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-dark-300/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-white text-base tracking-tighter shadow-lg shadow-primary/20">RW</span>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
              <span className="text-xl font-black text-white tracking-tighter uppercase font-mono">
                RedWire<span className="text-primary">Sys</span>
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs text-gray-300 hover:text-white font-bold uppercase tracking-widest transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-mono">Políticas de Privacidad</h1>
          <p className="text-sm text-gray-400 font-semibold">Última actualización: {new Date().toLocaleDateString()}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono text-primary">1. Información que Recopilamos</h2>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
            En RedWire System recopilamos la información mínima necesaria para brindarte nuestros servicios de automatización de WhatsApp. Esto incluye:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-400 leading-relaxed font-semibold space-y-2">
            <li><strong>Datos de cuenta:</strong> Tu dirección de correo electrónico y contraseña encriptada.</li>
            <li><strong>Datos de uso:</strong> Registros de interacción con nuestra plataforma, configuraciones de tus bots y flujos conversacionales.</li>
            <li><strong>Datos de conexión:</strong> Tokens de sesión de WhatsApp (para conexiones Baileys) o tokens de Meta Cloud API, gestionados de forma segura.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono text-primary">2. Uso de la Información</h2>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
            Utilizamos tu información exclusivamente para:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-400 leading-relaxed font-semibold space-y-2">
            <li>Proporcionar, mantener y mejorar nuestros servicios de automatización.</li>
            <li>Procesar tus pagos y gestionar tu suscripción mediante Stripe.</li>
            <li>Enviarte notificaciones importantes sobre actualizaciones del sistema o cambios en las políticas.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono text-primary">3. Protección de Datos y Privacidad en WhatsApp</h2>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
            RedWire System actúa como un procesador de datos de los mensajes que envían tus clientes a tu número conectado. 
            No leemos, vendemos, ni analizamos el contenido de los mensajes de tus clientes para fines comerciales de terceros. 
            Toda la comunicación entre tu sistema y WhatsApp / Meta API está encriptada.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono text-primary">4. Compartir Información</h2>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
            No compartimos tu información personal con terceros, salvo con proveedores de servicios esenciales (como pasarelas de pago o proveedores de infraestructura en la nube) que operan bajo estrictos acuerdos de confidencialidad, o cuando sea requerido por ley.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono text-primary">5. Derechos del Usuario</h2>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
            Tienes derecho a acceder, corregir, exportar o eliminar tus datos personales en cualquier momento desde el panel de administración o contactando a nuestro soporte técnico. Al eliminar tu cuenta, todos los flujos, tokens y datos de uso se purgan de nuestros sistemas.
          </p>
        </section>

      </main>

      <footer className="border-t border-white/5 bg-dark-300/50 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">
            © {new Date().getFullYear()} RedWire System. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
