
import { AccessLevel, UserData, UserUpdateData } from '@/types/auth';

export interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasAccess: (requiredLevel: AccessLevel) => boolean;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateUserProfile: (updateData: UserUpdateData) => Promise<boolean>;
  isInitialized: boolean;
  validateSessionOnNavigation?: () => Promise<boolean>;
}
