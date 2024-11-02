import * as fs from 'fs';
import path from 'path';
import { FileManager } from './fileManager';
import { logger } from '../../utils/logging/logger.js';

export class StateManager {
  constructor(private fileManager: FileManager) {}

  async saveGameState(checkpointDir: string, data: any) {
    // Estado do jogo básico
    await this.fileManager.writeFile(
      path.join(checkpointDir, 'gameState.json'),
      data.gameState
    );

    // Dados de treinamento intermediários
    await this.fileManager.writeFile(
      path.join(checkpointDir, 'training_data.json'),
      data.gameState.trainingData || []
    );

    // Cache de predições
    await this.fileManager.writeFile(
      path.join(checkpointDir, 'predictions_cache.json'),
      data.gameState.predictionsCache || {}
    );

    // Histórico de evolução completo
    await this.fileManager.writeFile(
      path.join(checkpointDir, 'evolution_history.json'),
      data.gameState.evolutionHistory || []
    );

    // Configurações do ambiente
    await this.fileManager.writeFile(
      path.join(checkpointDir, 'environment_config.json'),
      {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV,
        configurations: data.gameState.environmentConfig || {}
      }
    );

    logger.debug('Estados completos salvos');
  }

  async loadGameState(checkpointDir: string) {
    const gameState = await this.fileManager.readFile(
      path.join(checkpointDir, 'gameState.json')
    );
    if (!gameState) return null;

    // Carregar dados adicionais
    gameState.trainingData = await this.fileManager.readFile(
      path.join(checkpointDir, 'training_data.json')
    ) || [];

    gameState.predictionsCache = await this.fileManager.readFile(
      path.join(checkpointDir, 'predictions_cache.json')
    ) || {};

    gameState.evolutionHistory = await this.fileManager.readFile(
      path.join(checkpointDir, 'evolution_history.json')
    ) || [];

    gameState.environmentConfig = (await this.fileManager.readFile(
      path.join(checkpointDir, 'environment_config.json')
    ))?.configurations || {};

    return gameState;
  }
}