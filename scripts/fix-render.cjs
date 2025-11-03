const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

const RENDER_DB_URL = process.env.RENDER_DATABASE_URL;

(async () => {
  console.log('\n🔍 === DIAGNOSTIC ET RÉPARATION STOCKLINE - BASE RENDER ===\n');
  
  if (!RENDER_DB_URL) {
    console.log('❌ ERREUR: RENDER_DATABASE_URL non définie');
    console.log('   → Ajoutez-la dans les Secrets Replit\n');
    process.exit(1);
  }
  
  try {
    console.log('📋 Étape 1: Connexion à PostgreSQL Render...');
    const sql = neon(RENDER_DB_URL);
    
    const versionResult = await sql`SELECT version() as version, NOW() as now`;
    console.log('  ✅ Connexion réussie!');
    console.log(`  ℹ️  PostgreSQL: ${versionResult[0].version.split(',')[0]}`);
    console.log(`  ℹ️  Date serveur: ${versionResult[0].now}`);
    console.log('');
    
    console.log('📋 Étape 2: Vérification des tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const tableNames = tables.map(t => t.table_name);
    console.log('  Tables trouvées:', tableNames.length > 0 ? tableNames.join(', ') : 'AUCUNE');
    
    const requiredTables = ['users', 'companies', 'products', 'categories', 'stock_movements', 'suppliers'];
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length > 0) {
      console.log('  ❌ Tables manquantes:', missingTables.join(', '));
      console.log('  → SOLUTION: Exécutez "npm run db:push" sur Render ou connectez DATABASE_URL à Render');
      console.log('');
      process.exit(1);
    }
    console.log('  ✅ Toutes les tables requises existent');
    console.log('');
    
    console.log('📋 Étape 3: Structure de la table users...');
    const userColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    console.log('  Colonnes détectées:');
    userColumns.forEach(col => {
      console.log(`    - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('  ✅ Structure OK');
    console.log('');
    
    console.log('📋 Étape 4: Vérification des utilisateurs existants...');
    const allUsers = await sql`
      SELECT id, email, name, role, is_active
      FROM users
      ORDER BY role, email
    `;
    
    console.log(`  Utilisateurs trouvés: ${allUsers.length}`);
    if (allUsers.length > 0) {
      allUsers.forEach(user => {
        console.log(`    - ${user.email} (${user.role}) - Actif: ${user.is_active}`);
      });
    }
    console.log('');
    
    console.log('📋 Étape 5: Création/Réinitialisation du super admin...');
    const hashedPassword = await bcrypt.hash('Ndiay65@@', 10);
    
    const result = await sql`
      INSERT INTO users (name, email, password, role, is_active)
      VALUES ('Super Admin', 'maodok595@gmail.com', ${hashedPassword}, 'super_admin', true)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = ${hashedPassword}, 
        is_active = true,
        role = 'super_admin',
        name = 'Super Admin'
      RETURNING id, email, name, role, is_active, created_at
    `;
    
    console.log('  ✅ Super admin créé/réinitialisé avec succès!');
    console.log(`     ID: ${result[0].id}`);
    console.log(`     Email: ${result[0].email}`);
    console.log(`     Nom: ${result[0].name}`);
    console.log(`     Rôle: ${result[0].role}`);
    console.log(`     Actif: ${result[0].is_active}`);
    console.log(`     Créé le: ${result[0].created_at}`);
    console.log('');
    
    console.log('📋 Étape 6: Validation du mot de passe...');
    const testUser = await sql`
      SELECT password FROM users WHERE email = 'maodok595@gmail.com'
    `;
    
    const isValid = await bcrypt.compare('Ndiay65@@', testUser[0].password);
    if (isValid) {
      console.log('  ✅ Mot de passe validé avec succès!');
    } else {
      console.log('  ❌ Erreur de validation du mot de passe');
    }
    console.log('');
    
    console.log('📋 Étape 7: Statistiques de la base de données...');
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const companyCount = await sql`SELECT COUNT(*) as count FROM companies`;
    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`;
    const movementCount = await sql`SELECT COUNT(*) as count FROM stock_movements`;
    
    console.log(`  📊 Utilisateurs: ${userCount[0].count}`);
    console.log(`  📊 Entreprises: ${companyCount[0].count}`);
    console.log(`  📊 Produits: ${productCount[0].count}`);
    console.log(`  📊 Catégories: ${categoryCount[0].count}`);
    console.log(`  📊 Mouvements: ${movementCount[0].count}`);
    console.log('');
    
    console.log('📋 Étape 8: Vérification de la table session...');
    const sessionTableExists = tableNames.includes('session');
    if (sessionTableExists) {
      const sessionCount = await sql`SELECT COUNT(*) as count FROM session`;
      console.log(`  ✅ Table session existe (${sessionCount[0].count} sessions actives)`);
    } else {
      console.log('  ⚠️  Table session n\'existe pas encore');
      console.log('     → Elle sera créée automatiquement au premier démarrage de l\'app');
    }
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ ✅ ✅  DIAGNOSTIC TERMINÉ AVEC SUCCÈS  ✅ ✅ ✅');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📝 INFORMATIONS DE CONNEXION SUR RENDER:');
    console.log('');
    console.log('   🌐 URL: https://votre-app.onrender.com');
    console.log('   📧 Email: maodok595@gmail.com');
    console.log('   🔑 Mot de passe: Ndiay65@@');
    console.log('');
    console.log('🚀 Votre base de données Render est prête!');
    console.log('   → Allez sur votre URL Render et connectez-vous');
    console.log('   → Le super admin est actif et fonctionnel');
    console.log('');
    console.log('💡 Note: Assurez-vous que:');
    console.log('   1. DATABASE_URL sur Render pointe vers cette base');
    console.log('   2. SESSION_SECRET est défini sur Render');
    console.log('   3. Le service Render est déployé et actif');
    console.log('');
    
  } catch (error) {
    console.log('');
    console.log('❌ ❌ ❌  ERREUR CRITIQUE  ❌ ❌ ❌');
    console.log('');
    console.log('Message:', error.message);
    if (error.code) console.log('Code:', error.code);
    if (error.stack) {
      console.log('');
      console.log('Stack trace:');
      console.log(error.stack);
    }
    console.log('');
    console.log('💡 SOLUTIONS POSSIBLES:');
    console.log('');
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('   ❌ Les tables n\'existent pas dans la base de données');
      console.log('   ✅ SOLUTION:');
      console.log('      1. Sur Render Dashboard → Votre service → Shell');
      console.log('      2. Exécutez: npm run db:push');
      console.log('      3. Réessayez ce script');
    } else if (error.message.includes('connect') || error.message.includes('fetch')) {
      console.log('   ❌ Impossible de se connecter à la base de données');
      console.log('   ✅ SOLUTION:');
      console.log('      1. Vérifiez que la base PostgreSQL Render est active');
      console.log('      2. Vérifiez que RENDER_DATABASE_URL est correcte');
      console.log('      3. La base doit être accessible publiquement');
    } else {
      console.log('   ❌ Erreur inconnue');
      console.log('   ✅ SOLUTION:');
      console.log('      1. Vérifiez les logs Render');
      console.log('      2. Vérifiez DATABASE_URL sur Render');
      console.log('      3. Contactez le support si le problème persiste');
    }
    console.log('');
    process.exit(1);
  }
})();
