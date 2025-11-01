import { useState } from "react";
import { Building2, Users, Package, Activity } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { CompanyCard } from "@/components/CompanyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SuperAdminDashboard() {
  const [companies, setCompanies] = useState([
    {
      id: '1',
      name: 'Diallo Distribution',
      email: 'contact@diallodist.sn',
      phone: '+221 77 123 45 67',
      logo: 'DD',
      usersCount: 8,
      productsCount: 1248,
      isActive: true,
    },
    {
      id: '2',
      name: 'Sall Commerce',
      email: 'info@sallcommerce.sn',
      phone: '+221 76 234 56 78',
      logo: 'SC',
      usersCount: 5,
      productsCount: 856,
      isActive: true,
    },
    {
      id: '3',
      name: 'Kane Import-Export',
      email: 'contact@kaneimport.sn',
      phone: '+221 78 345 67 89',
      logo: 'KI',
      usersCount: 12,
      productsCount: 2150,
      isActive: false,
    },
    {
      id: '4',
      name: 'Ndiaye Wholesale',
      email: 'support@ndiayewholesale.sn',
      phone: '+221 77 456 78 90',
      logo: 'NW',
      usersCount: 6,
      productsCount: 643,
      isActive: true,
    },
  ]);

  const handleToggleStatus = (id: string) => {
    setCompanies(companies.map(company => 
      company.id === id ? { ...company, isActive: !company.isActive } : company
    ));
    console.log('Toggle status for company:', id);
  };

  const activeCompanies = companies.filter(c => c.isActive);
  const inactiveCompanies = companies.filter(c => !c.isActive);
  const totalUsers = companies.reduce((sum, c) => sum + c.usersCount, 0);
  const totalProducts = companies.reduce((sum, c) => sum + c.productsCount, 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Administration Globale</h1>
        <p className="text-muted-foreground mt-1">
          Gérez toutes les entreprises de la plateforme StockLine
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Entreprises Totales"
          value={companies.length}
          icon={Building2}
          subtitle={`${activeCompanies.length} actives`}
        />
        <KPICard
          title="Utilisateurs Totaux"
          value={totalUsers}
          icon={Users}
          subtitle="toutes entreprises"
        />
        <KPICard
          title="Produits Gérés"
          value={totalProducts.toLocaleString()}
          icon={Package}
          subtitle="catalogue global"
        />
        <KPICard
          title="Entreprises Actives"
          value={activeCompanies.length}
          icon={Activity}
          subtitle={`${Math.round((activeCompanies.length / companies.length) * 100)}% du total`}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-companies">
            Toutes ({companies.length})
          </TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active-companies">
            Actives ({activeCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" data-testid="tab-inactive-companies">
            Désactivées ({inactiveCompanies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                {...company}
                onToggleStatus={() => handleToggleStatus(company.id)}
                onEdit={() => console.log('Edit company:', company.id)}
                onDelete={() => console.log('Delete company:', company.id)}
                onResetPassword={() => console.log('Reset password for:', company.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                {...company}
                onToggleStatus={() => handleToggleStatus(company.id)}
                onEdit={() => console.log('Edit company:', company.id)}
                onDelete={() => console.log('Delete company:', company.id)}
                onResetPassword={() => console.log('Reset password for:', company.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inactiveCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                {...company}
                onToggleStatus={() => handleToggleStatus(company.id)}
                onEdit={() => console.log('Edit company:', company.id)}
                onDelete={() => console.log('Delete company:', company.id)}
                onResetPassword={() => console.log('Reset password for:', company.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
