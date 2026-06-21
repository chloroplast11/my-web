import { getSiteLikeCount, incrementSiteLike } from "@/lib/db/site-likes";

const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

export async function GET(): Promise<Response> {
  const count = await getSiteLikeCount();
  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

export async function POST(): Promise<Response> {
  const count = await incrementSiteLike();
  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: JSON_HEADERS,
  });
}
