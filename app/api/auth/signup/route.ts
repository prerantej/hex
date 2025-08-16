import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import { z } from "zod";
import { hash } from "bcryptjs";
import { isAllowedDomain } from "../../../../src/lib/utils";
import { rateLimit } from "../../../../src/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  handle: z.string().min(3).max(24).regex(/^[a-z0-9-]+$/),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "ip";
    const lim = await rateLimit(`signup:${ip}`, 5, 60 * 15);
    if (!lim.allowed) {
      return NextResponse.json(
        { error: "Too many signups, try later." },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, handle } = parsed.data;

    // ✅ safer email check
    if (!isAllowedDomain(email)) {
      return NextResponse.json(
        { error: "Email domain not allowed" },
        { status: 403 }
      );
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { handle }] },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Email or handle already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), passwordHash, handle },
      select: { id: true, email: true, handle: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("Signup API crashed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
