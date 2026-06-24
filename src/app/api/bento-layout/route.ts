import { z } from "zod";
import { auth } from "@/lib/auth";
import { getBentoLayout, setBentoLayout } from "@/lib/db/bento-layout";
import { layoutWriteSchema } from "@/lib/bento-defaults";

const requestSchema = z.object({
  positions: layoutWriteSchema.strict(),
});

export async function GET(): Promise<Response> {
  const positions = await getBentoLayout();
  return new Response(JSON.stringify({ positions }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

export async function PUT(req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "malformed json" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  // Last-writer-wins by design. The single-row table has no version column;
  // concurrent admin edits race and the later upsert wins.
  const saved = await setBentoLayout(parsed.data.positions);
  return new Response(JSON.stringify({ positions: saved }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
