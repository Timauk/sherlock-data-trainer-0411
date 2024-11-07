import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckpointControls from './CheckpointControls';

interface DataUploaderProps {
  onCsvUpload: (file: File) => void;
  onModelUpload: (jsonFile: File, weightsFile: File, metadataFile?: File) => void;
  onSaveModel: () => void;
}

const DataUploader: React.FC<DataUploaderProps> = ({ onCsvUpload, onModelUpload, onSaveModel }) => {
  const jsonFileRef = useRef<HTMLInputElement>(null);
  const weightsFileRef = useRef<HTMLInputElement>(null);
  const metadataFileRef = useRef<HTMLInputElement>(null);
  const [savePath, setSavePath] = React.useState(localStorage.getItem('checkpointPath') || '');
  const { toast } = useToast();

  const handleAutoSave = async () => {
    if (!savePath) {
      toast({
        title: "Erro no Checkpoint",
        description: "Por favor, configure o diretório de salvamento primeiro!",
        variant: "destructive"
      });
      return;
    }

    try {
      const gameState = {
        timestamp: new Date().toISOString(),
        path: savePath
      };

      localStorage.setItem('gameCheckpoint', JSON.stringify(gameState));
      
      toast({
        title: "Checkpoint Salvo",
        description: "Recarregando página para limpar memória...",
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="preparation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preparation">Preparação</TabsTrigger>
          <TabsTrigger value="checkpoint">Checkpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="preparation" className="space-y-4">
          <div>
            <label htmlFor="csvInput" className="block mb-2">Carregar CSV de Jogos:</label>
            <input
              type="file"
              id="csvInput"
              accept=".csv"
              onChange={(e) => e.target.files && onCsvUpload(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label htmlFor="modelJsonInput" className="block mb-2">Carregar Modelo (JSON):</label>
            <input
              type="file"
              id="modelJsonInput"
              accept=".json"
              ref={jsonFileRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label htmlFor="modelWeightsInput" className="block mb-2">Carregar Pesos (bin):</label>
            <input
              type="file"
              id="modelWeightsInput"
              accept=".bin"
              ref={weightsFileRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label htmlFor="modelMetadataInput" className="block mb-2">Carregar Metadata (JSON - Opcional):</label>
            <input
              type="file"
              id="modelMetadataInput"
              accept=".json"
              ref={metadataFileRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <Button onClick={() => {
            const jsonFile = jsonFileRef.current?.files?.[0];
            const weightsFile = weightsFileRef.current?.files?.[0];
            const metadataFile = metadataFileRef.current?.files?.[0];
            
            if (jsonFile && weightsFile) {
              onModelUpload(jsonFile, weightsFile, metadataFile);
            } else {
              toast({
                title: "Arquivos Faltando",
                description: "Por favor, selecione os arquivos model.json e weights.bin",
                variant: "destructive"
              });
            }
          }}>
            <Upload className="mr-2 h-4 w-4" /> Carregar Modelo
          </Button>
        </TabsContent>

        <TabsContent value="checkpoint">
          <CheckpointControls
            savePath={savePath}
            onSavePathChange={setSavePath}
            onAutoSave={handleAutoSave}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataUploader;