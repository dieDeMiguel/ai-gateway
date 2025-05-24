export type DisplayModel = {
  id: string;
  label: string;
  isAvailable?: boolean; // Status indicator
  tokensPerSecond?: number; // Performance metric
  rank?: number; // Leaderboard rank
};
