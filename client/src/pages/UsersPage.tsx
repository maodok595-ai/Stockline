import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function UsersPage() {
  const users = [
    {
      id: '1',
      name: 'Amadou Diallo',
      email: 'amadou@stockline.sn',
      role: 'admin_entreprise',
      avatar: 'AD',
      status: 'active',
      lastLogin: 'Il y a 5 min',
    },
    {
      id: '2',
      name: 'Fatou Sall',
      email: 'fatou.sall@stockline.sn',
      role: 'employe',
      avatar: 'FS',
      status: 'active',
      lastLogin: 'Il y a 2h',
    },
    {
      id: '3',
      name: 'Moussa Kane',
      email: 'moussa.kane@stockline.sn',
      role: 'employe',
      avatar: 'MK',
      status: 'active',
      lastLogin: 'Il y a 1 jour',
    },
    {
      id: '4',
      name: 'Awa Ndiaye',
      email: 'awa.ndiaye@stockline.sn',
      role: 'employe',
      avatar: 'AN',
      status: 'inactive',
      lastLogin: 'Il y a 5 jours',
    },
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin_entreprise':
        return 'Administrateur';
      case 'employe':
        return 'Employé';
      default:
        return role;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les utilisateurs de votre entreprise
          </p>
        </div>
        <Button data-testid="button-add-user">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Utilisateur
        </Button>
      </div>

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
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin_entreprise' ? 'default' : 'secondary'}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.lastLogin}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      data-testid={`button-edit-${user.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
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
    </div>
  );
}
