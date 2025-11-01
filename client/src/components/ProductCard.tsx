import { Package, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  quantity: number;
  threshold: number;
  buyPrice: number;
  sellPrice: number;
  supplier?: string;
  imageUrl?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProductCard({
  id,
  name,
  category,
  quantity,
  threshold,
  buyPrice,
  sellPrice,
  supplier,
  imageUrl,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const isLowStock = quantity <= threshold;

  return (
    <Card className="hover-elevate" data-testid={`card-product-${id}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex aspect-square items-center justify-center rounded-md bg-muted">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="h-full w-full object-cover rounded-md" />
            ) : (
              <Package className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base line-clamp-2">{name}</h3>
              {isLowStock && (
                <Badge variant="destructive" className="shrink-0">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Faible
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col gap-1 text-sm">
              <Badge variant="secondary" className="w-fit">{category}</Badge>
              {supplier && (
                <p className="text-xs text-muted-foreground">Fournisseur: {supplier}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Quantité</p>
                <p className="font-mono font-semibold">{quantity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prix Vente</p>
                <p className="font-mono font-semibold">{sellPrice.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onEdit}
          data-testid={`button-edit-${id}`}
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onDelete}
          data-testid={`button-delete-${id}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  );
}
