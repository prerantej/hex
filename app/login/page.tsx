'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState<string|undefined>();
  const router = useRouter();

  async function onSubmit(e:React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    const res = await signIn("credentials",{ redirect:false, email, password });
    if (res?.error) setError("Invalid credentials");
    else router.push("/");
  }

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-xl font-semibold mb-4">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div><label className="label">Email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <div><label className="label">Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn w-full">Log in</button>
      </form>
    </div>
  );
}
