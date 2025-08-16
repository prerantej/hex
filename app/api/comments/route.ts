import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { auth } from "../../../src/lib/auth";
import { z } from "zod";
import { sanitizeJourney, containsProfanity } from "../../../src/lib/safety";

const createSchema = z.object({
  submissionId: z.string(),
  body: z.string().min(2),
  parentId: z.string().optional()
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submissionId");
  if (!submissionId) return NextResponse.json({ error: "submissionId required" }, { status: 400 });
  const comments = await prisma.comment.findMany({
    where: { submissionId, status: "visible" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { handle: true } } }
  });
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { submissionId, body, parentId } = parsed.data;
  if (containsProfanity(body)) return NextResponse.json({ error: "Contains disallowed language" }, { status: 400 });

  const c = await prisma.comment.create({ data: { submissionId, userId: session.user.id, body: sanitizeJourney(body), parentId } });
  return NextResponse.json({ comment: c }, { status: 201 });
}
