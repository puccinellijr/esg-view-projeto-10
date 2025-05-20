
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useAuth, AccessLevel } from '@/context/AuthContext';
import { getUsersAccessLevels, updateUserAccessLevel } from '@/services/userPermissionService';

const ManageUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { hasAccess } = useAuth();
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { users: usersData, error } = await getUsersAccessLevels();
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        toast.error('Erro ao carregar usuários');
        return;
      }
      
      if (usersData) {
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleEditUser = (user: any) => {
    setSelectedUser({
      ...user,
      terminal: user.terminal || "none" // Ensure terminal has a value
    });
    setIsEditDialogOpen(true);
  };
  
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
          .update({ terminal: selectedUser.terminal === "none" ? null : selectedUser.terminal })
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
            terminal: selectedUser.terminal === "none" ? null : selectedUser.terminal
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
  
  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(part => part[0]).join('').toUpperCase();
    }
    return email ? email[0].toUpperCase() : 'U';
  };
  
  return (
    <div className="container py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
      </header>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead>Terminal</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">Carregando...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">Nenhum usuário encontrado</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoUrl || ""} alt={user.name || user.email} />
                        <AvatarFallback>{getInitials(user.name || "", user.email)}</AvatarFallback>
                      </Avatar>
                      <span>{user.name || "Sem nome"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.accessLevel === 'administrative' ? 'Administrativo' : 
                     user.accessLevel === 'operational' ? 'Operacional' : 'Visualizador'}
                  </TableCell>
                  <TableCell>{user.terminal || "Nenhum"}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div>{selectedUser.email}</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="access-level">Nível de Acesso</Label>
                <Select 
                  value={selectedUser.accessLevel} 
                  onValueChange={(value: AccessLevel) => 
                    setSelectedUser({...selectedUser, accessLevel: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível de acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrative">Administrativo</SelectItem>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="terminal">Terminal</Label>
                <Select 
                  value={selectedUser.terminal || "none"} 
                  onValueChange={(value) => 
                    setSelectedUser({...selectedUser, terminal: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="Rio Grande">Rio Grande</SelectItem>
                    <SelectItem value="Alemoa">Alemoa</SelectItem>
                    <SelectItem value="Santa Helena de Goiás">Santa Helena de Goiás</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageUsers;
