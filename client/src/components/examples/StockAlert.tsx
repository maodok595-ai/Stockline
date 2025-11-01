import { StockAlert } from '../StockAlert';

export default function StockAlertExample() {
  const products = [
    { id: '1', name: 'Riz Parfumé 25kg', quantity: 5, threshold: 10 },
    { id: '2', name: 'Huile Végétale 5L', quantity: 3, threshold: 8 },
    { id: '3', name: 'Sucre 1kg', quantity: 12, threshold: 20 },
  ];

  return (
    <div className="p-6 bg-background">
      <StockAlert 
        products={products} 
        onDismiss={() => console.log('Dismissed')} 
      />
    </div>
  );
}
