import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { DEFAULT_MODEL } from "@/lib/constants";
import { gateway } from "@/lib/gateway";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    modelId = DEFAULT_MODEL,
  }: { messages: UIMessage[]; modelId: string } = await req.json();

  try {
    // Check if model is available (in a real implementation)
    // For demo purposes, we'll simulate some models being unavailable
    const unavailableModels = [
      "google/gemini-2.0-pro-002",
      "xai/grok-3-beta",
      "mistral/mistral-medium"
    ];
    
    // If the requested model is unavailable, fallback to a default
    const isModelAvailable = !unavailableModels.includes(modelId);
    const effectiveModelId = isModelAvailable ? modelId : DEFAULT_MODEL;
    
    // If we had to fallback, log it
    if (!isModelAvailable) {
      console.warn(`Model ${modelId} is unavailable, falling back to ${DEFAULT_MODEL}`);
    }

  const result = streamText({
      model: gateway(effectiveModelId),
    system: "You are a software engineer exploring Generative AI.",
    messages: convertToModelMessages(messages),
    onError: (e) => {
      console.error("Error while streaming.", e);
    },
  });

  return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}
