-- CreateEnum
CREATE TYPE "FeaturedKind" AS ENUM ('post', 'photo');

-- CreateTable
CREATE TABLE "Featured" (
    "id" TEXT NOT NULL,
    "kind" "FeaturedKind" NOT NULL,
    "refId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Featured_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Featured_kind_order_idx" ON "Featured"("kind", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Featured_kind_refId_key" ON "Featured"("kind", "refId");
