import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { X, Camera } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Component implementation starts here
const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
  const { user, updateUserProfile } = useAuth();
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [terminal, setTerminal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Initialize form values when the modal opens or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhotoUrl(user.photoUrl || "");
      setTerminal(user.terminal || "");
    }
  }, [user, isOpen]);
  
  // Clean up camera stream when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    };
  }, [cameraStream]);

  // Clean up camera when modal closes
  useEffect(() => {
    if (!isOpen && cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
    }
  }, [isOpen, cameraStream]);

  // Handle starting the camera
  const handleStartCamera = async () => {
    try {
      console.log("Tentando acessar câmera...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }
      });
      
      setCameraStream(stream);
      setIsCameraActive(true);
      
      // Wait for the next render cycle before attaching the stream to the video element
      setTimeout(() => {
        if (videoRef.current) {
          console.log("Configurando elemento de vídeo");
          videoRef.current.srcObject = stream;
          videoRef.current.play()
            .then(() => console.log("Reprodução de vídeo iniciada"))
            .catch(err => console.error("Erro ao iniciar reprodução de vídeo:", err));
        } else {
          console.error("Elemento de vídeo não encontrado");
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera. Verifique as permissões do navegador.",
        variant: "destructive"
      });
    }
  };
  
  // Handle taking a picture
  const handleTakePicture = () => {
    console.log("Tentando capturar foto...");
    if (!videoRef.current) {
      console.error("Elemento de vídeo não encontrado ao capturar foto");
      return;
    }
    
    try {
      // Create a canvas with the video dimensions
      const canvas = document.createElement("canvas");
      const videoElement = videoRef.current;
      
      // Check if video dimensions are available
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.error("Dimensões de vídeo indisponíveis:", videoElement.videoWidth, videoElement.videoHeight);
        toast({
          title: "Erro",
          description: "A câmera não está pronta. Tente novamente.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Dimensões do vídeo:", videoElement.videoWidth, "x", videoElement.videoHeight);
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw the current frame from video to canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to base64 image data URL
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        console.log("Imagem capturada com sucesso, tamanho:", imageDataUrl.length);
        setPhotoUrl(imageDataUrl);
        
        // Stop the camera stream
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        
        setIsCameraActive(false);
      } else {
        console.error("Contexto de canvas não disponível");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      toast({
        title: "Erro",
        description: "Erro ao capturar a foto",
        variant: "destructive"
      });
    }
  };
  
  // Handle stopping the camera
  const handleStopCamera = () => {
    console.log("Parando câmera...");
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
        console.log("Track parada:", track.kind, track.readyState);
      });
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Atualizando perfil com dados:", {
        name,
        photoUrl,
        terminal,
        ...(newPassword ? { password: newPassword } : {})
      });
      
      // Atualizar usuário incluindo todos os dados necessários
      const updated = await updateUserProfile({
        name,
        photoUrl,
        terminal,
        ...(newPassword ? { password: newPassword } : {}),
      });
      
      if (updated) {
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso"
        });
        // Limpar os campos de senha
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      } else {
        toast({
          title: "Erro",
          description: "Erro ao atualizar perfil",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-[95%] max-w-[350px] max-h-[70vh] overflow-y-auto' : 'sm:max-w-[350px]'} p-4 sm:p-6`}>
        <DialogHeader>
          <DialogTitle>Perfil do Usuário</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-2">
          {!isCameraActive ? (
            <div className="flex flex-col items-center">
              <ImageUpload
                value={photoUrl}
                onChange={setPhotoUrl}
                name={name}
                email={email}
                className="scale-75"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartCamera}
                className="mt-2 text-xs flex items-center gap-1"
              >
                <Camera size={14} /> Usar Câmera
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full h-48 bg-gray-200 rounded-md overflow-hidden">
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay 
                  playsInline
                  muted
                />
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleTakePicture}
                  className="flex-1 text-xs"
                >
                  Capturar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleStopCamera}
                  className="flex-1 text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              disabled
              placeholder="seu@email.com"
            />
            <p className="text-xs text-gray-500">Email não pode ser alterado</p>
          </div>
          
          {user?.accessLevel === "administrative" && (
            <div className="space-y-1">
              <Label htmlFor="terminal">Terminal</Label>
              <Select
                value={terminal}
                onValueChange={setTerminal}
                disabled={isLoading}
              >
                <SelectTrigger id="terminal">
                  <SelectValue placeholder="Selecione o terminal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rio Grande">Rio Grande</SelectItem>
                  <SelectItem value="SP">SP</SelectItem>
                  <SelectItem value="Alemoa">Alemoa</SelectItem>
                  <SelectItem value="Santa Helena de Goiás">Santa Helena de Goiás</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input 
              id="current-password" 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="confirm-password">Confirmar Senha</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
              disabled={isLoading}
            />
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={isLoading}
            >
              <X className="h-4 w-4" /> Cancelar
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
