
import { useState, useEffect, useRef } from 'react';

export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [lastVisibilityChange, setLastVisibilityChange] = useState(Date.now());
  const lastVisibleTime = useRef(Date.now());
  const visibilityTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

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
        if (isInitialized.current) {
          const timeSinceHidden = now - lastVisibleTime.current;
          console.log(`Página ficou visível novamente após ${Math.round(timeSinceHidden / 1000)}s oculta`);
        }
        
        // Always update visibility immediately when page becomes visible
        setIsVisible(true);
        setLastVisibilityChange(now);
        lastVisibleTime.current = now;
        isInitialized.current = true;
      } else {
        // Page became hidden
        console.log('Página ficou oculta');
        lastVisibleTime.current = now;
        
        // Don't immediately mark as not visible to avoid disrupting ongoing processes
        visibilityTimeout.current = setTimeout(() => {
          setIsVisible(false);
          setLastVisibilityChange(now);
        }, 500); // Increased delay to 500ms
      }
    };

    const handleFocus = () => {
      if (document.hidden) return;
      
      const now = Date.now();
      console.log('Janela ganhou foco');
      setIsVisible(true);
      setLastVisibilityChange(now);
      lastVisibleTime.current = now;
      isInitialized.current = true;
    };

    const handleBlur = () => {
      console.log('Janela perdeu foco - não alterando estado imediatamente');
      // Don't change visibility state on blur alone
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pageshow', handleFocus);
    
    // Initialize the state properly
    setIsVisible(!document.hidden);
    isInitialized.current = true;
    
    return () => {
      if (visibilityTimeout.current) {
        clearTimeout(visibilityTimeout.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pageshow', handleFocus);
    };
  }, []);

  return { isVisible, lastVisibilityChange };
};
