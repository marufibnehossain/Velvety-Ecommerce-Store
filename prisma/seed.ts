import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { id: "cat-1", name: "Skincare", slug: "skincare" },
  { id: "cat-2", name: "Body Care", slug: "body-care" },
  { id: "cat-3", name: "Wellness", slug: "wellness" },
  { id: "cat-4", name: "Gifts", slug: "gifts" },
];

const products = [
  {
    id: "prod-1",
    slug: "calming-serum",
    productCode: "G-123-4",
    name: "Calming Restore Serum",
    priceCents: 2900,
    compareAtCents: 5800,
    rating: 4.8,
    reviewCount: 124,
    images: JSON.stringify(["/images/placeholder.svg"]),
    categoryId: "cat-1",
    tags: JSON.stringify(["serum", "calming"]),
    shortDesc: "A lightweight serum to soothe and restore balance.",
    longDesc: null,
    ingredients: "Aloe vera, chamomile extract, niacinamide, hyaluronic acid, vitamin E.",
    howToUse: "Apply 2–3 drops to cleansed skin morning and evening. Follow with moisturizer.",
    stock: 12,
  },
  {
    id: "prod-2",
    slug: "night-cream",
    productCode: "G-124-1",
    name: "Night Renewal Cream",
    priceCents: 2900,
    compareAtCents: null,
    rating: 4.9,
    reviewCount: 89,
    images: JSON.stringify(["/images/placeholder.svg"]),
    categoryId: "cat-1",
    tags: JSON.stringify(["moisturizer", "night"]),
    shortDesc: "Rich overnight cream for deep nourishment.",
    longDesc: null,
    ingredients: "Shea butter, jojoba oil, calendula, lavender essential oil.",
    howToUse: "Apply a small amount to face and neck before bed. Allow to absorb.",
    stock: 8,
  },
  {
    id: "prod-3",
    slug: "face-oil",
    productCode: "G-125-2",
    name: "Botanical Face Oil",
    priceCents: 4900,
    compareAtCents: null,
    rating: 4.7,
    reviewCount: 203,
    images: JSON.stringify(["/images/placeholder.svg"]),
    categoryId: "cat-1",
    tags: JSON.stringify(["oil", "botanical"]),
    shortDesc: "Plant-based face oil for a natural glow.",
    longDesc: null,
    ingredients: null,
    howToUse: null,
    stock: 0,
  },
  {
    id: "prod-4",
    slug: "cleanser",
    productCode: "G-126-3",
    name: "Gentle Cleansing Balm",
    priceCents: 2900,
    compareAtCents: null,
    rating: 4.6,
    reviewCount: 156,
    images: JSON.stringify(["/images/placeholder.svg"]),
    categoryId: "cat-1",
    tags: JSON.stringify(["cleanser"]),
    shortDesc: "Soft balm that melts away impurities.",
    longDesc: null,
    ingredients: null,
    howToUse: null,
    stock: 3,
  },
  {
    id: "prod-5",
    slug: "toner",
    productCode: "G-127-5",
    name: "Rose Hydrating Toner",
    priceCents: 2900,
    compareAtCents: null,
    rating: 4.5,
    reviewCount: 78,
    images: JSON.stringify(["/images/placeholder.svg"]),
    categoryId: "cat-1",
    tags: JSON.stringify(["toner", "hydrating"]),
    shortDesc: "Refreshing rose water toner.",
    longDesc: null,
    ingredients: null,
    howToUse: null,
    stock: 15,
  },
  {
    id: "prod-6",
    slug: "mask",
    productCode: "G-128-6",
    name: "Clay Purifying Mask",
    priceCents: 4900,
    compareAtCents: null,
    rating: 4.7,
    reviewCount: 92,
    images: JSON.stringify(["/images/placeholder.svg"]),
    categoryId: "cat-1",
    tags: JSON.stringify(["mask", "purifying"]),
    shortDesc: "Deep-cleansing clay mask.",
    longDesc: null,
    ingredients: null,
    howToUse: null,
    stock: 6,
  },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Seeded categories");

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }
  console.log("Seeded products");

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      minOrderCents: null,
      expiresAt: null,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "SAVE5" },
    update: {},
    create: {
      code: "SAVE5",
      type: "FIXED",
      value: 500,
      minOrderCents: 3000,
      expiresAt: null,
    },
  });
  console.log("Seeded coupons: WELCOME10, SAVE5");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
