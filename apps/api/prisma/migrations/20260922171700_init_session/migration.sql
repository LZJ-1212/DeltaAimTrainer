-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dpi" INTEGER NOT NULL DEFAULT 1600,
    "sens" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "hFovDeg" DOUBLE PRECISION NOT NULL DEFAULT 110,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "optic" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "shotsFired" INTEGER NOT NULL,
    "shotsHit" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "avgReactionMs" INTEGER,
    "trackingUptime" DOUBLE PRECISION,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_userId_createdAt_idx" ON "Session"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
