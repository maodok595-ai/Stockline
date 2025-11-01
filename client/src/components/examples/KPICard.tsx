import { KPICard } from '../KPICard';
import { Package } from 'lucide-react';

export default function KPICardExample() {
  return (
    <div className="p-6 bg-background">
      <KPICard
        title="Produits Total"
        value="1,248"
        icon={Package}
        change={12}
        trend="up"
        subtitle="vs mois dernier"
      />
    </div>
  );
}
