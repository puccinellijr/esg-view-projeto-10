
export type AccessLevel = "operational" | "viewer" | "administrative";

export interface UserData {
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
  terminal?: string | null;
}
