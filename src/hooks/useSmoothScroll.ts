import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const useSmoothScroll = () => {
  const location = useLocation()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Check if we're on an admin route - disable smooth scroll for admin pages
    const isAdminRoute = location.pathname.startsWith('/admin')
    
    if (isAdminRoute) {
      // Destroy Lenis if it exists
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      return
    }

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  
      // smooth: true,
      // smoothTouch: false,
      // touchMultiplier: 2,
    })

    lenisRef.current = lenis

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Use GSAP ticker for smooth animation
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    // Refresh ScrollTrigger after Lenis is initialized
    ScrollTrigger.refresh()

    // Listen for scrollToTop custom event
    const handleScrollToTop = () => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: false, duration: 1.2 })
      }
    }

    window.addEventListener('scrollToTop', handleScrollToTop)

    // Cleanup
    return () => {
      window.removeEventListener('scrollToTop', handleScrollToTop)
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      gsap.ticker.remove(tickerCallback)
    }
  }, [location.pathname])
}

