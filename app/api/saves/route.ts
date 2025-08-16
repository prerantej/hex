import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { auth } from "../../../src/lib/auth";
import { z } from "zod";
const schema = z.object({ submissionId: z.string() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { submissionId } = parsed.data;
  try {
    const save = await prisma.save.create({ data: { submissionId, userId: session.user.id } });
    return NextResponse.json({ save }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
