import { eq, and, desc, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Company,
  InsertCompany,
  Product,
  InsertProduct,
  Category,
  InsertCategory,
  StockMovement,
  InsertStockMovement,
  Supplier,
  InsertSupplier,
} from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  // Entreprises
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByEmail(email: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<void>;

  // Utilisateurs
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByCompany(companyId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  // Catégories
  getCategories(companyId: string): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  // Produits
  getProducts(companyId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategoryId(categoryId: string): Promise<Product[]>;
  getLowStockProducts(companyId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  // Mouvements de stock
  getStockMovements(companyId: string): Promise<StockMovement[]>;
  getStockMovement(id: string): Promise<StockMovement | undefined>;
  getStockMovementsByProduct(productId: string): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  deleteStockMovement(id: string): Promise<void>;

  // Fournisseurs
  getSuppliers(companyId: string): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<void>;

  // Statistiques
  getCompanyStats(companyId: string): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockAlerts: number;
    movementsThisMonth: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Entreprises
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(schema.companies).orderBy(desc(schema.companies.createdAt));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const result = await db.select().from(schema.companies).where(eq(schema.companies.id, id));
    return result[0];
  }

  async getCompanyByEmail(email: string): Promise<Company | undefined> {
    const result = await db.select().from(schema.companies).where(eq(schema.companies.email, email));
    return result[0];
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const result = await db.insert(schema.companies).values(company).returning();
    return result[0];
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const result = await db.update(schema.companies).set(company).where(eq(schema.companies.id, id)).returning();
    return result[0];
  }

  async deleteCompany(id: string): Promise<void> {
    await db.delete(schema.companies).where(eq(schema.companies.id, id));
  }

  // Utilisateurs
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return await db.select().from(schema.users).where(eq(schema.users.companyId, companyId)).orderBy(desc(schema.users.createdAt));
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(schema.users).set(user).where(eq(schema.users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(schema.users).where(eq(schema.users.id, id));
  }

  // Catégories
  async getCategories(companyId: string): Promise<Category[]> {
    return await db.select().from(schema.categories).where(eq(schema.categories.companyId, companyId)).orderBy(schema.categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(schema.categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(schema.categories).set(category).where(eq(schema.categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(schema.categories).where(eq(schema.categories.id, id));
  }

  // Produits
  async getProducts(companyId: string): Promise<Product[]> {
    return await db.select().from(schema.products).where(eq(schema.products.companyId, companyId)).orderBy(desc(schema.products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return result[0];
  }

  async getProductsByCategoryId(categoryId: string): Promise<Product[]> {
    return await db.select().from(schema.products).where(eq(schema.products.categoryId, categoryId));
  }

  async getLowStockProducts(companyId: string): Promise<Product[]> {
    return await db
      .select()
      .from(schema.products)
      .where(
        and(
          eq(schema.products.companyId, companyId),
          sql`${schema.products.quantity} <= ${schema.products.minQuantity}`
        )
      );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(schema.products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const updates = { ...product, updatedAt: new Date() };
    const result = await db.update(schema.products).set(updates).where(eq(schema.products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(schema.products).where(eq(schema.products.id, id));
  }

  // Mouvements de stock
  async getStockMovements(companyId: string): Promise<StockMovement[]> {
    return await db.select().from(schema.stockMovements).where(eq(schema.stockMovements.companyId, companyId)).orderBy(desc(schema.stockMovements.createdAt));
  }

  async getStockMovement(id: string): Promise<StockMovement | undefined> {
    const result = await db.select().from(schema.stockMovements).where(eq(schema.stockMovements.id, id));
    return result[0];
  }

  async getStockMovementsByProduct(productId: string): Promise<StockMovement[]> {
    return await db.select().from(schema.stockMovements).where(eq(schema.stockMovements.productId, productId)).orderBy(desc(schema.stockMovements.createdAt));
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const result = await db.insert(schema.stockMovements).values(movement).returning();
    return result[0];
  }

  async deleteStockMovement(id: string): Promise<void> {
    await db.delete(schema.stockMovements).where(eq(schema.stockMovements.id, id));
  }

  // Fournisseurs
  async getSuppliers(companyId: string): Promise<Supplier[]> {
    return await db.select().from(schema.suppliers).where(eq(schema.suppliers.companyId, companyId)).orderBy(schema.suppliers.name);
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const result = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id));
    return result[0];
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const result = await db.insert(schema.suppliers).values(supplier).returning();
    return result[0];
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const result = await db.update(schema.suppliers).set(supplier).where(eq(schema.suppliers.id, id)).returning();
    return result[0];
  }

  async deleteSupplier(id: string): Promise<void> {
    await db.delete(schema.suppliers).where(eq(schema.suppliers.id, id));
  }

  // Statistiques
  async getCompanyStats(companyId: string): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockAlerts: number;
    movementsThisMonth: number;
  }> {
    const products = await this.getProducts(companyId);
    const lowStock = await this.getLowStockProducts(companyId);
    
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * p.quantity), 0);
    const lowStockAlerts = lowStock.length;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const movements = await db
      .select()
      .from(schema.stockMovements)
      .where(
        and(
          eq(schema.stockMovements.companyId, companyId),
          sql`${schema.stockMovements.createdAt} >= ${startOfMonth}`
        )
      );

    return {
      totalProducts,
      totalValue,
      lowStockAlerts,
      movementsThisMonth: movements.length,
    };
  }
}

export const storage = new DatabaseStorage();
