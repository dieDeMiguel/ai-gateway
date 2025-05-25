'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BenchmarkResult } from '@/lib/benchmarks/benchmark-service';

interface BenchmarkButtonProps {
  modelId: string;
  onBenchmarkComplete?: (result: BenchmarkResult) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function BenchmarkButton({
  modelId,
  onBenchmarkComplete,
  size = 'icon',
  variant = 'ghost'
}: BenchmarkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runBenchmark = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/benchmarks?model=${encodeURIComponent(modelId)}`);
      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        throw new Error('No benchmark data available');
      }
      
      const benchmarkResult = data.data.find((result: any) => result.modelId === modelId);
      if (!benchmarkResult) {
        throw new Error('Benchmark result for the model not found');
      }
      
      if (onBenchmarkComplete) {
        onBenchmarkComplete(benchmarkResult);
      }
    } catch (err) {
      console.error('Benchmark error:', err);
      setError(err instanceof Error ? err.message : 'Failed to run benchmark');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={size}
            variant={variant}
            onClick={runBenchmark}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            {size !== 'icon' && (
              <span>{isLoading ? 'Benchmarking...' : 'Benchmark'}</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>
            {error
              ? `Error: ${error}`
              : isLoading
              ? 'Running benchmark...'
              : 'Measure tokens/second for this model'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 