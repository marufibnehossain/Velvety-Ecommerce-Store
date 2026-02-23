CREATE TABLE "Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Address_userId_idx" ON "Address"("userId");
