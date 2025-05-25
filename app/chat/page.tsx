import { Chat } from "@/components/chat";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat | AI SDK Gateway Demo",
  description: "Chat with AI models through the AI SDK Gateway",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ model: string }>;
}) {
  const { model } = await searchParams;
  return <Chat modelId={model} />;
} 