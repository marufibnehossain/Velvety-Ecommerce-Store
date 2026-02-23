-- Add trackInventory to Product (1 = true = limited stock, 0 = false = unlimited)
ALTER TABLE "Product" ADD COLUMN "trackInventory" INTEGER NOT NULL DEFAULT 1;
