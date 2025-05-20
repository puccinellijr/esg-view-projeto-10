
export type AccessLevel = "operational" | "viewer" | "administrative";

export interface UserData {
  id?: string;  // ID do usuário do Supabase
  email: string;
  accessLevel: AccessLevel;
  name?: string;
  photoUrl?: string;
  terminal?: string | null;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  photoUrl?: string;
  password?: string;
  currentPassword?: string; // Adicionando a senha atual para verificação
  terminal?: string | null;
}
