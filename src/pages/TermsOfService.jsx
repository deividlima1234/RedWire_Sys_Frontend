import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-mono">Términos de Servicio</h1>
          <p className="text-sm text-gray-400 font-semibold">Última actualización: {new Date().toLocaleDateString()}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono text-primary">1. Aceptación de los Términos</h2>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
            Al registrarse y utilizar RedWire System, usted acepta estos Términos de Servicio. Si no está de acuerdo con alguna parte, no debe utilizar la plataforma.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono text-primary">2. Uso de la Plataforma</h2>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
            RedWire System provee una herramienta para la automatización de mensajería vía WhatsApp. Usted acepta usar este servicio únicamente para fines legales y cumpliendo con las políticas de uso y comercio de WhatsApp / Meta.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold text-red-400">
            Está terminantemente prohibido usar la plataforma para envíos masivos de SPAM, estafas, o envío de contenido inapropiado. El incumplimiento resultará en el baneo inmediato de su cuenta sin derecho a reembolso.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono text-primary">3. Responsabilidad sobre las Cuentas de WhatsApp</h2>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
            Usted es el único responsable de mantener la salud de su número de WhatsApp. RedWire System no se hace responsable de posibles bloqueos o baneos de números aplicados por Meta debido a quejas de usuarios o violación de sus normativas.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono text-primary">4. Suscripciones y Pagos</h2>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
            Los servicios de pago se facturan por adelantado. Puede cancelar su suscripción en cualquier momento. No se emitirán reembolsos parciales por meses no utilizados salvo disposición legal contraria.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono text-primary">5. Disponibilidad del Servicio</h2>
          <p className="text-sm text-gray-400 leading-relaxed font-semibold">
            Nos esforzamos por mantener un 99.9% de uptime, pero no garantizamos que el servicio sea ininterrumpido. Nos reservamos el derecho a realizar mantenimientos programados informando a nuestros clientes con antelación.
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

export default TermsOfService;
