import React from 'react';
import ProcessingSelector from '../ProcessingSelector';
import GameMetrics from '../GameMetrics';
import ControlPanel from '../GameControls/ControlPanel';
import { Button } from "@/components/ui/button";
import { Save, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ModelUploadProps, GameLogicProps } from '@/types/modelTypes';

interface ProcessingPanelProps extends ModelUploadProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onThemeToggle: () => void;
  onCsvUpload: (file: File) => void;
  onSaveModel: () => void;
  progress: number;
  champion: any;
  modelMetrics: any;
  gameLogic: GameLogicProps;
  isServerProcessing: boolean;
  serverStatus: 'online' | 'offline' | 'checking';
  onToggleProcessing: () => void;
  saveFullModel: () => Promise<void>;
  loadFullModel: () => Promise<void>;
}

const ProcessingPanel: React.FC<ProcessingPanelProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onThemeToggle,
  onCsvUpload,
  onModelUpload,
  onSaveModel,
  progress,
  champion,
  modelMetrics,
  gameLogic,
  isServerProcessing,
  serverStatus,
  onToggleProcessing,
  saveFullModel,
  loadFullModel
}) => {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <ProcessingSelector
        isServerProcessing={isServerProcessing}
        onToggleProcessing={onToggleProcessing}
        serverStatus={serverStatus}
      />
      
      <GameMetrics 
        progress={progress}
        champion={champion}
        modelMetrics={modelMetrics}
      />
      
      <ControlPanel
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onReset={onReset}
        onThemeToggle={onThemeToggle}
        onCsvUpload={onCsvUpload}
        onModelUpload={(jsonFile: File, weightsFile: File, metadataFile: File, weightSpecsFile: File) => {
          onModelUpload(jsonFile, weightsFile, metadataFile, weightSpecsFile);
        }}
        onSaveModel={onSaveModel}
        toggleInfiniteMode={gameLogic.toggleInfiniteMode}
        toggleManualMode={gameLogic.toggleManualMode}
        isInfiniteMode={gameLogic.isInfiniteMode}
        isManualMode={gameLogic.isManualMode}
        disabled={serverStatus === 'checking' || (isServerProcessing && serverStatus === 'offline')}
      />

      <Button
        onClick={saveFullModel}
        className="w-full"
        variant="secondary"
      >
        <Save className="inline-block mr-2" />
        Salvar Modelo Completo
      </Button>

      <Button
        onClick={loadFullModel}
        className="w-full"
        variant="outline"
      >
        <Download className="inline-block mr-2" />
        Carregar Modelo Treinado
      </Button>
    </div>
  );
};

export default ProcessingPanel;