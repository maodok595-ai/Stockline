import { Building2, Users, Package, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

interface CompanyCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  logo?: string;
  usersCount: number;
  productsCount: number;
  isActive: boolean;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResetPassword: () => void;
}

export function CompanyCard({
  id,
  name,
  email,
  phone,
  logo,
  usersCount,
  productsCount,
  isActive,
  onToggleStatus,
  onEdit,
  onDelete,
  onResetPassword,
}: CompanyCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-company-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {logo || name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-menu-${id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} data-testid={`menu-edit-${id}`}>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onResetPassword} data-testid={`menu-reset-${id}`}>
              Réinitialiser mot de passe
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid={`menu-delete-${id}`}>
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Utilisateurs</span>
              <span className="font-mono font-semibold">{usersCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Produits</span>
              <span className="font-mono font-semibold">{productsCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Statut:</span>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? 'Active' : 'Désactivée'}
            </Badge>
          </div>
          <Switch 
            checked={isActive} 
            onCheckedChange={onToggleStatus}
            data-testid={`switch-status-${id}`}
          />
        </div>

        <p className="text-xs text-muted-foreground">{phone}</p>
      </CardContent>
    </Card>
  );
}
