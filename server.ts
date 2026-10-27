import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './server/src/config/db';
import { seedDatabase } from './server/src/seed/seedData';
import apiRouter from './server/src/routes/api';
import { errorHandler } from './server/src/middleware/errorHandler';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Connect to MongoDB and seed demo accounts/resources
  try {
    await connectDB();
    await seedDatabase(false);
  } catch (dbErr) {
    console.error('Database initialization error:', dbErr);
  }

  // API router mounted under /api
  app.use('/api', apiRouter);

  // Serve generated local assets from /src/assets
  app.use('/src/assets', express.static(path.join(__dirname, 'src', 'assets')));

  if (!isProd) {
    // In development mode, mount Vite middleware into Express
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development middlewares attached to Express server.');
  } else {
    // In production mode, serve static built files
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static asset middleware attached.');
  }

  // Centralized Error Handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` Academic Event & Resource Booking Portal Server`);
    console.log(` Ready at: http://0.0.0.0:${PORT}`);
    console.log(` API Endpoint: http://0.0.0.0:${PORT}/api`);
    console.log(` Mode: ${isProd ? 'Production' : 'Development'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});
