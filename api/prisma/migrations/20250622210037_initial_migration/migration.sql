-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BARTENDER', 'MANAGER');

-- CreateTable
CREATE TABLE "Patron" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalPints" INTEGER NOT NULL DEFAULT 0,
    "avatarUrl" TEXT,

    CONSTRAINT "Patron_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pint" (
    "id" TEXT NOT NULL,
    "patronId" TEXT NOT NULL,
    "pouredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bartenderId" TEXT NOT NULL,

    CONSTRAINT "Pint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pintTarget" INTEGER NOT NULL,
    "rewardText" TEXT,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patron_email_key" ON "Patron"("email");

-- AddForeignKey
ALTER TABLE "Pint" ADD CONSTRAINT "Pint_patronId_fkey" FOREIGN KEY ("patronId") REFERENCES "Patron"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pint" ADD CONSTRAINT "Pint_bartenderId_fkey" FOREIGN KEY ("bartenderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
