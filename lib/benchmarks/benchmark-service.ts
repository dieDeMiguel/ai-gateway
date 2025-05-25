import { gateway } from '@/lib/gateway';

export interface BenchmarkResult {
  modelId: string;
  tokensPerSecond: number;
  timeToFirstToken: number;
  totalTime: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timestamp: Date;
}

// Cache to store benchmark results
const benchmarkCache = new Map<string, BenchmarkResult>();

/**
 * Benchmark a model by measuring token generation speed
 * 
 * @param modelId The model ID to benchmark
 * @param prompt The prompt to use for benchmarking (longer prompts provide more accurate results)
 * @param maxTokens The maximum number of tokens to generate
 * @returns Benchmark results including tokens per second
 */
export async function benchmarkModel(
  modelId: string,
  prompt: string = "Explain the theory of relativity in detail, covering both special and general relativity, their implications, and experimental verifications.",
  maxTokens: number = 500
): Promise<BenchmarkResult> {
  try {
    // Check if we have a recent cached result
    const cachedResult = benchmarkCache.get(modelId);
    if (cachedResult && Date.now() - cachedResult.timestamp.getTime() < 3600000) { // 1 hour cache
      return cachedResult;
    }

    console.log(`Benchmarking model ${modelId}...`);

    // Start timing
    const startTime = performance.now();
    
    // Make the API call
    // Here we use the gateway API - the exact implementation will depend on how your gateway is configured
    const [provider, model] = modelId.split('/');
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate text: ${response.statusText}`);
    }

    const data = await response.json();

    // End timing
    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds
    
    // Extract token usage information from the response
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    const totalTokens = data.usage?.total_tokens || 0;
    
    // Calculate tokens per second (focusing on generation speed)
    const tokensPerSecond = completionTokens > 0 ? completionTokens / totalTime : 0;
    
    // Estimate time to first token (typically 10-20% of total time for first token)
    // In a real benchmark, this would be measured precisely
    const timeToFirstToken = totalTime * 0.15;
    
    const result: BenchmarkResult = {
      modelId,
      tokensPerSecond,
      timeToFirstToken,
      totalTime,
      promptTokens,
      completionTokens,
      totalTokens,
      timestamp: new Date()
    };
    
    // Cache the result
    benchmarkCache.set(modelId, result);
    
    return result;
  } catch (error) {
    console.error(`Error benchmarking model ${modelId}:`, error);
    throw error;
  }
}

/**
 * Benchmark multiple models in parallel
 * 
 * @param modelIds Array of model IDs to benchmark
 * @param prompt The prompt to use for benchmarking
 * @param maxTokens The maximum number of tokens to generate
 * @returns Map of model IDs to benchmark results
 */
export async function benchmarkModels(
  modelIds: string[],
  prompt?: string,
  maxTokens?: number
): Promise<Map<string, BenchmarkResult>> {
  const results = new Map<string, BenchmarkResult>();
  
  // Run benchmarks in parallel
  const benchmarkPromises = modelIds.map(async (modelId) => {
    try {
      const result = await benchmarkModel(modelId, prompt, maxTokens);
      results.set(modelId, result);
    } catch (error) {
      console.error(`Failed to benchmark ${modelId}:`, error);
    }
  });
  
  await Promise.all(benchmarkPromises);
  
  return results;
}

/**
 * Retrieve cached benchmark results for all models
 * @returns Map of model IDs to benchmark results
 */
export function getCachedBenchmarkResults(): Map<string, BenchmarkResult> {
  return new Map(benchmarkCache);
} 