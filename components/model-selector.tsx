"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { ZapIcon, AlertTriangleIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { DisplayModel } from "../lib/display-model";

export type ModelSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  models: DisplayModel[];
  loading: boolean;
};

export function ModelSelector({ value, onChange, models, loading }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedModel = models.find((model) => model.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[350px] justify-between"
          disabled={loading}
        >
          {loading ? (
            "Loading models..."
          ) : selectedModel ? (
            <div className="flex items-center justify-between gap-2 text-left w-full">
              <div className="w-full flex items-center justify-between">
                <div className="font-medium">{selectedModel.label}</div>
                <div className="text-xs text-muted-foreground ml-2">
                  {selectedModel.isAvailable ? "Available" : "Unavailable"}
                </div>
              </div>
              {selectedModel.tokensPerSecond !== undefined && selectedModel.tokensPerSecond > 0 && (
                <div className="ml-auto text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md flex items-center">
                  <ZapIcon className="w-3 h-3 mr-1" />
                  {selectedModel.tokensPerSecond.toFixed(1)} token/s
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
            {models.map((model) => (
              <CommandItem
                key={model.id}
                value={model.id}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
                disabled={model.isAvailable === false}
                className={cn(
                  "flex flex-col items-start py-2",
                  model.isAvailable === false && "opacity-50"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div>
                    <div className="font-medium">{model.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {model.isAvailable ? "Available" : "Unavailable"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {model.tokensPerSecond !== undefined && model.tokensPerSecond > 0 && (
                      <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md flex items-center">
                        <ZapIcon className="w-3 h-3 mr-1" />
                        {model.tokensPerSecond.toFixed(1)} token/s
                      </div>
                    )}
                    {model.id === value && (
                      <CheckIcon className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
