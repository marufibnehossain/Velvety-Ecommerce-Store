-- AlterTable: add role to User
ALTER TABLE "User" ADD COLUMN "role" TEXT DEFAULT 'CUSTOMER';

-- CreateTable: Order
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "shippingCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "couponCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable: OrderItem
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex (for listing items by order)
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
