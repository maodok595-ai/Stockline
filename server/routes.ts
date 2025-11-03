import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import {
  insertCompanySchema,
  insertUserSchema,
  insertProductSchema,
  insertCategorySchema,
  insertStockMovementSchema,
  insertSupplierSchema,
  loginSchema,
  registerCompanySchema,
} from "@shared/schema";

// Configuration de l'upload de fichiers
const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage_multer,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisées"));
    }
  },
});

// Middleware d'authentification
declare module "express-session" {
  interface SessionData {
    userId?: string;
    companyId?: string;
    role?: string;
  }
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  next();
}

function requireSuperAdmin(req: Request, res: Response, next: Function) {
  if (!req.session.userId || req.session.role !== "super_admin") {
    return res.status(403).json({ error: "Accès refusé - Super Admin requis" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Servir les fichiers uploadés de manière sécurisée (protection contre path traversal)
  app.use("/uploads", (req, res) => {
    // Supprimer le "/" initial pour éviter que path.resolve ignore uploadDir
    const requestedPath = req.path.startsWith('/') ? req.path.slice(1) : req.path;
    
    // Normaliser et résoudre le chemin complet
    const fullPath = path.resolve(uploadDir, requestedPath);
    
    // Protection robuste contre path traversal : vérifier que le chemin reste dans uploadDir
    const relativePath = path.relative(uploadDir, fullPath);
    const isInside = relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
    
    if (!isInside) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    
    // Servir le fichier de manière sécurisée
    res.sendFile(fullPath, (err) => {
      if (err) {
        res.status(404).json({ error: "Fichier non trouvé" });
      }
    });
  });

  // ============================================
  // AUTHENTIFICATION
  // ============================================

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Données invalides", details: parsed.error });
      }

      const { email, password } = parsed.data;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Compte désactivé" });
      }

      // Vérifier si l'entreprise est active (sauf pour super_admin)
      if (user.role !== "super_admin" && user.companyId) {
        const company = await storage.getCompany(user.companyId);
        if (!company?.isActive) {
          return res.status(403).json({ error: "Entreprise désactivée" });
        }
      }

      req.session.userId = user.id;
      req.session.companyId = user.companyId || undefined;
      req.session.role = user.role;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Erreur login:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Erreur lors de la déconnexion" });
      }
      res.json({ success: true });
    });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Erreur get user:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Register (création du premier super admin)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Données invalides", details: parsed.error });
      }

      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      const user = await storage.createUser({
        ...parsed.data,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Erreur register:", error);
      if (error.message?.includes("unique")) {
        return res.status(409).json({ error: "Email déjà utilisé" });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Register Company (création d'une entreprise avec son premier admin)
  app.post("/api/auth/register-company", async (req, res) => {
    try {
      const parsed = registerCompanySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Données invalides", details: parsed.error.errors });
      }

      const { companyName, companyEmail, companyPhone, companyAddress, adminName, adminEmail, adminPassword } = parsed.data;

      // Créer l'entreprise
      const company = await storage.createCompany({
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddress,
        isActive: true,
      });

      // Créer l'utilisateur admin de l'entreprise
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = await storage.createUser({
        companyId: company.id,
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin_entreprise",
        isActive: true,
      });

      // Connecter automatiquement l'utilisateur
      req.session.userId = admin.id;
      req.session.companyId = company.id;
      req.session.role = admin.role;

      const { password: _, ...adminWithoutPassword } = admin;
      res.status(201).json({ 
        company,
        user: adminWithoutPassword,
        message: "Entreprise créée avec succès"
      });
    } catch (error: any) {
      console.error("Erreur register company:", error);
      if (error.message?.includes("unique")) {
        return res.status(409).json({ error: "Email déjà utilisé" });
      }
      res.status(500).json({ error: "Erreur lors de la création de l'entreprise" });
    }
  });

  // ============================================
  // ENTREPRISES (Super Admin only)
  // ============================================

  app.get("/api/companies", requireSuperAdmin, async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Erreur get companies:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/companies", requireSuperAdmin, upload.single("logo"), async (req, res) => {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.logo = `/uploads/${req.file.filename}`;
      }

      const parsed = insertCompanySchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: "Données invalides", details: parsed.error });
      }

      const company = await storage.createCompany(parsed.data);
      res.status(201).json(company);
    } catch (error: any) {
      console.error("Erreur create company:", error);
      if (error.message?.includes("unique")) {
        return res.status(409).json({ error: "Email déjà utilisé" });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/companies/:id", requireSuperAdmin, upload.single("logo"), async (req, res) => {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.logo = `/uploads/${req.file.filename}`;
      }

      const company = await storage.updateCompany(req.params.id, data);
      if (!company) {
        return res.status(404).json({ error: "Entreprise non trouvée" });
      }
      res.json(company);
    } catch (error) {
      console.error("Erreur update company:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/companies/:id", requireSuperAdmin, async (req, res) => {
    try {
      await storage.deleteCompany(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Erreur delete company:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============================================
  // UTILISATEURS
  // ============================================

  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      if (req.session.role === "super_admin") {
        // Super admin peut voir tous les utilisateurs d'une entreprise spécifique
        const companyId = req.query.companyId as string;
        if (!companyId) {
          return res.status(400).json({ error: "companyId requis" });
        }
        const users = await storage.getUsersByCompany(companyId);
        res.json(users.map(({ password, ...user }) => user));
      } else {
        // Les autres voient seulement leur entreprise
        const users = await storage.getUsersByCompany(req.session.companyId!);
        res.json(users.map(({ password, ...user }) => user));
      }
    } catch (error) {
      console.error("Erreur get users:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      // Seul super_admin et admin_entreprise peuvent créer des utilisateurs
      if (req.session.role !== "super_admin" && req.session.role !== "admin_entreprise") {
        return res.status(403).json({ error: "Accès refusé" });
      }

      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Données invalides", details: parsed.error });
      }

      // Si admin_entreprise, forcer le companyId
      if (req.session.role === "admin_entreprise") {
        parsed.data.companyId = req.session.companyId;
      }

      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      const user = await storage.createUser({
        ...parsed.data,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Erreur create user:", error);
      if (error.message?.includes("unique")) {
        return res.status(409).json({ error: "Email déjà utilisé" });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const updates = { ...req.body };
      
      // Hasher le mot de passe si présent
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erreur update user:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      if (req.session.role !== "super_admin" && req.session.role !== "admin_entreprise") {
        return res.status(403).json({ error: "Accès refusé" });
      }

      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Erreur delete user:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============================================
  // CATÉGORIES
  // ============================================

  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories(req.session.companyId!);
      res.json(categories);
    } catch (error) {
      console.error("Erreur get categories:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const data = { ...req.body, companyId: req.session.companyId };
      const parsed = insertCategorySchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: "Données invalides", details: parsed.error });
      }

      const category = await storage.createCategory(parsed.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Erreur create category:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ error: "Catégorie non trouvée" });
      }
      res.json(category);
    } catch (error) {
      console.error("Erreur update category:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Erreur delete category:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============================================
  // PRODUITS
  // ============================================

  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getProducts(req.session.companyId!);
      res.json(products);
    } catch (error) {
      console.error("Erreur get products:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/products/low-stock", requireAuth, async (req, res) => {
    try {
      const products = await storage.getLowStockProducts(req.session.companyId!);
      res.json(products);
    } catch (error) {
      console.error("Erreur get low stock:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/products", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const data = {
        ...req.body,
        companyId: req.session.companyId,
        price: req.body.price ? parseFloat(req.body.price) : 0,
        cost: req.body.cost ? parseFloat(req.body.cost) : 0,
        quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
        minQuantity: req.body.minQuantity ? parseInt(req.body.minQuantity) : 10,
      };

      if (req.file) {
        data.image = `/uploads/${req.file.filename}`;
      }

      const parsed = insertProductSchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: "Données invalides", details: parsed.error });
      }

      const product = await storage.createProduct(parsed.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Erreur create product:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/products/:id", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const data = { ...req.body };
      
      if (req.body.price) data.price = parseFloat(req.body.price);
      if (req.body.cost) data.cost = parseFloat(req.body.cost);
      if (req.body.quantity !== undefined) data.quantity = parseInt(req.body.quantity);
      if (req.body.minQuantity !== undefined) data.minQuantity = parseInt(req.body.minQuantity);

      if (req.file) {
        data.image = `/uploads/${req.file.filename}`;
      }

      const product = await storage.updateProduct(req.params.id, data);
      if (!product) {
        return res.status(404).json({ error: "Produit non trouvé" });
      }
      res.json(product);
    } catch (error) {
      console.error("Erreur update product:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Erreur delete product:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============================================
  // MOUVEMENTS DE STOCK
  // ============================================

  app.get("/api/movements", requireAuth, async (req, res) => {
    try {
      const movements = await storage.getStockMovements(req.session.companyId!);
      res.json(movements);
    } catch (error) {
      console.error("Erreur get movements:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/movements", requireAuth, async (req, res) => {
    try {
      const data = {
        ...req.body,
        companyId: req.session.companyId,
        userId: req.session.userId,
        quantity: parseInt(req.body.quantity),
      };

      const parsed = insertStockMovementSchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: "Données invalides", details: parsed.error });
      }

      // Créer le mouvement
      const movement = await storage.createStockMovement(parsed.data);

      // Mettre à jour la quantité du produit
      const product = await storage.getProduct(data.productId);
      if (product) {
        const newQuantity = data.type === "entree" 
          ? product.quantity + data.quantity 
          : product.quantity - data.quantity;
        
        await storage.updateProduct(data.productId, { quantity: newQuantity });
      }

      res.status(201).json(movement);
    } catch (error) {
      console.error("Erreur create movement:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============================================
  // FOURNISSEURS
  // ============================================

  app.get("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers(req.session.companyId!);
      res.json(suppliers);
    } catch (error) {
      console.error("Erreur get suppliers:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const data = { ...req.body, companyId: req.session.companyId };
      const parsed = insertSupplierSchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: "Données invalides", details: parsed.error });
      }

      const supplier = await storage.createSupplier(parsed.data);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Erreur create supplier:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.patch("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      const supplier = await storage.updateSupplier(req.params.id, req.body);
      if (!supplier) {
        return res.status(404).json({ error: "Fournisseur non trouvé" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Erreur update supplier:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Erreur delete supplier:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============================================
  // STATISTIQUES
  // ============================================

  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getCompanyStats(req.session.companyId!);
      res.json(stats);
    } catch (error) {
      console.error("Erreur get stats:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
