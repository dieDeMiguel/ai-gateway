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
    <div className="container py-8 flex justify-center min-w-[1000px]">
      <Leaderboard />
    </div>
  );
} 