import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/Header";
import { LoginPage } from "@/pages/LoginPage";
import { CompanyDashboard } from "@/pages/CompanyDashboard";
import { ProductsPage } from "@/pages/ProductsPage";
import { MovementsPage } from "@/pages/MovementsPage";
import { UsersPage } from "@/pages/UsersPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SuperAdminDashboard } from "@/pages/SuperAdminDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <Switch>
              {user?.role === 'super_admin' ? (
                <>
                  <Route path="/" component={SuperAdminDashboard} />
                  <Route path="/admin" component={SuperAdminDashboard} />
                  <Route path="/admin/companies" component={SuperAdminDashboard} />
                  <Route path="/admin/settings" component={SettingsPage} />
                </>
              ) : (
                <>
                  <Route path="/" component={CompanyDashboard} />
                  <Route path="/dashboard" component={CompanyDashboard} />
                  <Route path="/products" component={ProductsPage} />
                  <Route path="/movements" component={MovementsPage} />
                  <Route path="/users" component={UsersPage} />
                  <Route path="/reports" component={CompanyDashboard} />
                  <Route path="/settings" component={SettingsPage} />
                </>
              )}
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
