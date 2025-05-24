import { NextResponse } from 'next/server';
import { fetchLeaderboardData } from '@/lib/leaderboard-service';

export async function GET() {
  try {
    const leaderboardData = await fetchLeaderboardData();
    return NextResponse.json({ data: leaderboardData });
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
} 