import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin_entreprise' | 'employe';
  companyId?: string;
  isActive: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      // Utilisateur non connecté
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await apiRequest('POST', '/api/auth/login', { email, password });
      const data = await res.json();
      setUser(data.user);
      
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${data.user.name} !`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error.message || 'Email ou mot de passe incorrect',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      
      toast({
        title: 'Déconnexion réussie',
        description: 'À bientôt !',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Erreur lors de la déconnexion',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      logout,
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
