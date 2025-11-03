import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

// Types basés sur le schéma backend
export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  companyId?: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin_entreprise' | 'employe';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  categoryId?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  image?: string;
  price: string;
  cost?: string;
  quantity: number;
  minQuantity?: number;
  unit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  companyId: string;
  productId: string;
  userId: string;
  type: 'entree' | 'sortie';
  quantity: number;
  reason?: string;
  supplier?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Stats {
  totalProducts: number;
  totalValue: number;
  lowStockAlerts: number;
  movementsThisMonth: number;
}

// Hook pour les entreprises (Super Admin)
export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });
}

export function useCreateCompany() {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/companies', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
    },
  });
}

export function useUpdateCompany() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: data,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
    },
  });
}

export function useDeleteCompany() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
    },
  });
}

// Hook pour les utilisateurs
export function useUsers(companyId?: string) {
  const { user } = useAuth();
  const params = companyId ? `?companyId=${companyId}` : '';
  
  return useQuery<User[]>({
    queryKey: ['/api/users', companyId],
    queryFn: async () => {
      const res = await fetch(`/api/users${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!user,
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/users', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });
}

// Hook pour les produits
export function useProducts() {
  const { user } = useAuth();
  
  return useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !!user,
  });
}

export function useLowStockProducts() {
  const { user } = useAuth();
  
  return useQuery<Product[]>({
    queryKey: ['/api/products/low-stock'],
    enabled: !!user,
  });
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}

export function useUpdateProduct() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: data,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}

export function useDeleteProduct() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}

// Hook pour les catégories
export function useCategories() {
  const { user } = useAuth();
  
  return useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!user,
  });
}

export function useCreateCategory() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/categories', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
  });
}

export function useUpdateCategory() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
  });
}

export function useDeleteCategory() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
  });
}

// Hook pour les mouvements de stock
export function useStockMovements() {
  const { user } = useAuth();
  
  return useQuery<StockMovement[]>({
    queryKey: ['/api/movements'],
    enabled: !!user,
  });
}

export function useCreateStockMovement() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/movements', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/movements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}

// Hook pour les fournisseurs
export function useSuppliers() {
  const { user } = useAuth();
  
  return useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
    enabled: !!user,
  });
}

export function useCreateSupplier() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/suppliers', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
    },
  });
}

export function useUpdateSupplier() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/suppliers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
    },
  });
}

export function useDeleteSupplier() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
    },
  });
}

// Hook pour les statistiques
export function useStats() {
  const { user } = useAuth();
  
  return useQuery<Stats>({
    queryKey: ['/api/stats'],
    enabled: !!user && user.role !== 'super_admin',
  });
}
