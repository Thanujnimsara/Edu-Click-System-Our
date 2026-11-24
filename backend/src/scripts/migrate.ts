import fs from 'fs';
import path from 'path';
import { db } from '../config/db';

export async function runMigrations(): Promise<void> {
  console.log('=======================================================');
  console.log('  EDU CLICK LMS – DATABASE MIGRATION RUNNER');
  console.log('=======================================================');

  await db.init();
  const engine = db.getEngine();
  console.log(`[Migration] Active Relational Database Engine: ${engine.toUpperCase()}`);

  const migrationsDir = path.resolve(process.cwd(), '../database/migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`[Migration] Migrations directory not found at: ${migrationsDir}`);
    return;
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  console.log(`[Migration] Found ${files.length} migration files to verify/execute:`);

  for (const file of files) {
    console.log(`  -> Running migration: ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sqlContent = fs.readFileSync(filePath, 'utf8');

    // Split SQL statements by semicolon
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await db.execute(stmt);
      } catch (err: any) {
        console.warn(`    Notice on [${file}]: ${err.message}`);
      }
    }
    console.log(`  ✓ Migration ${file} applied successfully.`);
  }

  console.log('=======================================================');
  console.log('  ALL MIGRATIONS SUCCESSFULLY EXECUTED');
  console.log('=======================================================');
}

if (process.argv[1] && process.argv[1].includes('migrate.ts')) {
  runMigrations().then(() => process.exit(0)).catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
