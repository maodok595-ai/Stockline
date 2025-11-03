import { useState, useMemo } from "react";
import { Plus, Search, Grid3x3, List, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product, type Category } from "@/hooks/use-api";

const productFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  sku: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.string().min(1, "Le prix de vente est requis"),
  cost: z.string().optional(),
  quantity: z.string().min(0, "La quantité est requise"),
  minQuantity: z.string().optional(),
  unit: z.string().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStock, setSelectedStock] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      categoryId: "",
      price: "0",
      cost: "0",
      quantity: "0",
      minQuantity: "10",
      unit: "unité",
    },
  });

  // Filter products based on search, category, and stock level
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;

      // Stock filter
      let matchesStock = true;
      if (selectedStock === "low") {
        matchesStock = product.quantity <= (product.minQuantity || 10);
      } else if (selectedStock === "normal") {
        matchesStock = product.quantity > (product.minQuantity || 10) && product.quantity <= (product.minQuantity || 10) * 2;
      } else if (selectedStock === "high") {
        matchesStock = product.quantity > (product.minQuantity || 10) * 2;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, selectedStock]);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.reset({
        name: product.name,
        description: product.description || "",
        sku: product.sku || "",
        categoryId: product.categoryId || "",
        price: product.price,
        cost: product.cost || "0",
        quantity: product.quantity.toString(),
        minQuantity: product.minQuantity?.toString() || "10",
        unit: product.unit || "unité",
      });
    } else {
      setEditingProduct(null);
      form.reset({
        name: "",
        description: "",
        sku: "",
        categoryId: "",
        price: "0",
        cost: "0",
        quantity: "0",
        minQuantity: "10",
        unit: "unité",
      });
    }
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setImageFile(null);
    form.reset();
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.sku) formData.append("sku", data.sku);
      if (data.categoryId) formData.append("categoryId", data.categoryId);
      formData.append("price", data.price);
      if (data.cost) formData.append("cost", data.cost);
      formData.append("quantity", data.quantity);
      if (data.minQuantity) formData.append("minQuantity", data.minQuantity);
      if (data.unit) formData.append("unit", data.unit);
      if (imageFile) formData.append("image", imageFile);

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data: formData });
      } else {
        await createProduct.mutateAsync(formData);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct.mutateAsync(productToDelete.id);
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Sans catégorie";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Sans catégorie";
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Produits</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-product" className="w-full md:w-auto shrink-0">
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

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]" data-testid="select-category">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStock} onValueChange={setSelectedStock}>
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

      {loadingProducts ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[400px]" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={getCategoryName(product.categoryId)}
              quantity={product.quantity}
              threshold={product.minQuantity || 10}
              buyPrice={parseFloat(product.cost || "0")}
              sellPrice={parseFloat(product.price)}
              imageUrl={product.image}
              onEdit={() => handleOpenDialog(product)}
              onDelete={() => handleDeleteClick(product)}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? "Modifiez les informations du produit" : "Remplissez les informations du nouveau produit"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Nom du produit *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="input-product-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-sku" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product-category">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix de vente (FCFA) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} data-testid="input-product-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix d'achat (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} data-testid="input-product-cost" />
                      </FormControl>
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
                        <Input type="number" {...field} data-testid="input-product-quantity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité minimale</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-product-min-quantity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unité</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="unité, kg, L, etc." data-testid="input-product-unit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem className="col-span-2">
                  <FormLabel>Image du produit</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        data-testid="input-product-image"
                      />
                      {imageFile && (
                        <span className="text-sm text-muted-foreground">{imageFile.name}</span>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  data-testid="button-cancel-product"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  data-testid="button-save-product"
                >
                  {createProduct.isPending || updateProduct.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit "{productToDelete?.name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteProduct.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteProduct.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
