import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../src/lib/db";
import { auth } from "../../../../../src/lib/auth";
import { z } from "zod";

const schema = z.object({ note: z.string().optional() });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session as any)?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const sub = await prisma.submission.update({ where: { id: params.id }, data: { status: "REJECTED", modNote: parsed.data.note ?? null } });
  return NextResponse.json({ submission: sub });
}
