import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function setupDatabase() {
  const dbName = process.env.PGDATABASE || 'water_network_db';
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'postgres';
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);

  console.log(`[*] Checking PostgreSQL instance at ${host}:${port}...`);

  // Connect to default 'postgres' database first to create the target database if needed
  const adminClient = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    console.log('[OK] Connected to PostgreSQL server.');

    const checkDbRes = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
    );

    if (checkDbRes.rows.length === 0) {
      console.log(`[*] Creating database '${dbName}'...`);
      await adminClient.query(`CREATE DATABASE "${dbName}";`);
      console.log(`[OK] Database '${dbName}' created.`);
    } else {
      console.log(`[OK] Database '${dbName}' already exists.`);
    }
    await adminClient.end();

    // Now connect to the target database and apply schema and seed
    console.log(`[*] Connecting to '${dbName}' to apply PostGIS schema and seed data...`);
    const dbClient = new Client({
      host,
      port,
      user,
      password,
      database: dbName
    });

    await dbClient.connect();

    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('[*] Running schema.sql (Enabling PostGIS, creating tables, indexes)...');
    await dbClient.query(schemaSql);
    console.log('[OK] PostGIS schema applied successfully.');

    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    console.log('[*] Running seed.sql (Inserting default users, roles, maintenance, complaints)...');
    await dbClient.query(seedSql);
    console.log('[OK] Seed data inserted successfully.');

    await dbClient.end();
    console.log('\n[SUCCESS] PostgreSQL + PostGIS database setup is complete!');
  } catch (err) {
    console.error('[!] PostgreSQL setup failed:', err.message);
    console.log('    Note: The backend automatically falls back to its embedded resilient store,');
    console.log('    so the application will continue to run seamlessly.');
  }
}

setupDatabase();
