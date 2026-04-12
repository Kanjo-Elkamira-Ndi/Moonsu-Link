import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const TELEGRAM_URL  = 'https://t.me/MoonsuBot';
const WHATSAPP_URL  = 'https://wa.me/+237621606279';    

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Bubble({
  from, text, delay,
}: { from: 'farmer' | 'bot'; text: string; delay: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`flex transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${from === 'farmer' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed font-body ${
          from === 'farmer'
            ? 'bg-[#2a9d5c] text-white rounded-br-sm'
            : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-bl-sm'
        }`}
        style={{ whiteSpace: 'pre-line' }}
      >
        {text}
      </div>
    </div>
  );
}

const COMMANDS = [
  { cmd: 'PRIX maïs',                    en: 'Maize market prices across Cameroon', lang: 'FR' },
  { cmd: 'PRICE tomato',                 en: 'Tomato prices — English',             lang: 'EN' },
  { cmd: 'VENDRE maïs 80kg Bafia 250',   en: 'Post: 80 kg maize at 250 FCFA/kg',   lang: 'FR' },
  { cmd: 'SELL cassava 60kg Yaoundé 180',en: 'Post a listing in English',           lang: 'EN' },
  { cmd: 'CHERCHER maïs Ouest',          en: 'Find maize in the West Region',       lang: 'FR' },
  { cmd: 'ALERTE tomate Centre',         en: 'Alert when tomatoes are posted',      lang: 'FR' },
  { cmd: 'INTERESSE a3f8e2d1',           en: 'Contact the farmer — share details',  lang: 'FR' },
  { cmd: 'AIDE / HELP',                  en: 'Show all commands, in your language', lang: 'BOTH' },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
    title: 'Live market prices',
    desc: 'Check today\'s price range for 7 crops across Yaoundé, Douala, Bafoussam and more — before you sell.',
    accent: '#2a9d5c',
    bg: '#f0faf4',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
      </svg>
    ),
    title: 'Post your harvest',
    desc: 'One message is all it takes. Buyers search, find you, and connect directly — no middleman taking a cut.',
    accent: '#0f6e56',
    bg: '#f0faf7',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: 'Buyer alerts',
    desc: 'Buyers subscribe by crop and region. The moment a farmer posts a match, they\'re notified instantly.',
    accent: '#854f0b',
    bg: '#fdf6ee',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
      </svg>
    ),
    title: 'Any phone, anywhere',
    desc: 'SMS fallback means a farmer in Adamawa with a basic Nokia has full access. No smartphone required.',
    accent: '#185fa5',
    bg: '#f0f6ff',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'Français & English',
    desc: 'Every command and response available in both languages. Switch anytime by typing FR or EN.',
    accent: '#533ab7',
    bg: '#f5f4fe',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
      </svg>
    ),
    title: 'Platform alerts',
    desc: 'Pest outbreaks, price crashes, market closures — admins broadcast critical alerts to all users instantly.',
    accent: '#993c1d',
    bg: '#fef3ee',
  },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const demoRef   = useRef<HTMLDivElement>(null);
  const [demoOn, setDemoOn] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const el = demoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setDemoOn(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const featSection    = useInView();
  const cmdSection     = useInView();
  const stepsSection   = useInView();
  const ctaSection     = useInView();

  return (
    <div className="min-h-screen bg-[#fafaf8] text-slate-900 overflow-x-hidden">

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#fafaf8]/90 backdrop-blur border-b border-slate-200/60 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#1a5c38] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.5-10 20-10 20S2 17.5 2 12A10 10 0 0 1 12 2Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span className="font-display text-[17px] font-semibold tracking-tight text-slate-900">MoonsuLink</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {['#features','#how-it-works','#commands'].map(h => (
              <a key={h} href={h}
                className="font-body text-sm text-slate-500 hover:text-slate-900 transition-colors capitalize">
                {h.slice(1).replace(/-/g,' ')}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className="font-body text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Admin
            </Link>
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1a5c38] px-4 py-2 font-body text-sm font-medium text-white hover:bg-[#145230] transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}>
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z"/>
              </svg>
              Open bot
            </a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 text-slate-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}>
              {menuOpen
                ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                : <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-[#fafaf8] px-5 py-5 space-y-4">
            {['#features','#how-it-works','#commands'].map(h => (
              <a key={h} href={h} onClick={() => setMenuOpen(false)}
                className="block font-body text-sm text-slate-700 capitalize">
                {h.slice(1).replace(/-/g,' ')}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-3">
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#1a5c38] py-3 font-body text-sm font-medium text-white">
                Open Telegram bot
              </a>
              <Link to="/login" className="text-center font-body text-sm text-slate-500">
                Admin login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-5 sm:px-8 overflow-hidden">
        {/* Subtle background shape */}
        <div
          className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #2a9d5c 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #854f0b 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
        />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f0faf4] border border-[#b8e6cc] px-3.5 py-1.5 mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2a9d5c]" style={{animation:'pulse 2s ease-in-out infinite'}} />
              <span className="font-mono text-xs text-[#1a5c38] font-medium">Live on Telegram · SMS</span>
            </div>

            <h1 className="font-display text-[42px] sm:text-[54px] lg:text-[60px] font-semibold leading-[1.08] tracking-tight text-slate-900">
              Farm to market,{' '}
              <span style={{ color: '#2a9d5c' }}>instantly.</span>
            </h1>

            <p className="mt-5 font-body text-[17px] leading-relaxed text-slate-500 max-w-lg">
              MoonsuLink connects Cameroonian farmers and buyers through
              the channels they already use: WhatsApp Telegram and SMS.
              No app, no data plan required.
            </p>

            {/* Channel tags */}
            <div className="mt-7 flex flex-wrap gap-2">
              {[
                { label: 'Telegram', color: '#e8f4ff', border: '#93c5fd', text: '#1e3a8a' },
                { label: 'SMS — MTN', color: '#fefce8', border: '#fde047', text: '#713f12' },
                { label: 'SMS — Orange', color: '#fff7ed', border: '#fdba74', text: '#7c2d12' },
                { label: 'Français & English', color: '#f0fdf4', border: '#86efac', text: '#14532d' },
              ].map(p => (
                <span key={p.label}
                  className="inline-block rounded-full px-3 py-1 font-body text-xs font-medium"
                  style={{ background: p.color, border: `1px solid ${p.border}`, color: p.text }}>
                  {p.label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-2xl px-6 py-3.5 font-body text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{ background: '#1a5c38', boxShadow: '0 4px 20px rgba(26,92,56,0.25)' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}>
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z"/>
                </svg>
                Start on Telegram
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-body text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:-translate-y-0.5">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16,color:'#25D366'}}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Right — phone mockup */}
          <div ref={demoRef} className="flex justify-center lg:justify-end">
            <div className="relative w-[300px] sm:w-[320px]">
              {/* Glow */}
              <div className="absolute inset-0 rounded-[2.5rem] opacity-20 blur-2xl"
                style={{ background: '#2a9d5c', transform: 'scale(0.9) translateY(8px)' }} />

              {/* Phone shell */}
              <div className="relative rounded-[2.5rem] overflow-hidden border-[5px] border-slate-800 shadow-2xl bg-white">
                {/* Status bar */}
                <div className="bg-slate-800 px-6 pt-3 pb-1 flex justify-between items-center">
                  <span className="font-mono text-[10px] text-slate-400">9:41</span>
                  <div className="flex gap-1">
                    {[...Array(4)].map((_,i) => (
                      <div key={i} className="w-1 rounded-sm bg-slate-400" style={{height: 4+i*2}} />
                    ))}
                  </div>
                </div>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#1a5c38' }}>
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-base font-semibold bg-[#2a9d5c] text-white">
                    M
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">MoonsuLink Bot</p>
                    <p className="text-[10px] text-green-200">● online</p>
                  </div>
                </div>
                {/* Bubbles */}
                <div className="bg-[#ece5dd] px-3 py-4 space-y-2.5 min-h-[320px]">
                  {demoOn && (<>
                    <Bubble from="farmer" text="PRIX maïs"                                    delay={400}  />
                    <Bubble from="bot"    text={"📊 Prix MAÏS aujourd'hui:\n• Marché Central: 200–320 FCFA/kg\n• Marché Mokolo: 210–340 FCFA/kg\n• Marché Mboppi: 220–350 FCFA/kg"} delay={1000} />
                    <Bubble from="farmer" text="VENDRE maïs 80kg Bafia 250"                   delay={2100} />
                    <Bubble from="bot"    text={"✅ Annonce publiée!\n🌽 maïs · 80 kg · 250 FCFA/kg\n📍 Bafia  |  ID: a3f8e2d1\nExpire dans 7 jours."} delay={2900} />
                    <Bubble from="farmer" text="AIDE"                                         delay={4000} />
                    <Bubble from="bot"    text="📋 VENDRE · CHERCHER · PRIX · ALERTE · INTERESSE · MESLISTES · ANNULER" delay={4600} />
                  </>)}
                </div>
                {/* Input */}
                <div className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-2.5 border-t border-slate-200">
                  <div className="flex-1 rounded-full bg-white border border-slate-200 px-3 py-1.5">
                    <span className="font-body text-[11px] text-slate-400">Tapez une commande…</span>
                  </div>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ background: '#1a5c38' }}>
                    <svg viewBox="0 0 24 24" fill="white" style={{width:13,height:13}}>
                      <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="border-y border-slate-200 bg-white py-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: '30–50%', label: 'Post-harvest loss', sub: 'in Cameroonian perishables' },
            { val: '3×',     label: 'Price gap',         sub: 'farm gate vs. urban markets' },
            { val: '7',      label: 'Crops tracked',     sub: 'maize, tomato, plantain & more' },
            { val: '0 FCFA', label: 'Cost for farmers',  sub: 'always free to use' },
          ].map(s => (
            <div key={s.val} className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#2a9d5c' }}>{s.val}</div>
              <div className="mt-1 font-body text-sm font-medium text-slate-800">{s.label}</div>
              <div className="font-body text-xs text-slate-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-5 sm:px-8">
        <div ref={featSection.ref} className="max-w-6xl mx-auto">
          <div className={`mb-14 transition-all duration-700 ${featSection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">What it does</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-slate-900 leading-tight">
              One platform.<br/>Two sides of the market.
            </h2>
            <p className="mt-4 font-body text-lg text-slate-500 max-w-xl">
              Farmers post harvests and check prices. Buyers search and subscribe to alerts.
              The bot connects them — no middleman, no markup.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`rounded-2xl border border-slate-200 p-6 transition-all duration-700 hover:shadow-md hover:-translate-y-0.5 ${featSection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 80}ms`, background: '#fff' }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: f.bg, color: f.accent }}>
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="font-body text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-5 sm:px-8" style={{ background: '#0f2d1a' }}>
        <div ref={stepsSection.ref} className="max-w-5xl mx-auto">
          <div className={`mb-14 transition-all duration-700 ${stepsSection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: '#6fcf97' }}>Simple by design</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white leading-tight">
              Up and running<br/>in 30 seconds.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: '01', title: 'Open the bot', desc: 'Find MoonsuLink on Telegram or text via SMS. No registration form — your phone number is your identity.' },
              { n: '02', title: 'Set your language', desc: 'Type FR for French or EN for English. The bot remembers your choice for every future message.' },
              { n: '03', title: 'Start trading', desc: 'PRIX to check prices, VENDRE to post your harvest, CHERCHER to find produce. That\'s it.' },
            ].map((s, i) => (
              <div
                key={s.n}
                className={`rounded-2xl p-7 border transition-all duration-700 ${stepsSection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', transitionDelay: `${i*100}ms` }}
              >
                <div className="font-mono text-xs mb-4" style={{ color: '#6fcf97' }}>{s.n}</div>
                <h3 className="font-display text-xl font-semibold text-white mb-3">{s.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMANDS ── */}
      <section id="commands" className="py-24 px-5 sm:px-8">
        <div ref={cmdSection.ref} className="max-w-3xl mx-auto">
          <div className={`mb-12 transition-all duration-700 ${cmdSection.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-3">All commands</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-slate-900 leading-tight">Text it. Get it.</h2>
            <p className="mt-4 font-body text-lg text-slate-500">
              Every command fits in one SMS. Every response too.
            </p>
          </div>

          <div className="space-y-2.5">
            {COMMANDS.map((c, i) => (
              <div
                key={c.cmd}
                className={`flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition-all duration-500 hover:border-[#b8e6cc] hover:bg-[#f8fdf9] ${cmdSection.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <code className="shrink-0 rounded-xl px-3 py-1.5 font-mono text-xs font-medium"
                  style={{ background: c.lang === 'EN' ? '#f0faf4' : c.lang === 'FR' ? '#fef6ee' : '#f0f6ff',
                           color:      c.lang === 'EN' ? '#1a5c38' : c.lang === 'FR' ? '#854f0b' : '#1e3a8a' }}>
                  {c.cmd}
                </code>
                <span className="font-body text-sm text-slate-600 flex-1 min-w-0 truncate">{c.en}</span>
                <span className="shrink-0 font-mono text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: '#f1f5f9', color: '#64748b' }}>{c.lang}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-5 sm:px-8">
        <div ref={ctaSection.ref} className="max-w-4xl mx-auto">
          <div
            className={`rounded-[2rem] p-12 sm:p-20 text-center relative overflow-hidden transition-all duration-700 ${ctaSection.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ background: '#1a5c38' }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #6fcf97, transparent)' }} />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, #2a9d5c, transparent)' }} />
            </div>
            <div className="relative">
              <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: '#86efac' }}>
                Free for farmers, always
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white leading-tight">
                Ready to sell smarter?
              </h2>
              <p className="mt-5 font-body text-lg leading-relaxed max-w-xl mx-auto" style={{ color: '#bbf7d0' }}>
                Join farmers and buyers across Cameroon using MoonsuLink
                to trade directly, fairly, and fast.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a href={TELEGRAM_URL} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-body text-sm font-semibold transition-all hover:bg-green-50 hover:-translate-y-0.5"
                  style={{ color: '#1a5c38', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:18,height:18}}>
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z"/>
                  </svg>
                  Open on Telegram
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 font-body text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:18,height:18}}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp (soon)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white py-10 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: '#1a5c38' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}>
                <path d="M12 2a10 10 0 0 1 10 10c0 5.5-10 20-10 20S2 17.5 2 12A10 10 0 0 1 12 2Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span className="font-display text-base font-semibold text-slate-900">MoonsuLink</span>
          </div>
          <p className="font-body text-xs text-slate-400 text-center">
            Built for FarmerHack 2026 · Rebase Code Camp · Cameroon
          </p>
          <div className="flex items-center gap-5">
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer"
              className="font-body text-xs text-slate-500 hover:text-slate-800 transition-colors">Telegram</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
              className="font-body text-xs text-slate-500 hover:text-slate-800 transition-colors">WhatsApp</a>
            <Link to="/login"
              className="font-body text-xs text-slate-400 hover:text-slate-600 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .font-mono    { font-family: 'JetBrains Mono', monospace; }
        @keyframes fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-up { animation: fade-up 0.7s ease forwards; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}
