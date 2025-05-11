
import React from 'react';

interface WelcomeMessageProps {
  displayName: string;
  isMobile?: boolean;
}

const WelcomeMessage = ({ displayName, isMobile }: WelcomeMessageProps) => {
  if (isMobile) {
    return (
      <div className="md:hidden text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
        <span>Bem-vindo, {displayName}</span>
      </div>
    );
  }
  
  return (
    <div className="hidden md:flex items-center ml-2 lg:ml-4 text-sm lg:text-base font-medium">
      <span>Bem-vindo, {displayName}</span>
    </div>
  );
};

export default WelcomeMessage;
