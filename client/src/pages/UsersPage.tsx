import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, type User } from "@/hooks/use-api";

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const userFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().optional(),
  role: z.enum(["super_admin", "admin_entreprise", "employe"], { required_error: "Le rôle est requis" }),
});

type UserFormData = z.infer<typeof userFormSchema>;

export function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "employe",
    },
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin_entreprise':
        return 'Administrateur';
      case 'employe':
        return 'Employé';
      default:
        return role;
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role as "super_admin" | "admin_entreprise" | "employe",
      });
    } else {
      setEditingUser(null);
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "employe",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    form.reset();
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        role: data.role,
      };

      if (editingUser) {
        // For updates, only include password if it's provided
        if (data.password && data.password.trim() !== "") {
          payload.password = data.password;
        }
        await updateUser.mutateAsync({ id: editingUser.id, data: payload });
      } else {
        // For creation, password is required
        if (!data.password || data.password.trim() === "") {
          form.setError("password", { message: "Le mot de passe est requis pour la création" });
          return;
        }
        payload.password = data.password;
        await createUser.mutateAsync(payload);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser.mutateAsync(userToDelete.id);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Gérez les utilisateurs de votre entreprise
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-user" className="w-full md:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Utilisateur
        </Button>
      </div>

      {loadingUsers ? (
        <div className="rounded-lg border">
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg border">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.avatar || getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin_entreprise' || user.role === 'super_admin' ? 'default' : 'secondary'}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    -
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenDialog(user)}
                        data-testid={`button-edit-${user.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(user)}
                        data-testid={`button-delete-${user.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
            <DialogTitle>
              {editingUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? "Modifiez les informations de l'utilisateur" : "Remplissez les informations du nouvel utilisateur"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-user-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-user-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mot de passe {editingUser ? "(laissez vide pour ne pas changer)" : "*"}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" {...field} data-testid="input-user-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-user-role">
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employe">Employé</SelectItem>
                        <SelectItem value="admin_entreprise">Administrateur</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  data-testid="button-cancel-user"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createUser.isPending || updateUser.isPending}
                  data-testid="button-save-user"
                >
                  {createUser.isPending || updateUser.isPending ? "Enregistrement..." : "Enregistrer"}
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
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{userToDelete?.name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteUser.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteUser.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
