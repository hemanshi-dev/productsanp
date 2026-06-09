import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import f1 from "../assets/images/f1.png";
import f3 from "../assets/images/f3.png";
import f2 from "../assets/images/f2.png";
import f6 from "../assets/images/f6.png";
import f7 from "../assets/images/f7.png";
import f8 from "../assets/images/f8.jpeg";
import f4 from "../assets/images/f4.png";
import f9 from "../assets/images/f9.png";
// import demo from "../assets/images/demo.png";
gsap.registerPlugin(ScrollTrigger);

const CategoriesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const particlesRef = useRef<
    { x: number; y: number; targetX: number; targetY: number }[]
  >([]);

  // Random project images with subtitles
  const projectData = [
    { name: "Jewellery Photoshoot", subtitle: "MINIMAL", img: f1 },
    {
      name: "Outdoor photoshoot",
      subtitle: "Outdoor photoshoot",
      img: f2,
    },
    {
      name: "Product Photoshoot",
      subtitle: "EDITORIAL",
      img: f3,
    },
    {
      name: "Minimalist Editorial",
      subtitle: "VIBRANT",
      img: f4,
    },
    {
      name: "Footwear photoshoot",
      subtitle: "NATURE",
      img: f8,
    },
    {
      name: "Studio Product shoot",
      subtitle: "Studio Product shoot",
      img: f6,
    },
    {
      name: "Standard Product View",
      subtitle: "Standard Product View",
      img: f7,
    },
    {
      name: "Lifestyle Photoshoot",
      subtitle: "WARM",
      img: f9,
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!section || !cursor || !dot) return;

    // const xSetterCursor = gsap.quickSetter(cursor, "x", "px")
    // const ySetterCursor = gsap.quickSetter(cursor, "y", "px")
    const xSetterDot = gsap.quickSetter(dot, "x", "px");
    const ySetterDot = gsap.quickSetter(dot, "y", "px");
    const previousCursor = document.body.style.cursor;
    const hiddenSelectors = [
      "button",
      "a",
      "input",
      "textarea",
      "select",
      '[role="button"]',
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "span",
      "label",
      ".fw-heading",
      ".category-text",
    ].join(",");
    const pointerSelectors = [
      "button",
      "a",
      "input",
      "textarea",
      "select",
      '[role="button"]',
    ].join(",");

    const canvas = canvasRef.current;
    const ctx_canvas = canvas?.getContext("2d");
    let animationFrameId: number;

    // Initialize Dot Grid
    const dots_grid: {
      x: number;
      y: number;
      originalX: number;
      originalY: number;
      size: number;
    }[] = [];
    const spacing = 40;

    const initGrid = () => {
      if (!canvas) return;
      dots_grid.length = 0;
      const rect = section.getBoundingClientRect();
      const width = Math.ceil(rect.width);
      const height = Math.ceil(rect.height);
      canvas.width = width;
      canvas.height = height;

      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          dots_grid.push({ x, y, originalX: x, originalY: y, size: 0.8 });
        }
      }
    };

    // Cursor Trail Setup
    for (let i = 0; i < 6; i++) {
      particlesRef.current.push({ x: 0, y: 0, targetX: 0, targetY: 0 });
    }

    const mousePos = { x: 0, y: 0 };

    let lastTime = 0;
    let velocity = 0;
    let lastX = 0;
    let lastY = 0;

    const setCursorVisibility = (_visible: boolean, nativeCursor = "auto") => {
      cursor.style.display = "none";
      dot.style.display = "none";
      document.body.style.cursor = nativeCursor;
    };

    const updateCursorVisibility = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      const shouldHide = Boolean(element?.closest(hiddenSelectors));
      const shouldUsePointer = Boolean(element?.closest(pointerSelectors));

      setCursorVisibility(!shouldHide, shouldUsePointer ? "pointer" : "auto");
    };

    const render = (time: number) => {
      if (!ctx_canvas || !canvas) return;
      ctx_canvas.clearRect(0, 0, canvas.width, canvas.height);

      const deltaTime = time - lastTime;
      lastTime = time;

      // Calculate cursor velocity for stretching
      const dx_mouse = mousePos.x - lastX;
      const dy_mouse = mousePos.y - lastY;
      velocity =
        Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse) / (deltaTime || 1);
      lastX = mousePos.x;
      lastY = mousePos.y;

      // Draw Grid
      dots_grid.forEach((dot, i) => {
        const dx = mousePos.x - dot.x;
        const dy = mousePos.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        // Subtle pulse/breathing effect
        const pulse = Math.sin(time * 0.002 + i * 0.1) * 0.5 + 0.5;

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          dot.x = dot.originalX - dx * force * 0.15;
          dot.y = dot.originalY - dy * force * 0.15;
          ctx_canvas.fillStyle = `rgba(0, 255, 255, ${0.1 + force * 0.5})`;
          ctx_canvas.beginPath();
          ctx_canvas.arc(dot.x, dot.y, dot.size + force * 2, 0, Math.PI * 2);
          ctx_canvas.fill();
        } else {
          dot.x += (dot.originalX - dot.x) * 0.1;
          dot.y += (dot.originalY - dot.y) * 0.1;
          ctx_canvas.fillStyle = `rgba(0, 255, 255, ${0.05 + pulse * 0.1})`;
          ctx_canvas.beginPath();
          ctx_canvas.arc(dot.x, dot.y, dot.size + pulse * 0.5, 0, Math.PI * 2);
          ctx_canvas.fill();
        }
      });

      // Animate the cursor dot stretching based on velocity
      if (dot) {
        const stretch = Math.min(1 + velocity * 0.1, 1.8);
        const rotation = (Math.atan2(dy_mouse, dx_mouse) * 180) / Math.PI;
        gsap.set(dot, {
          scaleX: stretch,
          scaleY: 1 / Math.sqrt(stretch),
          rotation: velocity > 0.5 ? rotation : 0,
          transformOrigin: "center center",
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateCursorVisibility(e.target);

      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePos.x = x;
      mousePos.y = y;

      gsap.to(cursor, { x, y, duration: 0.6, ease: "power3.out" });
      xSetterDot(x);
      ySetterDot(y);
    };

    const handleMouseOver = (e: MouseEvent) => {
      updateCursorVisibility(e.target);
    };

    const handleMouseLeave = () => {
      setCursorVisibility(false);
    };

    initGrid();
    requestAnimationFrame(render);
    window.addEventListener("resize", initGrid);
    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseover", handleMouseOver);
    section.addEventListener("mouseleave", handleMouseLeave);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fw-heading",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
      gsap.fromTo(
        ".fw-col",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".fw-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => {
      document.body.style.cursor = previousCursor;
      ctx.revert();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", initGrid);
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseover", handleMouseOver);
      section.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="featured-works"
      className="relative w-full overflow-hidden bg-black"
      style={{
        color: "#ffffff",
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#000000",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .fw-heading h2 {
            font-size: 32px !important;
            line-height: 1.2 !important;
          }
          .fw-col {
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          }
          .category-text {
            width: calc(100% - 2rem) !important;
            bottom: 1rem !important;
            padding: 1.25rem !important;
            border-radius: 12px !important;
          }
          .category-text h3 {
            font-size: 20px !important;
            margin-top: 0.25rem !important;
          }
        }
      `}</style>

      {/* Interactive Dot Grid Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 h-full w-full"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="pointer-events-none absolute z-50 w-20 h-20 -ml-10 -mt-10 rounded-full bg-white/5 transition-transform duration-300 ease-out items-center justify-center border border-[#00FFFF]/20"
        style={{ display: "none", backdropFilter: "blur(4px)" }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none absolute z-50 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#00FFFF]"
        style={{ display: "none" }}
      />

      {/* Centered Header — same pattern as AI Models */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="pt-20 md:pt-28">
          <div className="fw-heading mx-auto max-w-3xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full border border-[#00FFFF]"></div>
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-[#00FFFF]">
                Featured Works
              </span>
            </div>
            <h2
              className="mt-4 font-clash font-semibold leading-none tracking-normal"
              style={{ fontSize: "clamp(2rem, 4vw, 67px)" }}
            >
              See the magical creations <br /> for yourself
            </h2>
          </div>
        </div>
        <div className="pb-16"></div>
      </div>

      {/* Accordion 8 Column Grid */}
      <div className="fw-grid flex flex-col md:flex-row h-auto md:h-auto md:min-h-[750px] relative w-full">
        {projectData.map((project, idx) => {
          const isHovered = hovered === idx;

          return (
            <div
              key={idx}
              className="fw-col relative group cursor-default transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden bg-black min-h-[280px] md:min-h-0"
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flex: isHovered ? 6 : 1,
                borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor: "#000000",
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0 overflow-hidden bg-black">
                <img
                  src={project.img}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay: hidden on mobile, shown on desktop (removed on hover) */}
                <div
                  className={`absolute inset-0 z-10 bg-black transition-opacity duration-700 opacity-0 ${isHovered ? "md:opacity-0" : "md:opacity-85"}`}
                />
                {/* Bottom gradient for text readability on mobile */}
                <div className="absolute inset-x-0 bottom-0 z-10 h-44 bg-gradient-to-t from-black/70 to-transparent md:opacity-0 md:transition-opacity md:duration-700 md:group-hover:opacity-100" />
              </div>

              {/* Hover State: Smooth Blur Box with Corner Angles */}
              <div
                className={`absolute inset-0 z-30 transition-opacity duration-700 ease-out pointer-events-none opacity-100 ${isHovered ? "md:opacity-100" : "md:opacity-0"}`}
              >
                {/* 4 Corner Angles */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="absolute top-4 left-4 w-4 h-[1px] bg-white" />
                  <div className="absolute top-4 left-4 w-[1px] h-4 bg-white" />
                  <div className="absolute top-4 right-4 w-4 h-[1px] bg-white" />
                  <div className="absolute top-4 right-4 w-[1px] h-4 bg-white" />
                  <div className="absolute bottom-4 left-4 w-4 h-[1px] bg-white" />
                  <div className="absolute bottom-4 left-4 w-[1px] h-4 bg-white" />
                  <div className="absolute bottom-4 right-4 w-4 h-[1px] bg-white" />
                  <div className="absolute bottom-4 right-4 w-[1px] h-4 bg-white" />
                </div>
              </div>

              {/* Blur Box */}
              <div
                className={`category-text absolute left-1/2 -translate-x-1/2 bottom-10 z-30 w-[calc(100%-5rem)] max-w-[900px] rounded-[16px] bg-black/60 backdrop-blur-2xl p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] transition-all duration-700 ease-out opacity-100 pointer-events-auto ${isHovered ? "md:opacity-100 md:pointer-events-auto" : "md:opacity-0 md:pointer-events-none"}`}
              >
                <span className="text-[#00FFFF] text-[10px] md:text-[11px] font-bold tracking-[0.22em] uppercase">
                  {project.subtitle}
                </span>
                <h3 className="mt-4 text-3xl md:text-4xl font-clash font-bold tracking-tight leading-tight text-white text-left">
                  {project.name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriesSection;
