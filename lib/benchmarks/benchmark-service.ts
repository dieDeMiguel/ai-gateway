import { DisplayModel } from '../display-model';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface BenchmarkResult {
  modelId: string;
  tokensPerSecond: number;
  timeToFirstToken: number;
  totalTime: number;
  timestamp: number;
}

// In-memory cache for benchmark results
const benchmarkCache: Map<string, BenchmarkResult> = new Map();

/**
 * Run a performance benchmark on a specific model
 */
export async function runModelBenchmark(
  modelId: string,
  apiKey?: string
): Promise<BenchmarkResult | null> {
  try {
    // Check if we have a recent benchmark in cache
    const cachedResult = benchmarkCache.get(modelId);
    if (cachedResult && Date.now() - cachedResult.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
      return cachedResult;
    }

    // Extract provider and model name
    const [provider, model] = modelId.split('/');
    
    // Map provider to appropriate API base URL
    const apiBaseUrl = getProviderApiUrl(provider);
    if (!apiBaseUrl) {
      console.error(`Unsupported provider: ${provider}`);
      return null;
    }

    // Create a temporary script to run the benchmark
    const scriptPath = path.join(process.cwd(), 'tmp', 'benchmark.py');
    await fs.mkdir(path.join(process.cwd(), 'tmp'), { recursive: true });
    
    await fs.writeFile(
      scriptPath,
      `
import llm_performance_benchmark as lpb
import json
import sys

result = lpb.benchmark(
    base_url="${apiBaseUrl}",
    model="${model}",
    api_key="${apiKey || process.env.OPENAI_API_KEY || ''}",
    prompt="Explain the principles of quantum computing to a high school student.",
    max_tokens=100
)

json.dump({
    "modelId": "${modelId}",
    "tokensPerSecond": result["output_tokens_per_second"],
    "timeToFirstToken": result["time_to_first_token"],
    "totalTime": result["total_time"],
    "timestamp": ${Date.now()}
}, sys.stdout)
      `
    );

    // Run the benchmark
    const { stdout } = await execAsync(`python ${scriptPath}`);
    const result = JSON.parse(stdout) as BenchmarkResult;
    
    // Cache the result
    benchmarkCache.set(modelId, result);
    
    // Clean up
    await fs.unlink(scriptPath);
    
    return result;
  } catch (error) {
    console.error(`Error running benchmark for ${modelId}:`, error);
    return null;
  }
}

/**
 * Get benchmark results for all models
 */
export async function getAllBenchmarks(
  models: DisplayModel[]
): Promise<Map<string, BenchmarkResult>> {
  const results = new Map<string, BenchmarkResult>();
  
  // For demo purposes, we'll use simulated results rather than 
  // actually running benchmarks on all models (which would be expensive)
  for (const model of models) {
    const cachedResult = benchmarkCache.get(model.id);
    if (cachedResult) {
      results.set(model.id, cachedResult);
    } else {
      // Simulate benchmark result with realistic values
      const simulatedResult = getSimulatedBenchmark(model.id);
      results.set(model.id, simulatedResult);
      benchmarkCache.set(model.id, simulatedResult);
    }
  }
  
  return results;
}

/**
 * Get a provider's API base URL
 */
function getProviderApiUrl(provider: string): string | null {
  switch (provider.toLowerCase()) {
    case 'openai':
      return 'https://api.openai.com/v1';
    case 'anthropic':
      return 'https://api.anthropic.com/v1';
    case 'mistral':
      return 'https://api.mistral.ai/v1';
    case 'groq':
      return 'https://api.groq.com/v1';
    case 'google':
      return 'https://generativelanguage.googleapis.com/v1';
    // Add more providers as needed
    default:
      return null;
  }
}

/**
 * Generate simulated benchmark results for a model
 * This is used when we can't or don't want to run actual benchmarks
 */
function getSimulatedBenchmark(modelId: string): BenchmarkResult {
  // Base values for different model sizes
  const baseValues: Record<string, { tps: number, ttft: number }> = {
    'small': { tps: 40, ttft: 0.2 },
    'medium': { tps: 30, ttft: 0.3 },
    'large': { tps: 25, ttft: 0.4 },
    'llama': { tps: 85, ttft: 0.25 },
    'gpt-4': { tps: 30, ttft: 0.35 },
    'gpt-3.5': { tps: 40, ttft: 0.3 },
    'claude': { tps: 25, ttft: 0.4 },
    'gemini': { tps: 25, ttft: 0.4 },
    'mistral': { tps: 30, ttft: 0.35 },
    'grok': { tps: 33, ttft: 0.3 },
  };
  
  // Determine the base value to use based on model ID
  let baseValue = { tps: 30, ttft: 0.4 }; // Default
  for (const [key, value] of Object.entries(baseValues)) {
    if (modelId.toLowerCase().includes(key)) {
      baseValue = value;
      break;
    }
  }
  
  // Add some random variation (±15%)
  const randomFactor = 0.85 + (Math.random() * 0.3);
  const tokensPerSecond = baseValue.tps * randomFactor;
  
  // Random factor for TTFT (±10%)
  const ttftFactor = 0.9 + (Math.random() * 0.2);
  const timeToFirstToken = baseValue.ttft * ttftFactor;
  
  // Calculate total time for 100 tokens
  const totalTime = timeToFirstToken + (100 / tokensPerSecond);
  
  return {
    modelId,
    tokensPerSecond,
    timeToFirstToken,
    totalTime,
    timestamp: Date.now()
  };
} 