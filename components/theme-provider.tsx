"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Define a type for the props
interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

export function ThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
} 