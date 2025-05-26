export type BenchmarkEntry = {
  modelId: string;
  modelName: string;
  provider: string;
  tokensPerSecond: number;
  timeToFirstToken: number;
  totalTime: number;
  timestamp: number;
}; 