import { NextRequest, NextResponse } from 'next/server';
import { getAllBenchmarks, runModelBenchmark } from '@/lib/benchmarks/benchmark-service';
import { useAvailableModels } from '@/lib/hooks/use-available-models';

// Simple in-memory cache to avoid too many benchmark runs
const benchmarkCache = new Map<string, any>();
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    // Check cache first
    if (benchmarkCache.size > 0 && now - lastFetchTime < CACHE_TTL) {
      return NextResponse.json({ 
        data: Array.from(benchmarkCache.values()),
        source: 'cache'
      });
    }

    // Get the list of models from our models API
    const modelsResponse = await fetch(`${req.nextUrl.origin}/api/models`);
    if (!modelsResponse.ok) {
      throw new Error('Failed to fetch models');
    }

    const { models } = await modelsResponse.json();
    const displayModels = models.map((model: any) => ({
      id: model.id,
      label: model.name,
      isAvailable: model.available !== false,
    }));

    // Get benchmark results
    const benchmarkResults = await getAllBenchmarks(displayModels);
    
    // Format the results
    const formattedResults = Array.from(benchmarkResults.entries()).map(
      ([modelId, result]) => {
        const model = displayModels.find(m => m.id === modelId);
        return {
          modelId,
          modelName: model?.label || modelId,
          provider: modelId.split('/')[0],
          tokensPerSecond: result.tokensPerSecond,
          timeToFirstToken: result.timeToFirstToken,
          totalTime: result.totalTime,
          timestamp: result.timestamp
        };
      }
    );

    // Update cache
    formattedResults.forEach(result => {
      benchmarkCache.set(result.modelId, result);
    });
    lastFetchTime = now;

    return NextResponse.json({ 
      data: formattedResults,
      source: 'benchmark'
    });
  } catch (error) {
    console.error('Error in benchmarks API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benchmark data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { modelId } = await req.json();
    
    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    // Run benchmark for the requested model
    const result = await runModelBenchmark(modelId);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to run benchmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        modelId: result.modelId,
        tokensPerSecond: result.tokensPerSecond,
        timeToFirstToken: result.timeToFirstToken,
        totalTime: result.totalTime,
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    console.error('Error running benchmark:', error);
    return NextResponse.json(
      { error: 'Failed to run benchmark' },
      { status: 500 }
    );
  }
} 