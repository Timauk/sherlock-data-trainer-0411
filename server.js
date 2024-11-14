import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import NodeCache from 'node-cache';
import * as tf from '@tensorflow/tfjs';
import cluster from 'cluster';
import os from 'os';
import { logger } from './src/utils/logging/logger.js';
import { cacheMiddleware } from './src/utils/performance/serverCache.js';
import { statusRouter } from './routes/status.js';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`Primary ${process.pid} is running`);
  logger.info(`Starting ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const app = express();
  const PORT = process.env.PORT || 3001;

  // Cache configuration
  const gameCache = new NodeCache({ 
    stdTTL: 0,
    checkperiod: 0,
    useClones: false
  });

  // Configure middleware with updated CORS settings
  app.use(cors({
    origin: function(origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'https://id-preview--dcc838c0-148c-47bb-abaf-cbdd03ce84f5.lovable.app',
        'https://lovable.dev',
        'https://lovable.app'
      ];
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow all subdomains of lovable.app and lovable.dev
      if (origin.match(/^https:\/\/.*\.lovable\.(app|dev)$/)) {
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(compression());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(cacheMiddleware);

  // Create necessary directories
  const dirs = ['checkpoints', 'logs', 'saved-models'].map(dir => 
    path.join(__dirname, dir)
  );

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Mount routes
  app.use('/status', statusRouter);
  
  // Game routes
  const gameRouter = express.Router();

  gameRouter.post('/store', async (req, res) => {
    try {
      const { concurso, predictions, players } = req.body;
      if (!concurso || !predictions || !players) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const currentGames = gameCache.get('games') || [];
      currentGames.push({
        concurso,
        predictions,
        players,
        timestamp: new Date().toISOString()
      });
      
      gameCache.set('games', currentGames);
      
      res.json({ 
        success: true, 
        gamesStored: currentGames.length 
      });
    } catch (error) {
      logger.error('Error storing game:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  gameRouter.get('/all', async (req, res) => {
    try {
      const games = gameCache.get('games') || [];
      res.json(games);
    } catch (error) {
      logger.error('Error retrieving games:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  app.use('/api/game', gameRouter);

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error({
      err,
      method: req.method,
      url: req.url,
      body: req.body
    }, 'Error occurred');
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message
    });
  });

  app.listen(PORT, () => {
    logger.info(`Worker ${process.pid} started and listening on port ${PORT}`);
  });
}