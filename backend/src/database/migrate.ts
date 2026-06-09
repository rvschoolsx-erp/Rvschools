/**
 * Database migration script — runs schema.sql + seed.sql
 * Usage: ts-node src/database/migrate.ts
 */
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔧 Running database migration...');

    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const seedPath   = path.join(__dirname, '../../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('  📄 Applying schema...');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schema);
      console.log('  ✅ Schema applied');
    }

    if (process.argv.includes('--seed') && fs.existsSync(seedPath)) {
      console.log('  🌱 Seeding data...');
      const seed = fs.readFileSync(seedPath, 'utf-8');
      await client.query(seed);
      console.log('  ✅ Seed data inserted');
    }

    console.log('\n✅ Migration complete!');
    console.log('\nDemo accounts:');
    console.log('  Admin:   admin@srsv.edu.in   / admin123');
    console.log('  Teacher: ram.sharma@srsv.edu.in / teacher123');
    console.log('  Parent:  9876543230 / teacher123');
    console.log('  Student: rahul.sharma@srsv.edu.in / teacher123');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
