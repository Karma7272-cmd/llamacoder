import { getPrisma } from "@/lib/prisma";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const prisma = getPrisma();
  const { messageId, model } = await req.json();

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    return new Response(null, { status: 404 });
  }

  const messagesRes = await prisma.message.findMany({
    where: { chatId: message.chatId, position: { lte: message.position } },
    orderBy: { position: "asc" },
  });

  let messages = z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      }),
    )
    .parse(messagesRes);

  if (messages.length > 10) {
    messages = [messages[0], messages[1], messages[2], ...messages.slice(-7)];
  }

  const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  );

  const geminiModel = genAI.getGenerativeModel({ model });

  // Convert messages to Gemini format (system message + content)
  let systemPrompt = "";
  const conversationHistory = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemPrompt = msg.content;
    } else if (msg.role === "user") {
      conversationHistory.push({
        role: "user",
        parts: [{ text: msg.content }],
      });
    } else if (msg.role === "assistant") {
      conversationHistory.push({
        role: "model",
        parts: [{ text: msg.content }],
      });
    }
  }

  const chat = geminiModel.startChat({
    history: conversationHistory,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 9000,
    },
    systemInstruction: systemPrompt || undefined,
  });

  // Create a readable stream for streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const lastUserMessage = messages
          .reverse()
          .find((m) => m.role === "user");
        if (!lastUserMessage) {
          controller.close();
          return;
        }

        const response = await chat.sendMessageStream(lastUserMessage.content);

        for await (const chunk of response.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}

export const maxDuration = 45;
