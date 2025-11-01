import { ProductCard } from '../ProductCard';

export default function ProductCardExample() {
  return (
    <div className="p-6 bg-background max-w-sm">
      <ProductCard
        id="1"
        name="Riz Parfumé 25kg"
        category="Alimentaire"
        quantity={5}
        threshold={10}
        buyPrice={12000}
        sellPrice={15000}
        supplier="Import Direct SN"
        onEdit={() => console.log('Edit')}
        onDelete={() => console.log('Delete')}
      />
    </div>
  );
}
