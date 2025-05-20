
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
        terminal: terminal === "none" ? null : terminal,
        ...(newPassword ? { password: newPassword } : {})
      });
      
      // Atualizar usuário incluindo todos os dados necessários
      const updated = await updateUserProfile({
        name,
        photoUrl,
        terminal: terminal === "none" ? null : terminal,
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
