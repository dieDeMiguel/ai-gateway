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
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type BenchmarkEntry = {
  modelId: string;
  modelName: string;
  provider: string;
  tokensPerSecond: number;
  timeToFirstToken: number;
  totalTime: number;
  timestamp: number;
};

export function Leaderboard() {
  const [data, setData] = useState<BenchmarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("loading");

  const fetchBenchmarkData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/benchmarks");
      if (!response.ok) {
        throw new Error(`Failed to fetch benchmark data: ${response.status}`);
      }
      const result = await response.json();
      setData(result.data);
      setDataSource(result.source || "benchmark");
      setError(null);
    } catch (err) {
      console.error("Error fetching benchmarks:", err);
      setError("Failed to load benchmark data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Force the API to regenerate benchmark data by adding a cache-busting param
    fetch(`/api/benchmarks?refresh=${Date.now()}`)
      .then(res => res.json())
      .then(result => {
        setData(result.data);
        setDataSource(result.source || "benchmark");
        setError(null);
        setRefreshing(false);
      })
      .catch(err => {
        console.error("Error refreshing benchmarks:", err);
        setError("Failed to refresh benchmark data");
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchBenchmarkData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>LLM Performance Benchmarks</CardTitle>
          <Button disabled size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading
          </Button>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>LLM Performance Benchmarks</CardTitle>
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  // Sort by tokens per second (highest first)
  const sortedData = [...data].sort((a, b) => b.tokensPerSecond - a.tokensPerSecond);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>LLM Performance Benchmarks</CardTitle>
        <Button 
          onClick={handleRefresh} 
          size="sm" 
          variant="outline"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm text-muted-foreground">
          {dataSource === 'cache' ? (
            <p>Showing cached benchmark data. Click refresh to generate new benchmarks.</p>
          ) : (
            <p>Showing freshly generated benchmark data. These values include random variations to simulate real-world conditions.</p>
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
              <TableHead className="text-right">Tokens/Second</TableHead>
              <TableHead className="text-right">First Token (s)</TableHead>
              <TableHead className="text-right">Total Time (s)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((entry) => (
              <TableRow key={entry.modelId}>
                <TableCell className="font-medium">
                  {entry.modelName}
                </TableCell>
                <TableCell className="capitalize">
                  {entry.provider}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium">
                    {entry.tokensPerSecond.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {entry.timeToFirstToken.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
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