import Image from "next/image";
import {
  getFeaturedProducts,
  getProducts,
  filterTags,
  asSeenInLogos,
} from "@/lib/data";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import FilterChips from "@/components/FilterChips";
import LogoRow from "@/components/LogoRow";
import NewsletterBar from "@/components/NewsletterBar";
import TestimonialCard from "@/components/TestimonialCard";

function filterByTag(
  items: typeof products,
  tagSlug: string | null
) {
  if (!tagSlug) return items;
  const singular = tagSlug.replace(/s$/, "");
  return items.filter((p) =>
    p.tags.some((t) => t.toLowerCase() === tagSlug || t.toLowerCase() === singular)
  );
}

interface HomePageProps {
  searchParams?: { category?: string; tag?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const tagFilter = searchParams?.tag ?? null;
  const featured = await getFeaturedProducts();
  const allProducts = await getProducts();
  const discoveryProducts = (tagFilter ? filterByTag(allProducts, tagFilter) : allProducts).slice(0, 4);
  const discoveryFilterOptions = filterTags.map((t) => ({ id: t.id, name: t.name, slug: t.slug }));

  return (
    <>
      {/* 1. Hero: left sage + bottle, right darker green + foliage + headline + Shop now > */}
      <section className="grid lg:grid-cols-2 min-h-[70vh] lg:min-h-[85vh]">
        <div className="relative aspect-[4/5] lg:aspect-auto bg-sage-1 order-2 lg:order-1 flex items-center justify-center">
          <Image
            src="/images/hero-placeholder.svg"
            alt="Velvety product"
            width={280}
            height={480}
            className="object-contain object-center"
            priority
          />
        </div>
        <div className="relative flex flex-col justify-center px-6 md:px-10 lg:px-14 py-16 lg:py-24 order-1 lg:order-2 bg-sage-dark overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sage-dark via-sage-dark to-sage-2/20" aria-hidden />
          <div className="relative z-10">
            <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-hero-text leading-tight tracking-tight max-w-xl">
              Let nature take care of your body and soul
            </h1>
            <div className="mt-10">
              <Button href="/products" variant="hero">
                Shop now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Inspired by traditional knowledge: left heading + bowl image, right 3 value blocks with icons */}
      <section className="bg-bg py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <h2 className="font-sans text-2xl md:text-3xl font-medium text-text leading-tight mb-6">
              Inspired by traditional knowledge and nature
            </h2>
            <div className="relative aspect-[4/3] max-w-md rounded-lg overflow-hidden bg-sage-1">
              <Image
                src="/images/bowl-placeholder.svg"
                alt="Natural ingredients"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="space-y-8">
            {[
              {
                title: "100% Organic",
                desc: "Our products are made with natural, organic, and vegan ingredients sourced with care.",
                icon: "leaf",
              },
              {
                title: "Cruelty-free",
                desc: "We never test on animals. Our formulations are kind to all living beings.",
                icon: "heart",
              },
              {
                title: "Made in USA",
                desc: "Handcrafted in California with transparency and quality you can trust.",
                icon: "sprout",
              },
            ].map((block) => (
              <div key={block.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-sage-1 border border-sage-2 flex items-center justify-center shrink-0 text-sage-dark font-sans text-lg" aria-hidden>
                  {block.icon === "leaf" && "🍃"}
                  {block.icon === "heart" && "♥"}
                  {block.icon === "sprout" && "🌱"}
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-text">{block.title}</h3>
                  <p className="mt-1 font-sans text-sm text-muted leading-relaxed">{block.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Facial and skincare: centered title, 3 products in light green squares (code, price, stars, reviews) */}
      <section className="bg-bg py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-sans text-2xl md:text-3xl font-medium text-text text-center max-w-2xl mx-auto">
            Facial and skincare, natural and certified organic
          </h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} variant="featured" />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Brand story: "Velvety beauty and skincare company" + paragraph, Anna Doe testimonial, media logos */}
      <section className="bg-bg py-16 md:py-24 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16">
          <h2 className="font-sans text-2xl md:text-3xl font-medium text-text leading-tight">
            Velvety beauty and skincare company
          </h2>
          <div>
            <p className="font-sans text-muted leading-relaxed">
              We believe in the power of nature and tradition. Our formulations blend time-tested ingredients with modern efficacy, so you get results without compromise. Every product is created with intention—for your skin and for the planet.
            </p>
            <div className="mt-8">
              <TestimonialCard
                quote="I have been using Velvety for six months. My skin has never looked or felt better. Gentle yet effective."
                author="Anna Doe"
                rating={5}
              />
            </div>
          </div>
        </div>
        <div className="mt-12">
          <LogoRow logos={asSeenInLogos} />
        </div>
      </section>

      {/* 5. Discover: sage bar "Discover our entire growing range", then left "Mild skincare & Facial routine" + filter tags, right 2x2 grid + View All */}
      <section className="bg-sage-2 border-y border-border py-8 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-sans text-xl md:text-2xl font-medium text-hero-text text-center">
            Discover our entire growing range of products
          </h2>
        </div>
      </section>
      <section className="bg-bg py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <h3 className="font-sans text-xl font-medium text-text mb-6">
              Mild skincare & Facial routine
            </h3>
            <FilterChips
              options={discoveryFilterOptions}
              paramKey="tag"
            />
          </div>
          <div className="lg:col-span-8">
            <div className="grid sm:grid-cols-2 gap-8">
              {discoveryProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="featured" />
              ))}
            </div>
            <div className="mt-8">
              <Button href="/products" variant="secondary">
                View All
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Skin diagnosis: left face illustration, right "Your skin diagnosis in 3 minutes" + Find out more > */}
      <section className="bg-bg py-16 md:py-24 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-square max-w-sm mx-auto md:mx-0">
            <Image
              src="/images/face-diagnosis-placeholder.svg"
              alt=""
              fill
              className="object-contain"
              aria-hidden
            />
          </div>
          <div>
            <SectionHeading
              title="Your skin diagnosis in 3 minutes"
              subtitle="Answer a few quick questions and get personalised product recommendations tailored to your skin type and goals."
            />
            <Button href="/contact" variant="hero" className="mt-6">
              Find out more
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Testimonial + Why Choose Us: bottle left, Christina M. quote right, then 3 blocks (Tailored, Always improving, Planet-friendly) with Read more > */}
      <section className="bg-bg py-16 md:py-24 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          <div className="relative w-48 h-64 shrink-0">
            <Image
              src="/images/placeholder.svg"
              alt=""
              fill
              className="object-contain"
              aria-hidden
            />
          </div>
          <div className="flex-1 max-w-xl">
            <TestimonialCard
              quote="HOLOCENA skincare has completely transformed my routine. I recommend it to everyone."
              author="Christina M."
              rating={5}
            />
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-16">
          <h3 className="font-sans text-xl font-medium text-text mb-8">Why Choose Us</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Tailored for any skin", desc: "Whether sensitive, oily, or combination—we have a formula that fits.", href: "/about" },
              { title: "Always improving products", desc: "We listen to your feedback and continuously refine our formulations.", href: "/about" },
              { title: "Planet-friendly mission", desc: "Sustainable packaging and responsible sourcing at every step.", href: "/about#sustainability" },
            ].map((card) => (
              <div key={card.title} className="border border-border rounded-lg bg-surface p-6">
                <div className="w-10 h-10 rounded-full bg-sage-1 flex items-center justify-center text-sage-dark mb-4" aria-hidden>🍃</div>
                <h4 className="font-sans font-semibold text-text">{card.title}</h4>
                <p className="mt-2 font-sans text-sm text-muted leading-relaxed">{card.desc}</p>
                <Button href={card.href} variant="text-arrow" className="mt-4">
                  Read more
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Newsletter: sage bar, Subscribe 10% off + email input */}
      <NewsletterBar />
    </>
  );
}
