import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, requireRole } from "@/lib/auth";
import { ingestDocument } from "@/lib/ai/rag";
import type { ComplianceType } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || !requireRole(session, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const documents = await prisma.regulationDocument.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { chunks: true } } },
  });

  return NextResponse.json({ documents });
}

const createSchema = z.object({
  title: z.string().min(3),
  category: z.enum(["VAT", "INCOME_TAX", "TIN", "TRADE_LICENSE", "CUSTOMS", "OTHER"]),
  source: z.string().optional(),
  content: z.string().min(50),
});

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || !requireRole(session, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = createSchema.parse(await request.json());
    const document = await prisma.regulationDocument.create({
      data: {
        title: body.title,
        category: body.category as ComplianceType,
        source: body.source,
        content: body.content,
      },
    });

    const chunkCount = await ingestDocument(document.id);
    return NextResponse.json({ document, chunkCount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
