import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CtaButton from "./CtaButton";
import {
  Camera,
  Download,
  LayoutGrid,
  Palette,
  Settings2,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type FeatureCard = {
  id: string;
  title: string;
  description: string;
  icon: typeof LayoutGrid;
};

const featureCards: FeatureCard[] = [
  {
    id: "01",
    title: "Choose Your Creation Mode",
    description:
      "Start by selecting your creation type from the main dashboard: Product Photoshoot, Marketing Ads Visuals, or Personal Modelling.",
    icon: LayoutGrid,
  },
  {
    id: "02",
    title: "Select Your Photoshoot Style",
    description:
      "Choose a specific photoshoot style tailored to your creation mode.",
    icon: Palette,
  },
  {
    id: "03",
    title: "Choose Your Photo Scene",
    description:
      'Select the visual style and mood you want, such as "Studio product shot" for products. This defines lighting, composition, and overall generated aesthetic.',
    icon: Camera,
  },
  {
    id: "04",
    title: "Configure Your Generation",
    description:
      "Decide how many images to generate (1-4), set the aspect ratio (1:1, 3:4, 4:3, 16:9). This controls the diversity and completeness of your final set.",
    icon: Settings2,
  },
  {
    id: "05",
    title: "Review, Download, and Use",
    description:
      "Preview all generated images in high quality. Use directly on e-commerce platforms, social media, marketing campaigns, or portfolios without additional editing.",
    icon: Download,
  },
];

const STACK_GAP = 14;
const DESKTOP_CARD_HEIGHT = 336;
const DESKTOP_CARD_PITCH = DESKTOP_CARD_HEIGHT + STACK_GAP;
const DESKTOP_SCROLL_TAIL = 190;

const HowItWorks = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctxCanvas = canvas?.getContext("2d");

    if (!section || !canvas || !ctxCanvas) return;
    const dotsGrid: {
      x: number;
      y: number;
      originalX: number;
      originalY: number;
      size: number;
    }[] = [];
    const spacing = 40;
    const mousePos = { x: section.offsetWidth / 2, y: section.offsetHeight / 2 };
    let isPointerInside = false;
    let animationFrameId: number;

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

      dotsGrid.forEach((gridDot, index) => {
        const dx = mousePos.x - gridDot.x;
        const dy = mousePos.y - gridDot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;
        const pulse = Math.sin(time * 0.002 + index * 0.1) * 0.5 + 0.5;

        if (isPointerInside && dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          gridDot.x = gridDot.originalX - dx * force * 0.15;
          gridDot.y = gridDot.originalY - dy * force * 0.15;
          ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.1 + force * 0.5})`;
          ctxCanvas.beginPath();
          ctxCanvas.arc(gridDot.x, gridDot.y, gridDot.size + force * 2, 0, Math.PI * 2);
          ctxCanvas.fill();
        } else {
          gridDot.x += (gridDot.originalX - gridDot.x) * 0.1;
          gridDot.y += (gridDot.originalY - gridDot.y) * 0.1;
          ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.05 + pulse * 0.1})`;
          ctxCanvas.beginPath();
          ctxCanvas.arc(gridDot.x, gridDot.y, gridDot.size + pulse * 0.5, 0, Math.PI * 2);
          ctxCanvas.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mousePos.x = x;
      mousePos.y = y;
    };
    const handleMouseEnter = () => {
      isPointerInside = true;
    };
    const handleMouseLeave = () => {
      isPointerInside = false;
    };

    initGrid();
    animationFrameId = requestAnimationFrame(render);

    window.addEventListener("resize", initGrid);
    section.addEventListener("mouseenter", handleMouseEnter);
    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", initGrid);
      section.removeEventListener("mouseenter", handleMouseEnter);
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current || !pinRef.current) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean) as HTMLElement[];
      if (!cards.length) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const totalPhases = cards.length - 1;
        const phaseClamp = gsap.utils.clamp(0, 1);
        const stackTravel = DESKTOP_CARD_PITCH * totalPhases;
        const totalScrollDistance = stackTravel + DESKTOP_SCROLL_TAIL;

        const setupCardStack = () => {
          cards.forEach((card, index) => {
            gsap.set(card, {
              y: index * DESKTOP_CARD_PITCH,
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              zIndex: 10 + index,
              force3D: true,
            });
          });
        };

        setupCardStack();

        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${totalScrollDistance}`,
          pin: pinRef.current,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: setupCardStack,
          onUpdate: (self) => {
            const scrolled = self.progress * totalScrollDistance;
            const travelRatio = Math.min(scrolled / stackTravel, 1);
            const progress = travelRatio * totalPhases;

            cards.forEach((card, index) => {
              let shift = 0;

              for (let phase = 1; phase <= index; phase += 1) {
                const phaseProgress = phaseClamp(progress - (phase - 1));
                shift += DESKTOP_CARD_PITCH * phaseProgress;
              }

              const nextY = Math.round(index * DESKTOP_CARD_PITCH - shift);
              gsap.set(card, { y: nextY });
            });
          },
        });

        return () => {
          trigger.kill();
        };
      });

      mm.add("(max-width: 767px)", () => {
        cards.forEach((card, index) => {
          gsap.set(card, { clearProps: "all" });

          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 32,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              delay: index * 0.04,
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                once: true,
              },
            },
          );
        });
      });

      return () => {
        mm.revert();
      };
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-black text-white"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ mixBlendMode: "screen" }}
      />
      <div
        ref={pinRef}
        className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1400px] items-start px-4 pt-5 pb-6 md:min-h-[560px] md:px-4 md:pt-7 md:pb-6"
      >
        <div className="grid w-full grid-cols-1 gap-1 md:grid-cols-[0.74fr_1.4fr] md:items-start md:gap-12">
          <div className="mt-8 md:mt-15 w-full md:-ml-8 md:sticky md:top-16 md:w-[400px] md:h-[240px]">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full border border-[#00FFFF]"></div>
                <p className="font-geist-reference text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-[#00FFFF]">
                  How It Works
                </p>
              </div>
              <h5 className="mx-auto md:mx-0 max-w-full md:max-w-[13ch] font-clash text-[28px] font-semibold leading-[1.16] text-white md:text-[46px] md:leading-[1.08]">
                <span className="block">
                  The seamless path to
                </span>
                <span className="block">intelligence.</span>
              </h5>
              <p className="mx-auto md:mx-0 mt-5 max-w-[62ch] text-sm font-geist-reference leading-relaxed text-white/85 md:text-[15px] md:leading-[1.45]">
                With our global network of digital specialists, we're able to
                provide local knowledge in more than 50 international markets.
                Our team has knowledge for new market"
              </p>
            </div>
            <div className="mt-8 flex justify-center md:justify-start">
              <CtaButton onClick={onLoginClick}>Get started</CtaButton>
            </div>
          </div>

          <div className="mt-8 md:mt-15 w-full">
            <div className="relative h-auto w-full md:h-[336px]">
              {featureCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <div key={card.id} className="relative mb-4 md:mb-0">
                    <article
                      ref={(element) => {
                        cardsRef.current[index] = element;
                      }}
                      className="overflow-hidden rounded-[14px] md:rounded-[18px] border border-[#00ffff]/10 bg-[#030405] p-5 md:p-9 will-change-transform md:absolute md:left-0 md:right-0 md:h-[336px]"
                    >
                      <div className="mb-4 md:mb-6 flex items-start justify-between">
                        <div className="flex h-12 w-12 md:h-[84px] md:w-[84px] items-center justify-center rounded-full bg-[#00ffff] text-black">
                          <Icon
                            className="h-5 w-5 md:h-[36px] md:w-[36px]"
                            strokeWidth={2.2}
                          />
                        </div>
                        <div className="flex h-9 w-9 md:h-[45px] md:w-[45px] items-center justify-center rounded-full bg-black font-clash text-sm md:text-base font-thin text-[#00ffff]">
                          {card.id}
                        </div>
                      </div>

                      <h3 className="font-clash text-xl md:text-[48px] font-semibold leading-tight text-white md:leading-[1.05]">
                        {card.title}
                      </h3>
                      <p className="mt-3 md:mt-5 max-w-[62ch] text-sm md:text-[15px] font-geist-reference leading-relaxed text-white/85 md:leading-[1.4]">
                        {card.description}
                      </p>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;





