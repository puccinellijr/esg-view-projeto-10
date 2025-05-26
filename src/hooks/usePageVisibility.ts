
import { useState } from 'react';

export const usePageVisibility = () => {
  // Sempre retorna que a página está visível, sem monitoramento
  const [isVisible] = useState(true);
  const [lastVisibilityChange] = useState(Date.now());

  return { isVisible, lastVisibilityChange };
};
