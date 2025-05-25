"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BarChart2 } from "lucide-react";
import Link from "next/link";
import { Chat } from "@/components/chat";

export default function Home() {
  return <Chat modelId="" />;
}
