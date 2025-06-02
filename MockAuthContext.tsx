import { createContext, useContext, useState, ReactNode } from "react";

interface MockUser {
  uid: string;
  email: string;
  displayName: string;
}

interface User {
  id: number;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean | null;
  createdAt: Date | null;
}

interface AuthContextType {
  currentUser: MockUser | null;
  userProfile: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    // Mock signup
    const mockUser: MockUser = {
      uid: `user_${Date.now()}`,
      email,
      displayName,
    };
    
    const mockProfile: User = {
      id: Date.now(),
      firebaseUid: mockUser.uid,
      email,
      displayName,
      photoURL: null,
      isAdmin: email === "admin@dietplanet.com",
      createdAt: new Date(),
    };
    
    setCurrentUser(mockUser);
    setUserProfile(mockProfile);
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Mock signin
    const mockUser: MockUser = {
      uid: `user_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
    };
    
    const mockProfile: User = {
      id: Date.now(),
      firebaseUid: mockUser.uid,
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      isAdmin: email === "admin@dietplanet.com",
      createdAt: new Date(),
    };
    
    setCurrentUser(mockUser);
    setUserProfile(mockProfile);
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    // Mock Google signin
    const mockUser: MockUser = {
      uid: `google_user_${Date.now()}`,
      email: "user@gmail.com",
      displayName: "Demo User",
    };
    
    const mockProfile: User = {
      id: Date.now(),
      firebaseUid: mockUser.uid,
      email: "user@gmail.com",
      displayName: "Demo User",
      photoURL: null,
      isAdmin: false,
      createdAt: new Date(),
    };
    
    setCurrentUser(mockUser);
    setUserProfile(mockProfile);
    setLoading(false);
  };

  const logout = async () => {
    setCurrentUser(null);
    setUserProfile(null);
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};