import { useEffect, useLayoutEffect, useRef, useState, memo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroTitleReveal from "./HeroTitleReveal";
import CtaButton from "./CtaButton";
import bg1 from "../assets/images/bg1.png";
import bg2 from "../assets/images/bg2.png";
import bg3 from "../assets/images/bg3.png";
import bg4 from "../assets/images/bg-4.jpg";
import bg5 from "../assets/images/bg-5.jpg";
import bg6 from "../assets/images/bg-6.jpg";
import bg7 from "../assets/images/bg-7.jpg";
import bg8 from "../assets/images/bg-8.jpg";
import bg9 from "../assets/images/bg-9.jpg";
import bg10 from "../assets/images/bg-10.jpg";
import bg11 from "../assets/images/bg-11.jpg";

gsap.registerPlugin(ScrollTrigger);

const capabilities = [
  "Product Photoshoot",
  "Apparel Photoshoot",
  "Jewelry Photoshoot",
  "Footwear Photoshoot",
  "Packshot / Ecommerce Standard",
  "Festival Themes",
  "Ads & Promotions",
  "Social Media Creative",
  "Glamour and Beauty Shoots",
  "Cinematic Film Inspired Looks",
  "Model Portfolio Comp Card Styles",
  "Editorial Magazine Images",
  "Runway and Fashion Show Frames",
];

// Critical: Triple the items for a mathematically perfect infinite rolling loop
const infiniteCapabilities = [
  ...capabilities,
  ...capabilities,
  ...capabilities,
];

// (Unused getCapabilityWindow removed to fix console warnings)

const HeroSection = ({ onLoginClick }: { onLoginClick: () => void }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeCapability, setActiveCapability] = useState(capabilities.length);

  const allImages = [
    "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/ab18a524-10cb-49e0-83f3-1b72c28fa576.jpg",
    "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/803435aa-7540-41de-9a86-890e02e06196.jpg",
    "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/a188815f-6866-42ed-91cd-4bde5bdcdf47.jpg",
    "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/bf5bff34-ee2b-4286-a67a-40e6d9deee46.jpg",
    "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/d18210ca-f67d-4afc-afb9-0b73032158e8.jpg",
    "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/144652c0-402c-4e74-b369-05205f4bba87.jpg",
    "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/406a090c-80dd-4186-bd32-88d68f30876c.jpg",
    "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/7203d357-dcaf-40e5-84c7-1d3b9a6f5ff5.jpg",
    bg1,
    bg2,
    bg3,
    bg4,
    bg5,
    bg6,
    bg7,
    bg8,
    bg9,
    bg10,
    bg11,
  ];

  const col1Images = [allImages[0], allImages[4], allImages[1], allImages[5]];
  const col2Images = [allImages[2], allImages[6], allImages[3], allImages[7]];
  const col3Images = [allImages[8], allImages[1], allImages[9], allImages[10]];
  const col4Images = [
    allImages[11],
    allImages[12],
    allImages[13],
    allImages[14],
  ];
  const col5Images = [
    allImages[15],
    allImages[16],
    allImages[17],
    allImages[18],
  ];

  // Triple the items for seamless infinite scroll loops
  const col1Items = [...col1Images, ...col1Images, ...col1Images];
  const col2Items = [...col2Images, ...col2Images, ...col2Images];
  const col3Items = [...col3Images, ...col3Images, ...col3Images];
  const col4Items = [...col4Images, ...col4Images, ...col4Images];
  const col5Items = [...col5Images, ...col5Images, ...col5Images];

  // const col1Ref = useRef<HTMLDivElement>(null)
  // const col2Ref = useRef<HTMLDivElement>(null)
  // const col3Ref = useRef<HTMLDivElement>(null)
  // const col4Ref = useRef<HTMLDivElement>(null)
  // const col5Ref = useRef<HTMLDivElement>(null)
  const capabilityWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Infinite Column Scrolling (Smooth Tilted Carousel)
      // 1. High-Precision Infinite Loops moved to BackgroundCarousel sub-component
      // This prevents React state re-renders from interrupting the smooth GSAP motion.

      // Hero Content Sticky
      gsap.utils.toArray(".hero-capability-panel").forEach((panel: any) => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: panel,
          pinSpacing: false,
        });
      });

      gsap.fromTo(
        ".hero-capability-panel",
        { opacity: 0 },
        { opacity: 1, duration: 0.9, delay: 0.15, ease: "power2.out" },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // ─── LOCK INITIAL POSITION BEFORE FIRST PAINT (prevents flash/jump) ───────
  useLayoutEffect(() => {
    const windowEl = capabilityWindowRef.current;
    const len = capabilities.length;
    if (windowEl) {
      gsap.set(windowEl, {
        y: 189 - (len * 54 + 27),
        opacity: 1,
      });
    }
  }, []);

  useEffect(() => {
    // Start at the second set for infinite scroll headroom
    const len = capabilities.length;
    setActiveCapability(len);

    const timer = window.setInterval(() => {
      setActiveCapability((current) => current + 1);
    }, 1900);
    return () => window.clearInterval(timer);
  }, []);

  // Butter-Smooth GSAP Scrolling Engine
  useEffect(() => {
    const windowEl = capabilityWindowRef.current;
    const itemHeight = 54;
    const len = capabilities.length;

    if (windowEl) {
      const midpoint = 189; // 378 / 2
      gsap.to(windowEl, {
        y: midpoint - (activeCapability * itemHeight + 27),
        duration: 0.5,
        ease: "power4.out",
        overwrite: "auto",
        onComplete: () => {
          // SEAMLESS JUMP: Mathematically reset when we cross the middle set
          if (activeCapability >= len * 2) {
            const resetIdx = activeCapability - len;
            setActiveCapability(resetIdx);
            gsap.set(windowEl, {
              y: midpoint - (resetIdx * itemHeight + 27),
            });
          }
        },
      });
    }
  }, [activeCapability]);

  return (
    <section
      ref={sectionRef}
      data-hero-section
      className="relative min-h-[145vh] overflow-hidden flex items-center justify-center py-12 md:py-24 bg-[#000]"
    >
      <style>{`
        .hero-word-clip {
          line-height: 1.05;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        .hero-word-slide {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          will-change: transform;
        }
        .hero-title-reveal .hero-word-slide span {
          transform: translateZ(0);
        }
        nav, nav *, .hero-content { will-change: transform, opacity, height; }
        .hero-capability-window {
          will-change: transform;
        }
        .hero-capability-item {
          font-family: "GeistReference", "Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: -0.045em;
          line-height: 1;
          font-feature-settings: "ss02" 1;
          -webkit-font-feature-settings: "ss02" 1;
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-kerning: normal;
          font-synthesis: none;
          transition:
            opacity 300ms ease,
            color 300ms ease,
            transform 300ms ease,
            filter 300ms ease;
        }

        @media (min-width: 1280px) {
          .hero-capability-item {
            font-size: 24px;
          }
        }

        @media (max-width: 768px) {
          .hero-title-reveal .font-clash-display {
            font-size: 40px !important;
            letter-spacing: -1px !important;
            line-height: 1.1 !important;
          }
          .hero-content {
            top: 25vh !important;
            height: auto !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          [data-hero-section] {
            min-h-[100vh] !important;
          }
        }

      `}</style>

      {/* Background Image Base */}
      <div className="absolute inset-0 z-0" />

      {/* Noise Overlay */}
      <svg className="pointer-events-none absolute inset-0 z-10 opacity-[0.01] w-full h-full">
        <filter id="stotage-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#stotage-grain)"></rect>
      </svg>

      {/* 5-Line Smooth Carousel Canvas - Memoized to prevent React-induced jitters */}
      <BackgroundCarousel
        col1Items={col1Items}
        col2Items={col2Items}
        col3Items={col3Items}
        col4Items={col4Items}
        col5Items={col5Items}
      />

      {/* Vignette mask to smoothly fade carousel at edges */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_120%_120%_at_50%_50%,transparent_20%,#000000_100%)]" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black via-transparent to-black opacity-80" />
      {/* Bottom shadow fade for smooth section transition */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none h-[200px] bg-gradient-to-t from-black via-black/80 to-transparent" />

      {/* 4-sided corner brackets */}
      <div className="absolute inset-[20px] md:inset-[30px] z-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-white/20" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-white/20" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-white/20" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-white/20" />
      </div>

      {/* Hero Content - Left Side */}

      {/* Change: increase height to show 3 up and 3 down (approx 7 * 80px = 560px) */}
      <div className="hero-capability-panel hero-content pointer-events-none absolute inset-x-0 w-full px-[3vw] xl:px-[5vw] top-[40vh] z-[70] flex flex-col md:grid h-auto md:h-[378px] overflow-hidden text-center md:text-left grid-cols-12 gap-4 items-center">
        {/* ── LEFT: Text Content ── */}
        <div className="pointer-events-auto z-20 flex items-center justify-center md:justify-start col-span-12 md:col-span-5 xl:col-span-5 px-4 md:px-8 lg:px-10">
          <div className="flex flex-col items-center md:items-start gap-3 md:gap-4">
            <HeroTitleReveal />
            <p className="hero-capability-item font-geist-reference text-center md:text-left text-[#ffffff] py-1 px-3">
              In 3 minutes
            </p>
            <CtaButton
              onClick={onLoginClick}
              className="mt-0 pointer-events-auto"
            >
              Get started
            </CtaButton>
          </div>
        </div>

        {/* ── RIGHT: Capability Animation (Stationary Viewfinder + Rolling List) ── */}
        <div className="pointer-events-auto z-50 hidden md:flex h-full w-full items-start relative overflow-hidden col-span-7 xl:col-span-7">
          {/* CRITICAL INNER WRAPPER: Moves the absolutely-positioned arrow alongside the text natively! */}
          <div className="relative h-full w-full ml-[10%] lg:ml-[20%] xl:ml-[40%]">
            {/* Stationary Viewfinder Pointer - Fixed in center with Heartbeat */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-[60] flex items-center">
              <div className="viewfinder-arrow h-0 w-0 border-y-[15px] border-l-[25px] border-y-transparent border-l-[#00FFFF] scale-100" />
            </div>

            <div
              ref={capabilityWindowRef}
              className="hero-capability-window flex w-full flex-col will-change-transform"
              style={{ transform: "translateY(-270px)", opacity: 1 }} // GSAP controls transform - starts with correct initial math
            >
              {infiniteCapabilities.map((capability, i) => {
                const isActive = i === activeCapability;
                const distance = Math.abs(i - activeCapability);

                // Map colors based on distance from active center
                const colors = [
                  "#a1a1aa",
                  "#8f8f97",
                  "#73737d",
                  "#5f5f68",
                  "#4a4a52",
                ];
                const activeColor =
                  colors[Math.min(distance, colors.length - 1)];
                const isVisibleRange = distance <= 3;

                return (
                  <div
                    key={`${capability}-${i}`}
                    className={`hero-capability-item flex h-[54px] w-full items-center gap-10 whitespace-nowrap font-geist-reference z-50 px-[60px] ${isActive ? "active" : ""}`}
                    style={{
                      opacity: isActive ? 1 : isVisibleRange ? 0.6 : 0,
                      color: isActive ? "#FFFFFF" : activeColor,
                      transform: "none",
                      willChange: "transform, opacity, color",
                    }}
                  >
                    <span className="font-geist-reference" style={{ color: "inherit" }}>
                      {capability}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Close inner wrapper */}
          </div>
        </div>
      </div>

      <div className="hero-capability-panel pointer-events-auto absolute bottom-[12vh] left-6 right-6 z-30 flex flex-col md:hidden">
        <div className="mb-3 flex items-center justify-center gap-3">
          <span className="h-0 w-0 border-y-8 border-l-14 border-y-transparent border-l-[#00FFFF]" />
          <span className="font-geist-reference text-lg leading-none text-white">
            {capabilities[activeCapability % capabilities.length]}
          </span>
        </div>
        <div className="flex gap-1.5">
          {capabilities.map((capability, index) => (
            <span
              key={capability}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${index === activeCapability % capabilities.length
                ? "bg-[#00FFFF]"
                : "bg-white/20"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Isolated Carousel Component to prevent React state changes from causing stutter
const BackgroundCarousel = memo(
  ({ col1Items, col2Items, col3Items, col4Items, col5Items }: any) => {
    const c1 = useRef(null),
      c2 = useRef(null),
      c3 = useRef(null),
      c4 = useRef(null),
      c5 = useRef(null);

    useEffect(() => {
      const config = [
        { ref: c1, d: 90 },
        { ref: c2, d: 104 },
        { ref: c3, d: 76 },
        { ref: c4, d: 96 },
        { ref: c5, d: 110 },
      ];

      config.forEach((col) => {
        const wrap = col.ref.current as HTMLDivElement | null;
        if (wrap) {
          // Calculate the precise height of one complete group (including the trailing gap)
          // by measuring the distance between the first item of set 1 and first item of set 2.
          const numBaseItems = Math.floor(wrap.children.length / 3);
          const firstItem = wrap.children[0] as HTMLElement;
          const startOfSecondSet = wrap.children[numBaseItems] as HTMLElement;
          const setHeight =
            startOfSecondSet && firstItem
              ? startOfSecondSet.offsetTop - firstItem.offsetTop
              : wrap.offsetHeight / 3;

          // Pure linear infinite motion - no onUpdate reset needed for GSAP repeat
          gsap.to(wrap, {
            y: -setHeight,
            duration: col.d,
            repeat: -1,
            ease: "none",
            force3D: true,
          });
        }
      });
    }, []);

    return (
      <div className="absolute inset-[-100%] z-[5] flex items-center justify-center pointer-events-none opacity-35">
        <div className="relative w-full h-full flex justify-center gap-4 sm:gap-6 lg:gap-8 origin-center -rotate-12 scale-[1.05]">
          {[
            { ref: c1, items: col1Items, mt: "0" },
            { ref: c2, items: col2Items, mt: "10vh" },
            { ref: c3, items: col3Items, mt: "0" },
            { ref: c4, items: col4Items, mt: "-8vh" },
            { ref: c5, items: col5Items, mt: "15vh" },
          ].map((col, idx) => (
            <div
              key={idx}
              ref={col.ref}
              className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-[280px] sm:w-[350px] lg:w-[420px] will-change-transform"
              style={{ marginTop: col.mt }}
            >
              {col.items.map((src: string, i: number) => (
                <div
                  key={i}
                  className="w-full shrink-0 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-white/5"
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 hover:brightness-110 transition-all duration-1000"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  },
  () => true,
); // Never re-render based on props

export default HeroSection;
