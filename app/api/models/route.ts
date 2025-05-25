import { gateway } from "@/lib/gateway";
import { NextResponse } from "next/server";
import { getAllBenchmarks } from "@/lib/benchmarks/benchmark-service";
import { DisplayModel } from "@/lib/display-model";

// Simple cache to avoid hitting the gateway too frequently
let modelsCache: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Simulate some models being unavailable (for demo purposes)
// In a real implementation, this would come from the gateway or provider status
const UNAVAILABLE_MODELS = new Set([
  "google/gemini-2.0-pro-002", // Simulate this being down
  "xai/grok-3-beta", // Simulate temporary unavailability
  "mistral/mistral-medium" // Simulate this being down
]);

// This map helps match our internal model IDs to leaderboard model names
const MODEL_MAPPING: Record<string, string> = {
  "xai/grok-3-beta": "grok-3",
  "xai/grok-3-fast-beta": "grok-3-fast",
  "anthropic/claude-3-7-sonnet": "claude-3-sonnet",
  "anthropic/claude-3-5-sonnet": "claude-3.5-sonnet", 
  "groq/llama-3.1-70b-versatile": "llama-3-70b",
  "groq/llama-3.1-8b-versatile": "llama-3-8b",
  "google/gemini-2.0-flash-002": "gemini-2.0-flash",
  "google/gemini-2.0-pro-002": "gemini-2.0-pro",
  "openai/gpt-4o": "gpt-4o",
  "openai/gpt-4o-mini": "gpt-4o-mini",
  "mistral/mistral-large-2": "mistral-large-2",
  "mistral/mistral-small": "mistral-small"
};

export async function GET() {
  try {
    // Check if we have a recent cache
    const now = Date.now();
    if (modelsCache && now - lastFetchTime < CACHE_TTL) {
      return NextResponse.json(modelsCache);
    }

    // Create a list of display models for the benchmark service
    const displayModels: DisplayModel[] = [
      { id: "xai/grok-3-beta", label: "Grok 3 Beta" },
      { id: "xai/grok-3-fast-beta", label: "Grok 3 Fast Beta" },
      { id: "anthropic/claude-3-7-sonnet", label: "Claude 3.7 Sonnet" },
      { id: "groq/llama-3.1-70b-versatile", label: "Llama 3.1 70B" },
      { id: "google/gemini-2.0-flash-002", label: "Gemini 2.0 Flash" },
      { id: "google/gemini-2.0-pro-002", label: "Gemini 2.0 Pro" },
      { id: "openai/gpt-4o", label: "GPT-4o" },
      { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
      { id: "mistral/mistral-large-2", label: "Mistral Large 2" },
      { id: "mistral/mistral-small", label: "Mistral Small" }
    ];

    // Get benchmark data for all models
    const benchmarkResults = await getAllBenchmarks(displayModels);

    // Build the models response with benchmark data
    const models = {
      models: displayModels.map(model => {
        const benchmark = benchmarkResults.get(model.id);
        
        return {
          id: model.id,
          name: model.label,
          specification: {
            specificationVersion: "v1",
            provider: model.id.split('/')[0],
            modelId: model.id.split('/')[1]
          },
          available: !UNAVAILABLE_MODELS.has(model.id),
          tokensPerSecond: benchmark?.tokensPerSecond,
          timeToFirstToken: benchmark?.timeToFirstToken,
          totalTime: benchmark?.totalTime,
          // No longer including the rank since we're using real benchmark data
        };
      })
    };

    // Update cache
    modelsCache = models;
    lastFetchTime = now;

  return NextResponse.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
