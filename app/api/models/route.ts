import { gateway } from "@/lib/gateway";
import { NextResponse } from "next/server";
import { fetchLeaderboardData, getModelPerformance } from "@/lib/leaderboard-service";

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

    // Fetch leaderboard data for performance metrics
    let leaderboardData: Record<string, { tokensPerSecond?: number, rank?: number }> = {};
    try {
      // Fetch performance data for all models we care about
      const entries = await fetchLeaderboardData();
      // Create a mapping for quick lookup
      for (const modelId of Object.keys(MODEL_MAPPING)) {
        const mappedName = MODEL_MAPPING[modelId];
        const entry = entries.find(e => 
          e.model.toLowerCase().includes(mappedName.toLowerCase()) || 
          mappedName.toLowerCase().includes(e.model.toLowerCase())
        );
        console.log('entry', entry); 
        console.log('entries', entries); 
        if (entry) {
          leaderboardData[modelId] = { 
            tokensPerSecond: entry.tokensPerSecond, 
            rank: entry.rank 
          };
        }
      }
    } catch (error) {
      console.warn("Failed to fetch leaderboard data, using fallback performance metrics");
    }

    // In a real implementation, we'd get models from the gateway
    // For now, we're creating a mock response
    const models = {
      models: [
        {
          id: "xai/grok-3-beta",
          name: "Grok 3 Beta",
          specification: {
            specificationVersion: "v1",
            provider: "xai",
            modelId: "grok-3-beta"
          },
          available: !UNAVAILABLE_MODELS.has("xai/grok-3-beta"),
          tokensPerSecond: leaderboardData["xai/grok-3-beta"]?.tokensPerSecond || 32.7,
          rank: leaderboardData["xai/grok-3-beta"]?.rank
        },
        {
          id: "xai/grok-3-fast-beta",
          name: "Grok 3 Fast Beta",
          specification: {
            specificationVersion: "v1",
            provider: "xai",
            modelId: "grok-3-fast-beta"
          },
          available: !UNAVAILABLE_MODELS.has("xai/grok-3-fast-beta"),
          tokensPerSecond: leaderboardData["xai/grok-3-fast-beta"]?.tokensPerSecond || 48.2,
          rank: leaderboardData["xai/grok-3-fast-beta"]?.rank
        },
        {
          id: "anthropic/claude-3-7-sonnet",
          name: "Claude 3.7 Sonnet",
          specification: {
            specificationVersion: "v1",
            provider: "anthropic",
            modelId: "claude-3.7-sonnet"
          },
          available: !UNAVAILABLE_MODELS.has("anthropic/claude-3-7-sonnet"),
          tokensPerSecond: leaderboardData["anthropic/claude-3-7-sonnet"]?.tokensPerSecond || 28.5,
          rank: leaderboardData["anthropic/claude-3-7-sonnet"]?.rank
        },
        {
          id: "groq/llama-3.1-70b-versatile",
          name: "Llama 3.1 70B",
          specification: {
            specificationVersion: "v1",
            provider: "groq",
            modelId: "llama-3.1-70b-versatile"
          },
          available: !UNAVAILABLE_MODELS.has("groq/llama-3.1-70b-versatile"),
          tokensPerSecond: leaderboardData["groq/llama-3.1-70b-versatile"]?.tokensPerSecond || 90.4,
          rank: leaderboardData["groq/llama-3.1-70b-versatile"]?.rank
        },
        {
          id: "google/gemini-2.0-flash-002",
          name: "Gemini 2.0 Flash",
          specification: {
            specificationVersion: "v1",
            provider: "google",
            modelId: "gemini-2.0-flash-002"
          },
          available: !UNAVAILABLE_MODELS.has("google/gemini-2.0-flash-002"),
          tokensPerSecond: leaderboardData["google/gemini-2.0-flash-002"]?.tokensPerSecond || 26.8,
          rank: leaderboardData["google/gemini-2.0-flash-002"]?.rank
        },
        {
          id: "google/gemini-2.0-pro-002",
          name: "Gemini 2.0 Pro",
          specification: {
            specificationVersion: "v1",
            provider: "google",
            modelId: "gemini-2.0-pro-002"
          },
          available: !UNAVAILABLE_MODELS.has("google/gemini-2.0-pro-002"),
          tokensPerSecond: leaderboardData["google/gemini-2.0-pro-002"]?.tokensPerSecond || 24.3,
          rank: leaderboardData["google/gemini-2.0-pro-002"]?.rank
        },
        {
          id: "openai/gpt-4o",
          name: "GPT-4o",
          specification: {
            specificationVersion: "v1",
            provider: "openai",
            modelId: "gpt-4o"
          },
          available: !UNAVAILABLE_MODELS.has("openai/gpt-4o"),
          tokensPerSecond: leaderboardData["openai/gpt-4o"]?.tokensPerSecond || 30.5,
          rank: leaderboardData["openai/gpt-4o"]?.rank
        },
        {
          id: "openai/gpt-4o-mini",
          name: "GPT-4o Mini",
          specification: {
            specificationVersion: "v1",
            provider: "openai",
            modelId: "gpt-4o-mini"
          },
          available: !UNAVAILABLE_MODELS.has("openai/gpt-4o-mini"),
          tokensPerSecond: leaderboardData["openai/gpt-4o-mini"]?.tokensPerSecond || 35.2,
          rank: leaderboardData["openai/gpt-4o-mini"]?.rank
        },
        {
          id: "mistral/mistral-large-2",
          name: "Mistral Large 2",
          specification: {
            specificationVersion: "v1",
            provider: "mistral",
            modelId: "mistral-large-2"
          },
          available: !UNAVAILABLE_MODELS.has("mistral/mistral-large-2"),
          tokensPerSecond: leaderboardData["mistral/mistral-large-2"]?.tokensPerSecond || 29.8,
          rank: leaderboardData["mistral/mistral-large-2"]?.rank
        },
        {
          id: "mistral/mistral-small",
          name: "Mistral Small",
          specification: {
            specificationVersion: "v1",
            provider: "mistral",
            modelId: "mistral-small"
          },
          available: !UNAVAILABLE_MODELS.has("mistral/mistral-small"),
          tokensPerSecond: leaderboardData["mistral/mistral-small"]?.tokensPerSecond || 42.7,
          rank: leaderboardData["mistral/mistral-small"]?.rank
        }
      ]
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
