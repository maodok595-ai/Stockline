import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin_entreprise' | 'employe';
  tenantId?: string;
  companyName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  switchRole: (role: User['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Amadou Diallo',
    email: 'amadou@stockline.sn',
    role: 'admin_entreprise',
    tenantId: 'company-1',
    companyName: 'Diallo Distribution',
    avatar: 'AD'
  });

  const login = (email: string, password: string) => {
    console.log('Login:', email, password);
    setUser({
      id: '1',
      name: 'Amadou Diallo',
      email,
      role: 'admin_entreprise',
      tenantId: 'company-1',
      companyName: 'Diallo Distribution',
      avatar: 'AD'
    });
  };

  const logout = () => {
    console.log('Logout');
    setUser(null);
  };

  const switchRole = (role: User['role']) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      switchRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
