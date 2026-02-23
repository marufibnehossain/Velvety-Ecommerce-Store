-- Add variation fields to OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "variationId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "variationLabel" TEXT;
