"use client";

import { useState, useEffect, useCallback } from "react";
import { useAvailableModels } from "@/lib/hooks/use-available-models";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {  BarChart2, Clock, Zap } from "lucide-react";
import { BenchmarkButton } from "./benchmark-button";
import { BenchmarkAllButton } from "./benchmark-all-button";
import { BenchmarkResult } from "@/lib/benchmarks/benchmark-service";

export function BenchmarksDashboard() {
  const { models, isLoading, error, updateModelPerformance } =
    useAvailableModels();
  const [benchmarkResults, setBenchmarkResults] = useState<
    Map<string, BenchmarkResult>
  >(new Map());

  // Load cached benchmark results on mount
  useEffect(() => {
    const loadCachedBenchmarks = async () => {
      try {
        const response = await fetch("/api/benchmarks");
        const data = await response.json();

        if (data.success && data.results) {
          const resultsMap = new Map<string, BenchmarkResult>();
          data.results.forEach((result: BenchmarkResult) => {
            resultsMap.set(result.modelId, result);
          });
          setBenchmarkResults(resultsMap);
        }
      } catch (error) {
        console.error("Failed to load benchmark results:", error);
      }
    };

    loadCachedBenchmarks();
  }, []);

  // Handle benchmark completion for a single model
  const handleBenchmarkComplete = useCallback(
    (modelId: string, result: BenchmarkResult) => {
      setBenchmarkResults((prev) => {
        const newResults = new Map(prev);
        newResults.set(modelId, result);
        return newResults;
      });

      // Update the model performance in the models list
      updateModelPerformance(modelId, result.tokensPerSecond);
    },
    [updateModelPerformance]
  );

  // Handle benchmark completion for all models
  const handleAllBenchmarksComplete = useCallback(
    (results: Map<string, BenchmarkResult>) => {
      setBenchmarkResults(results);

      // Update all model performance metrics
      results.forEach((result, modelId) => {
        updateModelPerformance(modelId, result.tokensPerSecond);
      });
    },
    [updateModelPerformance]
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading models data...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading models: {error.message}
      </div>
    );
  }

  // Sort models by tokens per second (fastest first)
  const sortedModels = [...models].sort((a, b) => {
    const aSpeed = a.tokensPerSecond || 0;
    const bSpeed = b.tokensPerSecond || 0;
    return bSpeed - aSpeed;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Model Performance</h2>
        <BenchmarkAllButton
          models={models}
          onBenchmarkComplete={handleAllBenchmarksComplete}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedModels.map((model) => {
          const benchmarkResult = benchmarkResults.get(model.id);

          return (
            <Card
              key={model.id}
              className={model.isAvailable === false ? "opacity-60" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-1">
                      {model.label}
                      {model.rank && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                          #{model.rank}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Provider: {model.id.split("/")[0]}
                    </CardDescription>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      model.isAvailable === false
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                    title={
                      model.isAvailable === false ? "Unavailable" : "Available"
                    }
                  />
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {model.tokensPerSecond?.toFixed(1) || "N/A"} tok/s
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Generation Speed
                      </div>
                    </div>
                  </div>

                  {benchmarkResult && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">
                          {benchmarkResult.timeToFirstToken.toFixed(2)}s
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Time to First Token
                        </div>
                      </div>
                    </div>
                  )}

                  {benchmarkResult && (
                    <div className="flex items-center gap-2 col-span-2">
                      <BarChart2 className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">
                          {benchmarkResult.totalTime.toFixed(2)}s at{" "}
                          {benchmarkResult.tokensPerSecond.toFixed(1)} tokens/s
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Generation Time
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <BenchmarkButton
                  modelId={model.id}
                  onBenchmarkComplete={(result) =>
                    handleBenchmarkComplete(model.id, result)
                  }
                  size="default"
                  variant="outline"
                />

                {benchmarkResult && (
                  <div className="ml-auto text-xs text-muted-foreground">
                    Last run:{" "}
                    {new Date(benchmarkResult.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 border rounded-lg bg-muted/50">
        <h2 className="text-xl font-semibold mb-2">About These Benchmarks</h2>
        <p className="mb-2">
          These benchmarks measure model performance using real API calls. The
          key metrics include:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <strong>Tokens per Second</strong>: How quickly the model generates
            text
          </li>
          <li>
            <strong>Time to First Token</strong>: Latency before generation
            starts
          </li>
          <li>
            <strong>Total Time</strong>: Overall time to complete the response
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Benchmark results are cached for one hour. Results may vary based on
          network conditions, server load, and other factors. For more precise
          benchmarking, consider using specialized tools like LLMPerf by
          Anyscale or Artificial Analysis&apos;s LLM Performance Benchmark.
        </p>
      </div>
    </div>
  );
}
