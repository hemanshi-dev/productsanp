import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Function to scroll to top - works with both native scroll and Lenis
    const scrollToTop = () => {
      // Method 1: Direct DOM manipulation (works with Lenis)
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Method 2: Window scroll (fallback)
      window.scrollTo(0, 0);
      
      // Method 3: Dispatch custom event for Lenis if it's listening
      window.dispatchEvent(new CustomEvent('scrollToTop'));
    };

    // Immediate scroll to ensure it happens
    scrollToTop();

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      scrollToTop();
    });

    // Fallback: try again after a short delay to handle async rendering
    const timeoutId = setTimeout(() => {
      scrollToTop();
      // Also try smooth scroll as final attempt
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 150);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;

