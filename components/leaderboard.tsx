// Server Component (no "use client" directive)
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { BenchmarkEntry } from "@/lib/types";
import { LeaderboardHeader } from "./leaderboard-header";


async function getBenchmarkData() {
  // For server components in Next.js, we need an absolute URL when fetching
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.VERCEL_URL || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;
  
  const res = await fetch(`${baseUrl}/api/benchmarks`, {
    next: { revalidate: 3600 } // 1 hour
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch benchmark data');
  }
  
  return res.json() as Promise<{
    data: BenchmarkEntry[];
    source: string;
  }>;
}

export async function Leaderboard() {
  const { data, source } = await getBenchmarkData();
  
  // Sort by tokens per second (highest first)
  const sortedData = [...data].sort(
    (a: BenchmarkEntry, b: BenchmarkEntry) => b.tokensPerSecond - a.tokensPerSecond
  );

  const dataSource = source || "benchmark";

  return (
    <Card>
      <LeaderboardHeader />
      <CardContent>
        <div className="mb-4 text-sm text-muted-foreground">
          {dataSource === "cache" ? (
            <p>
              Showing cached benchmark data. Click refresh to generate new
              benchmarks.
            </p>
          ) : (
            <p>
              Showing freshly generated benchmark data. These values include
              random variations to simulate real-world conditions.
            </p>
          )}
        </div>
        <Table>
          <TableCaption>
            Performance benchmarks showing tokens/second and latency metrics
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead className="text-center">Tokens/Second</TableHead>
              <TableHead className="text-center">First Token (s)</TableHead>
              <TableHead className="text-center">Total Time (s)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((entry: BenchmarkEntry) => (
              <TableRow key={entry.modelId}>
                <TableCell className="font-medium">{entry.modelName}</TableCell>
                <TableCell className="capitalize">{entry.provider}</TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">
                    {entry.tokensPerSecond.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {entry.timeToFirstToken.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {entry.totalTime.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
