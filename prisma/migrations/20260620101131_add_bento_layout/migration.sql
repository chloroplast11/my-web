-- CreateTable
CREATE TABLE "BentoLayout" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "positions" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BentoLayout_pkey" PRIMARY KEY ("id")
);
