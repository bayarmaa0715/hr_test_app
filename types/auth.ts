import type { User, UserCredential } from "firebase/auth";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface AuthMethods {
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (
    email: string,
    password: string,
    userData?: { firstName?: string; lastName?: string; role?: string }
  ) => Promise<UserCredential>;
  logout: () => Promise<void>;
  clearError: () => void;
}
