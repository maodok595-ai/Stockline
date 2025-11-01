import { useState } from "react";
import { Plus, Search, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    {
      id: '1',
      name: 'Riz Parfumé 25kg',
      category: 'Alimentaire',
      quantity: 150,
      threshold: 50,
      buyPrice: 12000,
      sellPrice: 15000,
      supplier: 'Import Direct SN',
    },
    {
      id: '2',
      name: 'Huile Végétale 5L',
      category: 'Alimentaire',
      quantity: 85,
      threshold: 30,
      buyPrice: 4500,
      sellPrice: 5500,
      supplier: 'Agro Distribution',
    },
    {
      id: '3',
      name: 'Sucre 1kg',
      category: 'Alimentaire',
      quantity: 12,
      threshold: 20,
      buyPrice: 600,
      sellPrice: 750,
      supplier: 'Sweet Supplies',
    },
    {
      id: '4',
      name: 'Lait en Poudre 900g',
      category: 'Alimentaire',
      quantity: 200,
      threshold: 40,
      buyPrice: 3200,
      sellPrice: 4000,
      supplier: 'Dairy Products Inc',
    },
    {
      id: '5',
      name: 'Savon Liquide 500ml',
      category: 'Hygiène',
      quantity: 45,
      threshold: 25,
      buyPrice: 800,
      sellPrice: 1200,
      supplier: 'Clean Solutions',
    },
    {
      id: '6',
      name: 'Dentifrice 75ml',
      category: 'Hygiène',
      quantity: 180,
      threshold: 50,
      buyPrice: 450,
      sellPrice: 650,
      supplier: 'Oral Care Ltd',
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Produits</h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Button data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Produit
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-products"
            />
          </div>
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]" data-testid="select-category">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="alimentaire">Alimentaire</SelectItem>
            <SelectItem value="boissons">Boissons</SelectItem>
            <SelectItem value="hygiene">Hygiène</SelectItem>
            <SelectItem value="electronique">Electronique</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]" data-testid="select-stock">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les stocks</SelectItem>
            <SelectItem value="low">Stock faible</SelectItem>
            <SelectItem value="normal">Stock normal</SelectItem>
            <SelectItem value="high">Stock élevé</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            data-testid="button-view-grid"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onEdit={() => console.log('Edit product:', product.id)}
            onDelete={() => console.log('Delete product:', product.id)}
          />
        ))}
      </div>
    </div>
  );
}
