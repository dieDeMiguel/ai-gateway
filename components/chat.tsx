"use client";

import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "./model-selector";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SendIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { DEFAULT_MODEL } from "../lib/constants";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { defaultChatStore } from "ai";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ui/theme-toggle";
import { useAvailableModels } from "../lib/hooks/use-available-models";
import { BenchmarkButton } from "./benchmark-button";
import { BarChart2 } from "lucide-react";

export function Chat({ modelId = DEFAULT_MODEL }: { modelId: string }) {
  const [currentModelId, setCurrentModelId] = useState(modelId);
  const { models, isLoading, error: modelError, updateModelPerformance } = useAvailableModels();
  const [modelWarning, setModelWarning] = useState<string | null>(null);
  const router = useRouter();

  // Check if the selected model is available
  useEffect(() => {
    if (!models) return;

    const selectedModel = models.find(model => model.id === currentModelId);
    if (selectedModel && selectedModel.isAvailable === false) {
      setModelWarning(`${selectedModel.label} is currently unavailable. Your messages will be processed with the default model.`);
    } else {
      setModelWarning(null);
    }
  }, [currentModelId, models]);

  const handleModelIdChange = (newModelId: string) => {
    setCurrentModelId(newModelId);
  };

  const { messages, input, handleInputChange, handleSubmit, error, reload } =
    useChat({
      chatStore: defaultChatStore({
        api: "/api/chat",
        maxSteps: 3,
      }),
    });

  return (
    <div className="grid w-screen h-screen grid-rows-[auto_1fr_auto] max-w-[800px] m-auto">
      <div className="flex justify-between p-4 items-center">
        <ThemeToggle />
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push("/benchmarks")}
        >
          <BarChart2 className="h-4 w-4" />
          View Performance Benchmarks
        </Button>
      </div>
      <div className="flex flex-col-reverse gap-8 p-8 overflow-y-auto">
        {messages.toReversed().map((m) => (
          <div
            key={m.id}
            className={cn(
              "whitespace-pre-wrap",
              m.role === "user" &&
                "bg-muted/50 rounded-md p-3 ml-auto max-w-[80%]",
            )}
          >
            {m.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return <div key={`${m.id}-${i}`}>{part.text}</div>;
              }
            })}
          </div>
        ))}
      </div>

      {(error || modelWarning) && (
        <div className="px-8 pb-4 space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                An error occurred while generating the response.
              </AlertDescription>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => reload()}
              >
                Retry
              </Button>
            </Alert>
          )}

          {modelWarning && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm">
                {modelWarning}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          handleSubmit(e, { body: { modelId: currentModelId } });
        }}
        className="flex justify-center px-8 pt-0 pb-8"
      >
        <Card className="w-full p-0">
          <CardContent className="flex flex-col md:flex-row md:items-center gap-3 p-2">
            <div className="md:min-w-[280px]">
              <ModelSelector
                value={currentModelId}
                onChange={handleModelIdChange}
                models={models}
                loading={isLoading}
              />
            </div>
            <div className="flex flex-1 items-center">
              <Input
                name="prompt"
                placeholder="Type your message..."
                onChange={handleInputChange}
                value={input}
                autoFocus
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full md:w-[400px]"
                onKeyDown={(e) => {
                  if (e.metaKey && e.key === "Enter") {
                    handleSubmit(e, { body: { modelId: currentModelId } });
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="h-8 w-8 ml-1"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
            <BenchmarkButton
              modelId={currentModelId}
              onBenchmarkComplete={(result) => {
                updateModelPerformance(result.modelId, result.tokensPerSecond);
              }}
            />
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
