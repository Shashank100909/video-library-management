-- CreateEnum
CREATE TYPE "borrow_status_enum" AS ENUM ('BORROWED', 'RETURNED');

-- CreateEnum
CREATE TYPE "user_role_enum" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "user_role_enum" NOT NULL DEFAULT 'USER',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalCopies" INTEGER NOT NULL,
    "availableCopies" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "borrowCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "borrow" (
    "id" SERIAL NOT NULL,
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "status" "borrow_status_enum" NOT NULL DEFAULT 'BORROWED',
    "userId" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,

    CONSTRAINT "borrow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "borrow" ADD CONSTRAINT "borrow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrow" ADD CONSTRAINT "borrow_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
