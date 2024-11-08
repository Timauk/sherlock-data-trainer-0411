import { useState, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useToast } from "@/components/ui/use-toast";
import { useGameInitialization } from './useGameInitialization';
import { useGameLoop } from './useGameLoop';
import { useEvolutionLogic } from './useEvolutionLogic';
import { ModelVisualization, Player } from '@/types/gameTypes';
import { systemLogger } from '@/utils/logging/systemLogger';
import { cloneChampion } from '@/utils/playerEvolution';

export const useGameLogic = (csvData: number[][], trainedModel: tf.LayersModel | null) => {
  const { toast } = useToast();
  const { players, setPlayers, initializePlayers } = useGameInitialization();
  const [generation, setGeneration] = useState(1);
  const [gameCount, setGameCount] = useState(0);
  const [championData, setChampionData] = useState<{
    player: Player;
    trainingData: number[][];
  }>();
  const [evolutionData, setEvolutionData] = useState<Array<{
    generation: number;
    playerId: number;
    score: number;
    fitness: number;
  }>>([]);
  const [neuralNetworkVisualization, setNeuralNetworkVisualization] = useState<ModelVisualization | null>(null);
  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 0,
    randomAccuracy: 0,
    totalPredictions: 0,
  });
  const [dates, setDates] = useState<Date[]>([]);
  const [numbers, setNumbers] = useState<number[][]>([]);
  const [frequencyData, setFrequencyData] = useState<{ [key: string]: number[] }>({});
  const [updateInterval, setUpdateInterval] = useState(10);
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);
  const [concursoNumber, setConcursoNumber] = useState(0);
  const [trainingData, setTrainingData] = useState<number[][]>([]);
  const [boardNumbers, setBoardNumbers] = useState<number[]>([]);
  const [isManualMode, setIsManualMode] = useState(false);

  const addLog = useCallback((message: string, matches?: number) => {
    const logType = matches ? 'prediction' : 'action';
    systemLogger.log(logType, message, { matches });
  }, []);

  const gameLoop = useGameLoop(
    players,
    setPlayers,
    csvData,
    trainedModel,
    concursoNumber,
    setEvolutionData,
    generation,
    addLog,
    updateInterval,
    trainingData,
    setTrainingData,
    setNumbers,
    setDates,
    setNeuralNetworkVisualization,
    setBoardNumbers,
    setModelMetrics,
    setConcursoNumber,
    setGameCount,
    (title, description) => toast({ title, description })
  );

  const evolveGeneration = useEvolutionLogic(
    players,
    setPlayers,
    generation,
    setGeneration,
    setEvolutionData,
    trainedModel,
    trainingData,
    csvData,
    concursoNumber,
    championData,
    setChampionData
  );

  const updateFrequencyData = useCallback((newFrequencyData: { [key: string]: number[] }) => {
    setFrequencyData(newFrequencyData);
    
    if (trainedModel && players.length > 0) {
      const frequencyFeatures = Object.values(newFrequencyData).flat();
      setTrainingData(prev => {
        const lastEntry = prev[prev.length - 1];
        if (lastEntry) {
          return [...prev.slice(0, -1), [...lastEntry, ...frequencyFeatures]];
        }
        return prev;
      });
    }
  }, [trainedModel, players]);

  const toggleManualMode = useCallback(() => {
    setIsManualMode(prev => {
      const newMode = !prev;
      systemLogger.log('action', newMode ? 
        "Modo Manual Ativado - Clonagem automática desativada" : 
        "Modo Manual Desativado - Clonagem automática reativada"
      );
      return newMode;
    });
  }, []);

  const clonePlayer = useCallback((player: Player) => {
    const clones = cloneChampion(player, 1);
    setPlayers(prevPlayers => [...prevPlayers, ...clones]);
    systemLogger.log('player', `Novo clone do Jogador #${player.id} criado`);
  }, []);

  useEffect(() => {
    initializePlayers();
  }, [initializePlayers]);

  useEffect(() => {
    setUpdateInterval(Math.max(10, Math.floor(csvData.length / 10)));
  }, [csvData]);

  return {
    players,
    generation,
    evolutionData,
    neuralNetworkVisualization,
    modelMetrics,
    initializePlayers,
    gameLoop,
    evolveGeneration,
    addLog,
    toggleInfiniteMode: useCallback(() => setIsInfiniteMode(prev => !prev), []),
    dates,
    numbers,
    updateFrequencyData,
    isInfiniteMode,
    boardNumbers,
    concursoNumber,
    trainedModel,
    gameCount,
    isManualMode,
    toggleManualMode,
    clonePlayer
  };
};

