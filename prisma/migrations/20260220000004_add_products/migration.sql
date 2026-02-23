-- CreateTable: Category
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable: Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "productCode" TEXT,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "compareAtCents" INTEGER,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "longDesc" TEXT,
    "ingredients" TEXT,
    "howToUse" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
