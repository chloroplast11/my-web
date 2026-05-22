"use client";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fromParam = useSearchParams().get("from") ?? "/admin";
  const from = fromParam.startsWith("/") && !fromParam.startsWith("//") ? fromParam : "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Invalid email or password");
    else window.location.href = from;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="font-serif text-3xl">Sign in</h1>
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="Email" className="block w-full border border-line p-3 rounded"
      />
      <input
        type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
        placeholder="Password" className="block w-full border border-line p-3 rounded"
      />
      {error && <p className="text-red-700 text-sm">{error}</p>}
      <button className="px-6 py-3 bg-ink text-paper rounded-full">Sign in</button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
