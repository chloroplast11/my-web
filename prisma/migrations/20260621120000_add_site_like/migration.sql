-- CreateTable
CREATE TABLE "SiteLike" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteLike_pkey" PRIMARY KEY ("id")
);
