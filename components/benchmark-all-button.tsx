'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Activity } from 'lucide-react';
import { BenchmarkResult } from '@/lib/benchmarks/benchmark-service';
import { DisplayModel } from '@/lib/display-model';

interface BenchmarkAllButtonProps {
  models: DisplayModel[];
  onBenchmarkComplete?: (results: Map<string, BenchmarkResult>) => void;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function BenchmarkAllButton({
  models,
  onBenchmarkComplete,
  size = 'sm',
  variant = 'outline'
}: BenchmarkAllButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const runAllBenchmarks = async () => {
    if (!models.length) return;
    
    setIsLoading(true);
    setProgress(0);
    
    try {
      // Only benchmark available models
      const availableModels = models
        .filter(model => model.isAvailable !== false)
        .map(model => model.id);
      
      if (availableModels.length === 0) {
        throw new Error('No available models to benchmark');
      }
      
      const response = await fetch('/api/benchmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          models: availableModels
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Benchmark failed');
      }
      
      // Convert results to a Map
      const resultsMap = new Map<string, BenchmarkResult>();
      data.results.forEach((result: BenchmarkResult) => {
        resultsMap.set(result.modelId, result);
      });
      
      if (onBenchmarkComplete) {
        onBenchmarkComplete(resultsMap);
      }
    } catch (err) {
      console.error('Benchmark error:', err);
      setError(err instanceof Error ? err.message : 'Failed to run benchmarks');
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={runAllBenchmarks}
      disabled={isLoading || !models.length}
      className="flex items-center gap-1"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      ) : (
        <Activity className="h-4 w-4 mr-1" />
      )}
      {isLoading ? 'Benchmarking...' : 'Benchmark All Models'}
      {isLoading && progress > 0 && (
        <span className="ml-1 text-xs">({progress.toFixed(0)}%)</span>
      )}
    </Button>
  );
} 