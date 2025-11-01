import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Building2,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const companyMenuItems = [
    {
      title: "Tableau de Bord",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Produits",
      url: "/products",
      icon: Package,
    },
    {
      title: "Mouvements",
      url: "/movements",
      icon: TrendingUp,
    },
    {
      title: "Utilisateurs",
      url: "/users",
      icon: Users,
    },
    {
      title: "Rapports",
      url: "/reports",
      icon: FileText,
    },
    {
      title: "Paramètres",
      url: "/settings",
      icon: Settings,
    },
  ];

  const superAdminMenuItems = [
    {
      title: "Vue d'ensemble",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Entreprises",
      url: "/admin/companies",
      icon: Building2,
    },
    {
      title: "Paramètres",
      url: "/admin/settings",
      icon: Settings,
    },
  ];

  const menuItems = user?.role === 'super_admin' ? superAdminMenuItems : companyMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-sidebar-foreground">StockLine</span>
            {user?.companyName && (
              <span className="text-xs text-muted-foreground">{user.companyName}</span>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => setLocation(item.url)}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <button className="w-full">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.avatar || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin_entreprise' ? 'Administrateur' : 'Employé'}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
