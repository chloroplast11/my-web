import Link from "next/link";
import { listPublishedPosts } from "@/lib/db/posts";
import { listPhotos } from "@/lib/db/photos";
import { PostCard } from "@/components/blog/PostCard";
import { BlurredImage } from "@/components/photos/BlurredImage";

export async function Featured() {
  const [posts, photos] = await Promise.all([
    listPublishedPosts(),
    listPhotos(),
  ]);
  const recentPosts = posts.slice(0, 3);
  const recentPhotos = photos.slice(0, 6);

  return (
    <section className="px-[5vw] py-24 max-w-[var(--container-site)] mx-auto space-y-16">
      <div>
        <div className="flex items-baseline gap-5 mb-8">
          <span className="text-xs tracking-[.2em] text-accent">04</span>
          <h2 className="font-serif text-[clamp(1.5rem,3vw,2.4rem)]">Recent writing</h2>
          <Link href="/blog" className="ml-auto text-sm text-muted hover:text-ink">All posts →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recentPosts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-5 mb-8">
          <span className="text-xs tracking-[.2em] text-accent">05</span>
          <h2 className="font-serif text-[clamp(1.5rem,3vw,2.4rem)]">Selected photographs</h2>
          <Link href="/photos" className="ml-auto text-sm text-muted hover:text-ink">All photos →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {recentPhotos.map((p) => (
            <Link href="/photos" key={p.id} className="rounded-lg overflow-hidden">
              <BlurredImage publicId={p.cloudinaryPublicId} alt={p.caption ?? ""} width={p.width} height={p.height} blurDataUrl={p.blurDataUrl} sizes="(max-width:768px) 50vw, 33vw" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
