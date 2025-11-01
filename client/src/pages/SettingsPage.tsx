import { Building2, User, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Configurez votre compte et vos préférences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Informations de l'Entreprise</CardTitle>
            </div>
            <CardDescription>
              Gérez les informations de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nom de l'entreprise</Label>
                <Input 
                  id="company-name" 
                  defaultValue={user?.companyName} 
                  data-testid="input-company-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Email de contact</Label>
                <Input 
                  id="company-email" 
                  type="email" 
                  defaultValue={user?.email}
                  data-testid="input-company-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Téléphone</Label>
              <Input 
                id="company-phone" 
                type="tel" 
                defaultValue="+221 77 123 45 67"
                data-testid="input-company-phone"
              />
            </div>
            <Button data-testid="button-save-company">
              Enregistrer les modifications
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Informations Personnelles</CardTitle>
            </div>
            <CardDescription>
              Mettez à jour vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Nom complet</Label>
                <Input 
                  id="user-name" 
                  defaultValue={user?.name}
                  data-testid="input-user-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input 
                  id="user-email" 
                  type="email" 
                  defaultValue={user?.email}
                  data-testid="input-user-email"
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input 
                id="current-password" 
                type="password"
                data-testid="input-current-password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer mot de passe</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  data-testid="input-confirm-password"
                />
              </div>
            </div>
            <Button data-testid="button-save-profile">
              Enregistrer les modifications
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configurez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertes de stock faible</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications quand un produit atteint son seuil
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-low-stock-alerts" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rapports hebdomadaires</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir un résumé hebdomadaire par email
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-weekly-reports" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications d'activité</Label>
                <p className="text-sm text-muted-foreground">
                  Être notifié des mouvements de stock importants
                </p>
              </div>
              <Switch data-testid="switch-activity-notifications" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Sécurité</CardTitle>
            </div>
            <CardDescription>
              Paramètres de sécurité et confidentialité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Authentification à deux facteurs</Label>
                <p className="text-sm text-muted-foreground">
                  Ajouter une couche de sécurité supplémentaire
                </p>
              </div>
              <Switch data-testid="switch-2fa" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Journal d'activité</Label>
                <p className="text-sm text-muted-foreground">
                  Conserver un historique de toutes les actions
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-activity-log" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
