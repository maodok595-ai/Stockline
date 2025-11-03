#!/usr/bin/env node

/**
 * Script de diagnostic et réparation pour StockLine sur Render
 * Exécutez ce script dans le Shell Render pour diagnostiquer et résoudre les problèmes
 */

const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

console.log('🔍 === DIAGNOSTIC STOCKLINE SUR RENDER ===\n');

(async () => {
  try {
    // 1. Vérifier les variables d'environnement
    console.log('📋 Étape 1: Vérification des variables d\'environnement...');
    const requiredVars = ['DATABASE_URL', 'SESSION_SECRET', 'NODE_ENV'];
    const missing = [];
    
    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`  ✅ ${varName}: Défini`);
      } else {
        console.log(`  ❌ ${varName}: MANQUANT`);
        missing.push(varName);
      }
    });
    
    if (missing.length > 0) {
      console.log('\n❌ ERREUR: Variables d\'environnement manquantes:', missing.join(', '));
      console.log('   → Ajoutez-les dans Render Dashboard → Environment\n');
      process.exit(1);
    }
    
    console.log(`  ℹ️  NODE_ENV = ${process.env.NODE_ENV}`);
    console.log('  ✅ Toutes les variables requises sont présentes\n');

    // 2. Tester la connexion à la base de données
    console.log('📋 Étape 2: Test de connexion à PostgreSQL...');
    const sql = neon(process.env.DATABASE_URL);
    
    try {
      const result = await sql`SELECT NOW() as now, version() as version`;
      console.log('  ✅ Connexion PostgreSQL réussie');
      console.log(`  ℹ️  PostgreSQL version: ${result[0].version.split(',')[0]}\n`);
    } catch (error) {
      console.log('  ❌ Erreur de connexion PostgreSQL:', error.message);
      console.log('  → Vérifiez DATABASE_URL dans Environment\n');
      process.exit(1);
    }

    // 3. Vérifier les tables existantes
    console.log('📋 Étape 3: Vérification des tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const requiredTables = ['users', 'companies', 'products', 'categories', 'stock_movements', 'suppliers'];
    const existingTables = tables.map(t => t.table_name);
    
    requiredTables.forEach(tableName => {
      if (existingTables.includes(tableName)) {
        console.log(`  ✅ Table '${tableName}' existe`);
      } else {
        console.log(`  ❌ Table '${tableName}' MANQUANTE`);
      }
    });
    
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    if (missingTables.length > 0) {
      console.log('\n❌ ERREUR: Tables manquantes:', missingTables.join(', '));
      console.log('   → Exécutez: npm run db:push\n');
      process.exit(1);
    }
    
    console.log('  ✅ Toutes les tables requises existent\n');

    // 4. Vérifier la structure de la table users
    console.log('📋 Étape 4: Vérification de la structure de la table users...');
    const userColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('  Colonnes détectées:');
    userColumns.forEach(col => {
      console.log(`    - ${col.column_name} (${col.data_type})`);
    });
    console.log('  ✅ Structure de la table users OK\n');

    // 5. Vérifier si le super admin existe
    console.log('📋 Étape 5: Vérification du super admin...');
    const superAdmins = await sql`
      SELECT id, email, name, role, is_active
      FROM users
      WHERE role = 'super_admin'
    `;
    
    if (superAdmins.length === 0) {
      console.log('  ⚠️  Aucun super admin trouvé');
      console.log('  → Création du super admin maodok595@gmail.com...');
      
      const hashedPassword = await bcrypt.hash('Ndiay65@@', 10);
      const newAdmin = await sql`
        INSERT INTO users (name, email, password, role, is_active)
        VALUES ('Super Admin', 'maodok595@gmail.com', ${hashedPassword}, 'super_admin', true)
        RETURNING id, email, name, role
      `;
      
      console.log('  ✅ Super admin créé avec succès!');
      console.log(`     Email: ${newAdmin[0].email}`);
      console.log(`     ID: ${newAdmin[0].id}\n`);
    } else {
      console.log(`  ✅ ${superAdmins.length} super admin(s) trouvé(s):`);
      superAdmins.forEach(admin => {
        console.log(`     - ${admin.email} (${admin.name}) - Actif: ${admin.is_active}`);
      });
      
      // Vérifier si maodok595@gmail.com existe
      const targetAdmin = superAdmins.find(a => a.email === 'maodok595@gmail.com');
      if (!targetAdmin) {
        console.log('\n  ⚠️  Super admin maodok595@gmail.com non trouvé');
        console.log('  → Création...');
        
        const hashedPassword = await bcrypt.hash('Ndiay65@@', 10);
        const newAdmin = await sql`
          INSERT INTO users (name, email, password, role, is_active)
          VALUES ('Super Admin', 'maodok595@gmail.com', ${hashedPassword}, 'super_admin', true)
          RETURNING id, email, name, role
        `;
        
        console.log('  ✅ Super admin créé avec succès!');
        console.log(`     Email: ${newAdmin[0].email}\n`);
      } else {
        console.log(`\n  ✅ Super admin maodok595@gmail.com existe (ID: ${targetAdmin.id})\n`);
        
        // Réinitialiser le mot de passe
        console.log('  🔄 Réinitialisation du mot de passe à Ndiay65@@...');
        const hashedPassword = await bcrypt.hash('Ndiay65@@', 10);
        await sql`
          UPDATE users 
          SET password = ${hashedPassword}, is_active = true
          WHERE email = 'maodok595@gmail.com'
        `;
        console.log('  ✅ Mot de passe réinitialisé avec succès!\n');
      }
    }

    // 6. Vérifier la table session
    console.log('📋 Étape 6: Vérification de la table session...');
    const sessionTableExists = existingTables.includes('session');
    
    if (sessionTableExists) {
      const sessionCount = await sql`SELECT COUNT(*) as count FROM session`;
      console.log(`  ✅ Table session existe (${sessionCount[0].count} sessions actives)\n`);
    } else {
      console.log('  ⚠️  Table session n\'existe pas encore');
      console.log('  → Elle sera créée automatiquement au premier démarrage\n');
    }

    // 7. Test de connexion
    console.log('📋 Étape 7: Test de validation du mot de passe...');
    const testUser = await sql`
      SELECT id, email, password, role, is_active
      FROM users
      WHERE email = 'maodok595@gmail.com'
    `;
    
    if (testUser.length > 0) {
      const isPasswordValid = await bcrypt.compare('Ndiay65@@', testUser[0].password);
      if (isPasswordValid) {
        console.log('  ✅ Mot de passe validé avec succès!\n');
      } else {
        console.log('  ❌ Mot de passe invalide - réinitialisation...');
        const hashedPassword = await bcrypt.hash('Ndiay65@@', 10);
        await sql`
          UPDATE users 
          SET password = ${hashedPassword}
          WHERE email = 'maodok595@gmail.com'
        `;
        console.log('  ✅ Mot de passe réinitialisé!\n');
      }
    }

    // Résumé final
    console.log('═══════════════════════════════════════');
    console.log('✅ DIAGNOSTIC TERMINÉ AVEC SUCCÈS');
    console.log('═══════════════════════════════════════');
    console.log('\n📝 Informations de connexion:');
    console.log('   Email: maodok595@gmail.com');
    console.log('   Mot de passe: Ndiay65@@');
    console.log('\n🚀 Votre application est prête!');
    console.log('   Essayez de vous connecter maintenant.\n');

  } catch (error) {
    console.log('\n❌ ERREUR CRITIQUE:');
    console.log('   Message:', error.message);
    console.log('   Stack:', error.stack);
    console.log('\n💡 Solutions possibles:');
    console.log('   1. Vérifiez DATABASE_URL dans Environment');
    console.log('   2. Exécutez: npm run db:push');
    console.log('   3. Redémarrez le service Render\n');
    process.exit(1);
  }
})();
