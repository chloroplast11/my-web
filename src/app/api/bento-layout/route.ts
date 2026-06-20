import crypto from "node:crypto";
import { z } from "zod";
import { getBentoLayout, setBentoLayout } from "@/lib/db/bento-layout";
import { layoutSchema } from "@/lib/bento-defaults";

const requestSchema = z.object({
  positions: layoutSchema.strict(),
  key: z.string().min(1),
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

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
  const envKey = process.env.BENTO_LAYOUT_KEY;
  if (!envKey) {
    console.error("BENTO_LAYOUT_KEY is not set — refusing all writes");
    return Response.json({ error: "server misconfigured" }, { status: 500 });
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

  if (!safeEqual(parsed.data.key, envKey)) {
    return Response.json({ error: "invalid key" }, { status: 401 });
  }

  // Last-writer-wins by design (spec §9). The single-row table has no version
  // column; concurrent owner-edits race and the later upsert wins.
  const saved = await setBentoLayout(parsed.data.positions);
  return new Response(JSON.stringify({ positions: saved }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
