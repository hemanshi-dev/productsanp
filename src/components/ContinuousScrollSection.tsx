import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'


gsap.registerPlugin(ScrollTrigger)

const ContinuousScrollSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLDivElement>(null)
  const line2Ref = useRef<HTMLDivElement>(null)
  const image1Ref = useRef<HTMLDivElement>(null)
  const image2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !line1Ref.current || !line2Ref.current) return

    let ctx: gsap.Context | null = null
    let line1Animation: gsap.core.Tween | gsap.core.Timeline | null = null
    let line2Animation: gsap.core.Tween | gsap.core.Timeline | null = null

    const initAnimation = () => {
      // Get the width of one duplicate set
      const getLineWidth = (line: HTMLDivElement | null) => {
        if (!line) return 0
        const firstChild = line.firstElementChild as HTMLElement
        if (!firstChild) return 0
        // Get the width of one duplicate (first child)
        return firstChild.offsetWidth || firstChild.scrollWidth || 0
      }

      const line1Width = getLineWidth(line1Ref.current)
      const line2Width = getLineWidth(line2Ref.current)

      // If widths are 0, wait a bit and try again
      if (line1Width === 0 || line2Width === 0) {
        requestAnimationFrame(initAnimation)
        return
      }

      ctx = gsap.context(() => {
        // Line 1 continuous animation - left to right (positive x)
        // Use same approach as line 2 but in opposite direction
        if (line1Ref.current && line1Width > 0) {
          // Start from 0 and move to positive (left to right)
          line1Animation = gsap.fromTo(
            line1Ref.current,
            { x: 0 },
            {
              x: line1Width,
              duration: 50,
              ease: 'none',
              repeat: -1,
            }
          )
        }

        // Line 2 continuous animation - right to left (negative x)
        if (line2Ref.current && line2Width > 0) {
          line2Animation = gsap.fromTo(
            line2Ref.current,
            { x: 0 },
            {
              x: -line2Width,
              duration: 50,
              ease: 'none',
              repeat: -1,
            }
          )
        }

        // Create ScrollTrigger to control speed multiplier
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            // Speed starts at 0.5 (slow) and increases to 2.0 (fast) as you scroll
            const progress = self.progress
            const speedMultiplier = 0.5 + progress * 2.5 // 0.5 -> 2.0
            
            if (line1Animation) {
              line1Animation.timeScale(speedMultiplier)
            }
            if (line2Animation) {
              line2Animation.timeScale(speedMultiplier)
            }
          },
        })

      // Image animations - subtle movement
      if (image1Ref.current) {
        gsap.to(image1Ref.current, {
          y: -30,
          rotation: -5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }

      if (image2Ref.current) {
        gsap.to(image2Ref.current, {
          y: -20,
          rotation: 3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }
      }, sectionRef)
    }

    // Initialize immediately
    requestAnimationFrame(initAnimation)

    return () => {
      if (line1Animation) line1Animation.kill()
      if (line2Animation) line2Animation.kill()
      if (ctx) {
        ctx.revert()
      }
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === sectionRef.current) {
          trigger.kill()
        }
      })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-8 overflow-hidden bg-primary"
    >
        {/* Line 1 */}
        <div className="relative md:mb-8 mb-4">
          <div
            ref={line1Ref}
            className="flex items-center justify-end gap-8 whitespace-nowrap will-change-transform"
          >
            {/* Duplicate for seamless loop */}
            <div className="flex items-center md:gap-8 gap-4">
        
              <div
                ref={image1Ref}
                className="relative w-16 h-16 md:w-24 md:h-24 lg:w-24 lg:h-24 flex-shrink-0"
              >
                <img
                  src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/8d8ef43f-6234-4056-9f8b-e1a6890f466b.webp"
                  alt="Game Controller"
                  className="w-full h-full object-cover rounded-lg"
                  style={{ transform: 'perspective(1000px) rotateY(-15deg)' }}
                />
              </div>
              <span className="text-4xl md:text-6xl lg:text-6.5xl font-primary font-bold text-white uppercase tracking-tight">
                Next-Gen AI Photoshoots
              </span>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center md:gap-8 gap-4">
              
              <div className="relative w-16 h-16 md:w-24 md:h-24 lg:w-24 lg:h-24 flex-shrink-0">
                <img
                  src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/b3cb5ce3-6805-489c-b721-0f5e2e4f444a.webp"
                  alt="Game Controller"
                  className="w-full h-full object-cover rounded-lg"
                  style={{ transform: 'perspective(1000px) rotateY(-15deg)' }}
                />
              </div>
              <span className="text-4xl md:text-6xl lg:text-6.5xl font-primary font-bold text-white uppercase tracking-tight">
                Next-Gen AI Photoshoots
              </span>
            </div>
            {/* Third duplicate for smoother loop */}
            <div className="flex items-center md:gap-8 gap-4">
        
              <div className="relative w-16 h-16 md:w-24 md:h-24 lg:w-24 lg:h-24 flex-shrink-0">
                <img
                  src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/bae7a019-8af0-4979-b828-c6ca0722677f.webp"
                  alt="Game Controller"
                  className="w-full h-full object-cover rounded-lg"
                  style={{ transform: 'perspective(1000px) rotateY(-15deg)' }}
                />
              </div>
              <span className="text-4xl md:text-6xl lg:text-6.5xl font-primary font-bold text-white uppercase tracking-tight">
                Next-Gen AI Photoshoots
              </span>
            </div>
          </div>
        </div>

        {/* Line 2 */}
        <div className="relative">
          <div
            ref={line2Ref}
            className="flex items-center gap-8 whitespace-nowrap will-change-transform"
          >
            {/* Duplicate for seamless loop */}
            <div className="flex items-center md:gap-8 gap-4">
              <div
                ref={image2Ref}
                className="relative w-16 h-16 md:w-28 md:h-28 lg:w-24 lg:h-24 flex-shrink-0"
              >
                <img
                  src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/e705515e-0429-4b66-8c93-ee9d6b71558d.webp"
                  alt="Play Button"
                  className="w-full h-full object-cover rounded-lg"
                  style={{ transform: 'perspective(1000px) rotateY(15deg)' }}
                />
              </div>
              <span className="text-4xl md:text-6xl lg:text-6.5xl font-primary font-bold text-white uppercase tracking-tight">
                Instant Studio-Quality Results
              </span>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center md:gap-8 gap-4">
              <div className="relative w-16 h-16 md:w-28 md:h-28 lg:w-24 lg:h-24 flex-shrink-0">
                <img
                  src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/67c0876f-1745-412e-a890-5204cd70a586.webp"
                  alt="Play Button"
                  className="w-full h-full object-cover rounded-lg"
                  style={{ transform: 'perspective(1000px) rotateY(15deg)' }}
                />
              </div>
              <span className="text-4xl md:text-6xl lg:text-6.5xl font-primary font-bold text-white uppercase tracking-tight">
                Instant Studio-Quality Results
              </span>
            </div>
            {/* Third duplicate for smoother loop */}
            <div className="flex items-center md:gap-8 gap-4">
              <div className="relative w-16 h-16 md:w-28 md:h-28 lg:w-24 lg:h-24 flex-shrink-0">
                <img
                  src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/20e181ef-2a96-43f1-b11a-e7c50577fa09.webp"
                  alt="Play Button"
                  className="w-full h-full object-cover rounded-lg"
                  style={{ transform: 'perspective(1000px) rotateY(15deg)' }}
                />
              </div>
              <span className="text-4xl md:text-6xl lg:text-6.5xl font-primary font-bold text-white uppercase tracking-tight">
                Instant Studio-Quality Results
              </span>
            </div>
          </div>
        </div>
      
    </section>
  )
}

export default ContinuousScrollSection

