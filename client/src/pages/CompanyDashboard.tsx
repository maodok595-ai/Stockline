import { Package, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { StatsChart } from "@/components/StatsChart";
import { StockAlert } from "@/components/StockAlert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStats, useLowStockProducts, useStockMovements, useProducts } from "@/hooks/use-api";
import { useMemo } from "react";
import { format, startOfMonth, subMonths, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function CompanyDashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: lowStockProducts = [], isLoading: lowStockLoading } = useLowStockProducts();
  const { data: movements = [], isLoading: movementsLoading } = useStockMovements();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  // Transformer les produits en stock faible pour StockAlert
  const lowStockAlerts = useMemo(() => {
    return lowStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      threshold: product.minQuantity || 10,
    }));
  }, [lowStockProducts]);

  // Calculer les données mensuelles des mouvements (6 derniers mois)
  const monthlyData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: startOfMonth(date),
        name: format(date, 'MMM', { locale: fr }),
        entrees: 0,
        sorties: 0,
      };
    });

    movements.forEach(movement => {
      const movementDate = startOfMonth(parseISO(movement.createdAt));
      const monthData = last6Months.find(
        m => m.month.getTime() === movementDate.getTime()
      );
      
      if (monthData) {
        if (movement.type === 'entree') {
          monthData.entrees += 1;
        } else {
          monthData.sorties += 1;
        }
      }
    });

    return last6Months.map(({ name, entrees, sorties }) => ({ name, entrees, sorties }));
  }, [movements]);

  // Calculer la répartition par catégorie
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    products.forEach(product => {
      const category = product.categoryId || 'Sans catégorie';
      categoryMap.set(category, (categoryMap.get(category) || 0) + product.quantity);
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [products]);

  // Top 5 produits par quantité
  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(product => ({
        name: product.name,
        quantity: product.quantity,
      }));
  }, [products]);

  // Mouvements récents (derniers 5)
  const recentMovements = useMemo(() => {
    return [...movements]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(movement => {
        const product = products.find(p => p.id === movement.productId);
        const now = new Date();
        const movementDate = new Date(movement.createdAt);
        const diffHours = Math.floor((now.getTime() - movementDate.getTime()) / (1000 * 60 * 60));
        
        let timeAgo;
        if (diffHours < 1) {
          const diffMinutes = Math.floor((now.getTime() - movementDate.getTime()) / (1000 * 60));
          timeAgo = `Il y a ${diffMinutes}min`;
        } else if (diffHours < 24) {
          timeAgo = `Il y a ${diffHours}h`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          timeAgo = `Il y a ${diffDays}j`;
        }
        
        return {
          id: movement.id,
          type: movement.type === 'entree' ? 'Entrée' : 'Sortie',
          product: product?.name || 'Produit supprimé',
          quantity: movement.quantity,
          date: timeAgo,
        };
      });
  }, [movements, products]);

  const isLoading = statsLoading || lowStockLoading || movementsLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="title-dashboard">Tableau de Bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de votre gestion de stock
        </p>
      </div>

      {lowStockAlerts.length > 0 && <StockAlert products={lowStockAlerts} />}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Produits Total"
          value={stats?.totalProducts.toString() || "0"}
          icon={Package}
          subtitle="dans l'inventaire"
        />
        <KPICard
          title="Valeur du Stock"
          value={`${(stats?.totalValue || 0).toLocaleString('fr-FR')} FCFA`}
          icon={TrendingUp}
          subtitle="estimation totale"
        />
        <KPICard
          title="Alertes de Stock"
          value={stats?.lowStockAlerts || 0}
          icon={AlertTriangle}
          subtitle="produits en stock faible"
        />
        <KPICard
          title="Mouvements du Mois"
          value={stats?.movementsThisMonth.toString() || "0"}
          icon={Activity}
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
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun produit disponible
              </p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between" data-testid={`product-top-${index}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 font-mono text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold">{product.quantity} unités</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Mouvements Récents</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun mouvement récent
              </p>
            ) : (
              <div className="space-y-3">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between" data-testid={`movement-${movement.id}`}>
                    <div className="flex items-center gap-3">
                      <Badge variant={movement.type === 'Entrée' ? 'default' : 'secondary'}>
                        {movement.type}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{movement.product}</p>
                        <p className="text-xs text-muted-foreground">{movement.date}</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-semibold">
                      {movement.type === 'Entrée' ? '+' : '-'}{movement.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
