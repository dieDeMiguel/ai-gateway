import { Leaderboard } from "@/components/leaderboard";

export const metadata = {
  title: "LLM Performance Leaderboard",
  description: "Compare performance metrics of different language models",
};

export default function LeaderboardPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">LLM Performance Leaderboard</h1>
      <p className="text-muted-foreground mb-6">
        This data is sourced from the{" "}
        <a
          href="https://huggingface.co/spaces/ArtificialAnalysis/LLM-Performance-Leaderboard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Hugging Face LLM Performance Leaderboard
        </a>
        , showing throughput metrics (tokens/second) for various models.
      </p>
      <Leaderboard />
    </div>
  );
} 