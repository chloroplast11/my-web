import { BentoStage } from "@/components/home/bento/BentoStage";
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
import { pickRandomTrack } from "@/lib/music-playlist";
import { listPublishedPosts } from "@/lib/db/posts";
import { prisma } from "@/lib/prisma";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";

export default async function HomePage() {
  const today = new Date();
  const track = pickRandomTrack();

  const [posts, latestPhoto] = await Promise.all([
    listPublishedPosts(),
    prisma.photo.findFirst({ orderBy: [{ createdAt: "desc" }] }),
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

  return (
    <>
      <BentoStage>
        <TitleBlock />
        <PostmarkLayer today={today} />
        <AboutCard enterIndex={0} />
        <CalendarCard today={today} enterIndex={1} />
        <MusicCard track={track} enterIndex={2} />
        <PhotosCard photo={photoPreview} enterIndex={3} />
        <BlogCard post={latestPost} enterIndex={4} />
        <HanabiCard enterIndex={5} />
        <ClockLcdCard enterIndex={6} />
        <ClockAnalogCard enterIndex={7} />
      </BentoStage>
      <PersonJsonLd />
    </>
  );
}
