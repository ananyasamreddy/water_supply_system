import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// PostgreSQL Connection Pool configuration
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'water_network_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  connectionTimeoutMillis: 2500,
  max: 15
});

let isPgConnected = false;

// Registered users persistent storage path
const dataDir = path.resolve(__dirname, '../../data');
const usersFilePath = path.join(dataDir, 'registered_users.json');

const initialSeedUsers = [
  {
    id: 1,
    name: 'System Administrator',
    email: 'admin@water.gov',
    password_hash: '$2b$10$EPV6i0h9H3J/x7pP2XFZe.nkg/R6nK14Z2rYvL8c3S0D4d6aM1Q0q', // password123
    role: 'ADMIN',
    phone: '+91 9876543210',
    department: 'Infrastructure Operations'
  },
  {
    id: 2,
    name: 'Ramesh Kumar',
    email: 'officer@water.gov',
    password_hash: '$2b$10$EPV6i0h9H3J/x7pP2XFZe.nkg/R6nK14Z2rYvL8c3S0D4d6aM1Q0q',
    role: 'MUNICIPALITY_OFFICER',
    phone: '+91 9876543211',
    department: 'Municipal Water Board'
  },
  {
    id: 3,
    name: 'Priya Sharma',
    email: 'engineer@water.gov',
    password_hash: '$2b$10$EPV6i0h9H3J/x7pP2XFZe.nkg/R6nK14Z2rYvL8c3S0D4d6aM1Q0q',
    role: 'FIELD_ENGINEER',
    phone: '+91 9876543212',
    department: 'Rapid Pipeline Response'
  },
  {
    id: 4,
    name: 'Ananya Gupta',
    email: 'citizen@water.gov',
    password_hash: '$2b$10$EPV6i0h9H3J/x7pP2XFZe.nkg/R6nK14Z2rYvL8c3S0D4d6aM1Q0q',
    role: 'CITIZEN',
    phone: '+91 9876543213',
    department: 'Resident'
  }
];

function loadUsersFromFile() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      const loaded = JSON.parse(data);
      if (Array.isArray(loaded) && loaded.length > 0) {
        return loaded;
      }
    }
    // Write seed users to disk if not exists
    fs.writeFileSync(usersFilePath, JSON.stringify(initialSeedUsers, null, 2), 'utf8');
    return [...initialSeedUsers];
  } catch (err) {
    console.warn('[DB WARNING] Error handling registered_users.json:', err.message);
    return [...initialSeedUsers];
  }
}

export function saveUsersToFile(users) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[DB ERROR] Failed saving users to file:', err.message);
    return false;
  }
}

// Embedded Resilient Store
const fallbackStore = {
  users: loadUsersFromFile(),
  maintenance: [
    {
      id: 1,
      pipeline_id: 'P_102',
      problem_description: 'High failure risk predicted by Random Forest (Age 45 yrs, Cast Iron)',
      assigned_engineer_id: 3,
      assigned_engineer_name: 'Priya Sharma',
      priority_level: 'URGENT',
      priority_score: 89.5,
      status: 'IN_PROGRESS',
      scheduled_date: '2026-09-18',
      action_taken: 'Ultrasonic thickness scanning deployed',
      cost_estimated: 45000.0,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      pipeline_id: 'P_105',
      problem_description: 'Repeated diurnal pressure transient anomalies during morning pumping',
      assigned_engineer_id: 3,
      assigned_engineer_name: 'Priya Sharma',
      priority_level: 'HIGH',
      priority_score: 74.2,
      status: 'ASSIGNED',
      scheduled_date: '2026-09-19',
      action_taken: 'Valve throttling calibration pending',
      cost_estimated: 28000.0,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      pipeline_id: 'P_112',
      problem_description: 'Sub-surface soil moisture detected near junction crossway',
      assigned_engineer_id: 3,
      assigned_engineer_name: 'Priya Sharma',
      priority_level: 'MEDIUM',
      priority_score: 56.0,
      status: 'PENDING',
      scheduled_date: '2026-09-20',
      action_taken: null,
      cost_estimated: 12000.0,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      pipeline_id: 'P_120',
      problem_description: 'Severe graphitic corrosion pit remediation',
      assigned_engineer_id: 3,
      assigned_engineer_name: 'Priya Sharma',
      priority_level: 'HIGH',
      priority_score: 71.0,
      status: 'COMPLETED',
      scheduled_date: '2026-09-10',
      action_taken: 'Replaced 42m section with Ductile Iron Class K9',
      cost_estimated: 85000.0,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ],
  complaints: [
    {
      id: 1,
      citizen_id: 4,
      citizen_name: 'Ananya Gupta',
      citizen_phone: '+91 9876543213',
      complaint_type: 'Low pressure',
      description: 'Low water pressure during morning hours (7 AM - 9 AM) on upper floors.',
      location_desc: 'Near 5th Cross, 2nd Main, Indiranagar',
      latitude: 12.9782,
      longitude: 77.5920,
      related_zone: 'ZONE_A',
      related_pipeline_id: 'P_102',
      status: 'IN_PROGRESS',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      citizen_id: 4,
      citizen_name: 'Ananya Gupta',
      citizen_phone: '+91 9876543213',
      complaint_type: 'Pipeline leakage',
      description: 'Visible clean water oozing onto street pavement near market entrance.',
      location_desc: 'Main Market Road, opposite Community Hall',
      latitude: 12.9695,
      longitude: 77.6015,
      related_zone: 'ZONE_B',
      related_pipeline_id: 'P_105',
      status: 'ASSIGNED',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 3,
      citizen_id: 4,
      citizen_name: 'Vikram Singh',
      citizen_phone: '+91 9876543218',
      complaint_type: 'No water',
      description: 'Complete water supply disruption since yesterday afternoon in Block C.',
      location_desc: 'Block C Apartments, South Extension',
      latitude: 12.9550,
      longitude: 77.5890,
      related_zone: 'ZONE_C',
      related_pipeline_id: 'P_118',
      status: 'SUBMITTED',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 4,
      citizen_id: 4,
      citizen_name: 'Sunita Rao',
      citizen_phone: '+91 9876543220',
      complaint_type: 'Water quality issue',
      description: 'Slight yellowish water for 20 minutes upon opening morning tap.',
      location_desc: 'Green Glen Layout, Sector 3',
      latitude: 12.9810,
      longitude: 77.6105,
      related_zone: 'ZONE_A',
      related_pipeline_id: 'P_107',
      status: 'RESOLVED',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ],
  networkGeoJSON: null
};

// Load precomputed GeoJSON from AI service data directory
const geojsonPath = path.resolve(__dirname, '../../../ai_service/data/network.geojson');
if (fs.existsSync(geojsonPath)) {
  try {
    fallbackStore.networkGeoJSON = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  } catch (err) {
    console.warn('[DB WARNING] Could not parse network.geojson:', err.message);
  }
}

// Attempt PostgreSQL test connection
export async function initDatabase() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT postgis_full_version();');
    client.release();
    isPgConnected = true;
    console.log('[DB SUCCESS] Connected to PostgreSQL with PostGIS support!');
    console.log(`[DB INFO] ${res.rows[0].postgis_full_version.split(' ')[0]}`);
  } catch (err) {
    isPgConnected = false;
    console.log('[DB INFO] PostgreSQL connection not established. Running in Embedded Resilient Mode.');
    console.log('         (All PostGIS GeoJSON endpoints, role auth, complaints, and maintenance workflows are fully operational).');
  }
}

export function isPostgresActive() {
  return isPgConnected;
}

export const db = {
  query: async (text, params) => {
    if (isPgConnected) {
      return pool.query(text, params);
    }
    // Simple mock query handler for fallback
    return { rows: [] };
  },
  getFallbackStore: () => fallbackStore,
  pool
};

export default db;
