
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { AccessLevel } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Mock users data
const mockUsers = [
  { 
    id: "1", 
    name: "Admin User", 
    email: "admin@example.com", 
    accessLevel: "administrative" as AccessLevel,
    photoUrl: "https://i.pravatar.cc/150?u=admin@example.com"
  },
  { 
    id: "2", 
    name: "Viewer User", 
    email: "viewer@example.com", 
    accessLevel: "viewer" as AccessLevel,
    photoUrl: "https://i.pravatar.cc/150?u=viewer@example.com"
  },
  { 
    id: "3", 
    name: "Operator User", 
    email: "operator@example.com", 
    accessLevel: "operational" as AccessLevel,
    photoUrl: "https://i.pravatar.cc/150?u=operator@example.com"
  },
];

interface UserData {
  id: string;
  name: string;
  email: string;
  accessLevel: AccessLevel;
  photoUrl?: string;
}

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteUser = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    toast.success("Usuário excluído com sucesso");
  };
  
  const handleEditUser = (user: UserData) => {
    setSelectedUser({...user});
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateUser = () => {
    if (!selectedUser) return;
    
    setUsers((prevUsers) => 
      prevUsers.map((user) => 
        user.id === selectedUser.id ? selectedUser : user
      )
    );
    
    setIsEditDialogOpen(false);
    toast.success("Usuário atualizado com sucesso");
  };
  
  const getInitials = (name: string) => {
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
        
        <div className="container py-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gerenciar Usuários</CardTitle>
              <Button onClick={() => navigate("/settings/user/create")} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Nível de Acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoUrl} alt={user.name} />
                                <AvatarFallback className="bg-blue-500 text-white text-xs">{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getAccessLevelLabel(user.accessLevel)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)}>
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
                                      Você tem certeza que deseja excluir o usuário {user.name}? Esta ação não pode ser desfeita.
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
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage src={selectedUser.photoUrl} alt={selectedUser.name} />
                  <AvatarFallback className="bg-blue-500 text-white">{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-photoUrl">URL da Foto</Label>
                <Input
                  id="edit-photoUrl"
                  value={selectedUser.photoUrl || ""}
                  onChange={(e) => setSelectedUser({...selectedUser, photoUrl: e.target.value})}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
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
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateUser}>
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
