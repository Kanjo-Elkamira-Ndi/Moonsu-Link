import 'dotenv/config';
import app from './app';
import { config } from './config/env';
import { pool } from './db/pool';

const PORT = config.API_PORT;

async function start() {
  try {
    // Verify DB connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 AgriBridge API running on port ${PORT}`);
      console.log(`   Environment: ${config.NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
