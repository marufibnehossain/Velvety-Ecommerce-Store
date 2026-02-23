-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "minOrderCents" INTEGER,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
