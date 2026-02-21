"use server";

import { getPrisma } from "@/lib/prisma";
import {
  getMainCodingPrompt,
  screenshotToCodePrompt,
  softwareArchitectPrompt,
} from "@/lib/prompts";
import { notFound } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function createChat(
  prompt: string,
  model: string,
  quality: "high" | "low",
  screenshotUrl: string | undefined,
) {
  const prisma = getPrisma();
  const chat = await prisma.chat.create({
    data: {
      model,
      quality,
      prompt,
      title: "",
      shadcn: true,
    },
  });

  async function fetchTitle() {
    try {
      const genModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction:
          "You are a chatbot helping the user create a simple app or script, and your current job is to create a succinct title, maximum 3-5 words, for the chat given their initial prompt. Please return only the title.",
      });
      const response = await genModel.generateContent(prompt);
      return response.response.text().trim() || prompt;
    } catch (e) {
      console.error(e);
      return prompt;
    }
  }

  async function fetchTopExample() {
    try {
      const genModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are a helpful bot. Given a request for building an app, you match it to the most similar example provided. If the request is NOT similar to any of the provided examples, return "none". Here is the list of examples, ONLY reply with one of them OR "none":

          - landing page
          - blog app
          - quiz app
          - pomodoro timer
          `,
      });
      const response = await genModel.generateContent(prompt);
      return response.response.text().trim() || "none";
    } catch (e) {
      console.error(e);
      return "none";
    }
  }

  const [title, mostSimilarExample] = await Promise.all([
    fetchTitle(),
    fetchTopExample(),
  ]);

  let fullScreenshotDescription;
  if (screenshotUrl) {
    try {
      const response = await fetch(screenshotUrl);
      const buffer = await response.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString("base64");
      const mimeType = response.headers.get("content-type") || "image/png";

      const genModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const screenshotResponse = await genModel.generateContent([
        { text: screenshotToCodePrompt },
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
      ]);

      fullScreenshotDescription = screenshotResponse.response.text();
    } catch (e) {
      console.error("Error analyzing screenshot:", e);
    }
  }

  let userMessage: string;
  if (quality === "high") {
    try {
      const genModel = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        systemInstruction: softwareArchitectPrompt,
      });
      const initialRes = await genModel.generateContent(
        fullScreenshotDescription
          ? fullScreenshotDescription + prompt
          : prompt,
      );

      userMessage = initialRes.response.text() ?? prompt;
    } catch (e) {
      console.error(e);
      userMessage = prompt;
    }
  } else if (fullScreenshotDescription) {
    userMessage =
      prompt +
      "RECREATE THIS APP AS CLOSELY AS POSSIBLE: " +
      fullScreenshotDescription;
  } else {
    userMessage = prompt;
  }

  let newChat = await prisma.chat.update({
    where: {
      id: chat.id,
    },
    data: {
      title,
      messages: {
        createMany: {
          data: [
            {
              role: "system",
              content: getMainCodingPrompt(mostSimilarExample),
              position: 0,
            },
            { role: "user", content: userMessage, position: 1 },
          ],
        },
      },
    },
    include: {
      messages: true,
    },
  });

  const lastMessage = newChat.messages
    .sort((a, b) => a.position - b.position)
    .at(-1);
  if (!lastMessage) throw new Error("No new message");

  return {
    chatId: chat.id,
    lastMessageId: lastMessage.id,
  };
}

export async function createMessage(
  chatId: string,
  text: string,
  role: "assistant" | "user",
) {
  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) notFound();

  const maxPosition = Math.max(...chat.messages.map((m) => m.position));

  const newMessage = await prisma.message.create({
    data: {
      role,
      content: text,
      position: maxPosition + 1,
      chatId,
    },
  });

  return newMessage;
}
