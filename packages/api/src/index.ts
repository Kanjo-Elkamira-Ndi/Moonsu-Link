import { env } from './config/env';
import { testConnection } from './db/pool';
import { createApp } from './app';

async function main() {
  await testConnection();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`🚀 MoonsuLink API running on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`   OpenAI: ${env.OPENAI_ENABLED ? '✅ enabled' : '⚪ disabled'}`);
    console.log(`   WhatsApp: ${env.UNIPILE_ENABLED ? '✅ enabled via Unipile' : '⚪ disabled'}`);
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
