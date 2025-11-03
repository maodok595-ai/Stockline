# Guide de Déploiement StockLine sur Render

## 📋 Prérequis

- Compte Render.com (gratuit)
- Code source sur GitHub/GitLab
- Base de données PostgreSQL (fournie par Render)

## 🚀 Déploiement Automatique avec render.yaml

### Option 1 : Déploiement en un clic

1. Poussez votre code sur GitHub/GitLab
2. Connectez-vous à [Render Dashboard](https://dashboard.render.com)
3. Cliquez sur "New +" → "Blueprint"
4. Connectez votre repository
5. Render détectera automatiquement `render.yaml` et créera :
   - ✅ Service Web (StockLine)
   - ✅ Base de données PostgreSQL

### Option 2 : Déploiement Manuel

#### 1. Créer la Base de Données PostgreSQL

1. Sur Render Dashboard → "New +" → "PostgreSQL"
2. Nom : `stockline-db`
3. Database : `stockline`
4. User : `stockline`
5. Region : `Frankfurt` (ou votre région)
6. Plan : `Free`
7. Cliquez "Create Database"
8. **Copiez l'URL de connexion** (Internal Database URL)

#### 2. Créer le Service Web

1. Sur Render Dashboard → "New +" → "Web Service"
2. Connectez votre repository GitHub/GitLab
3. Configuration :
   - **Name** : `stockline`
   - **Region** : `Frankfurt`
   - **Branch** : `main`
   - **Runtime** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Plan** : `Free`

#### 3. Variables d'Environnement

Dans l'onglet "Environment" du service web, ajoutez **uniquement ces 2 variables** :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | *Coller l'Internal Database URL de l'étape 1* |
| `SESSION_SECRET` | *Générer un secret aléatoire* |

⚠️ **Important** : N'ajoutez **PAS** `NODE_ENV` ni `PORT` - Render les gère automatiquement !

**Pour générer SESSION_SECRET** :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. Déployer

1. Cliquez "Create Web Service"
2. Render va automatiquement :
   - Installer les dépendances (`npm install`)
   - Builder l'application (`npm run build`)
   - Démarrer le serveur (`npm start`)

## 🔧 Configuration Technique

### Commandes Render

- **Build Command** : `npm install && npm run build`
  - Installe toutes les dépendances Node.js
  - Compile le TypeScript en JavaScript
  - Build le frontend React avec Vite

- **Start Command** : `npm start`
  - Lance le serveur Express en mode production
  - Sert les fichiers statiques depuis `dist/`
  - Écoute sur le port 10000

### Port Configuration

Render assigne automatiquement le port via la variable `PORT`. L'application est configurée pour :
```javascript
const port = parseInt(process.env.PORT || '5000', 10);
```

Le port 10000 est défini dans `render.yaml` mais Render peut utiliser un port différent - l'app s'adaptera automatiquement.

## 🗄️ Migration de Base de Données

Après le premier déploiement, initialisez le schéma :

1. Dans le service web sur Render, allez dans "Shell"
2. Exécutez :
```bash
npm run db:push
```

Cela créera toutes les tables nécessaires dans PostgreSQL.

## 📊 Post-Déploiement

### 1. Créer le Super Admin

Après déploiement, créez votre compte super admin via l'API :

```bash
curl -X POST https://votre-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Votre Nom",
    "email": "maodok595@gmail.com",
    "password": "Ndiay65@@",
    "role": "super_admin"
  }'
```

### 2. Vérifier le Déploiement

- ✅ Accédez à `https://votre-app.onrender.com`
- ✅ Testez la connexion avec vos identifiants
- ✅ Vérifiez que le dashboard s'affiche correctement

## 🔒 Sécurité Production

### Variables d'Environnement Importantes

1. **SESSION_SECRET** : Doit être un secret fort (32+ caractères aléatoires)
2. **DATABASE_URL** : Ne jamais exposer publiquement
3. **NODE_ENV=production** : Active les optimisations de sécurité

### Recommandations

- ✅ Utilisez HTTPS (fourni automatiquement par Render)
- ✅ Changez le mot de passe super admin par défaut
- ✅ Activez les backups automatiques de la base de données (Render paid plan)
- ✅ Configurez des alertes de monitoring

## 🆓 Plan Gratuit Render

Le plan gratuit inclut :
- ✅ 750 heures/mois de runtime
- ✅ Mise en veille après 15 min d'inactivité
- ✅ SSL/TLS automatique
- ✅ Déploiements illimités
- ✅ PostgreSQL 1GB (gratuit séparé)

⚠️ **Limitation** : Le service se met en veille après 15 minutes d'inactivité. Le premier accès prendra ~30 secondes pour redémarrer.

## 🔄 Mises à Jour

Render redéploie automatiquement à chaque push sur la branche `main` :

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render détectera le changement et redéploiera automatiquement.

## 📱 URL de l'Application

Après déploiement, votre application sera accessible à :
```
https://stockline.onrender.com
```

Ou un nom personnalisé si configuré.

## 🐛 Debugging

### Voir les Logs

1. Sur Render Dashboard → Votre Service
2. Onglet "Logs"
3. Logs en temps réel de l'application

### Problèmes Courants

**Erreur "Port already in use"**
- Solution : Render gère le port automatiquement, ne pas forcer le port 10000

**Base de données non connectée**
- Vérifier que `DATABASE_URL` est bien configuré
- S'assurer que la DB PostgreSQL est créée

**Build échoue**
- Vérifier les logs de build
- S'assurer que toutes les dépendances sont dans `package.json`

## 📧 Support

Pour toute question :
- Documentation Render : https://render.com/docs
- Support Render : https://render.com/support

---

**Bon déploiement ! 🚀**
