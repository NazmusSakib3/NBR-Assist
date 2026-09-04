import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { buildRagPrompt, retrieveRelevantChunks } from "@/lib/ai/rag";
import { generateChatResponse } from "@/lib/ai/gemini";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
});

const SYSTEM_PROMPT = `You are NBR Assist, an AI compliance copilot for Bangladeshi SMEs.

Rules:
1. Use ONLY the provided regulation context for legal/compliance claims.
2. If context is missing or weak, say what is missing and recommend a qualified tax professional or official NBR guidance.
3. Prefer concrete Bangladesh actions: forms (e.g. Mushak-9.1), deadlines, documents, portals.
4. When a deadline exists in context, state it clearly near the top of the answer.
5. Cite sources inline as [Source 1], [Source 2], etc.
6. Keep answers short: 4–8 sentences or a tight bullet list.
7. Do not invent rates, thresholds, or circular numbers that are not in the context.
8. If the user writes in Bangla (Bengali), reply in Bangla; otherwise reply in clear English.`;

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = clientIp(request);
  const limited = rateLimit(`chat:${session.userId}:${ip}`, 12, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.resetAt);

  try {
    const body = chatSchema.parse(await request.json());
    let chatSession = body.sessionId
      ? await prisma.chatSession.findFirst({
          where: { id: body.sessionId, userId: session.userId },
        })
      : null;

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.userId,
          title: body.message.slice(0, 60),
        },
      });
    }

    const chunks = await retrieveRelevantChunks(body.message);
    const context = buildRagPrompt(chunks);

    const history = await prisma.chatMessage.findMany({
      where: { sessionId: chatSession.id },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    const messages = [
      ...history.map((item) => ({
        role: item.role === "assistant" ? ("model" as const) : ("user" as const),
        content: item.content,
      })),
      {
        role: "user" as const,
        content: `Context:\n${context}\n\nQuestion: ${body.message}`,
      },
    ];

    const answer = await generateChatResponse(SYSTEM_PROMPT, messages);
    const citations = chunks.map((chunk) => ({
      title: chunk.documentTitle,
      excerpt: chunk.content.slice(0, 180),
      score: chunk.score,
    }));

    await prisma.chatMessage.createMany({
      data: [
        { sessionId: chatSession.id, role: "user", content: body.message },
        {
          sessionId: chatSession.id,
          role: "assistant",
          content: answer,
          citations,
        },
      ],
    });

    return NextResponse.json({
      sessionId: chatSession.id,
      answer,
      citations,
    });
  } catch (error) {
    console.error("Chat error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate response";
    const isConfig =
      message.includes("GEMINI_API_KEY") ||
      message.includes("API key") ||
      message.includes("404") ||
      message.includes("not found");
    return NextResponse.json(
      {
        error: isConfig
          ? "AI is not configured correctly. Check GEMINI_API_KEY and GEMINI_CHAT_MODEL on Vercel."
          : "Failed to generate response. Please try again in a moment.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
