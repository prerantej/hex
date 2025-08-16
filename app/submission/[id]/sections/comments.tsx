'use client';
import useSWR from "swr";
import { useState } from "react";

export default function Comments({ submissionId }:{ submissionId: string }) {
  const { data, mutate } = useSWR(`/api/comments?submissionId=${submissionId}`, (u)=>fetch(u).then(r=>r.json()));
  const comments = data?.comments ?? [];
  const [body, setBody] = useState("");
  const [error, setError] = useState<string|undefined>();

  async function addComment(e:React.FormEvent){
    e.preventDefault();
    setError(undefined);
    const res = await fetch("/api/comments",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ submissionId, body }) });
    if (!res.ok) { const d = await res.json(); setError(d?.error ? JSON.stringify(d.error) : "Failed"); return; }
    setBody(""); mutate();
  }

  return (
    <section className="card">
      <h2 className="font-medium mb-2">Comments</h2>
      <form onSubmit={addComment} className="space-y-2">
        <textarea className="textarea" rows={3} placeholder="Share tips or questions (alias shows, not your real name)" value={body} onChange={e=>setBody(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn">Post comment</button>
      </form>

      <div className="mt-4 space-y-3">
        {comments.length === 0 && <p className="text-sm opacity-70">No comments yet.</p>}
        {comments.map((c:any)=>(
          <div key={c.id} className="border-t pt-2">
            <div className="text-xs opacity-70">@{c.user?.handle || "anon"} • {new Date(c.createdAt).toLocaleString()}</div>
            <div className="text-sm whitespace-pre-wrap">{c.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
