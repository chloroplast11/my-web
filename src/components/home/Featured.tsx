import Link from "next/link";
import { listVisibleFeaturedPosts, listVisibleFeaturedPhotos } from "@/lib/db/featured";
import { PostCard } from "@/components/blog/PostCard";
import { FeaturedPhotos } from "@/components/photos/FeaturedPhotos";
import { Container } from "@/components/ui/Container";

export async function Featured() {
  const [posts, photos] = await Promise.all([
    listVisibleFeaturedPosts(3),
    listVisibleFeaturedPhotos(6),
  ]);

  if (posts.length === 0 && photos.length === 0) return null;

  return (
    <Container className="py-24 space-y-16">
      {posts.length > 0 && (
        <div>
          <div className="flex items-baseline gap-5 mb-8">
            <span className="text-xs tracking-[.2em] text-accent">04</span>
            <h2 className="font-serif text-[clamp(1.5rem,3vw,2.4rem)]">Recent writing</h2>
            <Link href="/blog" className="ml-auto text-sm text-muted hover:text-ink">All posts →</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </div>
      )}
      {photos.length > 0 && (
        <div>
          <div className="flex items-baseline gap-5 mb-8">
            <span className="text-xs tracking-[.2em] text-accent">05</span>
            <h2 className="font-serif text-[clamp(1.5rem,3vw,2.4rem)]">Selected photographs</h2>
            <Link href="/photos" className="ml-auto text-sm text-muted hover:text-ink">All photos →</Link>
          </div>
          <FeaturedPhotos photos={photos} />
        </div>
      )}
    </Container>
  );
}
