import { prisma } from "../../../src/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const company = await prisma.company.findUnique({ where: { slug: params.slug } });
  if (!company) return notFound();
  const subs = await prisma.submission.findMany({ where: { companyId: company.id, status: "APPROVED" }, orderBy: { createdAt: "desc" }, include: { rounds: true } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{company.name}</h1>
      {subs.length === 0 && <p>No approved submissions yet.</p>}
      <div className="grid gap-3">
        {subs.map(s => (
          <article key={s.id} className="card">
            <div className="flex justify-between">
              <Link href={`/submission/${s.id}`} className="font-medium hover:underline">{s.roleTitle || "Journey"}</Link>
              <div className="text-sm opacity-70">{new Date(s.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="text-sm mt-1">CTC: {s.ctc} • Location: {s.location} • Difficulty: {s.difficulty}/5</div>
            {s.rounds?.length > 0 && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Rounds:</span>{" "}
                {s.rounds.sort((a:any,b:any)=>a.order-b.order).map((r:any)=>r.label).join(" → ")}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
