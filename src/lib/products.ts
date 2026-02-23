import { prisma } from "@/lib/prisma";
import type { Product, Category } from "@/lib/data";

function parseProduct(dbProduct: {
  id: string;
  slug: string;
  productCode: string | null;
  name: string;
  priceCents: number;
  compareAtCents: number | null;
  rating: number;
  reviewCount: number;
  images: string;
  category: { slug: string };
  tags: string;
  shortDesc: string;
  longDesc: string | null;
  ingredients: string | null;
  howToUse: string | null;
  stock: number;
}): Product {
  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    productCode: dbProduct.productCode ?? undefined,
    name: dbProduct.name,
    price: dbProduct.priceCents / 100,
    compareAt: dbProduct.compareAtCents ? dbProduct.compareAtCents / 100 : undefined,
    rating: dbProduct.rating,
    reviewCount: dbProduct.reviewCount,
    images: JSON.parse(dbProduct.images) as string[],
    category: dbProduct.category.slug,
    tags: JSON.parse(dbProduct.tags) as string[],
    shortDesc: dbProduct.shortDesc,
    longDesc: dbProduct.longDesc ?? undefined,
    ingredients: dbProduct.ingredients ?? undefined,
    howToUse: dbProduct.howToUse ?? undefined,
    stock: dbProduct.stock,
  };
}

export async function getProducts(): Promise<Product[]> {
  const dbProducts = await prisma.$queryRawUnsafe<Array<{
    id: string;
    slug: string;
    productCode: string | null;
    name: string;
    priceCents: number;
    compareAtCents: number | null;
    rating: number;
    reviewCount: number;
    images: string;
    categoryId: string;
    tags: string;
    shortDesc: string;
    longDesc: string | null;
    ingredients: string | null;
    howToUse: string | null;
    stock: number;
    trackInventory?: number;
    badge: string | null;
    categorySlug: string;
  }>>(
    `SELECT p.*, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id ORDER BY p.createdAt DESC`
  );
  return dbProducts.map(p => ({
    id: p.id,
    slug: p.slug,
    productCode: p.productCode ?? undefined,
    name: p.name,
    price: p.priceCents / 100,
    compareAt: p.compareAtCents ? p.compareAtCents / 100 : undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: JSON.parse(p.images) as string[],
    category: p.categorySlug || "",
    tags: JSON.parse(p.tags) as string[],
    shortDesc: p.shortDesc,
    longDesc: p.longDesc ?? undefined,
    ingredients: p.ingredients ?? undefined,
    howToUse: p.howToUse ?? undefined,
    stock: p.stock,
    trackInventory: p.trackInventory === undefined ? true : Boolean(p.trackInventory),
    badge: p.badge ?? undefined,
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const dbProducts = await prisma.$queryRawUnsafe<Array<{
    id: string;
    slug: string;
    productCode: string | null;
    name: string;
    priceCents: number;
    compareAtCents: number | null;
    rating: number;
    reviewCount: number;
    images: string;
    categoryId: string;
    tags: string;
    shortDesc: string;
    longDesc: string | null;
    ingredients: string | null;
    howToUse: string | null;
    stock: number;
    trackInventory?: number;
    badge: string | null;
  }>>(
    `SELECT p.*, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.slug = ?`,
    slug
  );
  if (dbProducts.length === 0) return null;
  const p = dbProducts[0];
  const categories = await prisma.$queryRawUnsafe<Array<{ slug: string }>>(
    `SELECT slug FROM Category WHERE id = ?`,
    p.categoryId
  );
  const product: Product = {
    id: p.id,
    slug: p.slug,
    productCode: p.productCode ?? undefined,
    name: p.name,
    price: p.priceCents / 100,
    compareAt: p.compareAtCents ? p.compareAtCents / 100 : undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: JSON.parse(p.images) as string[],
    category: categories[0]?.slug || "",
    tags: JSON.parse(p.tags) as string[],
    shortDesc: p.shortDesc,
    longDesc: p.longDesc ?? undefined,
    ingredients: p.ingredients ?? undefined,
    howToUse: p.howToUse ?? undefined,
    stock: p.stock,
    trackInventory: p.trackInventory === undefined ? true : Boolean(p.trackInventory),
    badge: p.badge ?? undefined,
  };
  // Load attributes and variations
    const attrs = await prisma.$queryRawUnsafe<Array<{
      id: string;
      name: string;
      values: string;
    }>>(
      'SELECT id, name, "values" FROM ProductAttribute WHERE productId = ? ORDER BY name ASC',
      p.id
    );
  const vars = await prisma.$queryRawUnsafe<Array<{
    id: string;
    attributes: string;
    priceCents: number | null;
    stock: number;
    sku: string | null;
    images: string | null;
  }>>(
    "SELECT id, attributes, priceCents, stock, sku, images FROM ProductVariation WHERE productId = ?",
    p.id
  );
  if (attrs.length > 0) {
    product.attributes = attrs.map(a => ({
      id: a.id,
      name: a.name,
      values: JSON.parse(a.values) as string[],
    }));
  }
  if (vars.length > 0) {
    product.variations = vars.map(v => ({
      id: v.id,
      attributes: JSON.parse(v.attributes) as Record<string, string>,
      price: v.priceCents ? v.priceCents / 100 : null,
      stock: v.stock,
      sku: v.sku ?? undefined,
      images: v.images ? JSON.parse(v.images) as string[] : undefined,
    }));
  }
  return product;
}

export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  const dbProducts = await prisma.$queryRawUnsafe<Array<{
    id: string;
    slug: string;
    productCode: string | null;
    name: string;
    priceCents: number;
    compareAtCents: number | null;
    rating: number;
    reviewCount: number;
    images: string;
    categoryId: string;
    tags: string;
    shortDesc: string;
    longDesc: string | null;
    ingredients: string | null;
    howToUse: string | null;
    stock: number;
    trackInventory?: number;
    badge: string | null;
    categorySlug: string;
  }>>(
    `SELECT p.*, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id ORDER BY p.createdAt DESC LIMIT ?`,
    limit
  );
  return dbProducts.map(p => ({
    id: p.id,
    slug: p.slug,
    productCode: p.productCode ?? undefined,
    name: p.name,
    price: p.priceCents / 100,
    compareAt: p.compareAtCents ? p.compareAtCents / 100 : undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: JSON.parse(p.images) as string[],
    category: p.categorySlug || "",
    tags: JSON.parse(p.tags) as string[],
    shortDesc: p.shortDesc,
    longDesc: p.longDesc ?? undefined,
    ingredients: p.ingredients ?? undefined,
    howToUse: p.howToUse ?? undefined,
    stock: p.stock,
    trackInventory: p.trackInventory === undefined ? true : Boolean(p.trackInventory),
    badge: p.badge ?? undefined,
  }));
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const categorySlug = product.category;
  const tagMatch = product.tags.length > 0 ? `%${product.tags[0]}%` : null;
  let query = `SELECT p.*, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.id != ?`;
  const params: any[] = [product.id];
  
  const conditions: string[] = [];
  if (categorySlug) {
    conditions.push(`c.slug = ?`);
    params.push(categorySlug);
  }
  if (tagMatch) {
    conditions.push(`p.tags LIKE ?`);
    params.push(tagMatch);
  }
  
  if (conditions.length > 0) {
    query += ` AND (${conditions.join(" OR ")})`;
  }
  
  query += ` ORDER BY p.createdAt DESC LIMIT ?`;
  params.push(limit);
  
  const dbProducts = await prisma.$queryRawUnsafe<Array<{
    id: string;
    slug: string;
    productCode: string | null;
    name: string;
    priceCents: number;
    compareAtCents: number | null;
    rating: number;
    reviewCount: number;
    images: string;
    categoryId: string;
    tags: string;
    shortDesc: string;
    longDesc: string | null;
    ingredients: string | null;
    howToUse: string | null;
    stock: number;
    trackInventory?: number;
    badge: string | null;
    categorySlug: string;
  }>>(query, ...params);
  
  return dbProducts.map(p => ({
    id: p.id,
    slug: p.slug,
    productCode: p.productCode ?? undefined,
    name: p.name,
    price: p.priceCents / 100,
    compareAt: p.compareAtCents ? p.compareAtCents / 100 : undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: JSON.parse(p.images) as string[],
    category: p.categorySlug || "",
    tags: JSON.parse(p.tags) as string[],
    shortDesc: p.shortDesc,
    longDesc: p.longDesc ?? undefined,
    ingredients: p.ingredients ?? undefined,
    howToUse: p.howToUse ?? undefined,
    stock: p.stock,
    trackInventory: p.trackInventory === undefined ? true : Boolean(p.trackInventory),
    badge: p.badge ?? undefined,
  }));
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.toLowerCase().trim();
  if (!q) return getProducts();
  const searchTerm = `%${q}%`;
  const dbProducts = await prisma.$queryRawUnsafe<Array<{
    id: string;
    slug: string;
    productCode: string | null;
    name: string;
    priceCents: number;
    compareAtCents: number | null;
    rating: number;
    reviewCount: number;
    images: string;
    categoryId: string;
    tags: string;
    shortDesc: string;
    longDesc: string | null;
    ingredients: string | null;
    howToUse: string | null;
    stock: number;
    trackInventory?: number;
    badge: string | null;
    categorySlug: string;
  }>>(
    `SELECT p.*, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE LOWER(p.name) LIKE ? OR LOWER(p.shortDesc) LIKE ? OR LOWER(p.tags) LIKE ? OR LOWER(c.slug) LIKE ? ORDER BY p.createdAt DESC`,
    searchTerm,
    searchTerm,
    searchTerm,
    searchTerm
  );
  return dbProducts.map(p => ({
    id: p.id,
    slug: p.slug,
    productCode: p.productCode ?? undefined,
    name: p.name,
    price: p.priceCents / 100,
    compareAt: p.compareAtCents ? p.compareAtCents / 100 : undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: JSON.parse(p.images) as string[],
    category: p.categorySlug || "",
    tags: JSON.parse(p.tags) as string[],
    shortDesc: p.shortDesc,
    longDesc: p.longDesc ?? undefined,
    ingredients: p.ingredients ?? undefined,
    howToUse: p.howToUse ?? undefined,
    stock: p.stock,
    trackInventory: p.trackInventory === undefined ? true : Boolean(p.trackInventory),
    badge: p.badge ?? undefined,
  }));
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const placeholders = slugs.map(() => "?").join(",");
  const dbProducts = await prisma.$queryRawUnsafe<Array<{
    id: string;
    slug: string;
    productCode: string | null;
    name: string;
    priceCents: number;
    compareAtCents: number | null;
    rating: number;
    reviewCount: number;
    images: string;
    categoryId: string;
    tags: string;
    shortDesc: string;
    longDesc: string | null;
    ingredients: string | null;
    howToUse: string | null;
    stock: number;
    trackInventory?: number;
    badge: string | null;
    categorySlug: string;
  }>>(
    `SELECT p.*, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.slug IN (${placeholders})`,
    ...slugs
  );
  return dbProducts.map(p => ({
    id: p.id,
    slug: p.slug,
    productCode: p.productCode ?? undefined,
    name: p.name,
    price: p.priceCents / 100,
    compareAt: p.compareAtCents ? p.compareAtCents / 100 : undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: JSON.parse(p.images) as string[],
    category: p.categorySlug || "",
    tags: JSON.parse(p.tags) as string[],
    shortDesc: p.shortDesc,
    longDesc: p.longDesc ?? undefined,
    ingredients: p.ingredients ?? undefined,
    howToUse: p.howToUse ?? undefined,
    stock: p.stock,
    trackInventory: p.trackInventory === undefined ? true : Boolean(p.trackInventory),
    badge: p.badge ?? undefined,
  }));
}

export async function getCategories(): Promise<Category[]> {
  const dbCategories = await prisma.$queryRawUnsafe<Array<{
    id: string;
    name: string;
    slug: string;
  }>>(
    `SELECT id, name, slug FROM Category ORDER BY name ASC`
  );
  return dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));
}
