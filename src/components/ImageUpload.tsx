
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  defaultImage?: string;
  name?: string;
  email?: string;
  className?: string;
}

const ImageUpload = ({ value, onChange, defaultImage, name, email, className }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(value || defaultImage || "");

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O arquivo é muito grande. Tamanho máximo: 5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Avatar className="h-20 w-20 md:h-24 md:w-24 mb-2">
        <AvatarImage src={previewUrl} alt={name || email || "User"} />
        <AvatarFallback className="bg-blue-500 text-white text-xl">
          {getInitials(name, email)}
        </AvatarFallback>
      </Avatar>
      
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleButtonClick}
        className="mt-2 text-xs sm:text-sm"
        size="sm"
      >
        {previewUrl ? "Alterar Foto" : "Adicionar Foto"}
      </Button>
    </div>
  );
};

export default ImageUpload;
