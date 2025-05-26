'use client';

import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RefreshButton } from "./refresh-button";

export function LeaderboardHeader() {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle>LLM Performance Benchmarks</CardTitle>
      <div className="flex gap-2">
        <RefreshButton />
        <Link href="/chat">
          <Button size="sm" variant="outline" className="gap-2">
            Go to Chat
          </Button>
        </Link>
      </div>
    </CardHeader>
  );
} 