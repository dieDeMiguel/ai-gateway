"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardEntry = {
  model: string;
  provider?: string;
  tokensPerSecond?: number;
  rank?: number;
};

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/leaderboard");
        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
        }
        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LLM Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LLM Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  // Sort by rank if available
  const sortedData = [...data].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Performance Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            Performance data from Hugging Face LLM-Performance-Leaderboard
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead className="text-right">Tokens/Second</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((entry) => (
              <TableRow key={entry.model}>
                <TableCell className="font-medium">
                  {entry.rank ? `#${entry.rank}` : "—"}
                </TableCell>
                <TableCell>{entry.model}</TableCell>
                <TableCell>{entry.provider || "Unknown"}</TableCell>
                <TableCell className="text-right">
                  {entry.tokensPerSecond
                    ? `${entry.tokensPerSecond.toFixed(1)} tok/s`
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 