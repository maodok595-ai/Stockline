import { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/auth/register-company", formData);

      toast({
        title: "Entreprise créée avec succès",
        description: "Vous pouvez maintenant gérer votre inventaire",
      });

      // Rediriger vers le dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer l'entreprise",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary">
              <Package className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Créer un compte entreprise</CardTitle>
            <CardDescription className="mt-2">
              Commencez à gérer votre inventaire gratuitement
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de l'entreprise */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations de l'entreprise</h3>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Ex: Diallo Distribution"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  data-testid="input-company-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email de l'entreprise *</Label>
                <Input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  placeholder="contact@entreprise.com"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  required
                  data-testid="input-company-email"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Téléphone</Label>
                  <Input
                    id="companyPhone"
                    name="companyPhone"
                    type="tel"
                    placeholder="+221 77 123 45 67"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    data-testid="input-company-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Adresse</Label>
                  <Input
                    id="companyAddress"
                    name="companyAddress"
                    type="text"
                    placeholder="Dakar, Sénégal"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    data-testid="input-company-address"
                  />
                </div>
              </div>
            </div>

            {/* Informations de l'administrateur */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Votre compte administrateur</h3>
              
              <div className="space-y-2">
                <Label htmlFor="adminName">Votre nom complet *</Label>
                <Input
                  id="adminName"
                  name="adminName"
                  type="text"
                  placeholder="Ex: Amadou Diallo"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                  data-testid="input-admin-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Votre email *</Label>
                <Input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  data-testid="input-admin-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Mot de passe * (minimum 6 caractères)</Label>
                <Input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  data-testid="input-admin-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-register"
            >
              {isLoading ? "Création en cours..." : "Créer mon entreprise"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              className="text-sm"
              onClick={() => setLocation("/")}
              data-testid="link-back-to-login"
            >
              Déjà un compte ? Se connecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
