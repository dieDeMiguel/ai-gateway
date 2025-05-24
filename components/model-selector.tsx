"use client";

import { useAvailableModels } from "@/lib/hooks/use-available-models";
import { Loader2 } from "lucide-react";
import { DEFAULT_MODEL } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ModelSelectorProps = {
  modelId: string;
  onModelChange: (modelId: string) => void;
};

export const ModelSelector = memo(function ModelSelector({
  modelId = DEFAULT_MODEL,
  onModelChange,
}: ModelSelectorProps) {
  const { models, isLoading, error } = useAvailableModels();

  return (
    <Select
      value={modelId}
      onValueChange={onModelChange}
      disabled={isLoading || !!error || !models?.length}
    >
      <SelectTrigger className="w-[280px]">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading</span>
          </div>
        ) : error ? (
          <span className="text-red-500">Error</span>
        ) : !models?.length ? (
          <span>No models</span>
        ) : (
          <SelectValue placeholder="Select a model" />
        )}
      </SelectTrigger>

      <SelectContent className="min-w-[320px]">
        <SelectGroup>
          <SelectLabel>Models</SelectLabel>
          {models?.map((model) => (
            <SelectItem key={model.id} value={model.id} className="p-0">
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 py-1.5 px-2 w-full">
                      <div 
                        className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0", 
                          model.isAvailable === false ? "bg-red-500" : "bg-green-500"
                        )} 
                        aria-label={model.isAvailable === false ? "Unavailable" : "Available"}
                      />
                      <div className="flex items-center gap-1 min-w-[140px]">
                        {model.rank && (
                          <span className="text-xs text-muted-foreground bg-muted px-1 rounded">
                            #{model.rank}
                          </span>
                        )}
                        <span className="truncate">{model.label}</span>
                      </div>
                      {model.tokensPerSecond && (
                        <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                          {model.tokensPerSecond.toFixed(1)} tok/s
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[320px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{model.label}</p>
                        {model.rank && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                            Rank #{model.rank}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">Provider: {model.id.split('/')[0]}</p>
                      <p className="text-sm">Status: {model.isAvailable === false ? "Unavailable" : "Available"}</p>
                      {model.tokensPerSecond && (
                        <p className="text-sm">
                          Performance: {model.tokensPerSecond.toFixed(1)} tokens/second
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SelectItem>
          )) || []}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
});
