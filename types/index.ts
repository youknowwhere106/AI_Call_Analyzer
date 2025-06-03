export enum INPUT_TYPES {
  PASS_FAIL = 'PASS_FAIL',
  SCORE = 'SCORE'
}

export interface ScoringParameter {
  name: string;
  type: INPUT_TYPES;
  weight: number;
  description: string;
}

export interface AnalysisResult {
  scores: Record<string, number>;
  overallFeedback: string;
  observation: string;
  transcription?: string;
}

export interface AudioFile {
  file: File;
  url: string;
  duration?: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
}
