// import { useState, useEffect, useRef, useCallback } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { apiService, type User } from "../services/api";
// import logo from "../assets/images/logo2.png";
// import CtaButton from "./CtaButton";
// import { HiPlus } from "react-icons/hi";
// import { BiLogoPlayStore } from "react-icons/bi";


// gsap.registerPlugin(ScrollTrigger);

// interface NavbarProps {
//   isAuthenticated: boolean;
//   user: User | null;
//   onLogoutClick: () => void;
// }

// const Navbar = ({ isAuthenticated, user, onLogoutClick }: NavbarProps) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
//   const [visibleSection] = useState<string | null>(null);

//   const navRef = useRef<HTMLElement>(null);
//   const navBgRef = useRef<HTMLDivElement>(null); // ← separate background layer (no layout mutation)
//   const logoRef = useRef<HTMLAnchorElement>(null);
//   const logoContainerRef = useRef<HTMLDivElement>(null);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // ─── AUTH & REVEAL LOGIC ──────────────────────────────────────────────────
//   const fetchCredits = useCallback(() => {
//     if (isAuthenticated && user?.id) {
//       apiService.getProfile(user.id).catch(() => undefined);
//     }
//   }, [isAuthenticated, user?.id]);

//   useEffect(() => {
//     fetchCredits();
//   }, [fetchCredits]);

//   const getInitial = (n?: string, e?: string) =>
//     (n || e || "U").charAt(0).toUpperCase();
//   const currentIsHome =
//     location.pathname === "/" || location.pathname.includes("/productsnap");
//   const isActive = (path: string, hash?: string) =>
//     hash
//       ? currentIsHome && visibleSection === hash
//       : location.pathname === path;

//   const scrollToSection = (sectionId: string) => {
//     if (!currentIsHome) navigate(`/#${sectionId}`);
//     else {
//       window.history.replaceState(null, "", `/#${sectionId}`);
//       const el = document.getElementById(sectionId);
//       if (el) el.scrollIntoView({ behavior: "smooth" });
//     }
//     setShowMobileMenu(false);
//   };

//   // ─── MASTER GSAP TRI-AXIS PIPELINE ─────────────────────────────────────────
//   useEffect(() => {
//     let cleanupHeaderSync = () => undefined;

//     const ctx = gsap.context(() => {
//       const compactLogoWidth = () => {
//         const width = window.innerWidth;
//         if (width < 640) return "180px";
//         if (width < 1024) return "220px";
//         if (width < 1440) return "260px";
//         return "300px";
//       };

//       const heroLogoWidth = () => {
//         const width = window.innerWidth;
//         if (width < 640) return "300px";
//         if (width < 768) return "500px";
//         if (width < 1024) return "720px";
//         if (width < 1280) return "980px";
//         return "1180px";
//       };

//       const isMobile = () => window.innerWidth < 768;
//       const heroNavHeight = () => (isMobile() ? 64 : 238);
//       const compactNavHeight = () => (isMobile() ? 64 : 86);
//       const pxValue = (value: string) => Number(value.replace("px", ""));

//       const setCompactHeader = (animate = true, force = false) => {
//         if (!force && !animate) return;

//         const compNavH = compactNavHeight();
//         const rowEndY = compNavH / 2;

//         gsap.to(navRef.current, {
//           height: compNavH,
//           duration: animate ? 0.45 : 0,
//           ease: "power3.out",
//         });

//         gsap.to(navBgRef.current, {
//           height: compNavH,
//           duration: animate ? 0.45 : 0,
//           ease: "power3.out",
//         });

//         // On mobile, logo stays fixed — no position/scale animation
//         if (!isMobile()) {
//           const maxW = pxValue(heroLogoWidth());
//           const targetScale = pxValue(compactLogoWidth()) / maxW;
//           const heroTop = 28;
//           const compactTargetY = compNavH / 2 - (maxW * targetScale * 0.1) / 2;

//           gsap.to(logoContainerRef.current, {
//             top: `${heroTop}px`,
//             y: `${compactTargetY - heroTop}px`,
//             force3D: true,
//             duration: animate ? 0.45 : 0,
//             ease: "power3.out",
//           });

//           gsap.to(logoRef.current, {
//             width: `${maxW}px`,
//             scale: targetScale,
//             transformOrigin: "top center",
//             filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.35))",
//             force3D: false,
//             duration: animate ? 0.45 : 0,
//             ease: "power3.out",
//           });
//         }

//         gsap.to(".stotage-interaction-row", {
//           top: 0,
//           bottom: "auto",
//           y: rowEndY,
//           yPercent: -50,
//           paddingBottom: "0px",
//           force3D: true,
//           duration: animate ? 0.45 : 0,
//           ease: "power3.out",
//         });

//         gsap.to(".stotage-menu-col", {
//           gap: window.innerWidth < 1280 ? 26 : 38,
//           duration: animate ? 0.45 : 0,
//           ease: "power3.out",
//         });

//         // Nav links stay visible in compact state — do NOT hide .stotage-socials-col
//         gsap.to(".stotage-bracket", {
//           opacity: 0,
//           scale: 0.9,
//           duration: animate ? 0.3 : 0,
//           ease: "power2.out",
//         });
//       };

//       // 1. Initial Reveal - Text Reveal Animation
//       gsap.set(".rolling-text-hover", {
//         yPercent: 100,
//         willChange: "transform",
//       });
//       gsap.set(navRef.current, {
//         height: heroNavHeight,
//         opacity: 0,
//         willChange: "height,opacity",
//       });
//       gsap.set(".stotage-compact-line", {
//         scaleX: 0,
//         opacity: 0,
//         willChange: "transform,opacity",
//       });
//       gsap.set(logoRef.current, {
//         opacity: 0,
//         y: 20,
//         clipPath: "inset(0 100% 0 0)",
//         willChange: "transform,opacity,clip-path",
//         force3D: true,
//       });
//       gsap.set(".stotage-bracket", {
//         opacity: 0,
//         x: -20,
//         willChange: "transform,opacity",
//         force3D: true,
//       });
//       gsap.set([".nav-link-rolling", ".nav-btn-gooey"], {
//         opacity: 0,
//         x: -20,
//         willChange: "transform,opacity",
//         force3D: true,
//       });

//       const tl = gsap.timeline();
//       tl.to(navRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" })
//         .to(
//           ".stotage-bracket",
//           {
//             opacity: 1,
//             x: 0,
//             stagger: 0.05,
//             duration: 0.6,
//             ease: "power3.out",
//           },
//           "-=0.2",
//         )
//         .to(
//           logoRef.current,
//           {
//             opacity: 1,
//             y: 0,
//             clipPath: "inset(0 0% 0 0)",
//             duration: 1.2,
//             ease: "power4.inOut",
//           },
//           "-=0.3",
//         )
//         .to(
//           [".nav-link-rolling", ".nav-btn-gooey"],
//           {
//             opacity: 1,
//             x: 0,
//             stagger: 0.08,
//             duration: 0.7,
//             ease: "power3.out",
//           },
//           "-=0.6",
//         );

//       // 2. Animate the transparent hero header while the hero scrolls.
//       const isHomePage =
//         location.pathname === "/" || location.pathname.includes("/productsnap");
//       const headerTimeline = () => {
//         const heroSection = document.querySelector<HTMLElement>(
//           "[data-hero-section]",
//         );

//         if (!isHomePage || !heroSection) {
//           setCompactHeader(false, true);
//           gsap.set(navBgRef.current, {
//             backgroundColor: "rgba(0, 0, 0, 0.72)",
//             backdropFilter: "blur(28px) saturate(160%)",
//             WebkitBackdropFilter: "blur(28px) saturate(160%)",
//           });
//           return undefined;
//         }

//         // ── MOBILE: fixed compact navbar, no scroll animation on logo ──
//         if (isMobile()) {
//           const mobileNavH = compactNavHeight();
//           gsap.set(navRef.current, { height: mobileNavH });
//           gsap.set(navBgRef.current, {
//             height: mobileNavH,
//             backgroundColor: "rgba(0, 0, 0, 0.72)",
//             backdropFilter: "blur(28px) saturate(160%)",
//             WebkitBackdropFilter: "blur(28px) saturate(160%)",
//           });
//           // Logo stays put — no GSAP transforms
//           gsap.set(logoContainerRef.current, { clearProps: "top,y" });
//           gsap.set(logoRef.current, { clearProps: "width,scale,filter" });
//           gsap.set(".stotage-bracket", { opacity: 0, scale: 0.9 });
//           return undefined;
//         }

//         // ── DESKTOP: full hero → compact scroll animation ──
//         const maxW = pxValue(heroLogoWidth());
//         const targetScale = pxValue(compactLogoWidth()) / maxW;
//         const heroTop = 28;
//         const heroBottom = 44;
//         const rowStartY = heroNavHeight() - heroBottom;
//         const rowEndY = compactNavHeight() / 2;
//         const compactTargetY =
//           compactNavHeight() / 2 - (maxW * targetScale * 0.1) / 2;
//         const compactGap = window.innerWidth < 1280 ? 26 : 38;

//         gsap.set(navRef.current, { height: heroNavHeight() });
//         gsap.set(navBgRef.current, {
//           height: heroNavHeight(),
//           backgroundColor: "rgba(0, 2, 15, 0)",
//           backdropFilter: "blur(0px) saturate(100%)",
//           WebkitBackdropFilter: "blur(0px) saturate(100%)",
//         });
//         gsap.set(logoContainerRef.current, {
//           top: `${heroTop}px`,
//           y: 0,
//           force3D: true,
//         });
//         gsap.set(logoRef.current, {
//           width: `${maxW}px`,
//           scale: 1,
//           transformOrigin: "top center",
//           filter: "drop-shadow(0 0 0 rgba(0, 0, 0, 0))",
//           force3D: true,
//           willChange: "transform",
//         });
//         gsap.set(".stotage-interaction-row", {
//           top: 0,
//           bottom: "auto",
//           y: rowStartY,
//           yPercent: -100,
//           paddingBottom: 0,
//           force3D: true,
//         });
//         gsap.set(".stotage-socials-col", {
//           opacity: 1,
//           x: 0,
//           pointerEvents: "auto",
//         });
//         gsap.set(".stotage-bracket", { opacity: 1, scale: 1 });

//         const stickyTl = gsap.timeline({
//           defaults: { ease: "none" },
//           scrollTrigger: {
//             trigger: heroSection,
//             start: "top 25%",
//             end: `bottom top`,
//             scrub: 1.2,
//             invalidateOnRefresh: true,
//           },
//         });

//         stickyTl
//           .to(navRef.current, { height: compactNavHeight() }, 0)
//           .to(navBgRef.current, { height: compactNavHeight() }, 0)
//           .to(
//             logoContainerRef.current,
//             { y: compactTargetY - heroTop, force3D: true },
//             0,
//           )
//           .to(
//             logoRef.current,
//             {
//               scale: targetScale,
//               filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.35))",
//             },
//             0,
//           )
//           .to(
//             ".stotage-interaction-row",
//             {
//               y: rowEndY,
//               yPercent: -50,
//               force3D: true,
//             },
//             0,
//           )
//           .to(".stotage-menu-col", { gap: `${compactGap}px` }, 0)
//           .to(".stotage-bracket", { opacity: 0, scale: 0.9 }, 0)
//           .to(
//             navBgRef.current,
//             {
//               backgroundColor: "rgba(0, 0, 0, 0.72)",
//               backdropFilter: "blur(28px) saturate(160%)",
//               WebkitBackdropFilter: "blur(28px) saturate(160%)",
//             },
//             0.5,
//           );

//         return stickyTl.scrollTrigger;
//       };

//       let stickyTrigger = headerTimeline();

//       const rebuildHeader = () => {
//         stickyTrigger?.kill();
//         stickyTrigger = headerTimeline();
//         ScrollTrigger.refresh();
//       };

//       window.addEventListener("resize", rebuildHeader);

//       cleanupHeaderSync = () => {
//         stickyTrigger?.kill();
//         window.removeEventListener("resize", rebuildHeader);
//       };
//     });

//     return () => {
//       cleanupHeaderSync();
//       ctx.revert();
//     };
//   }, [location.pathname]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setShowDropdown(false);
//       }
//     };

//     if (showDropdown)
//       document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [showDropdown]);

//   // ─── INTERACTIVE NAV LINK ──────────────────────────────────────────────────
//   const NavLink = ({ label, onClick, to, isActive }: any) => {
//     const chars = label.trim().split("");
//     return (
//       <Link
//         to={to || "#"}
//         onClick={onClick}
//         className="group relative inline-flex h-[26px] items-center overflow-hidden pointer-events-auto"
//       >
//         <div className="flex">
//           {chars.map((char: string, i: number) => (
//             <span key={i} className="relative inline-flex flex-col">
//               <span
//                 className={`inline-block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full
//                 ${isActive ? "text-[#00FFFF]" : "text-white"}
//                 font-geist-reference text-[10px] lg:text-[11px] uppercase tracking-[0.25em] leading-[26px]`}
//               >
//                 {char === " " ? "\u00A0" : char}
//               </span>
//               <span
//                 className={`absolute left-0 top-full inline-block text-[#00FFFF] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full
//                 font-geist-reference text-[10px] lg:text-[11px] uppercase tracking-[0.25em] leading-[26px]`}
//               >
//                 {char === " " ? "\u00A0" : char}
//               </span>
//             </span>
//           ))}
//         </div>
//       </Link>
//     );
//   };
//   return (
//     <>
//       {/* 1. VIEWPORT BRACKETS */}
//       <div className="fixed inset-0 pointer-events-none z-[100] p-6 lg:p-10">
//         <div className="stotage-bracket absolute top-6 left-6 lg:top-10 lg:left-10" />
//         <div className="stotage-bracket absolute top-6 right-6 lg:top-10 lg:right-10" />
//         <div className="stotage-bracket absolute bottom-6 left-6 lg:bottom-10 lg:left-10" />
//         <div className="stotage-bracket absolute bottom-6 right-6 lg:bottom-10 lg:right-10" />
//       </div>

//       {/* Background layer — OUTSIDE nav so backdrop-filter never rasterizes nav text */}
//       <div
//         ref={navBgRef}
//         className="fixed top-0 left-0 right-0 pointer-events-none z-[49]"
//         style={{
//           height: "238px",
//           backgroundColor: "transparent",
//           willChange: "background-color, backdrop-filter, height",
//         }}
//       />

//       {/* 2. MASTER NAVBAR — no background, pure layout */}
//       <nav
//         ref={navRef}
//         className="fixed top-0 left-0 right-0 z-50 h-[64px] md:h-[238px] overflow-hidden"
//         style={{ background: "transparent", isolation: "isolate" }}
//       >
//         <div className="max-w-[1920px] mx-auto px-5 sm:px-6 md:px-12 lg:px-20 h-full relative">
//           {/* ─── BRAND LAYER (Logo - Left on mobile, Centered on desktop) ─── */}
//           <div
//             ref={logoContainerRef}
//             className="logo-container absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 md:top-7 z-30 w-full flex justify-start md:justify-center items-center pointer-events-none origin-center h-[64px] md:h-auto px-5 sm:px-6 md:px-0"
//           >
//             <Link
//               to="/"
//               ref={logoRef}
//               className="pointer-events-auto flex items-center w-[140px] sm:w-[160px] md:w-[720px] lg:w-[980px] xl:w-[1180px]"
//             >
//               <img src={logo} alt="Stotage Logo" className="w-full h-auto" />
//             </Link>
//           </div>

//           {/* ─── INTERACTION LAYER (The Tri-Axis Row) ─── */}
//           {/* 3-column grid: left=nav links | center=logo gap | right=auth buttons */}
//           <div className="stotage-interaction-row absolute bottom-5 md:bottom-11 left-0 right-0 px-5 sm:px-6 md:px-12 lg:px-20 grid grid-cols-[1fr_auto_1fr] items-end pointer-events-none origin-bottom">
//             {/* ── LEFT: Navigation Links ── */}
//             <div className="stotage-socials-col hidden lg:flex items-center gap-6 xl:gap-9 z-10 pointer-events-auto origin-left">
//               <NavLink
//                 label="Explore"
//                 to="/explore"
//                 isActive={isActive("/explore")}
//               />
//               <NavLink
//                 label="Pricing"
//                 to="/gallery"
//                 isActive={isActive("/gallery")}
//               />
//               <NavLink
//                 label="Features"
//                 onClick={(e: any) => {
//                   e.preventDefault();
//                   scrollToSection("pricing");
//                 }}
//                 isActive={isActive("/", "pricing")}
//               />
//               <NavLink
//                 label="Contact Us"
//                 to="/contact-us"
//                 isActive={isActive("/contact-us")}
//               />
//             </div>

//             {/* ── CENTER: Reserved gap for the logo ── */}
//             <div className="w-[148px] sm:w-[190px] lg:w-[260px] pointer-events-none" />

//             {/* ── RIGHT: Auth Buttons ── */}
//             <div className="stotage-menu-col flex items-center justify-end gap-3 z-10 pointer-events-none origin-right">
//               {isAuthenticated && user ? (
//                 /* Avatar + dropdown when logged in */
//                 <div
//                   ref={dropdownRef}
//                   onClick={() => setShowDropdown(!showDropdown)}
//                   className="relative group/auth pointer-events-auto cursor-pointer"
//                 >
//                   {user.avatar ? (
//                     <img
//                       src={user.avatar}
//                       className="w-10 h-10 rounded-full border border-white/20 hover:border-[#00FFFF] transition-all"
//                     />
//                   ) : (
//                     <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-geist-reference font-black text-[10px]">
//                       {getInitial(user.name, user.email)}
//                     </div>
//                   )}
//                   {showDropdown && (
//                     <div className="absolute right-0 bottom-full mb-4 w-52 bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
//                       <Link
//                         to="/settings"
//                         className="block px-6 py-4 text-[10px] font-geist-reference text-white/50 hover:text-white uppercase tracking-widest transition-all"
//                       >
//                         Settings
//                       </Link>
//                       <button
//                         onClick={onLogoutClick}
//                         className="w-full text-left px-6 py-4 text-[10px] font-geist-reference text-red-500 hover:bg-white/5 uppercase tracking-widest border-t border-white/5 transition-all"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 /* Login + Google Play when logged out */
//                 <div className="pointer-events-auto flex items-center gap-3">
//                   <CtaButton
//                     onClick={() => navigate("/openstudio")}
//                     size="sm"
//                     showArrow={false}
//                     className="navbar-cta-btn"
//                     icon={<HiPlus className="w-4 h-4" />}
//                   >
//                     Open Studio
//                   </CtaButton>
//                   <CtaButton
//                     onClick={() => window.open("https://play.google.com/store/apps/details?id=com.diapp.productsnap&hl=en_IN", "_blank")}
//                     size="sm"
//                     showArrow={false}
//                     className="navbar-cta-btn navbar-google-play-btn"
//                     icon={<BiLogoPlayStore className="w-5 h-5" />}
//                   >
//                     <span className="navbar-google-play-label">
//                       <span className="navbar-google-play-kicker">
//                         GET IT ON
//                       </span>
//                       <span className="navbar-google-play-title">
//                         Google Play
//                       </span>
//                     </span>
//                   </CtaButton>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* RULER (Visual polish) */}
//       {/* <div className="fixed bottom-10 lg:bottom-16 left-1/2 -translate-x-1/2 z-[100] h-12 w-[1px] bg-white/10 pointer-events-none overflow-hidden">
//         <div className="stotage-ruler-fill w-full bg-[#00FFFF] h-0 origin-top" />
//       </div> */}

//       <button
//         onClick={() => setShowMobileMenu(true)}
//         className="lg:hidden fixed top-6 right-6 z-[100] w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md"
//       >
//         <svg
//           width="24"
//           height="24"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2.5"
//         >
//           <path d="M4 8h16M4 16h16" />
//         </svg>
//       </button>

//       <div
//         className={`fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center gap-12 transition-all duration-700 ease-in-out ${showMobileMenu ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20 pointer-events-none"}`}
//       >
//         <button
//           onClick={() => setShowMobileMenu(false)}
//           className="absolute top-10 right-10 text-white/50 hover:text-white"
//         >
//           <svg
//             width="40"
//             height="40"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <path d="M18 6L6 18M6 6l12 12" />
//           </svg>
//         </button>
//         <Link
//           to="/"
//           className="text-white text-5xl font-geist-reference font-black uppercase tracking-[0.4em] hover:text-[#00FFFF] transition-all"
//           onClick={() => setShowMobileMenu(false)}
//         >
//           Home
//         </Link>
//         <Link
//           to="/explore"
//           className="text-white text-5xl font-geist-reference font-black uppercase tracking-[0.4em] hover:text-[#00FFFF] transition-all"
//           onClick={() => setShowMobileMenu(false)}
//         >
//           Explore
//         </Link>
//         <button
//           onClick={() => {
//             setShowMobileMenu(false);
//             scrollToSection("pricing");
//           }}
//           className="text-white text-5xl font-geist-reference font-black uppercase tracking-[0.4em] hover:text-[#00FFFF] transition-all"
//         >
//           Pricing
//         </button>
//         <Link
//           to="/contact-us"
//           className="text-white text-5xl font-geist-reference font-black uppercase tracking-[0.4em] hover:text-[#00FFFF] transition-all"
//           onClick={() => setShowMobileMenu(false)}
//         >
//           Contact
//         </Link>
//       </div>
//     </>
//   );
// };

// export default Navbar;


import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiService, type User } from "../services/api";
import logo from "../assets/images/logo2.png";
import CtaButton from "./CtaButton";
import { HiPlus } from "react-icons/hi";
import { BiLogoPlayStore } from "react-icons/bi";


gsap.registerPlugin(ScrollTrigger);

interface NavbarProps {
  isAuthenticated: boolean;
  user: User | null;
  onLogoutClick: () => void;
}

const Navbar = ({ isAuthenticated, user, onLogoutClick }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [visibleSection] = useState<string | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const navBgRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCredits = useCallback(() => {
    if (isAuthenticated && user?.id) {
      apiService.getProfile(user.id).catch(() => undefined);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const getInitial = (n?: string, e?: string) =>
    (n || e || "U").charAt(0).toUpperCase();
  const currentIsHome =
    location.pathname === "/" || location.pathname.includes("/productsnap");
  const isActive = (path: string, hash?: string) =>
    hash
      ? currentIsHome && visibleSection === hash
      : location.pathname === path;

  const scrollToSection = (sectionId: string) => {
    if (!currentIsHome) navigate(`/#${sectionId}`);
    else {
      window.history.replaceState(null, "", `/#${sectionId}`);
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setShowMobileMenu(false);
  };

  // ─── MASTER GSAP PIPELINE ─────────────────────────────────────────────────
  useEffect(() => {
    let cleanupHeaderSync: () => void = () => {};

    const ctx = gsap.context(() => {
      const isMobile = () => window.innerWidth < 768;

      const compactLogoWidth = () => {
        const width = window.innerWidth;
        if (width < 640) return "180px";
        if (width < 1024) return "220px";
        if (width < 1440) return "260px";
        return "300px";
      };

      const heroLogoWidth = () => {
        const width = window.innerWidth;
        if (width < 640) return "300px";
        if (width < 768) return "500px";
        if (width < 1024) return "720px";
        if (width < 1280) return "980px";
        return "1180px";
      };

      const heroNavHeight = () => (window.innerWidth < 768 ? 172 : 238);
      const compactNavHeight = () => (window.innerWidth < 768 ? 72 : 86);
      const pxValue = (value: string) => Number(value.replace("px", ""));

      const setCompactHeader = (animate = true, force = false) => {
        if (!force && !animate) return;

        const maxW = pxValue(heroLogoWidth());
        const targetScale = pxValue(compactLogoWidth()) / maxW;
        const compNavH = compactNavHeight();
        const compactTargetY = compNavH / 2 - (maxW * targetScale * 0.1) / 2;
        const heroTop = window.innerWidth < 768 ? 20 : 28;
        const rowEndY = compNavH / 2;

        gsap.to(navRef.current, { height: compNavH, duration: animate ? 0.45 : 0, ease: "power3.out" });
        gsap.to(navBgRef.current, { height: compNavH, duration: animate ? 0.45 : 0, ease: "power3.out" });
        gsap.to(logoContainerRef.current, { top: `${heroTop}px`, y: `${compactTargetY - heroTop}px`, force3D: true, duration: animate ? 0.45 : 0, ease: "power3.out" });
        gsap.to(logoRef.current, { width: `${maxW}px`, scale: targetScale, transformOrigin: "top center", filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.35))", force3D: false, duration: animate ? 0.45 : 0, ease: "power3.out" });
        gsap.to(".stotage-interaction-row", { top: 0, bottom: "auto", y: rowEndY, yPercent: -50, paddingBottom: "0px", force3D: true, duration: animate ? 0.45 : 0, ease: "power3.out" });
        gsap.to(".stotage-menu-col", { gap: window.innerWidth < 1280 ? 26 : 38, duration: animate ? 0.45 : 0, ease: "power3.out" });
        gsap.to(".stotage-bracket", { opacity: 0, scale: 0.9, duration: animate ? 0.3 : 0, ease: "power2.out" });
      };

      // ── MOBILE: static compact header, no scroll animation ──
      if (isMobile()) {
        const mobileCompact = () => {
          const maxW = pxValue(heroLogoWidth());
          const targetScale = pxValue(compactLogoWidth()) / maxW;
          const compNavH = compactNavHeight(); // 72px

          // Nav fixed at compact height always
          gsap.set(navRef.current, { height: compNavH, opacity: 1 });
          gsap.set(navBgRef.current, {
            height: compNavH,
            backgroundColor: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(28px) saturate(160%)",
            WebkitBackdropFilter: "blur(28px) saturate(160%)",
          });

          // Logo: compact scale, centered, vertically centered in 72px bar
          gsap.set(logoContainerRef.current, { top: "0px", y: compNavH / 2, yPercent: -50, force3D: true });
          gsap.set(logoRef.current, {
            opacity: 1,
            y: 0,
            clipPath: "inset(0 0% 0 0)",
            width: `${maxW}px`,
            scale: targetScale,
            transformOrigin: "top center",
            filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.35))",
            force3D: true,
          });

          // Buttons: centered, vertically centered in 72px bar
          gsap.set(".stotage-interaction-row", {
            top: 0,
            bottom: "auto",
            y: compNavH / 2,
            yPercent: -50,
            paddingBottom: "0px",
            force3D: true,
          });

          gsap.set(".stotage-bracket", { opacity: 0 });
          gsap.set([".nav-link-rolling", ".nav-btn-gooey"], { opacity: 1, x: 0 });
        };

        mobileCompact();

        // Rebuild on resize if still mobile
        const onResize = () => { if (isMobile()) mobileCompact(); };
        window.addEventListener("resize", onResize);
        cleanupHeaderSync = () => window.removeEventListener("resize", onResize);
        return; // ← skip all desktop GSAP scroll logic on mobile
      }

      // ── DESKTOP: full GSAP reveal + scroll-driven animation ──

      gsap.set(".rolling-text-hover", { yPercent: 100, willChange: "transform" });
      gsap.set(navRef.current, { height: heroNavHeight(), opacity: 0, willChange: "height,opacity" });
      gsap.set(".stotage-compact-line", { scaleX: 0, opacity: 0, willChange: "transform,opacity" });
      gsap.set(logoRef.current, { opacity: 0, y: 20, clipPath: "inset(0 100% 0 0)", willChange: "transform,opacity,clip-path", force3D: true });
      gsap.set(".stotage-bracket", { opacity: 0, x: -20, willChange: "transform,opacity", force3D: true });
      gsap.set([".nav-link-rolling", ".nav-btn-gooey"], { opacity: 0, x: -20, willChange: "transform,opacity", force3D: true });

      const tl = gsap.timeline();
      tl.to(navRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" })
        .to(".stotage-bracket", { opacity: 1, x: 0, stagger: 0.05, duration: 0.6, ease: "power3.out" }, "-=0.2")
        .to(logoRef.current, { opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "power4.inOut" }, "-=0.3")
        .to([".nav-link-rolling", ".nav-btn-gooey"], { opacity: 1, x: 0, stagger: 0.08, duration: 0.7, ease: "power3.out" }, "-=0.6");

      const isHomePage =
        location.pathname === "/" || location.pathname.includes("/productsnap");

      const headerTimeline = () => {
        const heroSection = document.querySelector<HTMLElement>("[data-hero-section]");

        if (!isHomePage || !heroSection) {
          setCompactHeader(false, true);
          gsap.set(navBgRef.current, {
            backgroundColor: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(28px) saturate(160%)",
            WebkitBackdropFilter: "blur(28px) saturate(160%)",
          });
          return undefined;
        }

        const maxW = pxValue(heroLogoWidth());
        const targetScale = pxValue(compactLogoWidth()) / maxW;
        const heroTop = 28;
        const heroBottom = 44;
        const rowStartY = heroNavHeight() - heroBottom;
        const rowEndY = compactNavHeight() / 2;
        const compactTargetY = compactNavHeight() / 2 - (maxW * targetScale * 0.1) / 2;
        const compactGap = window.innerWidth < 1280 ? 26 : 38;

        gsap.set(navRef.current, { height: heroNavHeight() });
        gsap.set(navBgRef.current, { height: heroNavHeight(), backgroundColor: "rgba(0, 2, 15, 0)", backdropFilter: "blur(0px) saturate(100%)", WebkitBackdropFilter: "blur(0px) saturate(100%)" });
        gsap.set(logoContainerRef.current, { top: `${heroTop}px`, y: 0, force3D: true });
        gsap.set(logoRef.current, { width: `${maxW}px`, scale: 1, transformOrigin: "top center", filter: "drop-shadow(0 0 0 rgba(0,0,0,0))", force3D: true, willChange: "transform" });
        gsap.set(".stotage-interaction-row", { top: 0, bottom: "auto", y: rowStartY, yPercent: -100, paddingBottom: 0, force3D: true });
        gsap.set(".stotage-socials-col", { opacity: 1, x: 0, pointerEvents: "auto" });
        gsap.set(".stotage-bracket", { opacity: 1, scale: 1 });

        const stickyTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: heroSection,
            start: "top 25%",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        });

        stickyTl
          .to(navRef.current, { height: compactNavHeight() }, 0)
          .to(navBgRef.current, { height: compactNavHeight() }, 0)
          .to(logoContainerRef.current, { y: compactTargetY - heroTop, force3D: true }, 0)
          .to(logoRef.current, { scale: targetScale, filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.35))" }, 0)
          .to(".stotage-interaction-row", { y: rowEndY, yPercent: -50, force3D: true }, 0)
          .to(".stotage-menu-col", { gap: `${compactGap}px` }, 0)
          .to(".stotage-bracket", { opacity: 0, scale: 0.9 }, 0)
          .to(navBgRef.current, { backgroundColor: "rgba(0,0,0,0.72)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)" }, 0.5);

        return stickyTl.scrollTrigger;
      };

      let stickyTrigger = headerTimeline();

      const rebuildHeader = () => {
        if (isMobile()) return; // don't rebuild scroll logic on mobile
        stickyTrigger?.kill();
        stickyTrigger = headerTimeline();
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", rebuildHeader);
      cleanupHeaderSync = () => {
        stickyTrigger?.kill();
        window.removeEventListener("resize", rebuildHeader);
      };
    });

    return () => {
      cleanupHeaderSync();
      ctx.revert();
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const NavLink = ({ label, onClick, to, isActive }: any) => {
    const chars = label.trim().split("");
    return (
      <Link
        to={to || "#"}
        onClick={onClick}
        className="group relative inline-flex h-[26px] items-center overflow-hidden pointer-events-auto"
      >
        <div className="flex">
          {chars.map((char: string, i: number) => (
            <span key={i} className="relative inline-flex flex-col">
              <span className={`inline-block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full ${isActive ? "text-[#00FFFF]" : "text-white"} font-geist-reference text-[10px] lg:text-[11px] uppercase tracking-[0.25em] leading-[26px]`}>
                {char === " " ? "\u00A0" : char}
              </span>
              <span className={`absolute left-0 top-full inline-block text-[#00FFFF] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full font-geist-reference text-[10px] lg:text-[11px] uppercase tracking-[0.25em] leading-[26px]`}>
                {char === " " ? "\u00A0" : char}
              </span>
            </span>
          ))}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* 1. VIEWPORT BRACKETS */}
      <div className="fixed inset-0 pointer-events-none z-[100] p-6 lg:p-10">
        <div className="stotage-bracket absolute top-6 left-6 lg:top-10 lg:left-10" />
        <div className="stotage-bracket absolute top-6 right-6 lg:top-10 lg:right-10" />
        <div className="stotage-bracket absolute bottom-6 left-6 lg:bottom-10 lg:left-10" />
        <div className="stotage-bracket absolute bottom-6 right-6 lg:bottom-10 lg:right-10" />
      </div>

      {/* Background layer */}
      <div
        ref={navBgRef}
        className="fixed top-0 left-0 right-0 pointer-events-none z-[49]"
        style={{ height: "238px", backgroundColor: "transparent", willChange: "background-color, backdrop-filter, height" }}
      />

      {/* 2. MASTER NAVBAR */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 h-[172px] md:h-[238px] overflow-hidden"
        style={{ background: "transparent", isolation: "isolate" }}
      >
        <div className="max-w-[1920px] mx-auto px-5 sm:px-6 md:px-12 lg:px-20 h-full relative">

          {/* ─── BRAND LAYER ─── */}
          <div
            ref={logoContainerRef}
            className="logo-container absolute left-1/2 -translate-x-1/2 top-5 md:top-7 z-30 w-full flex justify-center items-center pointer-events-none origin-center"
          >
            <Link
              to="/"
              ref={logoRef}
              className="pointer-events-auto flex items-center w-[300px] sm:w-[500px] md:w-[720px] lg:w-[980px] xl:w-[1180px]"
            >
              <img src={logo} alt="Stotage Logo" className="w-full h-auto" />
            </Link>
          </div>

          {/* ─── INTERACTION LAYER ─── */}
          <div className="stotage-interaction-row absolute bottom-5 md:bottom-11 left-0 right-0 px-5 sm:px-6 md:px-12 lg:px-20 flex items-center justify-center lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-end pointer-events-none origin-bottom">

            {/* LEFT: Nav links — desktop only */}
            <div className="stotage-socials-col hidden lg:flex items-center gap-6 xl:gap-9 z-10 pointer-events-auto origin-left">
              <NavLink label="Explore" to="/explore" isActive={isActive("/explore")} />
              <NavLink label="Pricing" to="/gallery" isActive={isActive("/gallery")} />
              <NavLink label="Features" onClick={(e: any) => { e.preventDefault(); scrollToSection("pricing"); }} isActive={isActive("/", "pricing")} />
              <NavLink label="Contact Us" to="/contact-us" isActive={isActive("/contact-us")} />
            </div>

            {/* CENTER: Logo gap — desktop only */}
            <div className="hidden lg:block w-[260px] pointer-events-none" />

            {/* RIGHT: Auth Buttons */}
            <div className="stotage-menu-col flex items-center justify-center lg:justify-end gap-3 z-10 pointer-events-none origin-right w-full lg:w-auto">
              {isAuthenticated && user ? (
                <div ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)} className="relative group/auth pointer-events-auto cursor-pointer">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-10 h-10 rounded-full border border-white/20 hover:border-[#00FFFF] transition-all" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-geist-reference font-black text-[10px]">
                      {getInitial(user.name, user.email)}
                    </div>
                  )}
                  {showDropdown && (
                    <div className="absolute right-0 bottom-full mb-4 w-52 bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                      <Link to="/settings" className="block px-6 py-4 text-[10px] font-geist-reference text-white/50 hover:text-white uppercase tracking-widest transition-all">Settings</Link>
                      <button onClick={onLogoutClick} className="w-full text-left px-6 py-4 text-[10px] font-geist-reference text-red-500 hover:bg-white/5 uppercase tracking-widest border-t border-white/5 transition-all">Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pointer-events-auto flex items-center gap-3">
                  {/* Open Studio — always shown */}
                  <CtaButton onClick={() => navigate("/openstudio")} size="sm" showArrow={false} className="navbar-cta-btn" icon={<HiPlus className="w-4 h-4" />}>
                    Open Studio
                  </CtaButton>
                  {/* Google Play — hidden on mobile (<640px) */}
                  <CtaButton
                    onClick={() => window.open("https://play.google.com/store/apps/details?id=com.diapp.productsnap&hl=en_IN", "_blank")}
                    size="sm" showArrow={false}
                    className="navbar-cta-btn navbar-google-play-btn hidden sm:flex"
                    icon={<BiLogoPlayStore className="w-5 h-5" />}
                  >
                    <span className="navbar-google-play-label">
                      <span className="navbar-google-play-kicker">GET IT ON</span>
                      <span className="navbar-google-play-title">Google Play</span>
                    </span>
                  </CtaButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── MOBILE BOTTOM TAB BAR — hidden on desktop ─── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around px-6 py-3"
        style={{
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Home */}
        <Link to="/" className="flex flex-col items-center gap-1 pointer-events-auto" onClick={() => setShowMobileMenu(false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={location.pathname === "/" ? "#00FFFF" : "rgba(255,255,255,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </Link>

        {/* Explore */}
        <Link to="/explore" className="flex flex-col items-center gap-1 pointer-events-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={location.pathname === "/explore" ? "#00FFFF" : "rgba(255,255,255,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </Link>

        {/* Pricing */}
        <button onClick={() => { setShowMobileMenu(false); scrollToSection("pricing"); }} className="flex flex-col items-center gap-1 pointer-events-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
          </svg>
        </button>

        {/* Contact */}
        <Link to="/contact-us" className="flex flex-col items-center gap-1 pointer-events-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={location.pathname === "/contact-us" ? "#00FFFF" : "rgba(255,255,255,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v12H4z" />
            <path d="M4 6l8 6 8-6" />
          </svg>
        </Link>

        {/* Menu */}
        <button onClick={() => setShowMobileMenu(true)} className="flex flex-col items-center gap-1 pointer-events-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </div>

      {/* ─── MOBILE FULL-SCREEN MENU ─── */}
      <div className={`fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center gap-12 transition-all duration-700 ease-in-out ${showMobileMenu ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20 pointer-events-none"}`}>
        <button onClick={() => setShowMobileMenu(false)} className="absolute top-10 right-10 text-white/50 hover:text-white">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <Link to="/" className="text-white text-5xl font-geist-reference font-black uppercase tracking-[0.4em] hover:text-[#00FFFF] transition-all" onClick={() => setShowMobileMenu(false)}>Home</Link>
        <Link to="/explore" className="text-white text-5xl font-geist-reference font-black uppercase tracking-[0.4em] hover:text-[#00FFFF] transition-all" onClick={() => setShowMobileMenu(false)}>Explore</Link>
        <button onClick={() => { setShowMobileMenu(false); scrollToSection("pricing"); }} className="text-white text-5xl font-geist-reference font-black uppercase tracking-[0.4em] hover:text-[#00FFFF] transition-all">Pricing</button>
        <Link to="/contact-us" className="text-white text-5xl font-geist-reference font-black uppercase tracking-[0.4em] hover:text-[#00FFFF] transition-all" onClick={() => setShowMobileMenu(false)}>Contact</Link>
      </div>
    </>
  );
};

export default Navbar;