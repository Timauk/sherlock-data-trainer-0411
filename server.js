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
import { modelRouter } from './routes/model.js';
import { checkpointRouter } from './routes/checkpoint.js';
import { statusRouter } from './routes/status.js';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`Primary ${process.pid} is running`);
  logger.info(`Starting ${numCPUs} workers...`);

  // Fork workers
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
  const PORT = 3001;

  // Cache configuration
  const gameCache = new NodeCache({ 
    stdTTL: 0,
    checkperiod: 0,
    useClones: false
  });

  // Configure middleware
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
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
  app.use('/api/model', modelRouter);
  app.use('/api/checkpoint', checkpointRouter);
  app.use('/api/status', statusRouter);

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

  app.options('*', cors());

  app.listen(PORT, () => {
    logger.info(`Worker ${process.pid} started and listening on port ${PORT}`);
  });
}