import { Package, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { StatsChart } from "@/components/StatsChart";
import { StockAlert } from "@/components/StockAlert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CompanyDashboard() {
  const lowStockProducts = [
    { id: '1', name: 'Riz Parfumé 25kg', quantity: 5, threshold: 10 },
    { id: '2', name: 'Huile Végétale 5L', quantity: 3, threshold: 8 },
    { id: '3', name: 'Sucre 1kg', quantity: 12, threshold: 20 },
  ];

  const monthlyData = [
    { name: 'Jan', entrees: 40, sorties: 24 },
    { name: 'Fév', entrees: 30, sorties: 13 },
    { name: 'Mar', entrees: 20, sorties: 38 },
    { name: 'Avr', entrees: 27, sorties: 39 },
    { name: 'Mai', entrees: 18, sorties: 48 },
    { name: 'Juin', entrees: 23, sorties: 38 },
  ];

  const categoryData = [
    { name: 'Alimentaire', value: 450 },
    { name: 'Boissons', value: 280 },
    { name: 'Hygiène', value: 150 },
    { name: 'Electronique', value: 95 },
  ];

  const topProducts = [
    { name: 'Riz Parfumé 25kg', sales: 245 },
    { name: 'Huile Végétale 5L', sales: 189 },
    { name: 'Sucre 1kg', sales: 156 },
    { name: 'Farine 2kg', sales: 134 },
    { name: 'Lait en Poudre 900g', sales: 98 },
  ];

  const recentMovements = [
    { id: '1', type: 'Entrée', product: 'Riz Parfumé 25kg', quantity: 50, user: 'Amadou D.', date: 'Il y a 2h' },
    { id: '2', type: 'Sortie', product: 'Huile Végétale 5L', quantity: 20, user: 'Fatou S.', date: 'Il y a 3h' },
    { id: '3', type: 'Entrée', product: 'Sucre 1kg', quantity: 100, user: 'Moussa K.', date: 'Il y a 5h' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de votre gestion de stock
        </p>
      </div>

      <StockAlert products={lowStockProducts} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Produits Total"
          value="1,248"
          icon={Package}
          change={12}
          trend="up"
          subtitle="vs mois dernier"
        />
        <KPICard
          title="Valeur du Stock"
          value="12.5M FCFA"
          icon={TrendingUp}
          change={8}
          trend="up"
          subtitle="estimation totale"
        />
        <KPICard
          title="Alertes de Stock"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          subtitle="produits en stock faible"
        />
        <KPICard
          title="Mouvements du Mois"
          value="345"
          icon={Activity}
          change={5}
          trend="down"
          subtitle="entrées et sorties"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatsChart
          title="Entrées / Sorties (6 derniers mois)"
          type="line"
          data={monthlyData}
          dataKey="entrees"
          nameKey="name"
        />
        <StatsChart
          title="Répartition par Catégorie"
          type="pie"
          data={categoryData}
          dataKey="value"
          nameKey="name"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top 5 Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 font-mono text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <span className="font-mono text-sm font-semibold">{product.sales} ventes</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Mouvements Récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex flex-col gap-1 pb-3 border-b last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{movement.product}</span>
                    <Badge variant={movement.type === 'Entrée' ? 'default' : 'secondary'}>
                      {movement.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Quantité: <span className="font-mono font-semibold">{movement.quantity}</span></span>
                    <span>{movement.user}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{movement.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
