import { auth } from "@/lib/auth";

export default async function AdminHome() {
  const session = await auth();
  return (
    <div>
      <h1 className="font-serif text-3xl">Admin</h1>
      <p className="mt-4 text-muted">Signed in as {session?.user?.email}</p>
    </div>
  );
}
