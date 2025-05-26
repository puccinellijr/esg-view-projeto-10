
import { useState, useEffect, useRef } from 'react';

export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [lastVisibilityChange, setLastVisibilityChange] = useState(Date.now());
  const lastVisibleTime = useRef(Date.now());
  const visibilityTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const newVisibility = !document.hidden;
      const now = Date.now();
      
      // Clear any existing timeout
      if (visibilityTimeout.current) {
        clearTimeout(visibilityTimeout.current);
        visibilityTimeout.current = null;
      }
      
      if (newVisibility) {
        // Page became visible
        const timeSinceHidden = now - lastVisibleTime.current;
        console.log(`Página ficou visível novamente após ${Math.round(timeSinceHidden / 1000)}s oculta`);
        
        // Always update visibility immediately when page becomes visible
        setIsVisible(true);
        setLastVisibilityChange(now);
        lastVisibleTime.current = now;
      } else {
        // Page became hidden
        console.log('Página ficou oculta');
        lastVisibleTime.current = now;
        
        // Add a small delay before marking as not visible to avoid rapid changes
        visibilityTimeout.current = setTimeout(() => {
          setIsVisible(false);
          setLastVisibilityChange(now);
        }, 100);
      }
    };

    // Handle focus/blur events as well for better mobile support
    const handleFocus = () => {
      if (document.hidden) return; // Don't override if document is actually hidden
      
      const now = Date.now();
      console.log('Janela ganhou foco');
      setIsVisible(true);
      setLastVisibilityChange(now);
      lastVisibleTime.current = now;
    };

    const handleBlur = () => {
      console.log('Janela perdeu foco');
      // Don't immediately set as not visible on blur, wait for visibilitychange
    };

    // Add multiple event listeners for better cross-platform support
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Also listen for page show/hide events (important for mobile)
    window.addEventListener('pageshow', handleFocus);
    window.addEventListener('pagehide', handleBlur);
    
    return () => {
      if (visibilityTimeout.current) {
        clearTimeout(visibilityTimeout.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pageshow', handleFocus);
      window.removeEventListener('pagehide', handleBlur);
    };
  }, []);

  return { isVisible, lastVisibilityChange };
};
