import { Leaderboard } from "@/components/leaderboard";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Benchmarks | AI SDK Gateway Demo",
  description: "Performance benchmarks for LLM models in the AI SDK Gateway",
};

export default function BenchmarksPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-end mb-4">
        <Link href="/chat">
          <Button variant="outline" className="gap-2">
            Go to Chat
          </Button>
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LLM Performance Benchmarks</h1>
        <p className="text-lg text-muted-foreground">
          Real-time performance metrics for popular LLM models through the AI SDK Gateway
        </p>
      </div>
      <Leaderboard />
    </div>
  );
} 