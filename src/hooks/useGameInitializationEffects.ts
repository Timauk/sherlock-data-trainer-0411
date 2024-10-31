import { useEffect } from 'react';

export const useGameInitializationEffects = (
  initializePlayers: () => void,
  csvData: number[][],
  setUpdateInterval: (interval: number) => void
) => {
  useEffect(() => {
    initializePlayers();
  }, [initializePlayers]);

  useEffect(() => {
    setUpdateInterval(Math.max(10, Math.floor(csvData.length / 10)));
  }, [csvData, setUpdateInterval]);
};