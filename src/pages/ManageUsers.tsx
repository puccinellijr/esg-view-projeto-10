
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { AccessLevel } from '@/types/auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/lib/supabase';

interface UserData {
  id: string;
  name?: string;
  email: string;
  accessLevel: AccessLevel;
  photoUrl?: string;
  terminal?: string | null;
}

// Component to display user cards on mobile
const UserCard = ({ 
  user, 
  onEdit, 
  onDelete 
}: { 
  user: UserData, 
  onEdit: (user: UserData) => void, 
  onDelete: (userId: string) => void 
}) => {
  const getAccessLevelLabel = (level: AccessLevel) => {
    switch (level) {
      case "administrative": return "Administrativo";
      case "viewer": return "Visualizador";
      case "operational": return "Operacional";
      default: return level;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || "U";
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.photoUrl} alt={user.name || user.email} />
            <AvatarFallback className="bg-blue-500 text-white">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.name || user.email.split('@')[0]}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="font-semibold block">Nível de Acesso:</span>
            <span>{getAccessLevelLabel(user.accessLevel)}</span>
          </div>
          <div>
            <span className="font-semibold block">Terminal:</span>
            <span>{user.terminal || "—"}</span>
          </div>
        </div>
        
        <div className="flex justify-between gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(user)}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 text-red-500 mr-1" /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[95%] max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja excluir o usuário {user.name || user.email}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto mt-0">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(user.id)} 
                  className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const isMobile = useIsMobile();
  
  // Load users from Supabase
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Carregando usuários...');
      // Get user access levels from the permission service
      const { getUsersAccessLevels } = await import('@/services/userPermissionService');
      const { users: accessUsers, error: accessError } = await getUsersAccessLevels();
      
      if (accessError) {
        console.error('Erro ao carregar níveis de acesso:', accessError);
        toast.error('Erro ao carregar os níveis de acesso dos usuários');
        setIsLoading(false);
        return;
      }
      
      if (!accessUsers || accessUsers.length === 0) {
        console.log('Nenhum usuário encontrado');
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Carregados ${accessUsers.length} usuários`);
      
      // For each user, get additional profile information
      const enhancedUsers = await Promise.all(
        accessUsers.map(async (user) => {
          try {
            console.log(`Buscando perfil para usuário: ${user.id}`);
            // Get additional profile data
            const { data: profileData } = await supabase
              .from('user_profiles')
              .select('name, photo_url, terminal')
              .eq('id', user.id)
              .single();
              
            const result = {
              id: user.id,
              email: user.email,
              accessLevel: user.accessLevel,
              name: profileData?.name || user.email.split('@')[0],
              photoUrl: profileData?.photo_url || undefined,
              terminal: profileData?.terminal || null
            };
            
            console.log(`Perfil encontrado para ${user.email}:`, result);
            return result;
          } catch (err) {
            console.warn(`Erro ao obter dados completos para usuário ${user.id}:`, err);
            // Return basic user data if profile fetch fails
            return {
              id: user.id,
              email: user.email,
              accessLevel: user.accessLevel,
              name: user.email.split('@')[0]
            };
          }
        })
      );
      
      console.log('Usuários processados:', enhancedUsers);
      setUsers(enhancedUsers);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      toast.error('Erro ao carregar lista de usuários');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);
  
  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) => 
      (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.terminal?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteUser = async (userId: string) => {
    try {
      console.log(`Excluindo usuário com ID: ${userId}`);
      // Primeiro, encontrar o usuário para exibir informações de log
      const userToDelete = users.find(u => u.id === userId);
      console.log(`Excluindo: ${userToDelete?.email} (${userToDelete?.name})`);
      
      // Remover o perfil do usuário
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Erro ao excluir perfil do usuário:', profileError);
        toast.error('Erro ao excluir usuário: ' + profileError.message);
        return;
      }
      
      // Tentar excluir o usuário da autenticação
      // Nota: Isso pode exigir funções especiais no Supabase
      try {
        // Esta é uma função personalizada que deve ser configurada no Supabase
        const { error: authError } = await supabase.functions.invoke('delete-user', {
          body: { userId }
        });
        
        if (authError) {
          console.error('Erro ao excluir autenticação do usuário:', authError);
          toast.warning('Usuário removido parcialmente. O registro de autenticação permanece.');
        }
      } catch (authErr) {
        console.error('Falha ao chamar função de exclusão de usuário:', authErr);
        toast.warning('Usuário removido parcialmente. O registro de autenticação permanece.');
      }
      
      // Atualiza a UI mesmo que a exclusão da autenticação tenha falhado
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      toast.success("Usuário excluído com sucesso");
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      toast.error('Erro ao excluir usuário');
    }
  };
  
  const handleEditUser = (user: UserData) => {
    console.log('Editando usuário:', user);
    setSelectedUser({...user});
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      console.log('Atualizando usuário:', selectedUser);
      
      // Update the user access level using the permission service
      const { updateUserAccessLevel } = await import('@/services/userPermissionService');
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
  
  const handleRefreshUsers = () => {
    loadUsers();
    setShowRefreshMessage(true);
    setTimeout(() => setShowRefreshMessage(false), 3000);
    toast.success('Lista de usuários atualizada');
  };
  
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || "U";
  };

  const getAccessLevelLabel = (level: AccessLevel) => {
    switch (level) {
      case "administrative": return "Administrativo";
      case "viewer": return "Visualizador";
      case "operational": return "Operacional";
      default: return level;
    }
  };
  
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <DashboardSidebar />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        
        <div className="p-3 sm:p-4 md:p-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-4 sm:py-6 sm:px-6">
              <CardTitle>Gerenciar Usuários</CardTitle>
              <div className="flex w-full sm:w-auto gap-2 flex-col sm:flex-row">
                <Button 
                  variant="outline"
                  onClick={handleRefreshUsers}
                  className="flex items-center gap-2 justify-center"
                >
                  <RefreshCw className="h-4 w-4" />
                  {showRefreshMessage ? "Atualizado!" : "Atualizar Lista"}
                </Button>
                <Button 
                  onClick={() => navigate("/settings/user/create")} 
                  className="flex items-center gap-2 justify-center"
                >
                  <UserPlus className="h-4 w-4" />
                  Novo Usuário
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="mb-6">
                <Input
                  placeholder="Buscar por nome, email ou terminal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
                  <span className="ml-3">Carregando usuários...</span>
                </div>
              ) : isMobile ? (
                // Mobile view - cards
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <UserCard 
                        key={user.id} 
                        user={user} 
                        onEdit={handleEditUser} 
                        onDelete={handleDeleteUser} 
                      />
                    ))
                  )}
                </div>
              ) : (
                // Desktop view - table
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nível de Acesso</TableHead>
                        <TableHead>Terminal</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.photoUrl} alt={user.name || user.email} />
                                  <AvatarFallback className="bg-blue-500 text-white text-xs">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <span>{user.name || user.email.split('@')[0]}</span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{getAccessLevelLabel(user.accessLevel)}</TableCell>
                            <TableCell>{user.terminal || "—"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Você tem certeza que deseja excluir o usuário {user.name || user.email}? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-red-500 hover:bg-red-600">
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className={`${isMobile ? 'w-[95%] max-h-[70vh] overflow-y-auto' : ''} max-w-[350px]`}>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <div className="mt-1 font-medium">{selectedUser.email}</div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="edit-accessLevel">Nível de Acesso</Label>
                <Select
                  value={selectedUser.accessLevel}
                  onValueChange={(value) => setSelectedUser({...selectedUser, accessLevel: value as AccessLevel})}
                >
                  <SelectTrigger id="edit-accessLevel">
                    <SelectValue placeholder="Selecione o nível de acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                    <SelectItem value="administrative">Administrativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="edit-terminal">Terminal</Label>
                <Select
                  value={selectedUser.terminal || ""}
                  onValueChange={(value) => setSelectedUser({...selectedUser, terminal: value || null})}
                >
                  <SelectTrigger id="edit-terminal">
                    <SelectValue placeholder="Selecione o terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    <SelectItem value="Rio Grande">Rio Grande</SelectItem>
                    <SelectItem value="SP">SP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="mt-2 flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateUser}
                className="w-full sm:w-auto"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageUsers;
