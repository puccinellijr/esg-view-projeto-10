
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface HeaderLogoProps {
  toggleSidebar: () => void;
  sidebarState: "expanded" | "collapsed" | "hidden";
}

const HeaderLogo = ({ toggleSidebar, sidebarState }: HeaderLogoProps) => {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="flex md:hidden lg:flex"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {sidebarState === "collapsed" && (
        <div className="hidden md:flex items-center justify-center">
          <img 
            src="/lovable-uploads/c8535274-7a23-458f-b0b0-5c5f2dd77c32.png" 
            alt="Odjell Terminals Logo" 
            className="h-10 w-auto object-contain" 
            loading="eager"
            style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.1))' }}
            onError={(e) => {
              console.error("Logo failed to load, using fallback");
              e.currentTarget.src = 'https://via.placeholder.com/150x80?text=Odjell+Terminals';
            }} 
          />
        </div>
      )}
      
      <h1 className="text-lg font-medium md:text-xl">
        ESG
      </h1>
    </div>
  );
};

export default HeaderLogo;
