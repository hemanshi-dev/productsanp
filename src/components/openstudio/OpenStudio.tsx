import { useState, useEffect } from "react";
import AvatarPage from "./AvatarPage";
import logo from "../../assets/images/logo2.png"
import CtaButton from "../CtaButton";
import { HiPlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import f1 from "../../assets/images/f1.png";
import f2 from "../../assets/images/f2.png";
import f3 from "../../assets/images/f3.png";
import f4 from "../../assets/images/f4.png";
import f5 from "../../assets/images/f4.png";
import aiImage from "../../assets/images/bg-main.png"


// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  icon: string;
  label: string;
  id: string;
}

interface HeroCard {
  id: string;
  title: string;
  highlight: string;
  subtitle: string;
}

interface ToolCard {
  id: string;
  icon: string;
  label: string;
  hoverLabel: string;
  iconBg: string;
}

interface InspoCard {
  id: number;
  image: string;
  title: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { icon: "fi fi-rr-home", label: "Home", id: "home" },
];

const ASSET_ITEMS: NavItem[] = [
  { icon: "fi fi-rr-add-image", label: "My Creations", id: "creations" },
  { icon: "fi fi-tr-circle-user", label: "Avatars", id: "avatars" },
];




const HERO_CARDS = [
  {
    id: "image",
    title: "Generate ",
    highlight: "AI Image",
    subtitle: "Create stunning visuals from your imagination in just a few seconds with AI.",
  },
];

const TOOL_CARDS: (ToolCard & {arrowColor: string })[] = [
  {
    id: "product",
    icon: "fi fi-rr-camera",
    label: "Product Photography",
    hoverLabel: "AI product photo",
    iconBg: "bg-cyan-500/10",
    arrowColor: "text-cyan-400",
  },
  {
    id: "marketing",
    icon: "fi fi-tr-megaphone",
    label: "Marketing Banner",
    hoverLabel: "Design eye-catching banners",
    iconBg: "bg-cyan-500/10",
    arrowColor: "text-cyan-400",
  },
  {
    id: "popular",
    icon: "fi fi-tr-fire-flame-curved",
    label: "Popular Images",
    hoverLabel: "Explore trending creations",
    iconBg: "bg-cyan-500/10",
    arrowColor: "text-cyan-400",
  },
];

const INSPO_CARDS: InspoCard[] = [
  { id: 1, image: f1, title: "Hand-Drawn Illustration"},
  { id: 2, image: f2, title: "Elegant Product Shot"},
  { id: 3, image: f3, title: "Fashion Portrait" },
  { id: 4, image: f4, title: "Premium Packaging" },
  { id: 5, image: f5, title: "Lifestyle Scene"},
  { id: 6, image: f5, title: "Creative Mockup" },
  { id: 7, image: f5, title: "Studio Poster"},
  { id: 8, image: f5, title: "Luxury Still Life" },
  { id: 9, image: f5, title: "Minimal Display" },
  { id: 10, image: f5, title: "Premium Creator"},
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  active,
  onClick,
  disabled = false,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 font-geist-reference py-4 rounded-xl text-md font-medium transition-all duration-200 text-left relative overflow-hidden group
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${active
          ? "bg-[#161618] text-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)]"
          : !disabled 
            ? "text-slate-300 hover:bg-[#111113] hover:text-white" 
            : "text-slate-200"
        }`}
    >
      <span className={`w-5 flex items-center justify-center text-lg text-white transition-transform duration-200 ${!disabled && !active ? "group-hover:scale-110" : ""}`}>
        <i className={`${item.icon} leading-none`}></i>
      </span>
      <span className="relative z-10">{item.label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-r-full" />
      )}
    </button>
  );
}



function Sidebar({
  activeNav,
  setActiveNav,
  isAuthenticated,
  onLoginClick,
}: {
  activeNav: string;
  setActiveNav: (id: string) => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
}) {
  const navigate = useNavigate();

  const handleNavClick = (id: string) => {
    if (id === "creations") {
      if (!isAuthenticated) {
        onLoginClick();
        return;
      }
      navigate("/gallery");
      return;
    }
    setActiveNav(id);
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[250px] bg-[#030405] border-r border-white/[0.07] flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.07]">
        <span className="font-black text-lg tracking-tight text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          <img src={logo} alt="Stotage Logo" className="w-full h-auto" />
        </span>
      </div>

      {/* Create Button */}
      <div className="px-4 pt-5 pb-2">
        <CtaButton
          onClick={() => {
            if (!isAuthenticated) {
              onLoginClick();
            } else {
              navigate("/app");
            }
          }}
          size="sm"
          showArrow={false}
          className="w-full justify-between font-geist-reference"
          icon={<HiPlus className="w-4 h-4" />}
        >
          Create 
        </CtaButton>
      </div>

      {/* Main Nav */}
      <nav className="px-3 py-3 flex flex-col gap-0.5 font-geist-reference">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            active={activeNav === item.id}
            onClick={() => handleNavClick(item.id)}
          />
        ))}
      </nav>

      {/* Assets */}
      <div className="px-3 pb-2">
        <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">Assets</p>
        {ASSET_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            active={activeNav === item.id}
            disabled={item.id === "creations" && !isAuthenticated}
            onClick={() => handleNavClick(item.id)}
          />
        ))}
      </div>
    </aside>
  );
}

function Topbar({ 
  isAuthenticated, 
  user,
  onLoginClick 
}: { 
  isAuthenticated: boolean;
  user: any;
  onLoginClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-end gap-2.5 pt-5 pb-5 px-6 py-2.5 bg-black/60 backdrop-blur-xl border-b border-white/3 font-geist-reference" >
      {/* <button className="flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-white/5 border border-white/[0.07] text-slate-200 text-xm font-medium transition-colors hover:bg-white/10">
        🎁 Refer &amp; Get Rewards
      </button> */}
      
      {isAuthenticated ? (
        <>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-linear-to-r from-purple-600 to-blue-600 text-white text-xm font-semibold transition-opacity hover:opacity-90">
            ⚡ Upgrade
          </button>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xm font-bold">
            ◆ {user?.credits ?? 0}
          </div>
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 cursor-pointer" />
          )}
        </>
      ) : (
        <button 
          onClick={onLoginClick}
          className="hero-cta-btn hero-cta-btn--sm w-[80px]"
        >
          <span className="hero-cta-btn-label font-geist-reference">Login</span>
        </button>
      )}
    </header>
  );
}

function ToolCardComponent({ card }: { card: ToolCard & { arrowColor: string } }) {
  const navigate = useNavigate();
  const glowColor = '#06b6d4';

  return (
    <button
      onClick={() => navigate('/app')}
      className="relative h-[126px] w-full rounded-[26px] text-left isolate overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
      style={{ 

        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1.5px solid ${glowColor}65`,
        boxShadow: `
          inset 0 0 40px ${glowColor}18,
          inset 0 1px 0 rgba(255,255,255,0.15),
          inset 0 -1px 0 ${glowColor}30,
          inset 1px 0 0 ${glowColor}12,
          inset -1px 0 0 ${glowColor}12
        `,
      }}
    >
      {/* ── Top specular highlight (3D top-face light) ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[40%] rounded-t-[26px] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.11) 0%, transparent 100%)',
        }}
      />

      {/* ── Inner depth vignette (bottom shadow for 3D recess) ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[55%] pointer-events-none"
        style={{
          background: `linear-gradient(0deg, ${glowColor}12 0%, transparent 100%)`,
        }}
      />

      {/* ── Ambient neon bloom (bottom-left) ── */}
      <div 
        className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full -z-10 pointer-events-none"
        style={{ 
          background: glowColor,
          filter: 'blur(55px)',
          opacity: 0.28,
        }}
      />

      {/* ── Bottom neon edge line ── */}
      <div 
        className="absolute bottom-0 left-10 right-10 h-[2px] pointer-events-none"
        style={{ 
          background: `linear-gradient(to right, transparent, ${glowColor}BB, transparent)`,
          filter: 'blur(3px)',
          opacity: 0.85,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex h-full items-center px-7 gap-5">
        
        {/* Icon box — 3D glass cube effect */}
        <div className="relative shrink-0">
          <div 
            className="w-[62px] h-[62px] rounded-[16px] flex items-center justify-center text-[26px]"
            style={{
              border: `1.5px solid ${glowColor}CC`,
   boxShadow: `
      0 0 6px 1px ${glowColor}70,
      0 0 12px 2px ${glowColor}35,
      inset 0 0 6px 1px ${glowColor}40,
      inset 0 1px 0 ${glowColor}80
              `,
            }}
          >
           <i className={card.icon} style={{marginTop:"5px"}}></i>
          </div>
          {/* Glow bloom behind icon box */}
          <div 
            className="absolute inset-0 rounded-[16px] -z-10 pointer-events-none"
            style={{ 
              background: glowColor,
              filter: 'blur(20px)',
              opacity: 0.25,
            }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[18px] font-geist-reference font-bold text-white tracking-tight leading-snug">
            {card.label}
          </span>
          <span className="text-[13px] font-geist-reference mt-1 font-normal text-slate-400">
            {card.hoverLabel}
          </span>
        </div>

        {/* Arrow button — same 3D treatment */}
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ 
            border: `1.5px solid ${glowColor}70`,
            boxShadow: `
              0 0 14px ${glowColor}35,
              inset 0 1px 0 rgba(255,255,255,0.14),
              inset 0 0 10px ${glowColor}20
            `,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={glowColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

function HeroCardComponent({ card }: { card: HeroCard }) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-[48px] w-full  group border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] isolate flex flex-col justify-between">
      {/* Dynamic Background Image */}
      <img 
        src={aiImage} 
        alt="Cosmic Portal" 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-3000"
      />
      
      {/* Premium Glass Overlays */}
      <div className="absolute inset-0 bg-linear-to-r from-[#030405] via-[#030405]/80 to-transparent flex flex-col justify-between" />
      
      {/* Decorative 3D Elements (Floating Stars/Sparks) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.3
            }}
          />
        ))}
        {/* Glow Trail Separator */}
        <div className="absolute bottom-[160px] left-0 w-full h-px bg-linear-to-r from-transparent via-purple-500/50 to-transparent blur-sm" />
      </div>

      {/* Hero Content (Above) */}
      <div className="relative z-10 p-12 space-y-7 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-7xl font-black tracking-tighter text-white leading-[1.05] transition-transform duration-700 group-hover:translate-x-2">
            {card.title} <br />
            <span className="bg-linear-to-r from-cyan-400 via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,255,0.3)] bg-size-[200%_auto] animate-gradient">
              {card.highlight}
            </span>
          </h1>
          <p className="text-slate-400 font-geist-reference text-lg leading-relaxed max-w-md font-medium opacity-90">
            {card.subtitle}
          </p>
        </div>

        {/* Glossy CTA Button */}
      
      </div>

      {/* Tool Cards (Integrated at Bottom) */}
      <div className="relative z-20 px-8 pb-8 ">
        <div className="grid grid-cols-3 gap-4">
          {TOOL_CARDS.map((tool) => (
            <ToolCardComponent key={tool.id} card={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InspoCardComponent({ card, index }: { card: InspoCard; index: number }) {
  // Pinterest-style varied heights based on index
  const heights = [
    'h-[320px]', 'h-[400px]', 'h-[280px]', 'h-[360px]', 'h-[300px]',
    'h-[380px]', 'h-[260px]', 'h-[340px]', 'h-[420px]', 'h-[290px]',
  ];
  const heightClass = heights[index % heights.length];

  return (
    <div className={`group relative z-0 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 mb-3 break-inside-avoid ${heightClass}`}>
  
  {/* Background Image */}
  <img
    src={card.image}
    alt={`Inspiration ${card.id}`}
    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
    style={{ transformOrigin: 'center center' }}
  />

  {/* Dark overlay on hover */}
  <div className="absolute inset-0 bg-black/10 transition-opacity duration-300" />

  {/* TOP HOVER CARD — matches Image 1 */}
  <div className="absolute left-3 right-3 top-3 z-20 opacity-0 -translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
    <div className="rounded-2xl border border-white/10 bg-black/75 backdrop-blur-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3">
      
      {/* Left: label + title */}
      <div className="min-w-0 flex flex-col gap-0.5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 font-medium">
          AI Image
        </p>
        <p className="text-sm font-semibold text-white truncate leading-snug">
          {card.title}
        </p>
      </div>

      {/* Right: sound icon + Remix button */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Volume icon */}
        <button className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
        </button>

        {/* Remix it button */}
        <button
          onClick={() => {}}
          className="flex items-center gap-1.5 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 px-4 py-1.5 text-xs font-bold text-black transition-all duration-200 shadow-[0_4px_14px_rgba(0,255,255,0.35)]"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Remix it
        </button>
      </div>

    </div>
  </div>


</div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OpenStudio({ 
  isAuthenticated = false, 
  user = null, 
  onLoginClick = () => {} 
}: { 
  isAuthenticated?: boolean;
  user?: any;
  onLoginClick?: () => void;
}) {
  const [activeNav, setActiveNav] = useState<string>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem("openstudio-activeNav");
    return saved || "home";
  });

  // Save to localStorage whenever activeNav changes
  useEffect(() => {
    localStorage.setItem("openstudio-activeNav", activeNav);
  }, [activeNav]);

  const isAvatarPage = activeNav === "avatars";

  return (
    <>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>

      <div className="min-h-screen bg-[#0b0d14] text-white flex">
        <Sidebar 
          activeNav={activeNav} 
          setActiveNav={setActiveNav} 
          isAuthenticated={isAuthenticated} 
          onLoginClick={onLoginClick || (() => {})} 
        />

        {/* Main */}
        <div className="ml-[250px] flex-1 flex flex-col min-h-screen">
          <Topbar isAuthenticated={isAuthenticated} user={user} onLoginClick={onLoginClick} />

          <main className="p-0 pl-4 ml-0 pr-4 pt-0 flex-1 bg-black">
            {isAvatarPage ? (
              <AvatarPage />
            ) : (
              <>
                {/* ── Integrated Hero Banner (Content + Tool Cards) ── */}
                <div className="grid grid-cols-1 mb-8">
                  {HERO_CARDS.map((card) => (
                    <HeroCardComponent key={card.id} card={card} />
                  ))}
                </div>

                {/* ── Inspiration Hub ── */}
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <span className="block text-[14px] uppercase tracking-widest text-cyan-400 mb-1.5">
                      Inspiration Hub
                    </span>
                  </div>
                </div>

                <div className="columns-5 gap-3">
                  {INSPO_CARDS.map((card, index) => (
                    <InspoCardComponent key={card.id} card={card} index={index} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}