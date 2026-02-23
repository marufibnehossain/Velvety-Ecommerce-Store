import Link from "next/link";
import AdminFooterLink from "@/components/AdminFooterLink";

const footerLinks = {
  Shop: [
    { href: "/products", label: "Shop All" },
    { href: "/products?category=sets", label: "Sets" },
    { href: "/products?category=serums", label: "Serums" },
    { href: "/products?category=moisturizers", label: "Moisturizers" },
    { href: "/products?category=masks", label: "Masks" },
    { href: "/products?category=cleansers", label: "Cleansers" },
    { href: "/products?category=toners", label: "Toners" },
    { href: "/products?category=sunscreens", label: "Sunscreens" },
    { href: "/products?category=gifts", label: "Gifts" },
    { href: "/faq", label: "FAQs" },
  ],
  About: [
    { href: "/about", label: "Our Story" },
    { href: "/about#mission", label: "Our Mission" },
    { href: "/about#sustainability", label: "Sustainability" },
    { href: "/care-tips", label: "Care Tips" },
    { href: "/ingredients", label: "Ingredients" },
    { href: "/reviews", label: "Reviews" },
    { href: "/contact", label: "Contacts" },
  ],
  Legal: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/returns", label: "Returns" },
    { href: "/shipping", label: "Shipping" },
    { href: "/refund-policy", label: "Refund Policy" },
  ],
};

const socialLinks = [
  { href: "#", label: "Instagram", icon: "ig" },
  { href: "#", label: "Facebook", icon: "fb" },
  { href: "#", label: "Twitter", icon: "tw" },
  { href: "#", label: "Pinterest", icon: "pin" },
  { href: "#", label: "YouTube", icon: "yt" },
];

export default function Footer() {
  return (
    <footer className="bg-bg border-t border-border text-text">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="font-sans text-xl font-semibold text-sage-dark uppercase tracking-wide hover:text-text"
            >
              Velvety
            </Link>
            <div className="mt-4 font-sans text-sm text-muted space-y-1">
              <p>Call Us: +1 (234) 567 890</p>
              <p>Email: hello@velvety.com</p>
            </div>
          </div>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-sans text-xs uppercase tracking-[0.15em] text-muted mb-4">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-text hover:text-muted transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-muted">
            © 2026 Velvety. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <AdminFooterLink />
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-sans text-sm text-muted hover:text-text transition-colors"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
