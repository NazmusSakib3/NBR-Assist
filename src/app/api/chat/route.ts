import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { buildRagPrompt, retrieveRelevantChunks } from "@/lib/ai/rag";
import { generateChatResponse } from "@/lib/ai/gemini";

const chatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
});

const SYSTEM_PROMPT = `You are NBR Assist, an AI compliance copilot for Bangladeshi businesses.
Answer questions about VAT, TIN, income tax, trade licenses, and NBR compliance using ONLY the provided context.
If the context does not contain enough information, say so clearly and suggest consulting a qualified tax professional.
Always mention relevant deadlines when applicable.
Keep answers practical, concise, and specific to Bangladesh.
Cite sources as [Source 1], [Source 2], etc. when using retrieved context.`;

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate response. Check GEMINI_API_KEY." },
      { status: 500 },
    );
  }
}
