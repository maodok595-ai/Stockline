# 🚀 Déploiement Rapide sur Render

## Configuration en 3 étapes

### 1️⃣ Préparer le Code
```bash
git add .
git commit -m "Préparation déploiement Render"
git push origin main
```

### 2️⃣ Sur Render.com

1. **Créer la Base de Données**
   - New + → PostgreSQL
   - Nom : `stockline-db`
   - Plan : Free
   - Copier l'**Internal Database URL**

2. **Créer le Service Web**
   - New + → Web Service
   - Connecter votre repo GitHub
   - Configuration :
     ```
     Name: stockline
     Runtime: Node
     Build Command: npm install && npm run build
     Start Command: npm start
     ```

3. **Variables d'Environnement**
   
   **Seulement 2 variables nécessaires** :
   
   | Variable | Valeur |
   |----------|--------|
   | `DATABASE_URL` | Coller l'Internal Database URL de votre PostgreSQL Render |
   | `SESSION_SECRET` | Générer un secret aléatoire |
   
   **Générer SESSION_SECRET** :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   ⚠️ **Note** : `NODE_ENV` et `PORT` sont gérés automatiquement par Render - ne les ajoutez pas !

### 3️⃣ Initialiser la Base de Données

Une fois déployé, dans le Shell de Render :
```bash
npm run db:push
```

## ✅ C'est Tout !

Votre application sera accessible à :
```
https://stockline.onrender.com
```

## 🔐 Connexion Super Admin

Email : `maodok595@gmail.com`  
Mot de passe : `Ndiay65@@`

---

**Pour plus de détails, voir DEPLOYMENT.md**
