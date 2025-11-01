import { AlertTriangle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StockAlertProps {
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    threshold: number;
  }>;
  onDismiss?: () => void;
}

export function StockAlert({ products, onDismiss }: StockAlertProps) {
  if (products.length === 0) return null;

  return (
    <Alert variant="destructive" className="relative">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Alertes de Stock Faible
        <Badge variant="destructive">{products.length}</Badge>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="flex flex-col gap-1">
          {products.slice(0, 3).map((product) => (
            <div key={product.id} className="text-sm">
              <span className="font-medium">{product.name}</span>
              {' - '}
              <span className="font-mono">{product.quantity}</span> unités restantes
              (seuil: {product.threshold})
            </div>
          ))}
          {products.length > 3 && (
            <p className="text-sm mt-1">
              Et {products.length - 3} autre(s) produit(s) en stock faible
            </p>
          )}
        </div>
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}
