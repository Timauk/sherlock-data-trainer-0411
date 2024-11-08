import React from 'react';
import BoardDisplay from './BoardDisplay';
import PlayerList from './PlayerList';
import EvolutionChart from './EvolutionChart';
import GeneticEvolutionChart from './GeneticEvolutionChart';
import TotalScoreChart from './TotalScoreChart';
import { Player } from '@/types/gameTypes';

interface GameBoardProps {
  boardNumbers: number[];
  concursoNumber: number;
  players: Player[];
  evolutionData: Array<{
    generation: number;
    playerId: number;
    score: number;
    fitness: number;
  }>;
  onUpdatePlayer?: (playerId: number, newWeights: number[]) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  boardNumbers, 
  concursoNumber, 
  players, 
  evolutionData = [],
  onUpdatePlayer
}) => {
  // Processar dados para o gráfico de evolução genética
  const processedEvolutionData = evolutionData.reduce((acc, curr) => {
    const generation = curr.generation;
    const player = players.find(p => p.id === curr.playerId);
    
    if (!player) return acc;

    const existingGen = acc.find(d => d.generation === generation);
    if (!existingGen) {
      const nicheData = {
        'Pares': { avgFitness: 0, population: 0 },
        'Ímpares': { avgFitness: 0, population: 0 },
        'Sequências': { avgFitness: 0, population: 0 },
        'Geral': { avgFitness: 0, population: 0 }
      };
      acc.push({ generation, nicheData });
    }

    const genData = acc.find(d => d.generation === generation)!;
    const nicheKey = ['Pares', 'Ímpares', 'Sequências', 'Geral'][player.niche];
    genData.nicheData[nicheKey].avgFitness += curr.fitness;
    genData.nicheData[nicheKey].population += 1;

    return acc;
  }, [] as Array<{
    generation: number;
    nicheData: {
      [key: string]: {
        avgFitness: number;
        population: number;
      };
    };
  }>);

  // Calcular médias
  processedEvolutionData.forEach(gen => {
    Object.values(gen.nicheData).forEach(data => {
      if (data.population > 0) {
        data.avgFitness = data.avgFitness / data.population;
      }
    });
  });

  // Calcular pontuação total por jogo
  const totalScoreData = evolutionData.reduce((acc, curr) => {
    const existingGame = acc.find(d => d.gameNumber === curr.generation);
    if (existingGame) {
      existingGame.totalScore += curr.score;
    } else {
      acc.push({ gameNumber: curr.generation, totalScore: curr.score });
    }
    return acc;
  }, [] as Array<{ gameNumber: number; totalScore: number }>);

  return (
    <div className="space-y-4">
      <BoardDisplay 
        numbers={boardNumbers} 
        concursoNumber={concursoNumber} 
      />
      <PlayerList 
        players={players} 
        onUpdatePlayer={onUpdatePlayer} 
      />
      <EvolutionChart data={evolutionData} />
      <GeneticEvolutionChart evolutionData={processedEvolutionData} />
      <TotalScoreChart scoreData={totalScoreData} />
    </div>
  );
};

export default GameBoard;