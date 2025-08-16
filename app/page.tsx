'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import Link from 'next/link';

const fetcher = async (u: string) => {
  const res = await fetch(u, { headers: { Accept: 'application/json' } });
  // if API ever returns HTML on error, avoid .json() crash
  try {
    const json = await res.json();
    return json;
  } catch {
    return { submissions: [] };
  }
};

export default function HomePage() {
  const [q, setQ] = useState('');
  const [difficultyMin, setMin] = useState(1);
  const [difficultyMax, setMax] = useState(5);

  const url = useMemo(
    () =>
      `/api/submissions?q=${encodeURIComponent(q)}&difficultyMin=${difficultyMin}&difficultyMax=${difficultyMax}`,
    [q, difficultyMin, difficultyMax]
  );

  const { data, isLoading } = useSWR(url, fetcher);
  const submissions = data?.submissions ?? [];

  return (
    <div className="space-y-6">
      
        <p className="text-lg text mt-2 text-center">
          HEX is a campus-only platform where students anonymously share their placement &amp; interview journeys.
          Browse approved experiences, filter by difficulty, and help peers by contributing your own.
        </p>
     

      {/* Search panel */}
      <section className="card p-5 space-y-3">
        <h2 className="text-lg font-medium">Search</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="label">Query</label>
            <input
              className="input"
              placeholder="Company, role, keywords"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search keywords"
            />
          </div>
          <div>
            <label className="label">Difficulty min</label>
            <input
              className="input w-28"
              type="number"
              min={1}
              max={5}
              value={difficultyMin}
              onChange={(e) => setMin(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
            />
          </div>
          <div>
            <label className="label">Difficulty max</label>
            <input
              className="input w-28"
              type="number"
              min={1}
              max={5}
              value={difficultyMax}
              onChange={(e) => setMax(Math.max(1, Math.min(5, Number(e.target.value) || 5)))}
            />
          </div>
        </div>
      </section>

      {/* Recent approved submissions */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Recent approved submissions</h2>

        {isLoading && <p className="text-muted">Loading…</p>}

        {!isLoading && submissions.length === 0 && (
          <p className="text-muted">No submissions yet.</p>
        )}

        <div className="space-y-3">
          {submissions.map((s: any) => {
            const companyName = s?.company?.name ?? '—';
            const role = s?.roleTitle ? ` • ${s.roleTitle}` : '';
            const created = s?.createdAt ? new Date(s.createdAt).toLocaleDateString() : '';
            const rounds =
              Array.isArray(s?.rounds) && s.rounds.length > 0
                ? s.rounds
                    .slice()
                    .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))
                    .map((r: any) => r?.label)
                    .filter(Boolean)
                    .join(' → ')
                : '';

            return (
              <article key={s.id} className="card p-4">
                <div className="flex justify-between">
                  <h3 className="font-medium">
                    <Link
                      // use the path that exists in your app: /submissions/[id] is common
                      href={`/submissions/${s.id}`}
                      className="hover:underline"
                    >
                      {companyName}
                      {role}
                    </Link>
                  </h3>
                  <div className="text-xs text-muted">{created}</div>
                </div>

                <p className="text-sm text-muted mt-1">
                  CTC: {s?.ctc ?? '—'} • Location: {s?.location ?? '—'} • Difficulty: {s?.difficulty ?? '—'}/5
                </p>

                {s?.journey && <p className="mt-2 text-sm">{s.journey}</p>}

                {rounds && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Rounds:</span> {rounds}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
