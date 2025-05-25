"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { ZapIcon, AlertTriangleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

export type ModelSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  models: any[];
  loading: boolean;
};

export function ModelSelector({ value, onChange, models, loading }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const selectedModel = models.find((model) => model.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[300px] justify-between"
          disabled={loading}
        >
          {loading ? (
            "Loading models..."
          ) : selectedModel ? (
            <div className="flex items-center gap-2 text-left">
              <div>
                <div className="font-medium">{selectedModel.name}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedModel.specification.provider}
                </div>
              </div>
              {selectedModel.tokensPerSecond && (
                <div className="ml-auto text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md flex items-center">
                  <ZapIcon className="w-3 h-3 mr-1" />
                  {selectedModel.tokensPerSecond.toFixed(1)} tok/s
                </div>
              )}
              {selectedModel.available === false && (
                <div className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-md flex items-center">
                  <AlertTriangleIcon className="w-3 h-3 mr-1" />
                  Unavailable
                </div>
              )}
            </div>
          ) : (
            "Select a model"
          )}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {models.map((model: any) => (
              <CommandItem
                key={model.id}
                value={model.id}
                onSelect={(currentValue: string) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
                disabled={model.available === false}
                className={cn(
                  "flex flex-col items-start py-2",
                  model.available === false && "opacity-50"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {model.specification.provider}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {model.available === false && (
                      <div className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-md flex items-center">
                        <AlertTriangleIcon className="w-3 h-3 mr-1" />
                        Unavailable
                      </div>
                    )}
                    {model.tokensPerSecond && (
                      <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md flex items-center">
                        <ZapIcon className="w-3 h-3 mr-1" />
                        {model.tokensPerSecond.toFixed(1)}
                      </div>
                    )}
                    {model.id === value && (
                      <CheckIcon className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
                {model.timeToFirstToken && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    First token: {model.timeToFirstToken.toFixed(2)}s | Total time (100 tokens): {model.totalTime.toFixed(2)}s
                  </div>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
