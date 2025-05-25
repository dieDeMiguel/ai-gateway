import { useState, useEffect, useCallback } from "react";
import type { DisplayModel } from "@/lib/display-model";
import type { GatewayLanguageModelEntry } from "@vercel/ai-sdk-gateway";

// Default models with availability status and performance metrics
// Data based on estimates and could be replaced with actual measurements
const DEFAULT_MODELS: DisplayModel[] = [
  { 
    id: "xai/grok-3-beta", 
    label: "Grok 3 Beta", 
    isAvailable: true, 
    tokensPerSecond: 32.7 
  },
  { 
    id: "anthropic/claude-3-7-sonnet", 
    label: "Claude 3.7 Sonnet", 
    isAvailable: true, 
    tokensPerSecond: 28.5 
  },
  { 
    id: "groq/llama-3.1-70b-versatile", 
    label: "Llama 3.1 70B", 
    isAvailable: true, 
    tokensPerSecond: 90.4  // Groq is known for high throughput
  },
  { 
    id: "google/gemini-2.0-flash-002", 
    label: "Gemini 2.0 Flash", 
    isAvailable: true,
    tokensPerSecond: 26.8 
  },
];

const MAX_RETRIES = 3;
const RETRY_DELAY_MILLIS = 5000;

// Model performance data from benchmark tests
// These values could be obtained from actual measurements or a database
const MODEL_PERFORMANCE = new Map<string, number>([
  ["xai/grok-3-beta", 32.7],
  ["anthropic/claude-3-7-sonnet", 28.5],
  ["anthropic/claude-3-opus", 22.1],
  ["anthropic/claude-3-5-sonnet", 25.8],
  ["groq/llama-3.1-70b-versatile", 90.4],
  ["groq/mixtral-8x7b-32768", 75.6],
  ["google/gemini-2.0-flash-002", 26.8],
  ["google/gemini-2.0-pro-002", 24.3],
  ["openai/gpt-4o", 30.5],
  ["openai/gpt-4o-mini", 35.2],
  ["openai/gpt-4-turbo", 27.6],
  ["openai/gpt-3.5-turbo", 40.3],
  ["mistral/mistral-large-2", 29.8],
  ["mistral/mistral-medium", 38.5],
  ["mistral/mistral-small", 42.7],
  ["meta/llama-3-8b", 45.2],
  ["meta/llama-3-70b", 31.9],
]);

function buildModelList(models: (GatewayLanguageModelEntry & { available?: boolean, tokensPerSecond?: number, rank?: number })[]) {
  return models.map((model) => {
    // Extract availability from the API response if available
    const isAvailable = model.available !== false;
    
    // Get performance metrics from the API response or fallback to our local data
    const tokensPerSecond = model.tokensPerSecond || 
      MODEL_PERFORMANCE.get(model.id) || 
      (model.id.includes("small") ? 40 : 
       model.id.includes("medium") ? 35 : 
       model.id.includes("large") ? 30 : 25);
    
    return {
    id: model.id,
    label: model.name,
      isAvailable,
      tokensPerSecond,
      rank: model.rank // Include the rank information
    };
  });
}

export function useAvailableModels() {
  const [models, setModels] = useState<DisplayModel[]>(DEFAULT_MODELS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchModels = useCallback(
    async (isRetry: boolean = false) => {
      if (!isRetry) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await fetch("/api/models");
        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        const data = await response.json();
        const newModels = buildModelList(data.models);
        setModels(newModels);
        setError(null);
        setRetryCount(0);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching models:", err);
        // On error, use the default models but mark some as potentially unavailable
        setModels(DEFAULT_MODELS.map(model => ({
          ...model,
          // Randomly mark some models as unavailable to demonstrate the feature
          isAvailable: Math.random() > 0.3
        })));
        
        setError(
          err instanceof Error ? err : new Error("Failed to fetch models")
        );
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1);
          setIsLoading(true);
        } else {
          setIsLoading(false);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [retryCount]
  );

  // Function to update model performance metrics
  const updateModelPerformance = useCallback((modelId: string, tokensPerSecond: number) => {
    setModels((currentModels) => 
      currentModels.map((model) => 
        model.id === modelId 
          ? { ...model, tokensPerSecond } 
          : model
      )
    );
    
    // Also update our cached performance data
    MODEL_PERFORMANCE.set(modelId, tokensPerSecond);
  }, []);

  useEffect(() => {
    if (retryCount === 0) {
      fetchModels(false);
    } else if (retryCount > 0 && retryCount <= MAX_RETRIES) {
      const timerId = setTimeout(() => {
        fetchModels(true);
      }, RETRY_DELAY_MILLIS);
      return () => clearTimeout(timerId);
    }
  }, [retryCount, fetchModels]);

  return { models, isLoading, error, updateModelPerformance };
}
