
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      console.log('Atualizando usuário:', selectedUser);
      
      // Update the user access level using the permission service
      const { success, error } = await updateUserAccessLevel(selectedUser.id, selectedUser.accessLevel);
      
      if (!success) {
        console.error('Erro ao atualizar nível de acesso:', error);
        toast.error("Erro ao atualizar nível de acesso do usuário");
        return;
      }
      
      // Update the user terminal if it changed
      if (selectedUser.terminal !== undefined) {
        console.log(`Atualizando terminal do usuário para: ${selectedUser.terminal}`);
        const { error: terminalError } = await supabase
          .from('user_profiles')
          .update({ terminal: selectedUser.terminal })
          .eq('id', selectedUser.id);
          
        if (terminalError) {
          console.error('Erro ao atualizar terminal do usuário:', terminalError);
          toast.error('Erro ao atualizar terminal do usuário');
          return;
        }
      }
      
      // Update the user in the local state
      setUsers((prevUsers) => 
        prevUsers.map((user) => 
          user.id === selectedUser.id ? {
            ...user,
            accessLevel: selectedUser.accessLevel,
            terminal: selectedUser.terminal
          } : user
        )
      );
      
      setIsEditDialogOpen(false);
      toast.success("Usuário atualizado com sucesso");
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      toast.error("Erro ao atualizar usuário");
    }
  };
