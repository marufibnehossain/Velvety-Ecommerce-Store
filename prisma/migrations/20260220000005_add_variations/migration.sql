-- CreateTable: ProductAttribute
CREATE TABLE "ProductAttribute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "values" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: ProductVariation
CREATE TABLE "ProductVariation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "attributes" TEXT NOT NULL,
    "priceCents" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "images" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductVariation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProductAttribute_productId_idx" ON "ProductAttribute"("productId");
CREATE INDEX "ProductVariation_productId_idx" ON "ProductVariation"("productId");
