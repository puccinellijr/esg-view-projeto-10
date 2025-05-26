
import { useState, useEffect } from 'react';

export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [lastVisibilityChange, setLastVisibilityChange] = useState(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      const newVisibility = !document.hidden;
      setIsVisible(newVisibility);
      setLastVisibilityChange(Date.now());
      
      if (newVisibility) {
        console.log('Página ficou visível novamente');
      } else {
        console.log('Página ficou oculta');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { isVisible, lastVisibilityChange };
};
