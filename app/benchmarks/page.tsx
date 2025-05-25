import { Leaderboard } from "@/components/leaderboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benchmarks | AI SDK Gateway Demo",
  description: "Performance benchmarks for LLM models in the AI SDK Gateway",
};

export default function BenchmarksPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LLM Performance Benchmarks</h1>
        <p className="text-lg text-muted-foreground">
          Real-time performance metrics for popular LLM models through the AI SDK Gateway
        </p>
      </div>
      <Leaderboard />
      <div className="mt-8 p-4 border rounded-lg bg-muted/50">
        <h2 className="text-xl font-semibold mb-2">About These Benchmarks</h2>
        <p className="mb-2">
          These benchmarks measure two key metrics:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li><strong>Tokens per Second</strong>: How quickly the model generates text</li>
          <li><strong>Time to First Token</strong>: Latency before generation starts</li>
          <li><strong>Total Time</strong>: How long it takes to generate 100 tokens</li>
        </ul>
        <p>
          Values are simulated but reflect realistic performance characteristics of each model.
          In a production environment, you would use tools like LLM Performance Benchmark,
          LLMPerf by Anyscale, or token generation speed simulators to collect accurate metrics.
        </p>
      </div>
    </div>
  );
} 