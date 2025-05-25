"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BarChart2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("");
  const router = useRouter();

  const handleContinue = () => {
    if (selectedModel) {
      router.push(`/chat?model=${selectedModel}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            AI SDK Gateway Demo
          </h1>
          <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Explore and benchmark different LLM providers through a unified API
          </p>
        </div>
        
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Select a model to continue</h2>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <Button 
                onClick={handleContinue} 
                disabled={!selectedModel}
                className="w-full md:w-auto"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground mt-4">
              <p>
                Models marked as unavailable are simulated to be offline for demonstration purposes.
              </p>
            </div>
          </div>
        </Card>
        
        <div className="flex justify-center">
          <Link href="/benchmarks">
            <Button variant="outline" className="gap-2">
              <BarChart2 className="h-4 w-4" />
              View Performance Benchmarks
            </Button>
          </Link>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>
            This demo showcases how to use the AI SDK to build applications
            that can benchmark and select from multiple LLM providers.
          </p>
        </div>
      </div>
    </main>
  );
}
