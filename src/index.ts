import dotenv from "dotenv";
dotenv.config();

import "./cron/keepAlive";
import { testConnection } from './db/pool';
import { createApp } from './app';

async function main() {
  await testConnection();

  const app = createApp();
  app.listen(process.env.PORT, () => {
      console.log(`🚀 MoonsuLink API running on port ${process.env.PORT} [${process.env.NODE_ENV}]`);
      console.log(`   OpenAI: ${process.env.OPENAI_ENABLED ? '✅ enabled' : '⚪ disabled'}`);
  });
}

main().catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
});
