// import { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import c1 from "../assets/images/c1.png";
// import c2 from "../assets/images/c2.jpg";
// import c3 from "../assets/images/5f137c28-fc9f-4cfa-a746-376ea93c84b4.jpg";
// import c4 from "../assets/images/c4.png";
// import c5 from "../assets/images/c5.jpg";
// import c6 from "../assets/images/c6.png";
// import c7 from "../assets/images/c1.jpeg";
// import c8 from "../assets/images/c8.jpg";
// import c9 from "../assets/images/c3.png";
// import c10 from "../assets/images/c10.png";
// import c11 from "../assets/images/c11.jpg";
// import c12 from "../assets/images/c12.png";
// import CtaButton from "./CtaButton";

// gsap.registerPlugin(ScrollTrigger);

// const DEMO_CASES = [
//   {
//     input: { src: c10, title: "Product", meta: "Input" },
//     model: { src: c11, title: "Model ", meta: "Model" },
//     generated: { src: c12, title: "Studio Product shoot" },
//   },
//   {
//     input: { src: c2, title: "Earings", meta: "Input" },
//     model: { src: c1, title: "Fashion Pose", meta: "Model" },
//     generated: { src: c3, title: "Jewelry Photoshoot" },
//   },
//   {
//     input: { src: c5, title: "Designer Purse", meta: "Input" },
//     model: { src: c4, title: "Fashion Model", meta: "Model" },
//     generated: { src: c6, title: "Luxury Fashion Campaign" },
//   },
//   {
//     input: { src: c8, title: "Product", meta: "Input" },
//     model: { src: c7, title: "Model", meta: "Model" },
//     generated: { src: c9, title: "LifeStyle Photoshoot" },
//   },
// ];

// const CYCLING_WORDS = [
//   "intelligence",
//   "Innovation",
//   "Commerce",
//   "Possibility",
//   "Perfection",
// ];

// // The two SVG paths — must match exactly what's in the SVG below
// const PATH_1 = "M365 135 C620 132 770 194 980 300 C1180 380 1345 365 1365 365";
// const PATH_2 = "M345 545 C625 550 770 500 980 430 C1180 355 1345 365 1365 365";

// type NodeData = {
//   src: string;
//   title: string;
//   meta?: string;
// };

// type MediaNodeProps = {
//   items: NodeData[];
//   activeIndex: number;
//   alt: string;
//   className: string;
//   imageClassName?: string;
//   imageFit?: "cover" | "contain";
// };

// const MediaNode = ({
//   items,
//   activeIndex,
//   alt,
//   className,
//   imageClassName = "",
//   imageFit = "cover",
// }: MediaNodeProps) => (
//   <div className={`feature-node absolute flex flex-col ${className}`}>
//     <div className="mb-2 relative h-[14px] overflow-hidden">
//       {items.map((item, i) => (
//         <div
//           key={i}
//           className={`absolute inset-0 flex items-center justify-between px-1 text-[13px] leading-none text-white/68 transition-all duration-700
//             ${i === activeIndex ? "opacity-100 translate-y-0" : i < activeIndex ? "opacity-0 -translate-y-4" : "opacity-0 translate-y-4"}
//           `}
//         >
//           <span>{item.title}</span>
//           <span className="text-white/35">{item.meta}</span>
//         </div>
//       ))}
//     </div>
//     <div
//       className={`feature-node-frame relative flex w-full overflow-hidden rounded-[18px] bg-white/5 ring-1 ring-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ${imageClassName}`}
//     >
//       {items.map((item, i) => (
//         <img
//           key={i}
//           src={item.src}
//           alt={alt}
//           loading="lazy"
//           decoding="async"
//           className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${imageFit === "contain" ? "object-contain" : "object-cover"} ${i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
//         />
//       ))}
//     </div>
//   </div>
// );

// // Typewriter hook
// function useTypewriter(
//   words: string[],
//   typingSpeed = 90,
//   deletingSpeed = 55,
//   pauseMs = 1800,
// ) {
//   const [displayed, setDisplayed] = useState("");
//   const [wordIndex, setWordIndex] = useState(0);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [started, setStarted] = useState(false);

//   useEffect(() => {
//     const t = setTimeout(() => setStarted(true), 600);
//     return () => clearTimeout(t);
//   }, []);

//   useEffect(() => {
//     if (!started) return;
//     const current = words[wordIndex];

//     if (!isDeleting && displayed === current) {
//       const t = setTimeout(() => setIsDeleting(true), pauseMs);
//       return () => clearTimeout(t);
//     }
//     if (isDeleting && displayed === "") {
//       setIsDeleting(false);
//       setWordIndex((i) => (i + 1) % words.length);
//       return;
//     }

//     const speed = isDeleting ? deletingSpeed : typingSpeed;
//     const next = isDeleting
//       ? current.slice(0, displayed.length - 1)
//       : current.slice(0, displayed.length + 1);

//     const t = setTimeout(() => setDisplayed(next), speed);
//     return () => clearTimeout(t);
//   }, [
//     displayed,
//     isDeleting,
//     wordIndex,
//     started,
//     words,
//     typingSpeed,
//     deletingSpeed,
//     pauseMs,
//   ]);

//   return displayed;
// }

// // ── Animated dot that travels along a path ──────────────────────────────────
// // Uses SVGGeometryElement.getTotalLength() + getPointAtLength() via rAF.
// type TravelingDotProps = {
//   pathD: string;
//   duration?: number; // ms for one full traversal
//   delay?: number; // ms initial delay
//   color?: string;
//   size?: number;
//   glowColor?: string;
//   /** direction: 1 = left→right (to center), -1 = right→left */
//   reverse?: boolean;
// };

// const TravelingDot = ({
//   pathD,
//   duration = 2800,
//   delay = 0,
//   color = "#00FFFF",
//   size = 5,
//   glowColor = "#00FFFF",
//   reverse = false,
// }: TravelingDotProps) => {
//   const circleRef = useRef<SVGCircleElement>(null);
//   const pathRef = useRef<SVGPathElement>(null);

//   useEffect(() => {
//     const circle = circleRef.current;
//     const path = pathRef.current;
//     if (!circle || !path) return;

//     const total = path.getTotalLength();
//     let raf: number;
//     let startTime: number | null = null;
//     let running = true;

//     const tick = (now: number) => {
//       if (!running) return;
//       if (startTime === null) startTime = now;
//       const elapsed = now - startTime;
//       // Loop forever; t goes 0→1
//       const t = (elapsed % duration) / duration;
//       const tDir = reverse ? 1 - t : t;
//       const pt = path.getPointAtLength(tDir * total);
//       circle.setAttribute("cx", String(pt.x));
//       circle.setAttribute("cy", String(pt.y));
//       // Fade in near start, fade out near end
//       const fade =
//         tDir < 0.08 ? tDir / 0.08 : tDir > 0.92 ? (1 - tDir) / 0.08 : 1;
//       circle.setAttribute("opacity", String(fade));
//       raf = requestAnimationFrame(tick);
//     };

//     const timeout = setTimeout(() => {
//       raf = requestAnimationFrame(tick);
//     }, delay);

//     return () => {
//       running = false;
//       cancelAnimationFrame(raf);
//       clearTimeout(timeout);
//     };
//   }, [pathD, duration, delay, reverse]);

//   return (
//     <>
//       {/* Hidden path used only for geometry */}
//       <path ref={pathRef} d={pathD} fill="none" stroke="none" />
//       {/* Glow layer */}
//       <circle
//         ref={circleRef}
//         r={size + 3}
//         fill={glowColor}
//         opacity={0}
//         style={{ filter: `blur(${size + 2}px)` }}
//       />
//       {/* Sharp dot (same element ref drives both via a wrapper — we duplicate) */}
//       <TravelingDotInner
//         pathD={pathD}
//         duration={duration}
//         delay={delay}
//         color={color}
//         size={size}
//         reverse={reverse}
//       />
//     </>
//   );
// };

// // Inner dot (the crisp circle) — shares the same loop logic
// const TravelingDotInner = ({
//   pathD,
//   duration = 2800,
//   delay = 0,
//   color = "#00FFFF",
//   size = 5,
//   reverse = false,
// }: Omit<TravelingDotProps, "glowColor">) => {
//   const circleRef = useRef<SVGCircleElement>(null);
//   const pathRef = useRef<SVGPathElement>(null);

//   useEffect(() => {
//     const circle = circleRef.current;
//     const path = pathRef.current;
//     if (!circle || !path) return;

//     const total = path.getTotalLength();
//     let raf: number;
//     let startTime: number | null = null;
//     let running = true;

//     const tick = (now: number) => {
//       if (!running) return;
//       if (startTime === null) startTime = now;
//       const elapsed = now - startTime;
//       const t = (elapsed % duration) / duration;
//       const tDir = reverse ? 1 - t : t;
//       const pt = path.getPointAtLength(tDir * total);
//       circle.setAttribute("cx", String(pt.x));
//       circle.setAttribute("cy", String(pt.y));
//       const fade =
//         tDir < 0.06 ? tDir / 0.06 : tDir > 0.94 ? (1 - tDir) / 0.06 : 1;
//       circle.setAttribute("opacity", String(fade));
//       raf = requestAnimationFrame(tick);
//     };

//     const timeout = setTimeout(() => {
//       raf = requestAnimationFrame(tick);
//     }, delay);

//     return () => {
//       running = false;
//       cancelAnimationFrame(raf);
//       clearTimeout(timeout);
//     };
//   }, [pathD, duration, delay, reverse]);

//   return (
//     <>
//       <path ref={pathRef} d={pathD} fill="none" stroke="none" />
//       <circle ref={circleRef} r={size} fill={color} opacity={0} />
//     </>
//   );
// };

// // ── Main section ─────────────────────────────────────────────────────────────
// const FeaturesSection = () => {
//   const sectionRef = useRef<HTMLElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const cursorRef = useRef<HTMLDivElement>(null);
//   const dotRef = useRef<HTMLDivElement>(null);
//   const typedText = useTypewriter(CYCLING_WORDS);
//   const [activeIndex, setActiveIndex] = useState(0);

//   useEffect(() => {
//     // Keep in sync with the traveling dots duration (2600ms) + delay (400ms)
//     // The dot arrives exactly after 3000ms.
//     const initialDelay = setTimeout(() => {
//       setActiveIndex(1);
//       const interval = setInterval(() => {
//         setActiveIndex((prev) => (prev + 1) % DEMO_CASES.length);
//       }, 2600);
//       return () => clearInterval(interval);
//     }, 400 + 2600);
//     return () => clearTimeout(initialDelay);
//   }, []);

//   useEffect(() => {
//     const section = sectionRef.current;
//     const cursor = cursorRef.current;
//     const dot = dotRef.current;
//     const canvas = canvasRef.current;
//     const ctxCanvas = canvas?.getContext("2d");
//     if (!section || !cursor || !dot || !canvas || !ctxCanvas) return;

//     const xSetterDot = gsap.quickSetter(dot, "x", "px");
//     const ySetterDot = gsap.quickSetter(dot, "y", "px");
//     const dotsGrid: {
//       x: number;
//       y: number;
//       originalX: number;
//       originalY: number;
//       size: number;
//     }[] = [];
//     const spacing = 40;
//     const mousePos = {
//       x: section.offsetWidth / 2,
//       y: section.offsetHeight / 2,
//     };
//     let animationFrameId: number;
//     let lastTime = 0;
//     let lastX = mousePos.x;
//     let lastY = mousePos.y;

//     const initGrid = () => {
//       dotsGrid.length = 0;
//       canvas.width = section.offsetWidth;
//       canvas.height = section.offsetHeight;

//       for (let x = spacing / 2; x < canvas.width; x += spacing) {
//         for (let y = spacing / 2; y < canvas.height; y += spacing) {
//           dotsGrid.push({ x, y, originalX: x, originalY: y, size: 0.8 });
//         }
//       }
//     };

//     const render = (time: number) => {
//       ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);

//       const deltaTime = time - lastTime;
//       lastTime = time;
//       const dxMouse = mousePos.x - lastX;
//       const dyMouse = mousePos.y - lastY;
//       const velocity =
//         Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse) / (deltaTime || 1);
//       lastX = mousePos.x;
//       lastY = mousePos.y;

//       dotsGrid.forEach((gridDot, i) => {
//         const dx = mousePos.x - gridDot.x;
//         const dy = mousePos.y - gridDot.y;
//         const dist = Math.sqrt(dx * dx + dy * dy);
//         const maxDist = 200;
//         const pulse = Math.sin(time * 0.002 + i * 0.1) * 0.5 + 0.5;

//         if (dist < maxDist) {
//           const force = (maxDist - dist) / maxDist;
//           gridDot.x = gridDot.originalX - dx * force * 0.15;
//           gridDot.y = gridDot.originalY - dy * force * 0.15;
//           ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.1 + force * 0.5})`;
//           ctxCanvas.beginPath();
//           ctxCanvas.arc(
//             gridDot.x,
//             gridDot.y,
//             gridDot.size + force * 2,
//             0,
//             Math.PI * 2,
//           );
//           ctxCanvas.fill();
//         } else {
//           gridDot.x += (gridDot.originalX - gridDot.x) * 0.1;
//           gridDot.y += (gridDot.originalY - gridDot.y) * 0.1;
//           ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.05 + pulse * 0.1})`;
//           ctxCanvas.beginPath();
//           ctxCanvas.arc(
//             gridDot.x,
//             gridDot.y,
//             gridDot.size + pulse * 0.5,
//             0,
//             Math.PI * 2,
//           );
//           ctxCanvas.fill();
//         }
//       });

//       const stretch = Math.min(1 + velocity * 0.1, 1.8);
//       const rotation = (Math.atan2(dyMouse, dxMouse) * 180) / Math.PI;
//       gsap.set(dot, {
//         scaleX: stretch,
//         scaleY: 1 / Math.sqrt(stretch),
//         rotation: velocity > 0.5 ? rotation : 0,
//         transformOrigin: "center center",
//       });

//       animationFrameId = requestAnimationFrame(render);
//     };

//     const handleMouseMove = (e: MouseEvent) => {
//       const rect = section.getBoundingClientRect();
//       const x = e.clientX - rect.left;
//       const y = e.clientY - rect.top;
//       mousePos.x = x;
//       mousePos.y = y;

//       gsap.to(cursor, { x, y, duration: 0.6, ease: "power3.out" });
//       xSetterDot(x);
//       ySetterDot(y);
//     };

//     initGrid();
//     gsap.set(cursor, { x: mousePos.x, y: mousePos.y });
//     gsap.set(dot, { x: mousePos.x, y: mousePos.y });
//     animationFrameId = requestAnimationFrame(render);

//     window.addEventListener("resize", initGrid);
//     section.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       cancelAnimationFrame(animationFrameId);
//       window.removeEventListener("resize", initGrid);
//       section.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       gsap.fromTo(
//         ".feature-node",
//         { opacity: 0, y: 34, scale: 0.96 },
//         {
//           opacity: 1,
//           y: 0,
//           scale: 1,
//           duration: 1,
//           stagger: 0.12,
//           ease: "power3.out",
//           scrollTrigger: {
//             trigger: sectionRef.current,
//             start: "top 70%",
//           },
//         },
//       );

//       gsap.fromTo(
//         ".feature-copy > *",
//         { opacity: 0, y: 22 },
//         {
//           opacity: 1,
//           y: 0,
//           duration: 0.9,
//           stagger: 0.12,
//           ease: "power3.out",
//           scrollTrigger: {
//             trigger: sectionRef.current,
//             start: "top 68%",
//           },
//         },
//       );

//       gsap.fromTo(
//         ".connector-path",
//         { strokeDashoffset: 1500, opacity: 0 },
//         {
//           strokeDashoffset: 0,
//           opacity: 1,
//           duration: 1.7,
//           stagger: 0.12,
//           ease: "power2.out",
//           scrollTrigger: {
//             trigger: sectionRef.current,
//             start: "top 66%",
//           },
//         },
//       );
//     }, sectionRef);

//     return () => ctx.revert();
//   }, []);
//   // relative overflow-hidden bg-black px-5 py-16 text-white md:px-8 lg:py-20
//   return (
//     <section
//       ref={sectionRef}
//       className="relative overflow-hidden border-y-[3rem] border-black bg-black px-5 py-16 text-white md:border-y-[5rem] md:px-8 lg:py-20"
//     >
//       <style>{`
//         .features-dot-grid {
//           background-image: radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px);
//           background-size: 15px 15px;
//         }
//         .connector-path {
//           stroke-dasharray: 1500;
//           filter: drop-shadow(0 0 4px rgba(255,255,255,0.12));
//         }
//         .feature-node-frame {
//           transform: translateZ(0);
//           backface-visibility: hidden;
//         }
//         /* Blinking cursor */
//         .typewriter-cursor {
//           display: inline-block;
//           width: 3px;
//           margin-left: 2px;
//           background: #00FFFF;
//           animation: blink 0.75s step-end infinite;
//           vertical-align: baseline;
//           border-radius: 1px;
//         }
//         @keyframes blink {
//           0%, 100% { opacity: 1; }
//           50%       { opacity: 0; }
//         }
//         @media (max-width: 1023px) {
//           .feature-node {
//             position: relative;
//             inset: auto;
//             width: min(100%, 430px);
//           }
//         }
//       `}</style>

//       <canvas
//         ref={canvasRef}
//         className="pointer-events-none absolute inset-0 z-0"
//         style={{ mixBlendMode: "screen" }}
//       />
//       <div
//         ref={cursorRef}
//         className="pointer-events-none absolute z-50 hidden w-20 h-20 -ml-10 -mt-10 rounded-full bg-white/5 border border-[#00FFFF]/20"
//         style={{ backdropFilter: "blur(4px)" }}
//       />
//       <div
//         ref={dotRef}
//         className="pointer-events-none absolute z-50 hidden w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
//       />

//       {/* ── SVG: static lines + animated traveling dots ── */}
//       <svg
//         className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
//         viewBox="0 0 1856 730"
//         preserveAspectRatio="none"
//         aria-hidden="true"
//       >
//         {/* Static connector paths */}
//         <path
//           className="connector-path"
//           d={PATH_1}
//           fill="none"
//           stroke="rgba(255,255,255,0.19)"
//           strokeWidth="3.1"
//         />
//         <path
//           className="connector-path"
//           d={PATH_2}
//           fill="none"
//           stroke="rgba(255,255,255,0.19)"
//           strokeWidth="3.1"
//         />

//         {/* ── Traveling dots on PATH_1 (top line, left→right) ── */}
//         {/* Primary green dot */}
//         <TravelingDot
//           pathD={PATH_1}
//           duration={2600}
//           delay={400}
//           color="#00FFFF"
//           glowColor="#00FFFF"
//           size={4.5}
//         />
//         {/* Secondary white dot, offset in time */}
//         {/* <TravelingDot
//           pathD={PATH_1}
//           duration={2600}
//           delay={1700}
//           color="rgba(255,255,255,0.85)"
//           glowColor="rgba(255,255,255,0.5)"
//           size={3}
//         /> */}

//         {/* ── Traveling dots on PATH_2 (bottom line, left→right) ── */}
//         <TravelingDot
//           pathD={PATH_2}
//           duration={2600}
//           delay={400}
//           color="#00FFFF"
//           glowColor="#00FFFF"
//           size={4.5}
//         />
//         {/* <TravelingDot
//           pathD={PATH_2}
//           duration={2800}
//           delay={2200}
//           color="rgba(255,255,255,0.85)"
//           glowColor="rgba(255,255,255,0.5)"
//           size={3}
//         /> */}
//       </svg>

//       <div className="relative z-10 mx-auto flex flex-col items-center gap-8 px-6 lg:block lg:h-[668px]">
//         {/* Center copy */}
//         <div className="feature-copy order-1 flex w-[min(92vw,550px)] flex-col items-center text-center lg:absolute lg:left-[50%] lg:top-[45%] lg:-translate-x-1/2 lg:-translate-y-1/2">
//           <div
//             className="mb-4 flex items-center justify-center gap-3"
//             style={{
//               translate: "none",
//               rotate: "none",
//               scale: "none",
//               transform: "translate(0px, 0px)",
//               opacity: 1,
//             }}
//           >
//             <div className="h-2.5 w-2.5 rounded-full border border-[#00FFFF]"></div>
//             <p className="font-geist-reference text-[10px] font-bold uppercase tracking-[0.25em] text-[#00FFFF] md:text-[11px]">
//               Creative Intelligence
//             </p>
//           </div>
//           <h2 className="font-heading text-[clamp(2.25rem,3vw,3.45rem)] font-semibold leading-[1.03] tracking-normal">
//             Where creativity{" "}
//             <span className="font-serif italic text-white/70">meets</span>{" "}
//             <span className="inline-block whitespace-nowrap">
//               <span className="text-white">{typedText}</span>
//               <span
//                 className="typewriter-cursor"
//                 aria-hidden="true"
//                 style={{ height: "0.85em" }}
//               />
//             </span>{" "}
//             ?
//           </h2>

//           <p className="font-geist-reference mt-5 max-w-[700px] text-lg leading-[1.35] tracking-[-0.025em] text-white/72 md:text-[18px]">
//             Bring your ideas to life with high quality AI generated visuals.
//             Turn concepts into polished images that match your style and
//             purpose.
//           </p>
//           <CtaButton
//             as="a"
//             href="#create"
//             showArrow={false}
//             className="mt-10 cursor-none text-[clamp(1rem,1.65vw,1.2rem)]"
//           >
//             Try it now
//           </CtaButton>
//         </div>

//         {/* Left top */}
//         <MediaNode
//           items={DEMO_CASES.map((c) => c.input)}
//           activeIndex={activeIndex}
//           alt="Original product before generation"
//           className="order-2 lg:left-[4.4%] lg:top-[0%] lg:w-[265px]"
//           imageClassName="aspect-[5/4]"
//           imageFit="cover"
//         />

//         {/* Left bottom */}
//         <MediaNode
//           items={DEMO_CASES.map((c) => c.model)}
//           activeIndex={activeIndex}
//           alt="Selected model reference"
//           className="order-3 lg:left-[5.0%] lg:top-[55%] lg:w-[250px]"
//           imageClassName="aspect-[4/5]"
//         />

//         {/* Right */}
//         <MediaNode
//           items={DEMO_CASES.map((c) => c.generated)}
//           activeIndex={activeIndex}
//           alt="Generated product photoshoot result"
//           className="order-4 lg:right-[2.1%] lg:top-[28%] lg:w-[450px]"
//           imageClassName="aspect-[16/9]"
//         />
//       </div>
//     </section>
//   );
// };

// export default FeaturesSection;

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import c1 from "../assets/images/c1.png";
import c2 from "../assets/images/c2.jpg";
import c3 from "../assets/images/5f137c28-fc9f-4cfa-a746-376ea93c84b4.jpg";
import c4 from "../assets/images/c4.png";
import c5 from "../assets/images/c5.jpg";
import c6 from "../assets/images/c6.png";
import c7 from "../assets/images/c1.jpeg";
import c8 from "../assets/images/c8.jpg";
import c9 from "../assets/images/c3.png";
import c10 from "../assets/images/c10.png";
import c11 from "../assets/images/c11.jpg";
import c12 from "../assets/images/c12.png";
import CtaButton from "./CtaButton";

gsap.registerPlugin(ScrollTrigger);

const DEMO_CASES = [
  {
    input: { src: c10, title: "Product", meta: "Input" },
    model: { src: c11, title: "Model ", meta: "Model" },
    generated: { src: c12, title: "Studio Product shoot" },
  },
  {
    input: { src: c2, title: "Earings", meta: "Input" },
    model: { src: c1, title: "Fashion Pose", meta: "Model" },
    generated: { src: c3, title: "Jewelry Photoshoot" },
  },
  {
    input: { src: c5, title: "Designer Purse", meta: "Input" },
    model: { src: c4, title: "Fashion Model", meta: "Model" },
    generated: { src: c6, title: "Luxury Fashion Campaign" },
  },
  {
    input: { src: c8, title: "Product", meta: "Input" },
    model: { src: c7, title: "Model", meta: "Model" },
    generated: { src: c9, title: "LifeStyle Photoshoot" },
  },
];

const CYCLING_WORDS = [
  "intelligence",
  "Innovation",
  "Commerce",
  "Possibility",
  "Perfection",
];

// The two SVG paths — must match exactly what's in the SVG below
const PATH_1 = "M365 135 C620 132 770 194 980 300 C1180 380 1345 365 1365 365";
const PATH_2 = "M345 545 C625 550 770 500 980 430 C1180 355 1345 365 1365 365";

type NodeData = {
  src: string;
  title: string;
  meta?: string;
};

type MediaNodeProps = {
  items: NodeData[];
  activeIndex: number;
  alt: string;
  className: string;
  imageClassName?: string;
  imageFit?: "cover" | "contain";
};

const MediaNode = ({
  items,
  activeIndex,
  alt,
  className,
  imageClassName = "",
  imageFit = "cover",
}: MediaNodeProps) => (
  <div className={`feature-node absolute flex flex-col ${className}`}>
    <div className="mb-2 relative h-[14px] overflow-hidden">
      {items.map((item, i) => (
        <div
          key={i}
          className={`absolute inset-0 flex items-center justify-between px-1 text-[13px] leading-none text-white/68 transition-all duration-700
            ${i === activeIndex ? "opacity-100 translate-y-0" : i < activeIndex ? "opacity-0 -translate-y-4" : "opacity-0 translate-y-4"}
          `}
        >
          <span>{item.title}</span>
          <span className="text-white/35">{item.meta || ""}</span>
        </div>
      ))}
    </div>
    <div
      className={`feature-node-frame relative flex w-full overflow-hidden rounded-[18px] bg-white/5 ring-1 ring-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ${imageClassName}`}
    >
      {items.map((item, i) => (
        <img
          key={i}
          src={item.src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${imageFit === "contain" ? "object-contain" : "object-cover"} ${i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        />
      ))}
    </div>
  </div>
);

// Typewriter hook
function useTypewriter(
  words: string[],
  typingSpeed = 90,
  deletingSpeed = 55,
  pauseMs = 1800,
) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!started) return;
    const current = words[wordIndex];

    if (!isDeleting && displayed === current) {
      const t = setTimeout(() => setIsDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (isDeleting && displayed === "") {
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
      return;
    }

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const next = isDeleting
      ? current.slice(0, displayed.length - 1)
      : current.slice(0, displayed.length + 1);

    const t = setTimeout(() => setDisplayed(next), speed);
    return () => clearTimeout(t);
  }, [
    displayed,
    isDeleting,
    wordIndex,
    started,
    words,
    typingSpeed,
    deletingSpeed,
    pauseMs,
  ]);

  return displayed;
}

// ── Animated dot that travels along a path ──────────────────────────────────
// Uses SVGGeometryElement.getTotalLength() + getPointAtLength() via rAF.
type TravelingDotProps = {
  pathD: string;
  duration?: number; // ms for one full traversal
  delay?: number; // ms initial delay
  color?: string;
  size?: number;
  glowColor?: string;
  /** direction: 1 = left→right (to center), -1 = right→left */
  reverse?: boolean;
};

const TravelingDot = ({
  pathD,
  duration = 2800,
  delay = 0,
  color = "#00FFFF",
  size = 5,
  glowColor = "#00FFFF",
  reverse = false,
}: TravelingDotProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const circle = circleRef.current;
    const path = pathRef.current;
    if (!circle || !path) return;

    const total = path.getTotalLength();
    let raf: number;
    let startTime: number | null = null;
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      // Loop forever; t goes 0→1
      const t = (elapsed % duration) / duration;
      const tDir = reverse ? 1 - t : t;
      const pt = path.getPointAtLength(tDir * total);
      circle.setAttribute("cx", String(pt.x));
      circle.setAttribute("cy", String(pt.y));
      // Fade in near start, fade out near end
      const fade =
        tDir < 0.08 ? tDir / 0.08 : tDir > 0.92 ? (1 - tDir) / 0.08 : 1;
      circle.setAttribute("opacity", String(fade));
      raf = requestAnimationFrame(tick);
    };

    const timeout = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [pathD, duration, delay, reverse]);

  return (
    <>
      {/* Hidden path used only for geometry */}
      <path ref={pathRef} d={pathD} fill="none" stroke="none" />
      {/* Glow layer */}
      <circle
        ref={circleRef}
        r={size + 3}
        fill={glowColor}
        opacity={0}
        style={{ filter: `blur(${size + 2}px)` }}
      />
      {/* Sharp dot (same element ref drives both via a wrapper — we duplicate) */}
      <TravelingDotInner
        pathD={pathD}
        duration={duration}
        delay={delay}
        color={color}
        size={size}
        reverse={reverse}
      />
    </>
  );
};

// Inner dot (the crisp circle) — shares the same loop logic
const TravelingDotInner = ({
  pathD,
  duration = 2800,
  delay = 0,
  color = "#00FFFF",
  size = 5,
  reverse = false,
}: Omit<TravelingDotProps, "glowColor">) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const circle = circleRef.current;
    const path = pathRef.current;
    if (!circle || !path) return;

    const total = path.getTotalLength();
    let raf: number;
    let startTime: number | null = null;
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const t = (elapsed % duration) / duration;
      const tDir = reverse ? 1 - t : t;
      const pt = path.getPointAtLength(tDir * total);
      circle.setAttribute("cx", String(pt.x));
      circle.setAttribute("cy", String(pt.y));
      const fade =
        tDir < 0.06 ? tDir / 0.06 : tDir > 0.94 ? (1 - tDir) / 0.06 : 1;
      circle.setAttribute("opacity", String(fade));
      raf = requestAnimationFrame(tick);
    };

    const timeout = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [pathD, duration, delay, reverse]);

  return (
    <>
      <path ref={pathRef} d={pathD} fill="none" stroke="none" />
      <circle ref={circleRef} r={size} fill={color} opacity={0} />
    </>
  );
};

// ── Main section ─────────────────────────────────────────────────────────────
const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const typedText = useTypewriter(CYCLING_WORDS);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Keep in sync with the traveling dots duration (2600ms) + delay (400ms)
    // The dot arrives exactly after 3000ms.
    const initialDelay = setTimeout(() => {
      setActiveIndex(1);
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % DEMO_CASES.length);
      }, 2600);
      return () => clearInterval(interval);
    }, 400 + 2600);
    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const canvas = canvasRef.current;
    const ctxCanvas = canvas?.getContext("2d");
    if (!section || !cursor || !dot || !canvas || !ctxCanvas) return;

    const xSetterDot = gsap.quickSetter(dot, "x", "px");
    const ySetterDot = gsap.quickSetter(dot, "y", "px");
    const dotsGrid: {
      x: number;
      y: number;
      originalX: number;
      originalY: number;
      size: number;
    }[] = [];
    const spacing = 40;
    const mousePos = {
      x: section.offsetWidth / 2,
      y: section.offsetHeight / 2,
    };
    let animationFrameId: number;
    let lastTime = 0;
    let lastX = mousePos.x;
    let lastY = mousePos.y;

    const initGrid = () => {
      dotsGrid.length = 0;
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;

      for (let x = spacing / 2; x < canvas.width; x += spacing) {
        for (let y = spacing / 2; y < canvas.height; y += spacing) {
          dotsGrid.push({ x, y, originalX: x, originalY: y, size: 0.8 });
        }
      }
    };

    const render = (time: number) => {
      ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);

      const deltaTime = time - lastTime;
      lastTime = time;
      const dxMouse = mousePos.x - lastX;
      const dyMouse = mousePos.y - lastY;
      const velocity =
        Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse) / (deltaTime || 1);
      lastX = mousePos.x;
      lastY = mousePos.y;

      dotsGrid.forEach((gridDot, i) => {
        const dx = mousePos.x - gridDot.x;
        const dy = mousePos.y - gridDot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;
        const pulse = Math.sin(time * 0.002 + i * 0.1) * 0.5 + 0.5;

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          gridDot.x = gridDot.originalX - dx * force * 0.15;
          gridDot.y = gridDot.originalY - dy * force * 0.15;
          ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.1 + force * 0.5})`;
          ctxCanvas.beginPath();
          ctxCanvas.arc(
            gridDot.x,
            gridDot.y,
            gridDot.size + force * 2,
            0,
            Math.PI * 2,
          );
          ctxCanvas.fill();
        } else {
          gridDot.x += (gridDot.originalX - gridDot.x) * 0.1;
          gridDot.y += (gridDot.originalY - gridDot.y) * 0.1;
          ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.05 + pulse * 0.1})`;
          ctxCanvas.beginPath();
          ctxCanvas.arc(
            gridDot.x,
            gridDot.y,
            gridDot.size + pulse * 0.5,
            0,
            Math.PI * 2,
          );
          ctxCanvas.fill();
        }
      });

      const stretch = Math.min(1 + velocity * 0.1, 1.8);
      const rotation = (Math.atan2(dyMouse, dxMouse) * 180) / Math.PI;
      gsap.set(dot, {
        scaleX: stretch,
        scaleY: 1 / Math.sqrt(stretch),
        rotation: velocity > 0.5 ? rotation : 0,
        transformOrigin: "center center",
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePos.x = x;
      mousePos.y = y;

      gsap.to(cursor, { x, y, duration: 0.6, ease: "power3.out" });
      xSetterDot(x);
      ySetterDot(y);
    };

    initGrid();
    gsap.set(cursor, { x: mousePos.x, y: mousePos.y });
    gsap.set(dot, { x: mousePos.x, y: mousePos.y });
    animationFrameId = requestAnimationFrame(render);

    window.addEventListener("resize", initGrid);
    section.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", initGrid);
      section.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".feature-node",
        { opacity: 0, y: 34, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        },
      );

      gsap.fromTo(
        ".feature-copy > *",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 68%",
          },
        },
      );

      gsap.fromTo(
        ".connector-path",
        { strokeDashoffset: 1500, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 1.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 66%",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);
  // relative overflow-hidden bg-black px-5 py-16 text-white md:px-8 lg:py-20
  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y-[3rem] border-black bg-black px-5 py-16 text-white md:border-y-[5rem] md:px-8 lg:py-20"
    >
      <style>{`
        .features-dot-grid {
          background-image: radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px);
          background-size: 15px 15px;
        }
        .connector-path {
          stroke-dasharray: 1500;
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.12));
        }
        .feature-node-frame {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        /* Blinking cursor */
        .typewriter-cursor {
          display: inline-block;
          width: 3px;
          margin-left: 2px;
          background: #00FFFF;
          animation: blink 0.75s step-end infinite;
          vertical-align: baseline;
          border-radius: 1px;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @media (max-width: 1023px) {
          .feature-node {
            position: relative;
            inset: auto;
            width: min(100%, 430px);
          }
        }
      `}</style>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ mixBlendMode: "screen" }}
      />
      <div
        ref={cursorRef}
        className="pointer-events-none absolute z-50 hidden w-20 h-20 -ml-10 -mt-10 rounded-full bg-white/5 border border-[#00FFFF]/20"
        style={{ backdropFilter: "blur(4px)" }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none absolute z-50 hidden w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
      />

      {/* ── SVG: static lines + animated traveling dots ── */}
      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        viewBox="0 0 1856 730"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Static connector paths */}
        <path
          className="connector-path"
          d={PATH_1}
          fill="none"
          stroke="rgba(255,255,255,0.19)"
          strokeWidth="3.1"
        />
        <path
          className="connector-path"
          d={PATH_2}
          fill="none"
          stroke="rgba(255,255,255,0.19)"
          strokeWidth="3.1"
        />

        {/* ── Traveling dots on PATH_1 (top line, left→right) ── */}
        {/* Primary green dot */}
        <TravelingDot
          pathD={PATH_1}
          duration={2600}
          delay={400}
          color="#00FFFF"
          glowColor="#00FFFF"
          size={4.5}
        />
        {/* Secondary white dot, offset in time */}
        {/* <TravelingDot
          pathD={PATH_1}
          duration={2600}
          delay={1700}
          color="rgba(255,255,255,0.85)"
          glowColor="rgba(255,255,255,0.5)"
          size={3}
        /> */}

        {/* ── Traveling dots on PATH_2 (bottom line, left→right) ── */}
        <TravelingDot
          pathD={PATH_2}
          duration={2600}
          delay={400}
          color="#00FFFF"
          glowColor="#00FFFF"
          size={4.5}
        />
        {/* <TravelingDot
          pathD={PATH_2}
          duration={2800}
          delay={2200}
          color="rgba(255,255,255,0.85)"
          glowColor="rgba(255,255,255,0.5)"
          size={3}
        /> */}
      </svg>

      <div className="relative z-10 mx-auto flex flex-col items-center gap-8 px-6 lg:block lg:h-[668px]">
        {/* Center copy */}
        <div className="feature-copy order-1 flex w-[min(92vw,550px)] flex-col items-center text-center lg:absolute lg:left-[50%] lg:top-[45%] lg:-translate-x-1/2 lg:-translate-y-1/2">
          <div
            className="mb-4 flex items-center justify-center gap-3"
            style={{
              translate: "none",
              rotate: "none",
              scale: "none",
              transform: "translate(0px, 0px)",
              opacity: 1,
            }}
          >
            <div className="h-2.5 w-2.5 rounded-full border border-[#00FFFF]" />
            <p className="font-geist-reference text-[10px] font-bold uppercase tracking-[0.25em] text-[#00FFFF] md:text-[11px]">
              Creative Intelligence
            </p>
          </div>

          <h2 className="font-heading text-[clamp(2.25rem,3vw,3.45rem)] font-semibold leading-[1.03] tracking-normal">
            Where creativity{" "}
            <span className="font-serif italic text-white/70">meets</span>{" "}
            <span className="inline-block whitespace-nowrap">
              <span className="text-white">{typedText}</span>
              <span
                className="typewriter-cursor"
                aria-hidden="true"
                style={{ height: "0.85em" }}
              />
            </span>{" "}
            ?
          </h2>

          <p className="font-geist-reference mt-5 max-w-[700px] text-lg leading-[1.35] tracking-[-0.025em] text-white/72 md:text-[18px]">
            Bring your ideas to life with high quality AI generated visuals.
            Turn concepts into polished images that match your style and
            purpose.
          </p>
          <CtaButton
            href="#create"
            showArrow={false}
            className="mt-10 cursor-pointer text-[clamp(1rem,1.65vw,1.2rem)]"
          >
            Try it now
          </CtaButton>
        </div>

        {/* Left top */}
        <MediaNode
          items={DEMO_CASES.map((c) => c.input)}
          activeIndex={activeIndex}
          alt="Original product before generation"
          className="order-2 lg:left-[4.4%] lg:top-[0%] lg:w-[265px]"
          imageClassName="aspect-[5/4]"
          imageFit="cover"
        />

        {/* Left bottom */}
        <MediaNode
          items={DEMO_CASES.map((c) => c.model)}
          activeIndex={activeIndex}
          alt="Selected model reference"
          className="order-3 lg:left-[5.0%] lg:top-[55%] lg:w-[250px]"
          imageClassName="aspect-[4/5]"
        />

        {/* Right */}
        <MediaNode
          items={DEMO_CASES.map((c) => c.generated)}
          activeIndex={activeIndex}
          alt="Generated product photoshoot result"
          className="order-4 lg:right-[2.1%] lg:top-[28%] lg:w-[450px]"
          imageClassName="aspect-[16/9]"
        />
      </div>
    </section>
  );
};

export default FeaturesSection;
