import { useState } from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MovementsPage() {
  const movements = [
    {
      id: '1',
      date: '01/11/2025 14:30',
      type: 'Entrée',
      product: 'Riz Parfumé 25kg',
      quantity: 50,
      user: 'Amadou Diallo',
      supplier: 'Import Direct SN',
      notes: 'Réception commande #CMD-2024-001',
    },
    {
      id: '2',
      date: '01/11/2025 11:15',
      type: 'Sortie',
      product: 'Huile Végétale 5L',
      quantity: 20,
      user: 'Fatou Sall',
      supplier: '-',
      notes: 'Vente client Boutique #12',
    },
    {
      id: '3',
      date: '01/11/2025 09:45',
      type: 'Entrée',
      product: 'Sucre 1kg',
      quantity: 100,
      user: 'Moussa Kane',
      supplier: 'Sweet Supplies',
      notes: 'Livraison hebdomadaire',
    },
    {
      id: '4',
      date: '31/10/2025 16:20',
      type: 'Sortie',
      product: 'Lait en Poudre 900g',
      quantity: 35,
      user: 'Awa Ndiaye',
      supplier: '-',
      notes: 'Vente client Détaillant #8',
    },
    {
      id: '5',
      date: '31/10/2025 10:00',
      type: 'Entrée',
      product: 'Savon Liquide 500ml',
      quantity: 60,
      user: 'Amadou Diallo',
      supplier: 'Clean Solutions',
      notes: 'Commande mensuelle',
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Mouvements de Stock</h1>
          <p className="text-muted-foreground mt-1">
            Historique des entrées et sorties
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button data-testid="button-add-movement">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Mouvement
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]" data-testid="select-type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="entree">Entrées</SelectItem>
            <SelectItem value="sortie">Sorties</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="7days">
          <SelectTrigger className="w-[180px]" data-testid="select-period">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="7days">7 derniers jours</SelectItem>
            <SelectItem value="30days">30 derniers jours</SelectItem>
            <SelectItem value="custom">Personnalisé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id} data-testid={`row-movement-${movement.id}`}>
                <TableCell className="font-mono text-sm">
                  {movement.date}
                </TableCell>
                <TableCell>
                  <Badge variant={movement.type === 'Entrée' ? 'default' : 'secondary'}>
                    {movement.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{movement.product}</TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {movement.type === 'Entrée' ? '+' : '-'}{movement.quantity}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {movement.user}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {movement.supplier}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {movement.notes}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
