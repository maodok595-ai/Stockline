import { useState } from "react";
import { Building2, Users, Package, Activity, Plus } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { CompanyCard } from "@/components/CompanyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  type Company,
} from "@/hooks/use-api";

const companyFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
  logo: z.instanceof(FileList).optional(),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

export function SuperAdminDashboard() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { data: companies = [], isLoading } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

  const createForm = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      isActive: true,
    },
  });

  const editForm = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      isActive: true,
    },
  });

  const handleToggleStatus = async (company: Company) => {
    try {
      const formData = new FormData();
      formData.append("isActive", (!company.isActive).toString());

      await updateCompany.mutateAsync({
        id: company.id,
        data: formData,
      });

      toast({
        title: "Statut mis à jour",
        description: `L'entreprise ${company.name} a été ${!company.isActive ? 'activée' : 'désactivée'}.`,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'entreprise.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCompany = async (data: CompanyFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.address) formData.append("address", data.address);
      formData.append("isActive", data.isActive.toString());
      
      if (data.logo && data.logo.length > 0) {
        formData.append("logo", data.logo[0]);
      }

      await createCompany.mutateAsync(formData);

      toast({
        title: "Entreprise créée",
        description: `L'entreprise ${data.name} a été créée avec succès.`,
      });

      setIsCreateDialogOpen(false);
      createForm.reset();
    } catch (error) {
      console.error("Erreur lors de la création de l'entreprise:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'entreprise.",
        variant: "destructive",
      });
    }
  };

  const handleEditCompany = async (data: CompanyFormData) => {
    if (!selectedCompany) return;

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.address) formData.append("address", data.address);
      formData.append("isActive", data.isActive.toString());
      
      if (data.logo && data.logo.length > 0) {
        formData.append("logo", data.logo[0]);
      }

      await updateCompany.mutateAsync({
        id: selectedCompany.id,
        data: formData,
      });

      toast({
        title: "Entreprise modifiée",
        description: `L'entreprise ${data.name} a été mise à jour.`,
      });

      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      editForm.reset();
    } catch (error) {
      console.error("Erreur lors de la modification de l'entreprise:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'entreprise.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    try {
      await deleteCompany.mutateAsync(selectedCompany.id);

      toast({
        title: "Entreprise supprimée",
        description: `L'entreprise ${selectedCompany.name} a été supprimée.`,
      });

      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entreprise:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'entreprise.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    editForm.reset({
      name: company.name,
      email: company.email,
      phone: company.phone || "",
      address: company.address || "",
      isActive: company.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPassword = (company: Company) => {
    console.log("Reset password for:", company.id);
    toast({
      title: "Fonctionnalité à venir",
      description: "La réinitialisation du mot de passe sera disponible prochainement.",
    });
  };

  const activeCompanies = companies.filter(c => c.isActive);
  const inactiveCompanies = companies.filter(c => !c.isActive);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administration Globale</h1>
          <p className="text-muted-foreground mt-1">
            Gérez toutes les entreprises de la plateforme StockLine
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-company"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Entreprise
        </Button>
      </div>

      {isLoading ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" data-testid={`skeleton-kpi-${i}`} />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" data-testid={`skeleton-card-${i}`} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Entreprises Totales"
              value={companies.length}
              icon={Building2}
              subtitle={`${activeCompanies.length} actives`}
            />
            <KPICard
              title="Entreprises Actives"
              value={activeCompanies.length}
              icon={Activity}
              subtitle={`${Math.round((activeCompanies.length / (companies.length || 1)) * 100)}% du total`}
            />
            <KPICard
              title="Entreprises Inactives"
              value={inactiveCompanies.length}
              icon={Building2}
              subtitle="désactivées"
            />
            <KPICard
              title="Taux d'Activité"
              value={`${Math.round((activeCompanies.length / (companies.length || 1)) * 100)}%`}
              icon={Activity}
              subtitle="entreprises actives"
            />
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-companies">
                Toutes ({companies.length})
              </TabsTrigger>
              <TabsTrigger value="active" data-testid="tab-active-companies">
                Actives ({activeCompanies.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" data-testid="tab-inactive-companies">
                Désactivées ({inactiveCompanies.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {companies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune entreprise trouvée</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {companies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      id={company.id}
                      name={company.name}
                      email={company.email}
                      phone={company.phone || "N/A"}
                      logo={company.logo}
                      usersCount={0}
                      productsCount={0}
                      isActive={company.isActive}
                      onToggleStatus={() => handleToggleStatus(company)}
                      onEdit={() => openEditDialog(company)}
                      onDelete={() => openDeleteDialog(company)}
                      onResetPassword={() => handleResetPassword(company)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              {activeCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune entreprise active</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeCompanies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      id={company.id}
                      name={company.name}
                      email={company.email}
                      phone={company.phone || "N/A"}
                      logo={company.logo}
                      usersCount={0}
                      productsCount={0}
                      isActive={company.isActive}
                      onToggleStatus={() => handleToggleStatus(company)}
                      onEdit={() => openEditDialog(company)}
                      onDelete={() => openDeleteDialog(company)}
                      onResetPassword={() => handleResetPassword(company)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inactive" className="mt-6">
              {inactiveCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune entreprise désactivée</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {inactiveCompanies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      id={company.id}
                      name={company.name}
                      email={company.email}
                      phone={company.phone || "N/A"}
                      logo={company.logo}
                      usersCount={0}
                      productsCount={0}
                      isActive={company.isActive}
                      onToggleStatus={() => handleToggleStatus(company)}
                      onEdit={() => openEditDialog(company)}
                      onDelete={() => openDeleteDialog(company)}
                      onResetPassword={() => handleResetPassword(company)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent data-testid="dialog-create-company">
          <DialogHeader>
            <DialogTitle>Nouvelle Entreprise</DialogTitle>
            <DialogDescription>
              Créez une nouvelle entreprise dans la plateforme StockLine
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateCompany)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'entreprise *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Diallo Distribution"
                        data-testid="input-company-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="contact@entreprise.sn"
                        data-testid="input-company-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+221 77 123 45 67"
                        data-testid="input-company-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Adresse complète"
                        data-testid="input-company-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="logo"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="file"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files)}
                        data-testid="input-company-logo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Entreprise active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-company-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-create"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createCompany.isPending}
                  data-testid="button-submit-create"
                >
                  {createCompany.isPending ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-company">
          <DialogHeader>
            <DialogTitle>Modifier l'Entreprise</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'entreprise
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditCompany)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'entreprise *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Diallo Distribution"
                        data-testid="input-edit-company-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="contact@entreprise.sn"
                        data-testid="input-edit-company-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+221 77 123 45 67"
                        data-testid="input-edit-company-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Adresse complète"
                        data-testid="input-edit-company-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="logo"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="file"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files)}
                        data-testid="input-edit-company-logo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Entreprise active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-edit-company-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updateCompany.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateCompany.isPending ? "Modification..." : "Modifier"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-company">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'entreprise "{selectedCompany?.name}" ?
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              disabled={deleteCompany.isPending}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCompany.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
