import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavLinks } from "@/components/nav-links";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Gateway Demo - Leaderboard",
  description: "Performance metrics and benchmarks for AI models",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="container mx-auto">
            <div className="flex justify-between p-4 items-center border-b">
              <NavLinks />
              <ThemeToggle />
            </div>
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
} 