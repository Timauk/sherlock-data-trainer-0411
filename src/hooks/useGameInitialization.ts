import { useState, useCallback } from 'react';
import { Player } from '@/types/gameTypes';
import { TOTAL_PLAYERS, INITIAL_WEIGHTS_LENGTH } from '@/constants/gameConstants';

export const useGameInitialization = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  const initializePlayers = useCallback(() => {
    const newPlayers = Array.from({ length: TOTAL_PLAYERS }, (_, i) => ({
      id: i + 1,
      score: 0,
      predictions: [],
      weights: Array.from({ length: INITIAL_WEIGHTS_LENGTH }, () => Math.floor(Math.random() * 1001)),
      fitness: 0,
      generation: 1
    }));

    // Garantir que o jogador 11 tenha pesos otimizados e seja especial
    const player11 = newPlayers.find(p => p.id === 11);
    if (player11) {
      player11.weights = player11.weights.map(() => 
        Math.floor(Math.random() * 1001) + 500 // Valores mais altos para melhor performance
      );
    }

    setPlayers(newPlayers);
  }, []);

  return {
    players,
    setPlayers,
    initializePlayers
  };
};