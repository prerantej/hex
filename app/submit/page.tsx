'use client';
import { useState } from "react";

type Round = { label: string; order: number; date?: string; result?: string; };

export default function SubmitPage() {
  const [company,setCompany] = useState("");
  const [roleTitle,setRoleTitle] = useState("");
  const [ctc,setCtc] = useState("");
  const [location,setLocation] = useState("");
  const [difficulty,setDifficulty] = useState(3);
  const [journey,setJourney] = useState("");
  const [rounds,setRounds] = useState<Round[]>([]);
  const [msg,setMsg] = useState<string|undefined>();

  function addRound(){ setRounds(r=>[...r,{ label:"", order:r.length }]) }

  async function onSubmit(e:React.FormEvent){
    e.preventDefault();
    setMsg(undefined);
    const res = await fetch("/api/submissions", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ company, roleTitle, ctc, location, difficulty: Number(difficulty), journey, rounds })
    });
    const data = await res.json();
    if (!res.ok) setMsg(data?.error ? JSON.stringify(data.error) : "Failed");
    else setMsg("Submitted! It will appear after moderation.");
  }

  return (
    <div className="max-w-2xl mx-auto card">
      <h1 className="text-xl font-semibold mb-4">Share your journey (anonymous)</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div><label className="label">Company*</label><input className="input" value={company} onChange={e=>setCompany(e.target.value)} required/></div>
        <div><label className="label">Role (optional)</label><input className="input" value={roleTitle} onChange={e=>setRoleTitle(e.target.value)}/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">CTC*</label><input className="input" value={ctc} onChange={e=>setCtc(e.target.value)} required/></div>
          <div><label className="label">Location*</label><input className="input" value={location} onChange={e=>setLocation(e.target.value)} required/></div>
        </div>
        <div><label className="label">Difficulty (1–5)*</label><input className="input" type="number" min={1} max={5} value={difficulty} onChange={e=>setDifficulty(Number(e.target.value))} required/></div>
        <div><label className="label">Brief journey/description*</label><textarea className="textarea" rows={5} value={journey} onChange={e=>setJourney(e.target.value)} required/></div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="label">Rounds</span>
            <button type="button" className="btn" onClick={addRound}>Add round</button>
          </div>
          {rounds.map((r,i)=>(
            <div key={i} className="grid grid-cols-4 gap-2">
              <input className="input col-span-2" placeholder="Label" value={r.label} onChange={e=>{ const v=[...rounds]; v[i].label=e.target.value; setRounds(v); }}/>
              <input className="input" type="number" placeholder="Order" value={r.order} onChange={e=>{ const v=[...rounds]; v[i].order=Number(e.target.value); setRounds(v); }}/>
              <input className="input" type="date" value={r.date||""} onChange={e=>{ const v=[...rounds]; v[i].date=e.target.value; setRounds(v); }}/>
            </div>
          ))}
        </div>
        {msg && <p className="text-sm">{msg}</p>}
        <button className="btn">Submit</button>
      </form>
    </div>
  );
}
