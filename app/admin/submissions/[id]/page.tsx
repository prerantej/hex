'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewPage({ params }: { params: { id: string } }) {
  const [sub, setSub] = useState<any>(null);
  const [note, setNote] = useState("");
  const router = useRouter();

  useEffect(()=>{
    (async()=>{
      const r = await fetch(`/api/submissions?id=${params.id}`);
      const d = await r.json();
      const one = (d.submissions||[]).find((s:any)=>s.id===params.id) || d.submission;
      setSub(one);
    })();
  },[params.id]);

  async function act(action:"approve"|"reject"){
    const r = await fetch(`/api/moderation/${params.id}/${action}`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ note }) });
    if (r.ok) router.push("/admin/moderation");
    else alert("Action failed");
  }

  if (!sub) return <div className="card">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <article className="card">
        <div className="flex justify-between"><h1 className="text-xl font-semibold">{sub.company?.name} {sub.roleTitle?`• ${sub.roleTitle}`:""}</h1><div className="text-sm opacity-70">{new Date(sub.createdAt).toLocaleString()}</div></div>
        <div className="text-sm mt-1">CTC: {sub.ctc} • Location: {sub.location} • Difficulty: {sub.difficulty}/5</div>
        <p className="mt-2 text-sm whitespace-pre-wrap">{sub.journey}</p>
      </article>
      <div className="card space-y-2">
        <textarea className="textarea" placeholder="Moderator note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn" onClick={()=>act("approve")}>Approve</button>
          <button className="btn-secondary" onClick={()=>act("reject")}>Reject</button>
        </div>
      </div>
    </div>
  );
}
