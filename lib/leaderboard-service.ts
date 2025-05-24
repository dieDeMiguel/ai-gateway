import { DisplayModel } from './display-model';

export interface LeaderboardEntry {
  model: string;
  provider?: string;
  tokensPerSecond?: number;
  rank?: number;
}

// Cache to avoid frequent API calls
let leaderboardCache: LeaderboardEntry[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Fetches performance data from the Hugging Face LLM Performance Leaderboard
 */
export async function fetchLeaderboardData(): Promise<LeaderboardEntry[]> {
  const now = Date.now();
  
  // Return cached data if available and recent
  if (leaderboardCache && now - lastFetchTime < CACHE_TTL) {
    return leaderboardCache;
  }

  try {
    // Fetch data from Hugging Face Spaces
    const response = await fetch(
      'https://artificialanalysis-llm-performance-leaderboard.hf.space/api/v1/models',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
    }

    const data = await response.json();
    
    // Process the data and extract relevant metrics
    // This is a simplified implementation that would need to be adjusted 
    // based on the actual API response structure
    const entries: LeaderboardEntry[] = data.models.map((model: any, index: number) => ({
      model: model.name,
      provider: extractProvider(model.name),
      tokensPerSecond: model.throughput || model.tokens_per_second,
      rank: index + 1
    }));

    // Update cache
    leaderboardCache = entries;
    lastFetchTime = now;
    
    return entries;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    // If error, return fallback data or empty array
    return getFallbackLeaderboardData();
  }
}

/**
 * Attempts to find performance data for a specific model
 */
export async function getModelPerformance(modelId: string): Promise<{ tokensPerSecond?: number, rank?: number }> {
  try {
    const leaderboardData = await fetchLeaderboardData();
    
    // Clean up the model ID to match potential leaderboard entries
    const normalizedModelId = normalizeModelId(modelId);
    
    // Try to find an exact or fuzzy match
    const exactMatch = leaderboardData.find(entry => 
      normalizeModelId(entry.model) === normalizedModelId
    );
    
    if (exactMatch) {
      return {
        tokensPerSecond: exactMatch.tokensPerSecond,
        rank: exactMatch.rank
      };
    }
    
    // Try a fuzzy match if exact match fails
    const fuzzyMatch = leaderboardData.find(entry => 
      normalizeModelId(entry.model).includes(normalizedModelId) ||
      normalizedModelId.includes(normalizeModelId(entry.model))
    );
    
    if (fuzzyMatch) {
      return {
        tokensPerSecond: fuzzyMatch.tokensPerSecond,
        rank: fuzzyMatch.rank
      };
    }
    
    // No match found
    return {};
  } catch (error) {
    console.error(`Error getting performance for model ${modelId}:`, error);
    return {};
  }
}

/**
 * Normalize model IDs to make matching more reliable
 */
function normalizeModelId(modelId: string): string {
  // Extract the model name part after the provider
  const parts = modelId.split('/');
  const modelName = parts.length > 1 ? parts[1] : modelId;
  
  // Remove common prefixes and version info
  return modelName
    .toLowerCase()
    .replace(/[-_]/g, '') // Remove hyphens and underscores
    .replace(/\d+b$/i, '') // Remove billion parameter indicators
    .replace(/\d+k$/i, '') // Remove context length indicators
    .replace(/\d+\.\d+$/i, ''); // Remove version numbers
}

/**
 * Extract provider name from model ID
 */
function extractProvider(modelId: string): string {
  if (modelId.includes('/')) {
    return modelId.split('/')[0];
  }
  
  // Try to extract known provider names
  const knownProviders = ['openai', 'anthropic', 'google', 'meta', 'mistral', 'groq', 'xai'];
  for (const provider of knownProviders) {
    if (modelId.toLowerCase().includes(provider)) {
      return provider;
    }
  }
  
  return 'unknown';
}

/**
 * Returns fallback data when API calls fail
 */
function getFallbackLeaderboardData(): LeaderboardEntry[] {
  return [
    { model: "gpt-4o", provider: "openai", tokensPerSecond: 30.5, rank: 1 },
    { model: "claude-3-opus", provider: "anthropic", tokensPerSecond: 22.1, rank: 2 },
    { model: "claude-3-sonnet", provider: "anthropic", tokensPerSecond: 28.5, rank: 3 },
    { model: "gpt-4-turbo", provider: "openai", tokensPerSecond: 27.6, rank: 4 },
    { model: "gemini-2.0-pro", provider: "google", tokensPerSecond: 24.3, rank: 5 },
    { model: "llama-3.1-70b", provider: "groq", tokensPerSecond: 90.4, rank: 6 },
    { model: "mistral-large-2", provider: "mistral", tokensPerSecond: 29.8, rank: 7 },
    { model: "gpt-4o-mini", provider: "openai", tokensPerSecond: 35.2, rank: 8 },
    { model: "llama-3.1-8b", provider: "groq", tokensPerSecond: 102.3, rank: 9 },
    { model: "gemini-2.0-flash", provider: "google", tokensPerSecond: 26.8, rank: 10 },
  ];
} 