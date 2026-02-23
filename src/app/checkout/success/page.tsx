import Link from "next/link";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg text-center">
        <div className="w-16 h-16 rounded-full bg-sage-1 border border-sage-2 flex items-center justify-center mx-auto mb-6 text-sage-dark text-2xl" aria-hidden>
          ✓
        </div>
        <SectionHeading
          title="Thank you for your order"
          subtitle="We’ve received your order and will send you a confirmation email shortly. Your items will ship within 2–3 business days."
        />
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/products" variant="primary">
            Continue shopping
          </Button>
          <Button href="/account/orders" variant="secondary">
            View orders
          </Button>
        </div>
      </div>
    </div>
  );
}
