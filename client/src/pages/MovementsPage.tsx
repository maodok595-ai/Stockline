import { useState, useMemo } from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useStockMovements, useCreateStockMovement, useProducts, useUsers } from "@/hooks/use-api";

const movementFormSchema = z.object({
  type: z.enum(["entree", "sortie"], { required_error: "Le type est requis" }),
  productId: z.string().min(1, "Le produit est requis"),
  quantity: z.string().min(1, "La quantité est requise"),
  reason: z.string().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementFormSchema>;

export function MovementsPage() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: movements = [], isLoading: loadingMovements } = useStockMovements();
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const createMovement = useCreateStockMovement();

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      type: "entree",
      productId: "",
      quantity: "1",
      reason: "",
      supplier: "",
      notes: "",
    },
  });

  // Filter movements based on type
  const filteredMovements = useMemo(() => {
    if (selectedType === "all") return movements;
    return movements.filter((movement) => movement.type === selectedType);
  }, [movements, selectedType]);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || "Produit inconnu";
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || "Utilisateur inconnu";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  const handleOpenDialog = () => {
    form.reset({
      type: "entree",
      productId: "",
      quantity: "1",
      reason: "",
      supplier: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    form.reset();
  };

  const onSubmit = async (data: MovementFormData) => {
    try {
      await createMovement.mutateAsync({
        type: data.type,
        productId: data.productId,
        quantity: parseInt(data.quantity),
        reason: data.reason || undefined,
        supplier: data.supplier || undefined,
        notes: data.notes || undefined,
      });

      handleCloseDialog();
    } catch (error) {
      console.error("Error creating movement:", error);
    }
  };

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
          <Button onClick={handleOpenDialog} data-testid="button-add-movement">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Mouvement
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Select value={selectedType} onValueChange={setSelectedType}>
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

      {loadingMovements || loadingProducts || loadingUsers ? (
        <div className="rounded-lg border">
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : filteredMovements.length === 0 ? (
        <div className="rounded-lg border">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Aucun mouvement trouvé</p>
          </div>
        </div>
      ) : (
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
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id} data-testid={`row-movement-${movement.id}`}>
                  <TableCell className="font-mono text-sm">
                    {formatDate(movement.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={movement.type === 'entree' ? 'default' : 'secondary'}>
                      {movement.type === 'entree' ? 'Entrée' : 'Sortie'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{getProductName(movement.productId)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {movement.type === 'entree' ? '+' : '-'}{movement.quantity}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getUserName(movement.userId)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {movement.supplier || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {movement.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau mouvement de stock</DialogTitle>
            <DialogDescription>
              Enregistrez une entrée ou sortie de stock
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de mouvement *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-movement-type">
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entree">Entrée</SelectItem>
                        <SelectItem value="sortie">Sortie</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produit *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-movement-product">
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} data-testid="input-movement-quantity" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motif</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Vente, achat, ajustement..." data-testid="input-movement-reason" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fournisseur</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom du fournisseur" data-testid="input-movement-supplier" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Notes supplémentaires..." data-testid="input-movement-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  data-testid="button-cancel-movement"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createMovement.isPending}
                  data-testid="button-save-movement"
                >
                  {createMovement.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
