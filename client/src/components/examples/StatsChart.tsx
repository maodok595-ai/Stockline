import { StatsChart } from '../StatsChart';

export default function StatsChartExample() {
  const data = [
    { name: 'Jan', value: 40 },
    { name: 'Fév', value: 30 },
    { name: 'Mar', value: 20 },
    { name: 'Avr', value: 27 },
    { name: 'Mai', value: 18 },
    { name: 'Juin', value: 23 },
  ];

  return (
    <div className="p-6 bg-background">
      <StatsChart
        title="Entrées / Sorties (6 derniers mois)"
        type="line"
        data={data}
        dataKey="value"
        nameKey="name"
      />
    </div>
  );
}
