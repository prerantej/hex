import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { auth } from "../../../src/lib/auth";
import { z } from "zod";

const schema = z.object({ submissionId: z.string(), reason: z.string().min(2) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { submissionId, reason } = parsed.data;
  await prisma.report.create({ data: { submissionId, reporterUserId: session.user.id, reason } });
  // Auto-hide threshold = 3
  const count = await prisma.report.count({ where: { submissionId } });
  if (count >= 3) {
    await prisma.submission.update({ where: { id: submissionId }, data: { status: "PENDING", modNote: "Auto-hidden due to reports" } });
  }
  return NextResponse.json({ ok: true });
}
