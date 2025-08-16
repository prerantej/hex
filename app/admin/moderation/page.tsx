import { auth } from "../../../src/lib/auth";
import { prisma } from "../../../src/lib/db";
import Link from "next/link";

export default async function ModerationPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return <div className="card">Forbidden: admin only. Set a user role to ADMIN in DB to access.</div>;
  }

  const pending = await prisma.submission.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { company: true }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Moderation queue</h1>
      {pending.length === 0 && <p>No pending submissions.</p>}
      <div className="grid gap-3">
        {pending.map(p => (
          <article key={p.id} className="card">
            <div className="flex justify-between">
              <div><span className="font-medium">{p.company.name}</span>{p.roleTitle ? ` • ${p.roleTitle}` : ""}</div>
              <div className="text-sm opacity-70">{new Date(p.createdAt).toLocaleString()}</div>
            </div>
            <p className="text-sm mt-2 line-clamp-3">{p.journey}</p>
            <div className="mt-2">
              <Link className="btn-secondary" href={`/admin/submissions/${p.id}`}>Review</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
