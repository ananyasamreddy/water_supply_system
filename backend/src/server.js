import app from './app.js';
import { initDatabase } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Initialize Database connection (PostgreSQL/PostGIS check)
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`=============================================================`);
    console.log(`  Smart Water Supply Network Monitoring Backend Active`);
    console.log(`  Server listening on: http://localhost:${PORT}`);
    console.log(`  API Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`=============================================================`);
  });
}

startServer();
