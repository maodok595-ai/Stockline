# 🚀 DÉPLOYER SUR RENDER - GUIDE ULTRA-SIMPLE

## 📋 CE QU'IL FAUT FAIRE (3 MINUTES)

### 1️⃣ Configurer 2 Variables sur Render

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Cliquez sur votre service web
3. Menu → **Environment**
4. Ajoutez **exactement 2 variables** :

#### Variable 1 : DATABASE_URL
```
Nom : DATABASE_URL
Valeur : postgresql://stokage_user:v1bEGfJtB7EOgHPf0t4Nc42PlgUlcuT0@dpg-d440tgqli9vc73dj4o20-a.oregon-postgres.render.com/stokage
```
*(Vous me l'avez déjà donnée - utilisez cette URL)*

#### Variable 2 : SESSION_SECRET
```
Nom : SESSION_SECRET
Valeur : 4df1f4d53812b2338b887aeb6d484a8ecb3256992c5a4643c309be8db75bed4a
```
*(Je l'ai déjà généré pour vous)*

5. Cliquez **Save Changes**

---

### 2️⃣ Pousser le Code

```bash
git add .
git commit -m "Auto-setup configuré"
git push origin main
```

---

### 3️⃣ Déployer

Sur Render → Votre service :
- Cliquez **Manual Deploy** → **Clear build cache & deploy**
- Attendez 2-3 minutes

---

### 4️⃣ SE CONNECTER

Une fois "Live" (vert), allez sur votre URL Render et connectez-vous :

```
Email : maodok595@gmail.com
Mot de passe : Ndiay65@@
```

**ÇA DOIT FONCTIONNER !** ✅

---

## ⚠️ SI ÇA NE MARCHE PAS

Regardez les logs Render et cherchez :

### ✅ BON SIGNE :
```
[AUTO-SETUP] ✅ APPLICATION PRÊTE
[express] serving on port 10000
```

### ❌ MAUVAIS SIGNE :
```
[AUTO-SETUP] ❌ Erreur
```

Si vous voyez une erreur, **envoyez-moi une capture d'écran des logs**.

---

## 📝 RÉCAPITULATIF

1. ✅ 2 variables dans Environment (DATABASE_URL + SESSION_SECRET)
2. ✅ Git push
3. ✅ Deploy sur Render
4. ✅ Connexion avec maodok595@gmail.com / Ndiay65@@

**C'est tout.**

Le reste (tables, super admin) se fait **automatiquement** au démarrage.
