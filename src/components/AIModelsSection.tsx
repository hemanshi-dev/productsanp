import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import img1 from "../assets/images/uifaces-human-avatar (4).jpg";
import img2 from "../assets/images/uifaces-human-avatar (5).jpg";
import img3 from "../assets/images/uifaces-human-avatar (6).jpg";
import img4 from "../assets/images/uifaces-human-avatar (7).jpg";
import img5 from "../assets/images/uifaces-human-avatar (8).jpg";
import img6 from "../assets/images/uifaces-human-avatar (9).jpg";
import img7 from "../assets/images/uifaces-human-avatar (10).jpg";
import img8 from "../assets/images/uifaces-human-avatar (11).jpg";
import img9 from "../assets/images/uifaces-human-avatar (12).jpg";
import img10 from "../assets/images/uifaces-human-avatar (13).jpg";
import img11 from "../assets/images/uifaces-human-avatar (14).jpg";
import img12 from "../assets/images/uifaces-human-avatar (15).jpg";
import img13 from "../assets/images/uifaces-human-avatar (16).jpg";

gsap.registerPlugin(ScrollTrigger);

const modelCards = [
  { src: img1, label: "Editorial" },
  { src: img2, label: "Studio" },
  { src: img3, label: "Lookbook" },
  { src: img4, label: "Runway" },
  { src: img5, label: "Campaign" },
  { src: img6, label: "Beauty" },
  { src: img7, label: "Fashion" },
  { src: img8, label: "Portrait" },
  { src: img9, label: "Luxury" },
  { src: img10, label: "Runway" },
  { src: img11, label: "Campaign" },
  { src: img12, label: "Editorial" },
  { src: img13, label: "Studio" },
];

const AIModelsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const centeredCardIndexRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const targetCardIndexRef = useRef<number | null>(null);

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
        ".ai-model-copy > *",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
          },
        },
      );

      gsap.fromTo(
        carouselRef.current,
        { opacity: 0, y: 34, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 68%",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const stage = carouselRef.current;
    if (!stage) return;

    let angle = -0.62;
    const orbitSpeed = 0.0065;
    const rotateToCenterThreshold = 0.01;

    const renderOrbit = () => {
      const stageWidth = stage.offsetWidth || 1000;
      const xRadius = Math.min(stageWidth * 0.49, 570);
      const yRadius = stageWidth < 768 ? 30 : 48;
      let maxDepth = -1;
      let centeredCardIndex = 0;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        const theta = angle + (index / modelCards.length) * Math.PI * 2;
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);
        const depth = (cos + 1) / 2;
        if (depth > maxDepth) {
          maxDepth = depth;
          centeredCardIndex = index;
        }
        const x = sin * xRadius;
        const y = 14 - depth * 34 - (1 - depth) * yRadius;
        const scale = 0.48 + depth * 0.55;
        const opacity = 0.28 + depth * 0.72;
        const blur = (1 - depth) * 6.4;
        const sideTurn = Math.abs(sin) ** 1.75;
        const rotateY = Math.sign(sin) * sideTurn * -72;

        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x,
          y,
          scale,
          opacity,
          zIndex: Math.round(depth * 100),
          rotateY,
          filter: `blur(${blur}px)`,
        });
      });

      centeredCardIndexRef.current = centeredCardIndex;
      cardRefs.current.forEach((card) => {
        if (!card) return;
        card.style.pointerEvents = "auto";
        card.style.cursor = "pointer";
      });

      if (targetCardIndexRef.current !== null) {
        const targetTheta =
          angle +
          (targetCardIndexRef.current / modelCards.length) * Math.PI * 2;
        const deltaToCenter = Math.atan2(
          Math.sin(targetTheta),
          Math.cos(targetTheta),
        );

        if (Math.abs(deltaToCenter) <= rotateToCenterThreshold) {
          angle -= deltaToCenter;
          pausedRef.current = true;
          targetCardIndexRef.current = null;
        } else {
          const rotationStep = Math.max(
            -0.03,
            Math.min(0.03, deltaToCenter * 0.18),
          );
          angle -= rotationStep;
        }
      } else if (!pausedRef.current) {
        angle -= orbitSpeed;
      }
    };

    gsap.ticker.add(renderOrbit);
    renderOrbit();

    return () => {
      gsap.ticker.remove(renderOrbit);
    };
  }, []);

  // ✅ NEW: hover handlers — replaces the old handleCardClick
  const handleMouseEnter = () => {
    pausedRef.current = true;
  };

  const handleMouseLeave = () => {
    pausedRef.current = false;
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-black px-4 py-8 text-white md:px-8 md:py-16 lg:py-20"
    >
      <style>{`
        .ai-model-stage {
          perspective: 1200px;
          perspective-origin: 50% 42%;
        }

        .ai-model-card {
          left: 50%;
          top: 50%;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          transform-origin: center center;
          will-change: transform, opacity, filter;
        }

        .ai-model-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            linear-gradient(115deg, rgba(255,255,255,0.26), transparent 24%),
            linear-gradient(to bottom, transparent 48%, rgba(0,0,0,0.34));
          pointer-events: none;
        }

        .ai-model-bubble-btn {
          --c: #00FFFF;
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: color 0.5s;
        }

        .ai-model-bubble-btn span {
          position: absolute;
          width: 25%;
          height: 100%;
          background-color: var(--c);
          transform: translateY(150%);
          border-radius: 50%;
          transition: transform 0.5s;
          z-index: -1;
        }

        .ai-model-bubble-btn span:nth-child(1) { left: 0%; transition-delay: 0.0s; }
        .ai-model-bubble-btn span:nth-child(2) { left: 25%; transition-delay: 0.1s; }
        .ai-model-bubble-btn span:nth-child(3) { left: 50%; transition-delay: 0.2s; }
        .ai-model-bubble-btn span:nth-child(4) { left: 75%; transition-delay: 0.3s; }

        .ai-model-bubble-btn:hover {
          color: black;
        }

        .ai-model-bubble-btn:hover span {
          transform: translateY(0) scale(2);
        }

        @media (max-width: 767px) {
          .ai-model-stage {
            perspective: 900px;
          }
        }
      `}</style>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ mixBlendMode: "screen" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_42%,rgba(0,0,0,0.86)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent" />
      <div
        ref={cursorRef}
        className="pointer-events-none absolute z-50 hidden h-20 w-20 -ml-10 -mt-10 rounded-full border border-[#00FFFF]/20 bg-white/5"
        style={{ backdropFilter: "blur(4px)" }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none absolute z-50 hidden h-1.5 w-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="pt-10 md:pt-28 bg-black ">
          <div className="ai-model-copy mx-auto max-w-3xl text-center px-6">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full border border-[#00FFFF]"></div>
              <p className="font-geist-reference text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-[#00FFFF]">
                AI Models
              </p>
            </div>

            <h2 className="mt-4 text-[clamp(2rem,4vw,5rem)] font-bold leading-[0.92] tracking-[-1px] text-white">
              Rotate Through
              <br />
              <span> Studio Faces</span>
            </h2>

            <p className="mx-auto mt-4 md:mt-9 max-w-2xl mb-0 text-sm md:text-lg font-medium leading-6 md:leading-7 text-white/62 ">
              Pick ready-to-use models for fashion, product, and campaign
              visuals.
            </p>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="ai-model-stage relative mx-auto mt-4 h-[240px] w-full max-w-[1120px] md:mt-2 md:h-[360px]"
        >
          <div className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00FFFF]/10 blur-3xl md:h-[300px] md:w-[300px]" />
          <div className="absolute left-1/2 top-[49%] h-[42%] w-[78%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-2xl" />

          <div className="absolute inset-0">
            {modelCards.map((card, index) => (
              <figure
                key={`${card.label}-${index}`}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="ai-model-card absolute aspect-square w-[105px] overflow-hidden rounded-[16px] md:rounded-[24px] border border-white/15 bg-white/8 shadow-[0_26px_70px_rgba(0,0,0,0.48)] md:w-[190px] lg:w-[215px]"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={card.src}
                  alt={`${card.label} AI model`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIModelsSection;
