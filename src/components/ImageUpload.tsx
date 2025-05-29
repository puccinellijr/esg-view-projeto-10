import React, { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  email?: string;
  enableCamera?: boolean;
}

const ImageUpload = ({ 
  value, 
  onChange, 
  name, 
  email,
  enableCamera = false 
}: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const getInitials = () => {
    if (name && name.trim() !== '') {
      const initials = name.split(' ').map(part => part[0]?.toUpperCase()).filter(Boolean).join('').slice(0, 2);
      return initials;
    } else if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("O arquivo é muito grande. O tamanho máximo é 5MB.");
        return;
      }

      // Read as data URL for preview
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onChange(result); // Send back to parent
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setPreviewUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleStartCamera = async () => {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("A câmera não está disponível neste navegador.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: false 
      });
      
      setStream(mediaStream);
      setIsCapturing(true);
      
      // Wait for next tick to ensure video element is in DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
            toast.error("Erro ao iniciar visualização da câmera");
          });
        }
      }, 100);
      
    } catch (err) {
      console.error("Error accessing camera:", err);
      
      // More specific error handling
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          toast.error("Acesso à câmera foi negado. Verifique as permissões do navegador.");
        } else if (err.name === 'NotFoundError') {
          toast.error("Nenhuma câmera foi encontrada neste dispositivo.");
        } else if (err.name === 'NotSupportedError') {
          toast.error("A câmera não é suportada neste navegador.");
        } else if (err.name === 'NotReadableError') {
          toast.error("A câmera está sendo usada por outro aplicativo.");
        } else {
          toast.error("Erro ao acessar a câmera. Tente usar o upload de arquivo.");
        }
      } else {
        toast.error("Erro ao acessar a câmera. Tente usar o upload de arquivo.");
      }
      
      setIsCapturing(false);
    }
  };
  
  const handleCaptureImage = () => {
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw the video frame to the canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/jpeg');
          
          // Set the preview and update parent
          setPreviewUrl(dataUrl);
          onChange(dataUrl);
          
          // Stop the camera
          handleStopCamera();
        }
      } catch (err) {
        console.error("Error capturing image:", err);
        toast.error("Erro ao capturar imagem");
      }
    }
  };
  
  const handleStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };
  
  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-28 w-28 border-2">
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt={name || "User"} className="object-cover" />
          ) : (
            <AvatarFallback className="bg-blue-500 text-white text-xl">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        
        {previewUrl && (
          <button 
            onClick={handleRemoveImage} 
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            type="button"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isCapturing ? (
        <div className="space-y-4 w-full max-w-sm">
          <div className="relative rounded-md overflow-hidden border border-gray-300 bg-black">
            <video 
              ref={videoRef} 
              className="w-full h-48 object-cover"
              muted 
              playsInline
              autoPlay
              style={{ 
                display: 'block',
                width: '100%',
                height: '192px',
                objectFit: 'cover'
              }}
            />
          </div>
          
          <div className="flex justify-center space-x-2">
            <Button
              type="button"
              size="sm"
              onClick={handleCaptureImage}
              className="flex items-center"
            >
              <Camera className="h-4 w-4 mr-1" />
              Capturar
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleStopCamera}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-1" />
            Enviar foto
          </Button>
          
          {enableCamera && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleStartCamera}
              className="flex items-center"
            >
              <Camera className="h-4 w-4 mr-1" />
              Usar câmera
            </Button>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};

export default ImageUpload;
