import Link from "next/link";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <SectionHeading
        title="Product not found"
        subtitle="This product may have been removed or the link is incorrect."
      />
      <Button href="/products" variant="primary" className="mt-8">
        View all products
      </Button>
    </div>
  );
}
