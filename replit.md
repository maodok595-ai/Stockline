# StockLine - Plateforme de Gestion d'Inventaire Multi-Tenant

## Vue d'ensemble

StockLine est une application SaaS professionnelle de gestion d'inventaire conçue pour les entreprises sénégalaises. L'application permet une gestion complète des stocks avec support multi-tenant, authentification sécurisée, et interface 100% en français.

## État actuel du projet

### ✅ Fonctionnalités complétées (03 novembre 2025)

#### 🚀 DÉPLOIEMENT AUTOMATIQUE (NOUVEAU !)

- **Auto-Setup** : Configuration automatique au premier démarrage en production
  - Création automatique de toutes les tables
  - Création automatique du super admin (maodok595@gmail.com)
  - Réinitialisation automatique du mot de passe si existant
  - Aucune commande manuelle requise sur Render
  - Smart detection : skip si déjà configuré

#### Backend (Node.js + Express + PostgreSQL)
- **Base de données** : Schéma complet avec Drizzle ORM (companies, users, products, categories, stock_movements, suppliers)
- **Authentification** : Login/Register avec bcrypt + sessions Express
- **API REST** : Routes complètes pour toutes les entités
  - `/api/auth/*` : Login, logout, register, get current user
  - `/api/companies/*` : CRUD entreprises (Super Admin seulement)
  - `/api/products/*` : CRUD produits avec upload d'images
  - `/api/movements/*` : Gestion des mouvements de stock
  - `/api/users/*` : CRUD utilisateurs
  - `/api/categories/*` : Gestion des catégories
  - `/api/suppliers/*` : Gestion des fournisseurs
  - `/api/stats` : Statistiques pour dashboard
- **Sécurité** : 
  - Middlewares requireAuth et requireSuperAdmin
  - Protection contre path traversal pour uploads
  - Validation Zod sur toutes les entrées
  - Isolation multi-tenant par companyId

#### Frontend (React + TailwindCSS + TanStack Query)
- **Authentification** : AuthContext avec vraies API
- **Pages principales** :
  - LoginPage : Connexion sécurisée
  - CompanyDashboard : KPIs, graphiques (recharts), mouvements récents, alertes stock bas
  - ProductsPage : Vue grille/liste, CRUD complet avec images, recherche et filtres
  - MovementsPage : Historique complet, création de mouvements
  - UsersPage : Gestion utilisateurs avec rôles
  - SuperAdminDashboard : Gestion globale des entreprises
- **Composants réutilisables** : KPICard, StatsChart, ProductCard, CompanyCard, StockAlert, AppSidebar, Header
- **UX** : Loading states, messages d'erreur en français, formulaires avec validation react-hook-form + Zod
- **Thème** : Dark/Light mode avec ThemeContext

### Architecture multi-tenant

L'application utilise une architecture multi-tenant avec isolation par `company_id` :
- Chaque entreprise a ses propres utilisateurs, produits, catégories, mouvements
- Les utilisateurs ne peuvent accéder qu'aux données de leur entreprise
- Le Super Admin peut gérer toutes les entreprises

### Rôles utilisateurs

1. **super_admin** : Gestion globale de la plateforme, création/modification/suppression d'entreprises
2. **admin_entreprise** : Gestion complète de son entreprise (produits, utilisateurs, mouvements)
3. **employe** : Utilisation basique (consultation, création de mouvements)

### Données de test

L'application contient des données de démonstration :
- **Super Admin** : admin@stockline.sn / admin123
- **Admin Entreprise** : amadou@diallodistribution.sn / admin123  
- **Employé** : fatou@diallodistribution.sn / admin123
- Entreprise de démo : Diallo Distribution avec produits et mouvements

## Structure technique

### Stack technique
- **Frontend** : React 18, TailwindCSS, shadcn/ui, TanStack Query, Wouter (routing), react-hook-form, Zod
- **Backend** : Node.js, Express, bcryptjs, express-session, multer
- **Base de données** : PostgreSQL (Neon), Drizzle ORM
- **Validation** : Zod (frontend + backend)
- **Charts** : Recharts
- **Internationalisation** : 100% français

### Fichiers importants
- `shared/schema.ts` : Schéma de base de données et types TypeScript
- `server/storage.ts` : Interface de stockage avec implémentation PostgreSQL
- `server/routes.ts` : Routes API backend
- `server/index.ts` : Configuration serveur et sessions
- `client/src/contexts/AuthContext.tsx` : Gestion authentification
- `client/src/hooks/use-api.ts` : Hooks personnalisés pour API
- `client/src/App.tsx` : Routing et layout principal
- `design_guidelines.md` : Guide de design et UX

## Commandes

```bash
npm run dev        # Démarre le serveur de développement (port 5000)
npm run build      # Build pour production
npm run start      # Démarre le serveur en production
npm run db:push    # Synchronise le schéma DB avec Drizzle
```

## Prochaines étapes suggérées

### Fonctionnalités à ajouter
1. **Export PDF/Excel** : Rapports de stock, mouvements, inventaire
2. **Notifications** : Alertes temps réel pour stock bas
3. **Dashboard avancé** : Graphiques personnalisables, prévisions
4. **Import CSV** : Import en masse de produits
5. **Codes-barres** : Scan et génération de codes-barres
6. **Multi-langue** : Support Wolof en plus du français
7. **Permissions granulaires** : Droits d'accès par fonctionnalité
8. **Audit logs** : Historique des actions utilisateurs

### Améliorations techniques
1. Tests automatisés (Jest, Playwright)
2. CI/CD pipeline
3. Monitoring et logging (Winston, Sentry)
4. Cache avec Redis
5. Optimisation images (compression, thumbnails)
6. Rate limiting
7. WebSockets pour updates temps réel
8. Backup automatique de la base de données

## Notes de sécurité

- ✅ Protection contre path traversal sur uploads
- ✅ Sessions sécurisées avec httpOnly cookies
- ✅ Passwords hashés avec bcrypt (10 rounds)
- ✅ Validation Zod sur toutes les entrées
- ✅ Isolation multi-tenant stricte
- ⚠️ À ajouter en production : HTTPS, CSRF protection, rate limiting

## Configuration production

Pour un déploiement en production, s'assurer de :
1. Définir `SESSION_SECRET` dans les variables d'environnement
2. Configurer `NODE_ENV=production`
3. Utiliser HTTPS
4. Configurer les backups DB
5. Mettre en place monitoring
6. Limiter la taille des uploads (actuellement 5MB)
7. Configurer un CDN pour les images

## Contact et support

Pour toute question ou problème, contacter l'équipe de développement StockLine.

---

**Dernière mise à jour** : 03 novembre 2025  
**Version** : 1.0.0  
**Statut** : MVP Fonctionnel - Prêt pour tests utilisateurs
