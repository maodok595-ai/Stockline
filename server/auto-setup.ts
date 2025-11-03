import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

const log = (message: string) => {
  console.log(`[AUTO-SETUP] ${message}`);
};

export async function autoSetup() {
  if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL non définie - skip auto-setup');
    return;
  }

  let pool: typeof Pool.prototype | null = null;

  try {
    log('🚀 Démarrage de la configuration automatique...');
    
    // Connexion PostgreSQL standard (fonctionne sur Render)
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // 1. Vérifier si les tables existent
    log('📋 Vérification des tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tableNames = tablesResult.rows.map((t: any) => t.table_name);
    const requiredTables = ['users', 'companies', 'products', 'categories', 'stock_movements', 'suppliers'];
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      log(`⚠️  Tables manquantes: ${missingTables.join(', ')}`);
      log('📦 Création automatique des tables...');
      
      // Créer les tables directement
      await pool.query(`
        CREATE TABLE IF NOT EXISTS companies (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          address TEXT,
          logo TEXT,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id VARCHAR REFERENCES companies(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'employe',
          avatar TEXT,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS suppliers (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          category_id VARCHAR REFERENCES categories(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          description TEXT,
          sku TEXT,
          barcode TEXT,
          image TEXT,
          price NUMERIC(10, 2) NOT NULL DEFAULT 0,
          cost NUMERIC(10, 2) DEFAULT 0,
          quantity INTEGER NOT NULL DEFAULT 0,
          min_quantity INTEGER DEFAULT 10,
          unit TEXT DEFAULT 'unité',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS stock_movements (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          product_id VARCHAR NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          reason TEXT,
          supplier TEXT,
          notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      log('✅ Toutes les tables créées avec succès!');
    } else {
      log('✅ Toutes les tables existent déjà');
    }

    // 2. Créer la table session si elle n'existe pas (pour connect-pg-simple)
    log('📋 Vérification de la table session...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire)
    `);
    log('✅ Table session configurée');

    // 3. Vérifier si le super admin existe
    log('📋 Vérification du super admin...');
    const adminsResult = await pool.query(`
      SELECT id, email FROM users WHERE role = 'super_admin' LIMIT 1
    `);

    if (adminsResult.rows.length === 0) {
      log('⚠️  Aucun super admin trouvé');
      log('👤 Création du super admin maodok595@gmail.com...');
      
      const hashedPassword = await bcrypt.hash('Ndiay65@@', 10);
      
      await pool.query(`
        INSERT INTO users (name, email, password, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Super Admin', 'maodok595@gmail.com', hashedPassword, 'super_admin', true]);
      
      log('✅ Super admin créé avec succès!');
      log('   📧 Email: maodok595@gmail.com');
      log('   🔑 Mot de passe: Ndiay65@@');
    } else {
      log(`✅ Super admin existe déjà: ${adminsResult.rows[0].email}`);
      
      // Réinitialiser le mot de passe au cas où
      const hashedPassword = await bcrypt.hash('Ndiay65@@', 10);
      await pool.query(`
        UPDATE users 
        SET password = $1, is_active = true
        WHERE email = $2
      `, [hashedPassword, 'maodok595@gmail.com']);
      log('✅ Mot de passe du super admin réinitialisé');
    }

    log('🎉 Configuration automatique terminée avec succès!');
    log('');
    log('═══════════════════════════════════════');
    log('✅ APPLICATION PRÊTE');
    log('═══════════════════════════════════════');
    log('📧 Email: maodok595@gmail.com');
    log('🔑 Mot de passe: Ndiay65@@');
    log('═══════════════════════════════════════');
    log('');

  } catch (error: any) {
    log('❌ Erreur lors de la configuration automatique:');
    log(`   ${error.message}`);
    log('');
    log('⚠️  L\'application va démarrer quand même, mais vous devrez peut-être:');
    log('   1. Vérifier DATABASE_URL dans les variables d\'environnement');
    log('   2. Vérifier que la base PostgreSQL est accessible');
    log('');
  } finally {
    // Fermer la connexion pool
    if (pool) {
      await pool.end();
    }
  }
}
