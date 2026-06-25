import { EditableBento } from "@/components/home/bento/EditableBento";
import { getBentoLayout } from "@/lib/db/bento-layout";
import { TitleBlock } from "@/components/home/bento/TitleBlock";
import { PostmarkLayer } from "@/components/home/bento/PostmarkLayer";
import { AboutCard } from "@/components/home/bento/cards/AboutCard";
import { CalendarCard } from "@/components/home/bento/cards/CalendarCard";
import { MusicCard } from "@/components/home/bento/cards/MusicCard";
import { PhotosCard } from "@/components/home/bento/cards/PhotosCard";
import { BlogCard } from "@/components/home/bento/cards/BlogCard";
import { HanabiCard } from "@/components/home/bento/cards/HanabiCard";
import { ClockLcdCard } from "@/components/home/bento/cards/ClockLcdCard";
import { ClockAnalogCard } from "@/components/home/bento/cards/ClockAnalogCard";
import { LikesCard } from "@/components/home/bento/cards/LikesCard";
import { WriteCard } from "@/components/home/bento/cards/WriteCard";
import { listPublishedPosts } from "@/lib/db/posts";
import { getSiteLikeCount } from "@/lib/db/site-likes";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin as checkIsAdmin } from "@/lib/admin-auth";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";

export default async function HomePage() {
  const today = new Date();

  const [posts, latestPhoto, initialLikeCount] = await Promise.all([
    listPublishedPosts(),
    prisma.photo.findFirst({ orderBy: [{ createdAt: "desc" }] }),
    getSiteLikeCount(),
  ]);

  const latestPost = posts[0]
    ? {
        title: posts[0].title,
        excerpt: posts[0].excerpt ?? null,
        publishedAt: posts[0].publishedAt ?? new Date(),
      }
    : null;

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const photoPreview = latestPhoto
    ? {
        src: `https://res.cloudinary.com/${cloud}/image/upload/q_auto,f_auto,w_1200/${latestPhoto.cloudinaryPublicId}`,
        alt: latestPhoto.caption ?? null,
      }
    : null;

  const [savedLayout, session] = await Promise.all([
    getBentoLayout(),
    auth(),
  ]);
  const isAdmin = checkIsAdmin(session);

  return (
    <>
      <EditableBento initialLayout={savedLayout} isAdmin={isAdmin}>
        <TitleBlock />
        <PostmarkLayer today={today} />
        <AboutCard enterIndex={0} />
        <CalendarCard today={today} enterIndex={1} />
        <MusicCard enterIndex={2} />
        <PhotosCard photo={photoPreview} enterIndex={3} />
        <BlogCard post={latestPost} enterIndex={4} />
        <HanabiCard enterIndex={5} />
        <ClockLcdCard enterIndex={6} />
        <ClockAnalogCard enterIndex={7} />
        <LikesCard enterIndex={8} initialCount={initialLikeCount} />
        {isAdmin && <WriteCard enterIndex={9} />}
      </EditableBento>
      <PersonJsonLd />
    </>
  );
}
