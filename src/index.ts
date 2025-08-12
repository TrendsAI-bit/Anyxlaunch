import 'dotenv/config';
import express from 'express';
import { startMentionStream } from './x/stream';

async function main() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Placeholder connect + callback routes (for future wallet linking)
  app.get('/connect', (req, res) => {
    res.send('Wallet connect placeholder. Add a real connect flow here.');
  });
  app.post('/callback', (req, res) => {
    console.log('Wallet callback payload:', req.body);
    res.json({ ok: true });
  });

  const port = 8789;
  app.listen(port, () => {
    console.log(`Web server listening on http://localhost:${port}`);
  });

  await startMentionStream();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});


