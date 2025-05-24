"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChartIcon, HomeIcon } from "lucide-react";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex gap-4 items-center">
      <Link
        href="/"
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        <HomeIcon className="h-4 w-4" />
        <span>Home</span>
      </Link>
      
      <Link
        href="/leaderboard"
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
          pathname === "/leaderboard" ? "text-primary" : "text-muted-foreground"
        )}
      >
        <BarChartIcon className="h-4 w-4" />
        <span>Leaderboard</span>
      </Link>
    </div>
  );
} 