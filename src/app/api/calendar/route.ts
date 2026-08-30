import { NextRequest, NextResponse } from "next/server";
import { differenceInDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { generateUpcomingDeadlines } from "@/lib/compliance/deadlines";
import type { DeadlineStatus } from "@prisma/client";

function resolveStatus(dueDate: Date): DeadlineStatus {
  const days = differenceInDays(dueDate, new Date());
  if (days < 0) return "OVERDUE";
  if (days <= 7) return "DUE_SOON";
  return "UPCOMING";
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let deadlines = await prisma.complianceDeadline.findMany({
    where: { userId: session.userId },
    orderBy: { dueDate: "asc" },
  });

  if (!deadlines.length) {
    const templates = generateUpcomingDeadlines();
    await prisma.complianceDeadline.createMany({
      data: templates.map((item) => ({
        userId: session.userId,
        title: item.title,
        type: item.type,
        description: item.description,
        dueDate: item.dueDate,
        status: resolveStatus(item.dueDate),
      })),
    });
    deadlines = await prisma.complianceDeadline.findMany({
      where: { userId: session.userId },
      orderBy: { dueDate: "asc" },
    });
  }

  return NextResponse.json({ deadlines });
}

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const deadline = await prisma.complianceDeadline.updateMany({
    where: { id: body.id, userId: session.userId },
    data: {
      status: body.status,
      completedAt: body.status === "COMPLETED" ? new Date() : null,
    },
  });

  return NextResponse.json({ updated: deadline.count });
}
