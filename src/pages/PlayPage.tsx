import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import * as tf from '@tensorflow/tfjs';
import { useToast } from "@/hooks/use-toast";
import { useGameLogic } from '@/hooks/useGameLogic';
import { PlayPageHeader } from '@/components/PlayPageHeader';
import PlayPageContent from '@/components/PlayPageContent';
import SpeedControl from '@/components/SpeedControl';
import { useGameInterval } from '@/hooks/useGameInterval';
import { loadModelFiles } from '@/utils/modelLoader';
import { loadModelWithWeights, saveModelWithWeights } from '@/utils/modelUtils';
import { setupPeriodicRetraining } from '@/utils/dataManagement/weightedTraining';
import { Progress } from "@/components/ui/progress";
import { systemLogger } from '@/utils/logging/systemLogger';

const PlayPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1000);
  const [csvData, setCsvData] = useState<number[][]>([]);
  const [csvDates, setCsvDates] = useState<Date[]>([]);
  const [trainedModel, setTrainedModel] = useState<tf.LayersModel | null>(null);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const gameLogic = useGameLogic(csvData, trainedModel);

  useEffect(() => {
    const handleError = (error: Error) => {
      setIsPlaying(false);
      setIsProcessing(false);
      toast({
        title: "Erro no Sistema",
        description: error.message,
        variant: "destructive"
      });
    };

    systemLogger.setErrorHandler(handleError);
  }, [toast]);

  useGameInterval(
    isPlaying && !isProcessing && isInitialized,
    gameSpeed,
    gameLogic.gameLoop,
    () => {
      setIsPlaying(false);
      toast({
        title: "Fim do Jogo",
        description: "Todos os concursos foram processados",
      });
    }
  );

  const loadCSV = useCallback(async (file: File) => {
    try {
      setIsInitialized(false);
      const text = await file.text();
      const lines = text.trim().split('\n').slice(1);
      const data = lines.map(line => {
        const values = line.split(',');
        return {
          concurso: parseInt(values[0], 10),
          data: new Date(values[1].split('/').reverse().join('-')),
          bolas: values.slice(2).map(Number)
        };
      });
      setCsvData(data.map(d => d.bolas));
      setCsvDates(data.map(d => d.data));
      systemLogger.log("action", "CSV carregado e processado com sucesso!");
      systemLogger.log("action", `Número de registros carregados: ${data.length}`);
      setIsInitialized(true);
    } catch (error) {
      systemLogger.log("action", `Erro ao carregar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, {}, 'error');
      setIsInitialized(false);
    }
  }, []);

  const loadModel = useCallback(async (jsonFile: File, weightsFile: File, metadataFile: File, weightSpecsFile: File) => {
    try {
      setIsInitialized(false);
      const { model, metadata } = await loadModelFiles(jsonFile, weightsFile, metadataFile, weightSpecsFile);
      setTrainedModel(model);
      await saveModelWithWeights(model);
      systemLogger.log("action", "Modelo e metadata carregados com sucesso!");
      if (metadata.playersData) {
        gameLogic.initializePlayers();
      }
      toast({
        title: "Modelo Carregado",
        description: "O modelo e seus metadados foram carregados com sucesso.",
      });
      setIsInitialized(true);
    } catch (error) {
      systemLogger.log("action", `Erro ao carregar o modelo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, {}, 'error');
      console.error("Detalhes do erro:", error);
      toast({
        title: "Erro ao Carregar Modelo",
        description: "Certifique-se de selecionar os três arquivos necessários: model.json, weights.bin e metadata.json",
        variant: "destructive",
      });
      setIsInitialized(false);
    }
  }, [gameLogic, toast]);

  const saveModel = useCallback(async () => {
    if (trainedModel) {
      try {
        await saveModelWithWeights(trainedModel);
        systemLogger.log("action", "Modelo salvo com sucesso!");
        toast({
          title: "Modelo Salvo",
          description: "O modelo atual foi salvo com sucesso.",
        });
      } catch (error) {
        systemLogger.log("action", `Erro ao salvar o modelo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, {}, 'error');
        console.error("Detalhes do erro:", error);
        toast({
          title: "Erro ao Salvar Modelo",
          description: "Ocorreu um erro ao salvar o modelo. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
      }
    } else {
      systemLogger.log("action", "Nenhum modelo para salvar.", {}, 'warning');
      toast({
        title: "Nenhum Modelo",
        description: "Não há nenhum modelo carregado para salvar.",
        variant: "destructive",
      });
    }
  }, [trainedModel, toast]);

  const handlePlay = () => {
    if (!isInitialized) {
      toast({
        title: "Sistema não Inicializado",
        description: "Por favor, carregue o CSV e o modelo antes de iniciar.",
        variant: "destructive"
      });
      return;
    }
    setIsPlaying(true);
  };

  return (
    <div className="p-6">
      <PlayPageHeader />
      <SpeedControl onSpeedChange={setGameSpeed} />
      <PlayPageContent
        isPlaying={isPlaying && !isProcessing}
        onPlay={handlePlay}
        onPause={() => setIsPlaying(false)}
        onReset={() => {
          setIsPlaying(false);
          gameLogic.initializePlayers();
          systemLogger.log("action", "Jogo reiniciado - Estado inicial restaurado");
        }}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onCsvUpload={loadCSV}
        onModelUpload={loadModel}
        onSaveModel={saveModel}
        progress={progress}
        generation={gameLogic.generation}
        gameLogic={gameLogic}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default PlayPage;