import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { getChecklistTemplate } from "@/lib/compliance/templates";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checklists = await prisma.checklist.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ checklists });
}

const createSchema = z.object({
  businessType: z.string().min(2),
});

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createSchema.parse(await request.json());
    const template = getChecklistTemplate(body.businessType);

    const checklist = await prisma.checklist.create({
      data: {
        userId: session.userId,
        businessType: body.businessType,
        title: template.title,
        items: template.items.map((text, index) => ({
          id: `item-${index}`,
          text,
          completed: false,
        })),
      },
    });

    return NextResponse.json({ checklist });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create checklist" }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean(),
    }),
  ),
});

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = updateSchema.parse(await request.json());
    const checklist = await prisma.checklist.updateMany({
      where: { id: body.id, userId: session.userId },
      data: { items: body.items },
    });
    return NextResponse.json({ updated: checklist.count });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 });
  }
}
