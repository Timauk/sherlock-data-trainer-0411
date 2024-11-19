import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { LRUCache } from 'lru-cache';
import { logger } from './src/utils/logging/logger.js';
import { cacheMiddleware } from './src/utils/performance/serverCache.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Initialize LRU Cache with options
const cache = new LRUCache({
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 5, // Items live for 5 minutes
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cacheMiddleware);

// Rotas
import { modelRouter } from './routes/model.js';
import { checkpointRouter } from './routes/checkpoint.js';
import { statusRouter } from './routes/status.js';
import { processingRouter } from './routes/model/processing.js';

app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/api/model', modelRouter);
app.use('/api/checkpoint', checkpointRouter);
app.use('/api/status', statusRouter);
app.use('/api/processing', processingRouter);

// Cria as pastas necessárias se não existirem
const checkpointsDir = path.join(__dirname, 'checkpoints');
const logsDir = path.join(__dirname, 'logs');
const savedModelsDir = path.join(__dirname, 'saved-models');

[checkpointsDir, logsDir, savedModelsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuração do TensorFlow.js - Removida a inicialização direta
let tfBackend = null;
try {
  const tf = await import('@tensorflow/tfjs');
  tfBackend = 'cpu';
  logger.info('TensorFlow.js backend configurado para CPU');
} catch (error) {
  logger.warn('TensorFlow.js não pôde ser carregado:', error);
}

// Error handler
app.use((err, req, res, next) => {
  logger.error({
    err,
    method: req.method,
    url: req.url,
    body: req.body
  }, 'Error occurred');
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Gerenciamento de memória
setInterval(() => {
  if (global.gc) {
    global.gc();
  }
}, 300000); // Limpa a cada 5 minutos

app.listen(PORT, () => {
  logger.info(`Servidor rodando em http://localhost:${PORT}`);
  logger.info(`Diretório de checkpoints: ${checkpointsDir}`);
  logger.info(`Diretório de logs: ${logsDir}`);
  logger.info(`Diretório de modelos salvos: ${savedModelsDir}`);
});