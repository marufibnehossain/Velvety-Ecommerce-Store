-- AlterTable Coupon: add maxUses, usedCount
ALTER TABLE "Coupon" ADD COLUMN "maxUses" INTEGER;
ALTER TABLE "Coupon" ADD COLUMN "usedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable Order: add tracking
ALTER TABLE "Order" ADD COLUMN "trackingNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "trackingCarrier" TEXT;

-- AlterTable Product: add badge
ALTER TABLE "Product" ADD COLUMN "badge" TEXT;

-- AlterTable Review: add status
ALTER TABLE "Review" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'APPROVED';

-- CreateTable NewsletterSubscriber
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateTable ContactMessage
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable WishlistItem
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");
