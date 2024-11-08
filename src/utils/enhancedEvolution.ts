import { Player } from '../types/gameTypes';

export const calculateFitness = (player: Player, boardNumbers: number[]): number => {
  if (!Array.isArray(player.predictions) || !Array.isArray(boardNumbers)) {
    return 0;
  }

  const matches = player.predictions.reduce((acc, prediction) => {
    if (Array.isArray(prediction)) {
      const matchingNumbers = prediction.filter((num): num is number => 
        typeof num === 'number' && boardNumbers.includes(num)
      );
      return acc + matchingNumbers.length;
    }
    return acc;
  }, 0);
  
  const consistencyBonus = calculateConsistencyBonus(player);
  const adaptabilityScore = calculateAdaptabilityScore(player);
  const nicheBonus = calculateNicheBonus(player, boardNumbers);
  
  return (matches * 2) + (consistencyBonus * 0.3) + 
         (adaptabilityScore * 0.2) + (nicheBonus * 1.5);
};

const calculateConsistencyBonus = (player: Player): number => {
  if (!Array.isArray(player.predictions) || player.predictions.length < 2) return 0;
  
  let consistentPredictions = 0;
  for (let i = 1; i < player.predictions.length; i++) {
    const prev = player.predictions[i - 1];
    const curr = player.predictions[i];
    
    if (Array.isArray(prev) && Array.isArray(curr)) {
      const intersection = prev.filter(num => 
        typeof num === 'number' && curr.includes(num)
      );
      if (intersection.length >= 10) consistentPredictions++;
    }
  }
  
  return (consistentPredictions / Math.max(1, player.predictions.length - 1)) * 5;
};

const calculateAdaptabilityScore = (player: Player): number => {
  if (!Array.isArray(player.predictions) || player.predictions.length < 5) return 0;
  
  const recentPredictions = player.predictions.slice(-5);
  if (!recentPredictions.every(Array.isArray)) return 0;
  
  const uniqueNumbers = new Set(recentPredictions.flat());
  return (uniqueNumbers.size / (25 * 0.6)) * 5;
};

const calculateNicheBonus = (player: Player, boardNumbers: number[]): number => {
  if (!Array.isArray(boardNumbers)) return 0;
  
  switch (player.niche) {
    case 0: // Pares
      return boardNumbers.filter(n => n % 2 === 0).length * 0.5;
    case 1: // Ímpares
      return boardNumbers.filter(n => n % 2 !== 0).length * 0.5;
    case 2: // Sequências
      return findSequences(boardNumbers) * 1.2;
    case 3: // Geral
      return 0.3;
    default:
      return 0;
  }
};

const findSequences = (numbers: number[]): number => {
  if (!Array.isArray(numbers)) return 0;
  
  let sequences = 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  
  for (let i = 0; i < sorted.length - 2; i++) {
    if (sorted[i + 1] === sorted[i] + 1 && sorted[i + 2] === sorted[i] + 2) {
      sequences++;
    }
  }
  
  return sequences;
};

export const createMutatedClone = (player: Player, mutationRate: number = 0.1): Player => {
  const adaptiveMutationRate = mutationRate * (1 + (player.age / 50));
  
  const mutatedWeights = player.weights.map(weight => {
    if (Math.random() < adaptiveMutationRate) {
      const mutation = (Math.random() - 0.5) * 0.1;
      return Math.max(0, Math.min(1, weight * (1 + mutation)));
    }
    return weight;
  });

  return {
    ...player,
    id: Math.random(),
    score: 0,
    predictions: [],
    weights: mutatedWeights,
    fitness: 0,
    generation: player.generation + 1,
    age: 0,
    niche: Math.random() < 0.9 ? player.niche : Math.floor(Math.random() * 4)
  };
};

export const crossoverPlayers = (parent1: Player, parent2: Player): Player => {
  const childWeights = parent1.weights.map((weight, index) => {
    const useParent1 = Math.random() < (0.5 + (parent1.fitness > parent2.fitness ? 0.2 : -0.2));
    return useParent1 ? weight : parent2.weights[index];
  });

  const preferredNiche = parent1.fitness > parent2.fitness ? 
    parent1.niche : parent2.niche;

  return {
    id: Math.random(),
    score: 0,
    predictions: [],
    weights: childWeights,
    fitness: 0,
    generation: Math.max(parent1.generation, parent2.generation) + 1,
    age: 0,
    niche: Math.random() < 0.8 ? preferredNiche : Math.floor(Math.random() * 4)
  };
};