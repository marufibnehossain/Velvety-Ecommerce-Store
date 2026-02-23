import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import Button from "@/components/Button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg">
      <section className="border-b border-border bg-surface py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading
            eyebrow="Our story"
            title="Velvety beauty and skincare company"
            subtitle="We believe in the power of nature and tradition. Our formulations blend time-tested ingredients with modern efficacy."
          />
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-sage-1">
            <Image
              src="/images/bowl-placeholder.svg"
              alt="Our process"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-sans text-2xl font-medium text-text mb-6">
              Born from a love of simple rituals
            </h2>
            <p className="font-sans text-muted leading-relaxed mb-4">
              Velvety started with one serum and a commitment to transparency. Today we offer a small range of products that work together—without overwhelm. No endless steps, just what your skin needs.
            </p>
            <p className="font-sans text-muted leading-relaxed">
              Every product is created with intention: for your skin and for the planet. We source carefully, formulate gently, and package responsibly.
            </p>
            <Button href="/products" variant="secondary" className="mt-8">
              Shop the collection
            </Button>
          </div>
        </div>
      </section>
      <section className="bg-sage-1 border-y border-border py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-sans text-2xl font-medium text-text text-center mb-12">
            Our values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "100% Organic", desc: "Natural, organic, and vegan ingredients sourced with care." },
              { title: "Cruelty-free", desc: "We never test on animals. Kind to all living beings." },
              { title: "Made in USA", desc: "Handcrafted in California with transparency and quality." },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <h3 className="font-sans font-semibold text-text">{v.title}</h3>
                <p className="mt-2 font-sans text-sm text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
