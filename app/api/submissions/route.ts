import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { auth } from "../../../src/lib/auth";
import { z } from "zod";
import { sanitizeJourney, containsProfanity } from "../../../src/lib/safety";
import { rateLimit } from "../../../src/lib/rate-limit";

const createSchema = z.object({
  company: z.string().min(2),
  roleTitle: z.string().optional(),
  ctc: z.string().min(1),
  location: z.string().min(1),
  difficulty: z.number().min(1).max(5),
  journey: z.string().min(10),
  rounds: z.array(z.object({
    label: z.string().min(1),
    order: z.number().int().nonnegative(),
    date: z.string().optional(),
    result: z.string().optional()
  })).default([])
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const company = searchParams.get("company") ?? undefined;
  const role = searchParams.get("role") ?? undefined;
  const difficultyMin = Number(searchParams.get("difficultyMin") ?? "1");
  const difficultyMax = Number(searchParams.get("difficultyMax") ?? "5");
  const from = searchParams.get("from") ? new Date(String(searchParams.get("from"))) : undefined;
  const to = searchParams.get("to") ? new Date(String(searchParams.get("to"))) : undefined;

  if (id) {
    const submission = await prisma.submission.findUnique({ where: { id }, include: { company: true, rounds: true } });
    if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ submission });
  }

  const where: any = { status: "APPROVED", difficulty: { gte: difficultyMin, lte: difficultyMax } };
  if (company) where.company = { slug: company };
  if (role) where.roleTitle = { contains: role, mode: "insensitive" };
  if (from || to) where.createdAt = { gte: from, lte: to };
  if (q) {
    where.OR = [
      { journey: { contains: q, mode: "insensitive" } },
      { roleTitle: { contains: q, mode: "insensitive" } },
      { company: { name: { contains: q, mode: "insensitive" } } }
    ];
  }

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { company: true, rounds: true, votes: true, comments: true }
  });
  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") ?? "ip";
  const lim = await rateLimit(`submit:${session.user.id}:${ip}`, 5, 60 * 10);
  if (!lim.allowed) return NextResponse.json({ error: "Too many submissions, try later." }, { status: 429 });

  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { company, roleTitle, ctc, location, difficulty, journey, rounds } = parsed.data;

  if (containsProfanity(journey)) return NextResponse.json({ error: "Contains disallowed language" }, { status: 400 });

  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const companyRec = await prisma.company.upsert({ where: { slug }, update: { name: company }, create: { name: company, slug } });

  const sub = await prisma.submission.create({
    data: {
      userId: session.user.id,
      companyId: companyRec.id,
      roleTitle,
      ctc,
      location,
      difficulty,
      journey: sanitizeJourney(journey),
      rounds: { create: rounds.map(r => ({ label: r.label, order: r.order, date: r.date ? new Date(r.date) : undefined, result: r.result })) }
    },
    include: { company: true, rounds: true }
  });

  return NextResponse.json({ submission: sub }, { status: 201 });
}
