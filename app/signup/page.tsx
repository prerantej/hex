'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function validate() {
    if (!email || !email.includes('@')) return 'Enter a valid email.';
    if (!email.toLowerCase().endsWith('@vitapstudent.ac.in'))
      return 'Use your campus email (@vitapstudent.ac.in).';
    if (!/^[a-z0-9-]{3,24}$/i.test(handle))
      return 'Handle must be 3–24 chars (letters, numbers, hyphen).';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    const clientErr = validate();
    if (clientErr) {
      setError(clientErr);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password, handle }),
      });

      // try JSON first, then fallback to text (so we can surface error pages)
      let data: any = null;
      let rawText = '';
      try {
        data = await res.clone().json();
      } catch {
        rawText = await res.text();
      }

      // log for debugging while testing
      console.log('Signup response status=', res.status, 'json=', data, 'text=', rawText);

      if (!res.ok) {
        // map common server statuses to readable messages
        const serverMsg =
          (data && (data.error || data.message)) ||
          rawText ||
          (res.status === 400
            ? 'Invalid input.'
            : res.status === 403
            ? 'Email domain not allowed.'
            : res.status === 409
            ? 'Email or handle already in use.'
            : res.status === 429
            ? 'Too many attempts. Please try later.'
            : 'Internal Server Error');

        setError(typeof serverMsg === 'string' ? serverMsg : 'Signup failed');
        return;
      }

      router.push('/login');
    } catch (err) {
      console.error('Signup request failed:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-xl font-semibold mb-4">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            placeholder="you@vitapstudent.ac.in"
            required
          />
        </div>

        <div>
          <label className="label">Handle (public alias)</label>
          <input
            className="input"
            value={handle}
            onChange={(e) => setHandle(e.target.value.trim())}
            placeholder="jade-owl"
            required
          />
          <p className="text-xs opacity-70 mt-1">3–24 chars, letters/numbers/hyphen only.</p>
        </div>

        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="btn w-full" type="submit" disabled={loading}>
          {loading ? 'Signing up…' : 'Sign up'}
        </button>
      </form>
    </div>
  );
}
