import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const HERO_TITLE_LINES = [
  ["Get", "Studio"],
  ["Grade", "Images"],
];

const HERO_TITLE_GRADIENT =
  "radial-gradient(circle farthest-corner at 75% 50%, #ffffff, #6b7280)";

const TITLE_CLASS =
  "font-clash-display text-[72px] font-bold leading-[105%] tracking-[-2px] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]";

const HeroTitleReveal = () => {
  const rootRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const slides = root.querySelectorAll<HTMLElement>(".hero-word-slide");
    if (!slides.length) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(slides, { yPercent: 0 });
      return;
    }

    gsap.set(slides, { yPercent: 110, force3D: true });

    const ctx = gsap.context(() => {
      gsap.to(slides, {
        yPercent: 0,
        duration: 1.35,
        ease: "power2.out",
        stagger: 0.3,
        delay: 0.35,
        force3D: true,
        overwrite: true,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <p ref={rootRef} className="hero-title-reveal w-auto pb-2 px-1 text-center md:text-left">
      {HERO_TITLE_LINES.map((line, lineIndex) => (
        <span
          key={line.join("-")}
          className={`block ${lineIndex === 1 ? "whitespace-nowrap" : ""}`}
        >
          {line.map((word, wordIndex) => (
            <span
              key={word}
              className="hero-word-clip inline-block overflow-hidden align-bottom"
            >
              <span className="hero-word-slide block">
                <span
                  className={TITLE_CLASS}
                  style={{ backgroundImage: HERO_TITLE_GRADIENT }}
                >
                  {word}
                  {wordIndex < line.length - 1 ? "\u00A0" : ""}
                </span>
              </span>
            </span>
          ))}
        </span>
      ))}
    </p>
  );
};

export default HeroTitleReveal;
