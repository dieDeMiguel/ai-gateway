import { NextResponse } from 'next/server';
import { benchmarkModel, benchmarkModels, getCachedBenchmarkResults } from '@/lib/benchmarks/benchmark-service';

// Define standard benchmarking parameters
const BENCHMARK_PROMPT = "Explain the theory of relativity in detail, covering both special and general relativity, their implications, and experimental verifications. Include mathematical formulations and discuss the historical context of Einstein's work.";
const BENCHMARK_MAX_TOKENS = 1000;

export async function GET(request: Request) {
  try {
    // Extract model ID from query parameters if provided
    const url = new URL(request.url);
    const modelId = url.searchParams.get('model');
    
    // Get cached results for all models
    const cachedResults = getCachedBenchmarkResults();
    
    if (modelId) {
      // Benchmark a specific model if provided
      try {
        const result = await benchmarkModel(
          modelId,
          BENCHMARK_PROMPT,
          BENCHMARK_MAX_TOKENS
        );
        return NextResponse.json({ success: true, result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { success: false, error: errorMessage, cachedResult: cachedResults.get(modelId) },
          { status: 500 }
        );
      }
    }
    
    // Return all cached benchmark results
    return NextResponse.json({
      success: true,
      results: Array.from(cachedResults.entries()).map(([id, result]) => result)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { models, prompt, maxTokens } = body;
    
    if (!models || !Array.isArray(models) || models.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No models specified for benchmarking' },
        { status: 400 }
      );
    }
    
    // Run benchmarks for all specified models
    const results = await benchmarkModels(
      models,
      prompt || BENCHMARK_PROMPT,
      maxTokens || BENCHMARK_MAX_TOKENS
    );
    
    return NextResponse.json({
      success: true,
      results: Array.from(results.entries()).map(([id, result]) => result)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 