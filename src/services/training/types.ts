import { Json } from '@/integrations/supabase/types';
import * as tf from '@tensorflow/tfjs';

export interface TrainingMetadata {
  timestamp: string;
  accuracy: number;
  loss: number;
  epochs: number;
  gamesCount?: number;
  weights?: any;
}

export interface ModelData {
  model_data: Json;
  metadata: Json;
  is_active?: boolean;
}

export interface TrainingResult {
  updated: boolean;
  message: string;
}

export interface ModelExport {
  json: any;
  weights: any[];
}