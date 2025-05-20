
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
import { getUsersAccessLevels, updateUserAccessLevel, deleteUser } from '@/services/userPermissionService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Input } from "@/components/ui/input";
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const ManageUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { hasAccess } = useAuth();
  const isMobile = useIsMobile();
  
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
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { success, error } = await deleteUser(selectedUser.id);
      
      if (!success) {
        console.error('Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário');
        return;
      }
      
      // Remove user from local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      toast.success('Usuário excluído com sucesso');
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      toast.error('Erro ao excluir usuário');
    }
  };
  
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    try {
      console.log('Atualizando usuário:', selectedUser);
      
      // Update the user access level using the permission service
      const { success, error } = await updateUserAccessLevel(
        selectedUser.id, 
        selectedUser.accessLevel,
        newPassword || undefined
      );
      
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

  // Component to render user edit form (shared between dialog and sheet)
  const UserEditForm = () => (
    <div className="space-y-4 py-4">
      {selectedUser && (
        <>
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
              <SelectTrigger className="w-full">
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
              <SelectTrigger className="w-full">
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
          
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input 
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite para alterar a senha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input 
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
            />
          </div>
        </>
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <div className="container py-4 md:py-6 flex-1 px-2 md:px-6">
          <header className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold">Gerenciar Usuários</h1>
          </header>
          
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isMobile ? "px-2" : ""}>Usuário</TableHead>
                  {!isMobile && <TableHead>Email</TableHead>}
                  <TableHead className={isMobile ? "px-2" : ""}>Nível</TableHead>
                  {!isMobile && <TableHead>Terminal</TableHead>}
                  <TableHead className={isMobile ? "px-2" : ""}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 5} className="text-center py-4">Carregando...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 5} className="text-center py-4">Nenhum usuário encontrado</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className={isMobile ? "px-2" : ""}>
                        <div className="flex items-center gap-2">
                          <Avatar className={`${isMobile ? "h-6 w-6" : "h-8 w-8"}`}>
                            <AvatarImage src={user.photoUrl || ""} alt={user.name || user.email} />
                            <AvatarFallback>{getInitials(user.name || "", user.email)}</AvatarFallback>
                          </Avatar>
                          <span className="line-clamp-1">{user.name || user.email.split('@')[0]}</span>
                        </div>
                      </TableCell>
                      {!isMobile && <TableCell>{user.email}</TableCell>}
                      <TableCell className={isMobile ? "px-2" : ""}>
                        {isMobile ? (
                          user.accessLevel === 'administrative' ? 'Admin' : 
                          user.accessLevel === 'operational' ? 'Oper' : 'View'
                        ) : (
                          user.accessLevel === 'administrative' ? 'Administrativo' : 
                          user.accessLevel === 'operational' ? 'Operacional' : 'Visualizador'
                        )}
                      </TableCell>
                      {!isMobile && <TableCell>{user.terminal || "Nenhum"}</TableCell>}
                      <TableCell className={isMobile ? "px-2" : ""}>
                        <div className="flex gap-1 md:gap-2">
                          <Button variant="outline" size={isMobile ? "icon" : "sm"} onClick={() => handleEditUser(user)}>
                            {isMobile ? "E" : "Editar"}
                          </Button>
                          <Button variant="destructive" size={isMobile ? "icon" : "sm"} onClick={() => handleDeleteUser(user)}>
                            {isMobile ? "X" : "Excluir"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {isMobile ? (
            <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <SheetContent className="overflow-y-auto">
                <div className="py-6">
                  <h2 className="text-lg font-semibold mb-4">Editar Usuário</h2>
                  <UserEditForm />
                  <div className="flex flex-col space-y-2 mt-6">
                    <Button onClick={handleUpdateUser}>
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Usuário</DialogTitle>
                </DialogHeader>
                
                <UserEditForm />
                
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
          )}
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent className="max-w-[95%] mx-auto md:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o usuário {selectedUser?.name || selectedUser?.email}?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col sm:flex-row">
                <AlertDialogCancel className="mb-2 sm:mb-0">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
