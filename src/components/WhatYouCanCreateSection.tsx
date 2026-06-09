// "use client";

// import React, { useEffect, useRef } from "react";
// import { motion, useReducedMotion } from "framer-motion";
// import { gsap } from "gsap";

// const DEFAULT_DATA = [
//   "https://images.unsplash.com/photo-1540968221243-29f5d70540bf?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1596135187959-562c650d98bc?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1628944682084-831f35256163?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1590013330451-3946e83e0392?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1590421959604-741d0eec0a2e?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1572613000712-eadc57acbecd?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1570097192570-4b49a6736f9f?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1620789550663-2b10e0080354?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1617775623669-20bff4ffaa5c?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1548600916-dc8492f8e845?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1573824969595-a76d4365a2e6?w=800&auto=format&fit=crop&q=60",
//   "https://images.unsplash.com/photo-1633936929709-59991b5fdd72?w=800&auto=format&fit=crop&q=60",
// ];

// interface Slider3DProps {
//   /** Array of image URLs to display */
//   images?: string[];
//   /** Duration of one full 360-degree rotation (in seconds) */
//   duration?: number;
//   /** Width of each card. Can be px, rem, em, etc. */
//   cardWidth?: string;
//   /** CSS aspect ratio of the cards */
//   cardAspectRatio?: string;
//   /** CSS perspective value for the 3D container */
//   perspective?: string;
//   /** Additional classes for the outermost container */
//   containerClassName?: string;
//   /** Additional classes for the individual image elements */
//   // imageClassName?: string;
//   /** Direction of the rotation */
//   rotationDirection?: "left" | "right";
//   /** Whether to apply a gradient fade mask on the edges */
//   withMask?: boolean;
// }

// export default function ImageSlider3D({
//   images = DEFAULT_DATA,
//   duration = 32,
//   cardWidth = "20em",
//   cardAspectRatio = "7/10",
//   perspective = "35em",
//   containerClassName = "",
//   rotationDirection = "right",
//   // withMask = true,
// }: Slider3DProps) {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const cursorRef = useRef<HTMLDivElement>(null);
//   const dotRef = useRef<HTMLDivElement>(null);

//   const n = images.length;
//   const prefersReducedMotion = useReducedMotion();
//   const animationDuration = prefersReducedMotion ? duration * 4 : duration;

//   // rotation angles based on direction
//   const rotationValues = rotationDirection === "left" ? [0, 360] : [360, 0];

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
//     const mousePos = { x: section.offsetWidth / 2, y: section.offsetHeight / 2 };
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
//     const interval = setInterval(() => {
//       const cards = document.querySelectorAll(".slider-card");

//       cards.forEach((card) => {
//         const rect = card.getBoundingClientRect();
//         const colorLayer = card.querySelector(".color-layer") as HTMLElement;

//         if (!colorLayer) return;

//         const stickX = window.innerWidth / 2;

//         const passed =
//           ((stickX - rect.left) / rect.width) * 100;

//         const reveal = Math.max(0, Math.min(100, passed));

//         colorLayer.style.clipPath = `inset(0 ${100 - reveal}% 0 0)`;
//       });
//     }, 40);

//     return () => clearInterval(interval);
//   }, []);

//   return (
// <div
//   ref={sectionRef}
//   className={`relative grid w-full h-full min-h-[1000px] overflow-hidden place-items-center bg-black ${containerClassName}`}
//   style={{
//     perspective: perspective,
//   }}
// >
//   <canvas
//     ref={canvasRef}
//     className="pointer-events-none absolute inset-0 z-0"
//     style={{ mixBlendMode: "screen" }}
//   />
//   <div
//     ref={cursorRef}
//     className="pointer-events-none absolute z-50 hidden h-20 w-20 -ml-10 -mt-10 rounded-full border border-[#00FFFF]/20 bg-white/5"
//     style={{ backdropFilter: "blur(4px)" }}
//   />
//   <div
//     ref={dotRef}
//     className="pointer-events-none absolute z-50 hidden h-1.5 w-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
//   />

//   <div className="pointer-events-none absolute left-0 top-0 z-50 h-full w-[250px] bg-gradient-to-r from-black via-black/90 to-transparent" />
//   <div className="pointer-events-none absolute right-0 top-0 z-50 h-full w-[250px] bg-gradient-to-l from-black via-black/90 to-transparent" />

// {/* NEON STICK — above carousel, below floating bubbles */}
// <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-[235px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_#00FFFF,0_0_25px_#00FFFF,0_0_50px_#00FFFF,0_0_80px_#00FFFF,0_0_120px_#00FFFF]" />

//   <motion.div
//     className="relative z-20 grid place-self-center pointer-events-auto"
//     style={{
//       transformStyle: "preserve-3d",
//       willChange: "transform",
//     }}
//     animate={{
//       rotateY: rotationValues,
//     }}
//     transition={{
//       duration: animationDuration,
//       ease: "linear",
//       repeat: Infinity,
//     }}
//   >
//         {images.map((src, i) => (
//           <div
//   key={i}
//   className="slider-card relative col-start-1 row-start-1 overflow-hidden rounded-[1.5em]"
//   style={{
//     width: cardWidth,
//     aspectRatio: cardAspectRatio,
//     backfaceVisibility: "hidden",
//     WebkitBackfaceVisibility: "hidden",
//     transform: `rotateY(calc(${i} * (1turn / ${n}))) translateZ(calc(-1 * (0.5 * ${cardWidth} + 0.5em) / tan(0.5 * (1turn / ${n}))))`,
//   }}
// >
//   {/* COLOR BASE */}
//   <img
//     src={src}
//     alt={`Slide ${i}`}
//     className="absolute inset-0 h-full w-full object-cover"
//   />

//   {/* B&W REVEAL LAYER */}
//   <div
//     className="color-layer absolute inset-0"
//     style={{
//       clipPath: "inset(0 100% 0 0)",
//     }}
//   >
//     <img
//       src={src}
//       alt={`Slide ${i}`}
//       className="h-full w-full object-cover grayscale"
//     />
//   </div>
// </div>
//         ))}
//       </motion.div>

// {/* BUBBLE PARTICLES — in front of carousel (after it in DOM + higher z) */}
// <div className="bubble-container pointer-events-none absolute left-1/2 top-1/2 z-[45]">
//   {Array.from({ length: 70 }, (_, i) => {
//     const seed = i;
//     const size = 2 + (seed % 6) * 1.2;
//     const dur = 2.5 + (seed % 8) * 0.6;
//     const del = (seed % 25) * 0.25;
//     const dirX = seed % 2 === 0 ? 1 : -1;
//     const dx = dirX * (40 + (seed % 10) * 12);
//     const dy = seed % 6 === 0
//       ? -(15 + (seed % 6) * 6)
//       : seed % 6 === 1
//         ? -(55 + (seed % 10) * 7)
//         : seed % 6 === 2
//           ? (20 + (seed % 8) * 5)
//           : seed % 6 === 3
//             ? (50 + (seed % 10) * 6)
//             : seed % 6 === 4
//               ? -(35 + (seed % 8) * 8)
//               : -(80 + (seed % 6) * 10);
//     const yOff = -125 + (seed % 28) * 9;
//     return (
//       <div
//         key={i}
//         className="bubble"
//         style={{
//           '--dx': `${dx}px`,
//           '--dy': `${dy}px`,
//           width: size,
//           height: size,
//           top: yOff,
//           left: -size / 2,
//           animationDuration: `${dur}s`,
//           animationDelay: `-${del}s`,
//           opacity: 0.5 + (seed % 5) * 0.1,
//         } as React.CSSProperties}
//       />
//     );
//   })}
// </div>

// <style>{`
//   .bubble-container {
//     width: 0;
//     height: 0;
//     /* Pull particles in front of the 3D carousel (perspective stacking) */
//     transform: translate(-50%, -50%) translateZ(180px);
//     transform-style: preserve-3d;
//   }

//   .bubble {
//     position: absolute;
//     border-radius: 50%;
//     background: rgba(0, 255, 255, 0.7);
//     box-shadow: 0 0 8px rgba(0, 255, 255, 0.6), 0 0 18px rgba(0, 255, 255, 0.3);
//     animation: bubbleFloat linear infinite;
//     will-change: transform, opacity;
//   }

//   @keyframes bubbleFloat {
//     0%   { transform: translate(0, 0) scale(0.2); opacity: 0; }
//     8%   { opacity: 0.7; }
//     30%  { opacity: 0.5; }
//     100% { transform: translate(var(--dx), var(--dy)) scale(1.2); opacity: 0; }
//   }
// `}</style>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";

const DEFAULT_DATA = [
  {
    before: "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/040fc1b2-89fc-44db-ae55-a0334b5dc1cb.webp",
    after:  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/750497e8-7a71-4ae2-ace8-29b463cf207d.webp",
  },
  {
    before: "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/97dffffc-40ad-435e-bfd9-24698f9b8d11.webp",
    after:  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/80bfe780-a1ae-4bb5-bbae-382168f77ed0.webp",
  },
  {
    before: "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/7e6a17ff-6ff2-40a2-a15a-e2bc827ddf41.webp",
    after:  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/7c4cf6b9-b29f-47a5-84d4-a3b1d5be1ada.webp",
  },
  {
    before: "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/2c35125d-3fed-4c38-9311-adae12aabcdb.webp",
    after:  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/99347f8a-d2bb-4722-b015-d291eaabd482.webp",
  },
  {
    before: "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/66be300a-6277-4b22-8ee4-a3d81f0c9115.webp",
    after:  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/15949363-7175-4e1a-80af-9aa1284e77a1.webp",
  },
  {
    before: "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/484d8a08-0f88-4706-8b70-c5375d8243f0.webp",
    after:  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/18592465-4faf-4902-8765-f181a4461aca.webp",
  },
  {
    before: "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/4f4ef3a9-b74d-45c4-afa9-caf5f02d90e3.webp",
    after:  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/5d41e814-df35-405f-bcdc-396d00d1cbc7.webp",
  },
  {
    before: "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/c3b2ec80-d239-478a-a014-e853b52456a6.webp",
    after:  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/af89cfcb-693c-4eca-85f8-515574a7666f.webp",
  },
  {
    before: "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/0580a1ca-8d1e-433a-9d0b-fb1474afdfef.webp",
    after:  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/b3701f70-4554-4ec9-97a2-c92ae1ce6b4b.webp",
  },
  {
    before: "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/d55e1943-d5b5-47be-8001-0e6e97838acf.webp",
    after:  "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/productsnap_app/app/admin/3a483555-7585-493a-91d5-be39dad88a85.webp",
  },
];

type ImagePair = {
  before: string;
  after: string;
};

interface Slider3DProps {
  /** Array of image URLs to display */
  images?: ImagePair[];
  /** Duration of one full 360-degree rotation (in seconds) */
  duration?: number;
  /** Width of each card. Can be px, rem, em, etc. */
  cardWidth?: string;
  /** CSS aspect ratio of the cards */
  cardAspectRatio?: string;
  /** CSS perspective value for the 3D container */
  perspective?: string;
  /** Additional classes for the outermost container */
  containerClassName?: string;
  /** Additional classes for the individual image elements */
  // imageClassName?: string;
  /** Direction of the rotation */
  rotationDirection?: "left" | "right";
  /** Whether to apply a gradient fade mask on the edges */
  withMask?: boolean;
}

export default function ImageSlider3D({
  images = DEFAULT_DATA,
  duration = 32,
  cardWidth = "20em",
  cardAspectRatio = "7/10",
  perspective = "35em",
  containerClassName = "",
  rotationDirection = "right",
  // withMask = true,
}: Slider3DProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const n = images.length;
  const prefersReducedMotion = useReducedMotion();
  const animationDuration = prefersReducedMotion ? duration * 4 : duration;

  // rotation angles based on direction
  const rotationValues = rotationDirection === "left" ? [0, 360] : [360, 0];

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
    const mousePos = { x: section.offsetWidth / 2, y: section.offsetHeight / 2 };
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
    const interval = setInterval(() => {
      const cards = document.querySelectorAll(".slider-card");

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const colorLayer = card.querySelector(".color-layer") as HTMLElement;

        if (!colorLayer) return;

        const stickX = window.innerWidth / 2;

        const passed =
          ((stickX - rect.left) / rect.width) * 100;

        const reveal = Math.max(0, Math.min(100, passed));

        colorLayer.style.clipPath = `inset(0 ${100 - reveal}% 0 0)`;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
<div
  ref={sectionRef}
  className={`relative grid w-full h-full min-h-[1000px] overflow-hidden place-items-center bg-black ${containerClassName}`}
  style={{
    perspective: perspective,
  }}
>
  <canvas
    ref={canvasRef}
    className="pointer-events-none absolute inset-0 z-0"
    style={{ mixBlendMode: "screen" }}
  />
  <div
    ref={cursorRef}
    className="pointer-events-none absolute z-50 hidden h-20 w-20 -ml-10 -mt-10 rounded-full border border-[#00FFFF]/20 bg-white/5"
    style={{ backdropFilter: "blur(4px)" }}
  />
  <div
    ref={dotRef}
    className="pointer-events-none absolute z-50 hidden h-1.5 w-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
  />

  <div className="pointer-events-none absolute left-0 top-0 z-50 h-full w-[250px] bg-gradient-to-r from-black via-black/90 to-transparent" />
  <div className="pointer-events-none absolute right-0 top-0 z-50 h-full w-[250px] bg-gradient-to-l from-black via-black/90 to-transparent" />

{/* NEON STICK — above carousel, below floating bubbles */}
<div className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-[235px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_#00FFFF,0_0_25px_#00FFFF,0_0_50px_#00FFFF,0_0_80px_#00FFFF,0_0_120px_#00FFFF]" />

  <motion.div
    className="relative z-20 grid place-self-center pointer-events-auto"
    style={{
      transformStyle: "preserve-3d",
      willChange: "transform",
    }}
    animate={{
      rotateY: rotationValues,
    }}
    transition={{
      duration: animationDuration,
      ease: "linear",
      repeat: Infinity,
    }}
  >
        {images.map((item, i) => (
          <div
  key={i}
  className="slider-card relative col-start-1 row-start-1 overflow-hidden rounded-[1.5em]"
  style={{
    width: cardWidth,
    aspectRatio: cardAspectRatio,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transform: `rotateY(calc(${i} * (1turn / ${n}))) translateZ(calc(-1 * (0.5 * ${cardWidth} + 0.5em) / tan(0.5 * (1turn / ${n}))))`,
  }}
>
  {/* COLOR BASE */}
  <img
    src={item.after}
    alt={`Slide ${i}`}
    className="absolute inset-0 h-full w-full object-cover"
  />

  {/* B&W REVEAL LAYER */}
  <div
    className="color-layer absolute inset-0"
    style={{
      clipPath: "inset(0 100% 0 0)",
    }}
  >
    <img
      src={item.before}
      alt={`Slide ${i}`}
      className="h-full w-full object-cover grayscale"
    />
  </div>
</div>
        ))}
      </motion.div>

{/* BUBBLE PARTICLES — in front of carousel (after it in DOM + higher z) */}
<div className="bubble-container pointer-events-none absolute left-1/2 top-1/2 z-[45]">
  {Array.from({ length: 70 }, (_, i) => {
    const seed = i;
    const size = 2 + (seed % 6) * 1.2;
    const dur = 2.5 + (seed % 8) * 0.6;
    const del = (seed % 25) * 0.25;
    const dirX = seed % 2 === 0 ? 1 : -1;
    const dx = dirX * (40 + (seed % 10) * 12);
    const dy = seed % 6 === 0
      ? -(15 + (seed % 6) * 6)
      : seed % 6 === 1
        ? -(55 + (seed % 10) * 7)
        : seed % 6 === 2
          ? (20 + (seed % 8) * 5)
          : seed % 6 === 3
            ? (50 + (seed % 10) * 6)
            : seed % 6 === 4
              ? -(35 + (seed % 8) * 8)
              : -(80 + (seed % 6) * 10);
    const yOff = -125 + (seed % 28) * 9;
    return (
      <div
        key={i}
        className="bubble"
        style={{
          '--dx': `${dx}px`,
          '--dy': `${dy}px`,
          width: size,
          height: size,
          top: yOff,
          left: -size / 2,
          animationDuration: `${dur}s`,
          animationDelay: `-${del}s`,
          opacity: 0.5 + (seed % 5) * 0.1,
        } as React.CSSProperties}
      />
    );
  })}
</div>

<style>{`
  .bubble-container {
    width: 0;
    height: 0;
    /* Pull particles in front of the 3D carousel (perspective stacking) */
    transform: translate(-50%, -50%) translateZ(180px);
    transform-style: preserve-3d;
  }

  .bubble {
    position: absolute;
    border-radius: 50%;
    background: rgba(0, 255, 255, 0.7);
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.6), 0 0 18px rgba(0, 255, 255, 0.3);
    animation: bubbleFloat linear infinite;
    will-change: transform, opacity;
  }

  @keyframes bubbleFloat {
    0%   { transform: translate(0, 0) scale(0.2); opacity: 0; }
    8%   { opacity: 0.7; }
    30%  { opacity: 0.5; }
    100% { transform: translate(var(--dx), var(--dy)) scale(1.2); opacity: 0; }
  }
`}</style>
    </div>
  );
}