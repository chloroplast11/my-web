import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

export function isAdmin(session: Session | null): boolean {
  const expected = process.env.ADMIN_EMAIL;
  if (!expected) return false;
  return session?.user?.email === expected;
}

export async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!isAdmin(session)) throw new Error("Unauthorized");
}
