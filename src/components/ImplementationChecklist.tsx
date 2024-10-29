import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ChecklistItem {
  title: string;
  items: {
    task: string;
    completed: boolean;
    inProgress?: boolean;
  }[];
}

const implementationChecklist: ChecklistItem[] = [
  {
    title: "Fase 1: Alta Prioridade - Gestão de Dados e IA",
    items: [
      { task: "Implementar sumarização de dados históricos", completed: true },
      { task: "Criar sistema de ponderação para dados históricos", completed: true },
      { task: "Implementar retreinamento periódico do modelo", completed: true },
      { task: "Adicionar threads de trabalho para cálculos pesados", completed: true },
      { task: "Implementar ensemble learning com modelos especializados", completed: true },
      { task: "Configurar monitoramento de desempenho básico", completed: false }
    ]
  },
  {
    title: "Fase 2: Otimização de Performance",
    items: [
      { task: "Implementar processamento em lote para previsões", completed: false },
      { task: "Configurar cache do lado do servidor", completed: false },
      { task: "Implementar compressão de dados históricos", completed: false },
      { task: "Otimizar E/S de disco para checkpoints", completed: false }
    ]
  },
  {
    title: "Fase 3: Modelos Especializados",
    items: [
      { task: "Modelo para padrões sazonais", completed: true },
      { task: "Modelo para análise de frequência", completed: true },
      { task: "Modelo para correlações lunares", completed: true },
      { task: "Modelo para padrões sequenciais", completed: true }
    ]
  },
  {
    title: "Fase 4: Validação e Qualidade",
    items: [
      { task: "Implementar validação cruzada", completed: false },
      { task: "Adicionar sistema de pontuação de confiança", completed: false },
      { task: "Criar ciclos de feedback para previsões", completed: false },
      { task: "Implementar tracking de precisão temporal", completed: false }
    ]
  },
  {
    title: "Fase 5: Análise Avançada",
    items: [
      { task: "Melhorar reconhecimento de padrões", completed: false },
      { task: "Implementar análise de correlação avançada", completed: false },
      { task: "Adicionar modelagem estatística avançada", completed: false },
      { task: "Implementar análise de tendências históricas", completed: false }
    ]
  },
  {
    title: "Fase 6: Experiência do Usuário",
    items: [
      { task: "Melhorar indicadores de progresso", completed: false },
      { task: "Adicionar feedback em tempo real", completed: false },
      { task: "Implementar visualizações avançadas", completed: false },
      { task: "Otimizar performance da UI", completed: false }
    ]
  },
  {
    title: "Fase 7: Monitoramento",
    items: [
      { task: "Implementar métricas de desempenho do modelo", completed: false },
      { task: "Adicionar tracking de taxa de aprendizagem", completed: false },
      { task: "Configurar monitoramento de recursos", completed: false },
      { task: "Implementar tracking de erros", completed: false }
    ]
  },
  {
    title: "Fase 8: Qualidade de Dados",
    items: [
      { task: "Implementar validação de dados", completed: false },
      { task: "Adicionar detecção de outliers", completed: false },
      { task: "Implementar redução de ruído", completed: false },
      { task: "Criar análise de importância de features", completed: false }
    ]
  },
  {
    title: "Fase 9: Longo Prazo",
    items: [
      { task: "Migrar para arquitetura de microsserviços", completed: false },
      { task: "Implementar processamento distribuído", completed: false },
      { task: "Otimizar uso de recursos do sistema", completed: false },
      { task: "Melhorar ciclos de feedback", completed: false }
    ]
  }
];

const ImplementationChecklist = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Checklist de Implementação</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <Accordion type="single" collapsible className="w-full">
            {implementationChecklist.map((phase, phaseIndex) => {
              const completedTasks = phase.items.filter(item => item.completed).length;
              const progress = Math.round((completedTasks / phase.items.length) * 100);
              
              return (
                <AccordionItem key={phaseIndex} value={`phase-${phaseIndex}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col items-start">
                      <span>{phase.title}</span>
                      <span className="text-sm text-muted-foreground">
                        Progresso: {progress}% ({completedTasks}/{phase.items.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {phase.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-2">
                          <Checkbox
                            id={`task-${phaseIndex}-${itemIndex}`}
                            checked={item.completed}
                            disabled
                          />
                          <label
                            htmlFor={`task-${phaseIndex}-${itemIndex}`}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                              item.completed ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {item.task}
                          </label>
                          {item.inProgress && (
                            <span className="text-xs bg-yellow-200 dark:bg-yellow-900 px-2 py-1 rounded">
                              Em progresso
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ImplementationChecklist;