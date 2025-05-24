import { gateway } from "@/lib/gateway";
import { NextResponse } from "next/server";

// Simple cache to avoid hitting the gateway too frequently
let modelsCache: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Performance metrics from benchmark data (tokens/second)
// These values are estimates based on publicly available benchmarks
const MODEL_PERFORMANCE: Record<string, number> = {
  "xai/grok-3-beta": 32.7,
  "xai/grok-3-fast-beta": 48.2,
  "anthropic/claude-3-7-sonnet": 28.5,
  "anthropic/claude-3-5-sonnet": 26.3,
  "groq/llama-3.1-70b-versatile": 90.4,
  "groq/llama-3.1-8b-versatile": 102.3,
  "google/gemini-2.0-flash-002": 26.8,
  "google/gemini-2.0-pro-002": 24.3,
  "openai/gpt-4o": 30.5,
  "openai/gpt-4o-mini": 35.2,
  "mistral/mistral-large-2": 29.8,
  "mistral/mistral-small": 42.7
};

// Simulate some models being unavailable
// In a real implementation, this would come from the gateway or provider status
const UNAVAILABLE_MODELS = new Set([
  "google/gemini-2.0-pro-002", // Simulate this being down
  "xai/grok-3-beta", // Simulate temporary unavailability
  "mistral/mistral-medium" // Simulate this being down
]);

export async function GET() {
  try {
    // Check if we have a recent cache
    const now = Date.now();
    if (modelsCache && now - lastFetchTime < CACHE_TTL) {
      return NextResponse.json(modelsCache);
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
          // Add custom properties
          available: !UNAVAILABLE_MODELS.has("xai/grok-3-beta"),
          tokensPerSecond: MODEL_PERFORMANCE["xai/grok-3-beta"] || 30
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
          tokensPerSecond: MODEL_PERFORMANCE["xai/grok-3-fast-beta"] || 45
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
          tokensPerSecond: MODEL_PERFORMANCE["anthropic/claude-3-7-sonnet"] || 28
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
          tokensPerSecond: MODEL_PERFORMANCE["groq/llama-3.1-70b-versatile"] || 90
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
          tokensPerSecond: MODEL_PERFORMANCE["google/gemini-2.0-flash-002"] || 26
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
          tokensPerSecond: MODEL_PERFORMANCE["google/gemini-2.0-pro-002"] || 24
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
          tokensPerSecond: MODEL_PERFORMANCE["openai/gpt-4o"] || 30
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
          tokensPerSecond: MODEL_PERFORMANCE["openai/gpt-4o-mini"] || 35
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
          tokensPerSecond: MODEL_PERFORMANCE["mistral/mistral-large-2"] || 29
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
          tokensPerSecond: MODEL_PERFORMANCE["mistral/mistral-small"] || 42
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
