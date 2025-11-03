const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

const RENDER_DB_URL = 'postgresql://stokage_user:v1bEGfJtB7EOgHPf0t4Nc42PlgUlcuT0@dpg-d440tgqli9vc73dj4o20-a.oregon-postgres.render.com/stokage';

(async () => {
  console.log('🔍 === DIAGNOSTIC STOCKLINE - BASE RENDER ===\n');
  
  try {
    console.log('📋 Étape 1: Connexion à PostgreSQL Render...');
    const sql = neon(RENDER_DB_URL);
    
    const versionResult = await sql`SELECT version() as version`;
    console.log('  ✅ Connexion réussie!');
    console.log('  ℹ️  PostgreSQL:', versionResult[0].version.split(',')[0]);
    console.log('');
    
    console.log('📋 Étape 2: Vérification des tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const tableNames = tables.map(t => t.table_name);
    console.log('  Tables trouvées:', tableNames.join(', '));
    
    const requiredTables = ['users', 'companies', 'products', 'categories', 'stock_movements', 'suppliers'];
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length > 0) {
      console.log('  ❌ Tables manquantes:', missingTables.join(', '));
      console.log('  → SOLUTION: Exécutez "npm run db:push" dans le Shell Render');
      process.exit(1);
    }
    console.log('  ✅ Toutes les tables requises existent\n');
    
    console.log('📋 Étape 3: Structure de la table users...');
    const userColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    console.log('  Colonnes:', userColumns.map(c => c.column_name).join(', '));
    console.log('  ✅ Structure OK\n');
    
    console.log('📋 Étape 4: Vérification des super admins...');
    const existingAdmins = await sql`
      SELECT id, email, name, role, is_active
      FROM users
      WHERE role = 'super_admin'
    `;
    
    if (existingAdmins.length > 0) {
      console.log(`  ℹ️  ${existingAdmins.length} super admin(s) trouvé(s):`);
      existingAdmins.forEach(admin => {
        console.log(`     - ${admin.email} (Actif: ${admin.is_active})`);
      });
    } else {
      console.log('  ⚠️  Aucun super admin trouvé');
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
        role = 'super_admin'
      RETURNING id, email, name, role, is_active
    `;
    
    console.log('  ✅ Super admin créé/réinitialisé avec succès!');
    console.log(`     ID: ${result[0].id}`);
    console.log(`     Email: ${result[0].email}`);
    console.log(`     Rôle: ${result[0].role}`);
    console.log(`     Actif: ${result[0].is_active}`);
    console.log('');
    
    console.log('📋 Étape 6: Test de validation du mot de passe...');
    const testUser = await sql`
      SELECT password FROM users WHERE email = 'maodok595@gmail.com'
    `;
    
    const isValid = await bcrypt.compare('Ndiay65@@', testUser[0].password);
    if (isValid) {
      console.log('  ✅ Mot de passe validé avec succès!\n');
    } else {
      console.log('  ❌ Erreur de validation du mot de passe\n');
    }
    
    console.log('📋 Étape 7: Statistiques de la base de données...');
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const companyCount = await sql`SELECT COUNT(*) as count FROM companies`;
    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    
    console.log(`  Utilisateurs: ${userCount[0].count}`);
    console.log(`  Entreprises: ${companyCount[0].count}`);
    console.log(`  Produits: ${productCount[0].count}`);
    console.log('');
    
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ DIAGNOSTIC TERMINÉ AVEC SUCCÈS');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('📝 INFORMATIONS DE CONNEXION:');
    console.log('   URL: https://votre-app.onrender.com');
    console.log('   Email: maodok595@gmail.com');
    console.log('   Mot de passe: Ndiay65@@');
    console.log('');
    console.log('🚀 Votre application est prête!');
    console.log('   Essayez de vous connecter maintenant.');
    console.log('');
    
  } catch (error) {
    console.log('');
    console.log('❌ ERREUR CRITIQUE:');
    console.log('   Message:', error.message);
    if (error.code) console.log('   Code:', error.code);
    console.log('');
    console.log('💡 SOLUTION:');
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('   → Les tables n\'existent pas encore');
      console.log('   → Exécutez dans le Shell Render: npm run db:push');
    } else if (error.message.includes('connect')) {
      console.log('   → Problème de connexion à la base de données');
      console.log('   → Vérifiez que la base PostgreSQL Render est active');
    } else {
      console.log('   → Erreur inconnue, vérifiez les logs Render');
    }
    console.log('');
    process.exit(1);
  }
})();
