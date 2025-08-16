import { prisma } from "../../../src/lib/db";
import { notFound } from "next/navigation";
import Comments from "./sections/comments";

export default async function SubmissionPage({ params }: { params: { id: string } }) {
  const s = await prisma.submission.findUnique({ where: { id: params.id, status: "APPROVED" as any }, include: { company: true, rounds: true } });
  if (!s) return notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <article className="card">
        <div className="flex justify-between">
          <h1 className="text-xl font-semibold">{s.company.name} {s.roleTitle ? `• ${s.roleTitle}` : ""}</h1>
          <div className="text-sm opacity-70">{new Date(s.createdAt).toLocaleDateString()}</div>
        </div>
        <div className="text-sm mt-1">CTC: {s.ctc} • Location: {s.location} • Difficulty: {s.difficulty}/5</div>
        <p className="mt-2 text-sm whitespace-pre-wrap">{s.journey}</p>
        {s.rounds?.length > 0 && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Rounds:</span>{" "}
            {s.rounds.sort((a:any,b:any)=>a.order-b.order).map((r:any)=>r.label).join(" → ")}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <form action={`/api/votes`} method="post">
            <input type="hidden" name="submissionId" value={s.id} />
          </form>
        </div>
      </article>

      <Comments submissionId={s.id} />
    </div>
  );
}
