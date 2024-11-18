import * as tf from '@tensorflow/tfjs';
import { systemLogger } from '../logging/systemLogger';

interface SpecializedModelConfig {
  type: 'pairs' | 'odds' | 'sequences' | 'primes' | 'fibonacci' | 'lunar';
  inputShape: number[];
  layers: number[];
}

interface TrainingOptions {
  epochs?: number;
  batchSize?: number;
}

class SuperSpecializedModel {
  private model: tf.LayersModel;
  private type: string;
  private metrics: {
    accuracy: number;
    predictions: number;
    successRate: number;
  };

  constructor(config: SpecializedModelConfig) {
    this.type = config.type;
    this.model = this.buildModel(config);
    this.metrics = {
      accuracy: 0,
      predictions: 0,
      successRate: 0
    };
  }

  private buildModel(config: SpecializedModelConfig): tf.LayersModel {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      units: config.layers[0],
      activation: 'relu',
      inputShape: [17]
    }));

    for (let i = 1; i < config.layers.length; i++) {
      model.add(tf.layers.dense({
        units: config.layers[i],
        activation: 'relu'
      }));
      
      if (i < config.layers.length - 1 && i % 2 === 0) {
        model.add(tf.layers.dropout({ rate: 0.2 }));
      }
    }

    model.add(tf.layers.dense({
      units: 15,
      activation: 'sigmoid'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async train(data: number[][], options: TrainingOptions = {}): Promise<void> {
    const xs = tf.tensor2d(data);
    const ys = tf.tensor2d(data);

    try {
      await this.model.fit(xs, ys, {
        epochs: options.epochs || 50,
        batchSize: options.batchSize || 32,
        validationSplit: 0.2,
        callbacks: [
          tf.callbacks.earlyStopping({
            monitor: 'val_loss',
            patience: 5,
            restoreBestWeights: true
          }),
          {
            onEpochEnd: (epoch, logs) => {
              if (logs) {
                this.metrics.accuracy = logs.acc;
              }
            }
          }
        ]
      });
    } finally {
      xs.dispose();
      ys.dispose();
    }
  }

  async predict(input: number[]): Promise<number[]> {
    return tf.tidy(() => {
      // Prepare input data to match expected shape [null,17]
      const normalizedInput = this.prepareInput(input);
      const inputTensor = tf.tensor2d([normalizedInput]);
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      return Array.from(prediction.dataSync());
    });
  }

  private prepareInput(input: number[]): number[] {
    // Ensure input has length 17 by adding required features
    if (input.length === 15) {
      // Add two additional features (e.g., timestamp and generation number)
      const timestamp = Date.now() / (1000 * 60 * 60 * 24); // Normalized timestamp
      const generation = 0; // Default generation number
      return [...input, timestamp, generation];
    } else if (input.length === 17) {
      return input;
    } else {
      throw new Error(`Invalid input length: ${input.length}. Expected 15 or 17.`);
    }
  }

  getMetrics() {
    return this.metrics;
  }
}

export const createSpecializedModels = () => {
  const models = {
    pairs: new SuperSpecializedModel({
      type: 'pairs',
      inputShape: [17],
      layers: [64, 32, 16]
    }),
    odds: new SuperSpecializedModel({
      type: 'odds',
      inputShape: [17],
      layers: [64, 32, 16]
    }),
    sequences: new SuperSpecializedModel({
      type: 'sequences',
      inputShape: [17],
      layers: [128, 64, 32]
    }),
    primes: new SuperSpecializedModel({
      type: 'primes',
      inputShape: [17],
      layers: [64, 32, 16]
    }),
    fibonacci: new SuperSpecializedModel({
      type: 'fibonacci',
      inputShape: [17],
      layers: [64, 32, 16]
    }),
    lunar: new SuperSpecializedModel({
      type: 'lunar',
      inputShape: [17],
      layers: [64, 32, 16]
    })
  };

  return models;
};