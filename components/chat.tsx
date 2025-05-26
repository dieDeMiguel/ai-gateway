"use client";

import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "./model-selector";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { SendIcon } from "lucide-react";
import { useState, useEffect } from "react";
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
  const { models, isLoading, updateModelPerformance } = useAvailableModels();
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

  function autoResizeTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

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
          <CardContent className="flex flex-col gap-4 w-full">
            <div className="w-full">
              <textarea
                onInput={(e) => autoResizeTextarea(e.target as HTMLTextAreaElement)}
                rows={1}
                placeholder="Type your message..."
                className="w-full max-h-52 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 rounded-xl border border-gray-300 bg-muted/50 p-4 text-base leading-relaxed shadow-sm focus:border-black focus:outline-none focus:ring-0 transition-all duration-200"
                value={input}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="md:min-w-[280px]">
                <ModelSelector
                  value={currentModelId}
                  onChange={handleModelIdChange}
                  models={models}
                  loading={isLoading}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
                <BenchmarkButton
                  modelId={currentModelId}
                  onBenchmarkComplete={(result) => {
                    updateModelPerformance(result.modelId, result.tokensPerSecond);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
