import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import heroImage from "../assets/images/demo12_1_1.png";
import sideImage1 from "../assets/images/cat1.png";
import sideImage2 from "../assets/images/cat2.png";
import sideImage3 from "../assets/images/cat3.png";
import sideImage4 from "../assets/images/cat4.png";
// import sideImage11 from "../assets/testing_images/hero_2.webp";
// import sideImage22 from "../assets/testing_images/hero_3.webp";
// import sideImage33 from "../assets/testing_images/hero_4.webp";
// import sideImage44 from "../assets/testing_images/hero_5.webp";

// const heroImage1 = "https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/ab18a524-10cb-49e0-83f3-1b72c28fa576.jpg";

gsap.registerPlugin(ScrollTrigger);

const sideImages = [sideImage1, sideImage2, sideImage3, sideImage4];
// const sideImages = [sideImage11, sideImage22, sideImage33, sideImage44];

type ViewTier = "mobile" | "tablet" | "desktop";

const resolveTier = (w: number): ViewTier =>
  w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";

const GallerySlider = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<
    { x: number; y: number; targetX: number; targetY: number }[]
  >([]);

  const heroRef = useRef<HTMLDivElement>(null); // clip-path target (the mask)
  const heroImageRef = useRef<HTMLImageElement>(null); // scales 1 -> 1.1
  const heroContentRef = useRef<HTMLDivElement>(null); // text wrapper (fades + scales 0.75)
  const heroCellRef = useRef<HTMLDivElement>(null); // invisible target cell in the grid
  const gridRef = useRef<HTMLDivElement>(null);

  const sideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sideImageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const imagesLoadedRef = useRef(0);
  const totalImages = 5;
  const refreshScheduledRef = useRef(false);

  const [tier, setTier] = useState<ViewTier>(() =>
    typeof window === "undefined" ? "desktop" : resolveTier(window.innerWidth),
  );
  const [cardsHoverEnabled, setCardsHoverEnabled] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleImageLoad = useCallback(() => {
    imagesLoadedRef.current += 1;
    if (
      imagesLoadedRef.current === totalImages &&
      !refreshScheduledRef.current
    ) {
      refreshScheduledRef.current = true;
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        refreshScheduledRef.current = false;
      });
    }
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const next = resolveTier(window.innerWidth);
        if (next !== tier) setTier(next);
        else ScrollTrigger.refresh();
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [tier]);

  useEffect(() => {
    const section = stickyRef.current;
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const canvas = canvasRef.current;
    const ctxCanvas = canvas?.getContext("2d");
    if (!section || !cursor || !dot || !canvas || !ctxCanvas) return;

    const xSetterDot = gsap.quickSetter(dot, "x", "px");
    const ySetterDot = gsap.quickSetter(dot, "y", "px");
    let animationFrameId: number;

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
    let lastTime = 0;
    let lastX = mousePos.x;
    let lastY = mousePos.y;
    let velocity = 0;

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

    particlesRef.current = Array.from({ length: 6 }, () => ({
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    }));

    const render = (time: number) => {
      ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);

      const deltaTime = time - lastTime;
      lastTime = time;

      const dxMouse = mousePos.x - lastX;
      const dyMouse = mousePos.y - lastY;
      velocity =
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

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // ---- Compute the target inset (vrt = vertical, hor = horizontal) ----
      const getInsets = () => {
        const sticky = stickyRef.current!.getBoundingClientRect();
        const cell = heroCellRef.current!.getBoundingClientRect();
        const top = cell.top - sticky.top;
        const left = cell.left - sticky.left;
        const right = sticky.width - (left + cell.width);
        const bottom = sticky.height - (top + cell.height);
        return { top, right, bottom, left };
      };

      const getHeroImageBounds = () => {
        const sticky = stickyRef.current!.getBoundingClientRect();
        const cell = heroCellRef.current!.getBoundingClientRect();
        return {
          x: cell.left - sticky.left,
          y: cell.top - sticky.top,
          width: cell.width,
          height: cell.height,
        };
      };

      // ---- Initial states ----
      gsap.set(heroRef.current, {
        clipPath: "inset(0px 0px 0px 0px round 0px)",
        webkitClipPath: "inset(0px 0px 0px 0px round 0px)",
      });
      gsap.set(heroImageRef.current, {
        x: 0,
        y: 0,
        width: "100%",
        height: "100%",
        scale: 1,
        transformOrigin: "center center",
      });
      gsap.set(heroContentRef.current, {
        scale: 1,
        opacity: 1,
        transformOrigin: "center center",
      });

      // Side cards: far off-screen, NO rotation (this is the key to the video look)
      gsap.set(sideRefs.current[0], {
        xPercent: -350,
        yPercent: 100,
        opacity: 0,
      });
      gsap.set(sideRefs.current[1], {
        xPercent: -400,
        yPercent: 200,
        opacity: 0,
      });
      gsap.set(sideRefs.current[2], {
        xPercent: 250,
        yPercent: 100,
        opacity: 0,
      });
      gsap.set(sideRefs.current[3], {
        xPercent: 350,
        yPercent: 200,
        opacity: 0,
      });

      // const scrollLen =
      //   tier === "mobile"
      //     ? window.innerHeight * 2.2
      //     : tier === "tablet"
      //     ? window.innerHeight * 2.6
      //     : window.innerHeight * 3.0;

      const scrollLen =
        tier === "mobile"
          ? window.innerHeight * 2.0
          : tier === "tablet"
            ? window.innerHeight * 2.2
            : window.innerHeight * 2.6;

      //   const scrollLen =
      //   tier === "mobile"
      // ? window.innerHeight * 1.1// was 2.2
      // : tier === "tablet"
      // ? window.innerHeight * 1.5// was 2.6
      // : window.innerHeight * 1.9; // was 3.0

      // =============================================================
      // Master timeline — pin + hero clip + image scale + text fade + side cards
      // =============================================================
      gsap
        .timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: () => `+=${scrollLen}`,
            scrub: 0.1,
            pin: stickyRef.current,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const threshold = 0.66;
              const isCompleted = self.progress >= threshold;
              setCardsHoverEnabled((prev) => {
                if (prev[0] === isCompleted) return prev;
                return [isCompleted, isCompleted, isCompleted, isCompleted];
              });
            },
          },
        })
        .to(
          heroRef.current,
          {
            clipPath: () => {
              const { top, right, bottom, left } = getInsets();
              return `inset(${top}px ${right}px ${bottom}px ${left}px round 25px)`;
            },
            webkitClipPath: () => {
              const { top, right, bottom, left } = getInsets();
              return `inset(${top}px ${right}px ${bottom}px ${left}px round 25px)`;
            },
            ease: "power3.out",
          },
          0,
        )
        .to(
          heroImageRef.current,
          {
            x: () => getHeroImageBounds().x,
            y: () => getHeroImageBounds().y,
            width: () => getHeroImageBounds().width,
            height: () => getHeroImageBounds().height,
            scale: 1,
            ease: "power3.out",
          },
          0,
        )
        .to(
          heroContentRef.current,
          { opacity: 0, scale: 0.75, ease: "power3.out" },
          0,
        )
        .to(
          sideRefs.current[0],
          { xPercent: 0, yPercent: 0, opacity: 1, ease: "power1.out" },
          0.0,
        )
        .to(
          sideRefs.current[1],
          { xPercent: 0, yPercent: 0, opacity: 1, ease: "power1.out" },
          0.06,
        )
        .to(
          sideRefs.current[2],
          { xPercent: 0, yPercent: 0, opacity: 1, ease: "power1.out" },
          0.08,
        )
        .to(
          sideRefs.current[3],
          { xPercent: 0, yPercent: 0, opacity: 1, ease: "power1.out" },
          0.14,
        );
    }, wrapperRef);

    return () => ctx.revert();
  }, [tier]);

  const gridCard = (i: number, col: string, row: string) => {
    const isHoverEnabled = cardsHoverEnabled[i];
    const isHovered = hoveredCard === i;

    return (
      <div
        ref={(el) => {
          sideRefs.current[i] = el;
        }}
        onMouseEnter={() => isHoverEnabled && setHoveredCard(i)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          pointerEvents: isHoverEnabled ? "auto" : "none",
          position: "relative",
          gridColumn: col,
          gridRow: row,
          overflow: "hidden",
          borderRadius: 25,
          willChange: "transform, opacity",
          cursor: isHoverEnabled ? "pointer" : "default",
        }}
      >
        <img
          ref={(el) => {
            sideImageRefs.current[i] = el;
          }}
          src={sideImages[i]}
          alt=""
          onLoad={handleImageLoad}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            transition: isHoverEnabled
              ? "transform 1.05s cubic-bezier(0.19, 1, 0.22, 1)"
              : "none",
            transform: isHoverEnabled && isHovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
            opacity: isHoverEnabled && isHovered ? 0.9 : 0.5,
            transition: isHoverEnabled
              ? "opacity 0.7s cubic-bezier(0.19, 1, 0.22, 1)"
              : "none",
            pointerEvents: "none",
          }}
        />
        {/* Content - Centered */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 2,
          }}
        >
          <h3
            style={{
              color: "white",
              fontSize: "1.1rem",
              fontWeight: "bold",
              lineHeight: 1.2,
              fontFamily: "'Clash Display', sans-serif",
              margin: 0,
              marginBottom: "0.5rem",
              textAlign: "center",
              opacity: isHoverEnabled ? 1 : 0,
              transform:
                isHoverEnabled && isHovered
                  ? "translateY(0)"
                  : "translateY(1rem)",
              transition: isHoverEnabled
                ? "opacity 0.7s cubic-bezier(0.19, 1, 0.22, 1), transform 0.7s cubic-bezier(0.19, 1, 0.22, 1)"
                : "none",
              transitionDelay: isHoverEnabled && isHovered ? "0.0875s" : "0s",
            }}
          >
            {/* {cardData[i].title} */}
          </h3>
          <p
            className="font-geist-reference"
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "0.9rem",
              lineHeight: 1.35,
              margin: 0,
              marginBottom: "1rem",
              textAlign: "center",
              opacity: isHoverEnabled && isHovered ? 1 : 0,
              transform:
                isHoverEnabled && isHovered
                  ? "translateY(0)"
                  : "translateY(1rem)",
              transition: isHoverEnabled
                ? "opacity 0.7s cubic-bezier(0.19, 1, 0.22, 1), transform 0.7s cubic-bezier(0.19, 1, 0.22, 1)"
                : "none",
              transitionDelay: isHoverEnabled && isHovered ? "0.0875s" : "0s",
            }}
          >
            {/* {cardData[i].copy} */}
          </p>
          {/* <CtaButton
            size="sm"
            showArrow={false}
            className="relative z-[1]"
            style={{
              cursor: "pointer",
              opacity: isHoverEnabled && isHovered ? 1 : 0,
              transform:
                isHoverEnabled && isHovered
                  ? "translateY(0)"
                  : "translateY(1rem)",
              transition: isHoverEnabled
                ? "opacity 0.7s cubic-bezier(0.19, 1, 0.22, 1), transform 0.7s cubic-bezier(0.19, 1, 0.22, 1), box-shadow 0.3s ease"
                : "none",
              transitionDelay: isHoverEnabled && isHovered ? "0.0875s" : "0s",
            }}
          >
            {cardData[i].button}
          </CtaButton> */}
        </div>
      </div>
    );
  };

  return (
    <div ref={wrapperRef} style={{ minHeight: "100vh", background: "#000000" }}>
      <div
        ref={stickyRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          background: "#000000",
          cursor: "default",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />
        <div
          ref={cursorRef}
          style={{
            display: "none",
            position: "absolute",
            zIndex: 50,
            width: "5rem",
            height: "5rem",
            marginLeft: "-2.5rem",
            marginTop: "-2.5rem",
            borderRadius: "9999px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(0, 255, 255, 0.2)",
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <div
          ref={dotRef}
          style={{
            display: "none",
            position: "absolute",
            zIndex: 50,
            width: "0.375rem",
            height: "0.375rem",
            marginLeft: "-0.1875rem",
            marginTop: "-0.1875rem",
            borderRadius: "9999px",
            background: "#00FFFF",
            boxShadow: "0 0 10px rgba(0,255,255,0.5)",
            pointerEvents: "none",
          }}
        />
        {/* GRID (sits behind hero; hero clips down to reveal heroCell area) */}
        <div
          ref={gridRef}
          style={{
            position: "absolute",
            inset: 0,
            width: tier === "tablet" ? "93vw" : "90vw",
            height: tier === "mobile" ? "56vh" : "75vh",
            margin: "0 auto",
            marginTop: "15vh",
            display: "grid",
            gridTemplateColumns:
              tier === "mobile" ? "1fr 1.1fr 1fr" : "1fr 1.2fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: tier === "mobile" ? 4 : 8,
            padding: tier === "mobile" ? 14 : 18,
            boxSizing: "border-box",
          }}
        >
          {gridCard(0, "1", "1")}
          {gridCard(1, "1", "2")}
          {/* invisible target cell – the hero's clip-path resolves to this rect */}
          <div
            ref={heroCellRef}
            style={{ gridColumn: "2", gridRow: "1 / 3", visibility: "hidden" }}
          />
          {gridCard(2, "3", "1")}
          {gridCard(3, "3", "2")}
        </div>

        {/* HERO — stays full-screen; clip-path shrinks the visible window */}
        <div
          ref={heroRef}
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            zIndex: 10,
            willChange: "clip-path",
          }}
        >
          <img
            ref={heroImageRef}
            src={heroImage}
            alt=""
            onLoad={handleImageLoad}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              willChange: "transform, width, height",
            }}
          />

          <div
            ref={heroContentRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              textAlign: "center",
              transform: "translateY(-10%)",
              willChange: "transform, opacity",
            }}
          >
            <h1
              style={{
                margin: 0,
                color: "#00020F",
                fontFamily: "'Clash Display', sans-serif",
                fontWeight: 600,
                fontSize: "clamp(4rem, 13vw, 12rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
              }}
            >
              Visual Modes
            </h1>
            <div
              className="font-geist-reference"
              style={{
                marginTop: 22,
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "0.34em",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              AI-generated visuals for every product in your collection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GallerySlider;
