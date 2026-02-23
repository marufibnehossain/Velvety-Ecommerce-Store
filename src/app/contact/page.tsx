"use client";

import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import Button from "@/components/Button";
import Accordion from "@/components/Accordion";

const FAQ_ITEMS = [
  { title: "What is your return policy?", content: "We offer a 30-day return policy for unopened items. Please contact us to initiate a return." },
  { title: "How long does shipping take?", content: "Orders typically ship within 2–3 business days. Delivery takes 5–7 business days within the US." },
  { title: "Do you ship internationally?", content: "We currently ship to the US and Canada. International expansion is planned for the future." },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(data.error ?? "Failed to send");
      }
    } catch {
      setError("Failed to send");
    }
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <SectionHeading
          eyebrow="Get in touch"
          title="Contact us"
          subtitle="We’d love to hear from you. Send a message and we’ll respond within 1–2 business days."
        />
        <div className="mt-12 grid lg:grid-cols-2 gap-12 lg:gap-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block font-sans text-sm font-medium text-text mb-1">Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block font-sans text-sm font-medium text-text mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
              />
            </div>
            <div>
              <label htmlFor="message" className="block font-sans text-sm font-medium text-text mb-1">Message</label>
              <textarea
                id="message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2 resize-none"
              />
            </div>
            {sent && <p className="font-sans text-sm text-sage-dark">Message sent. We&apos;ll get back to you soon.</p>}
            {error && <p className="font-sans text-sm text-red-600">{error}</p>}
            <Button type="submit" variant="primary" disabled={sending}>
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>
          <div>
            <h3 className="font-sans text-lg font-medium text-text mb-4">Other ways to reach us</h3>
            <div className="font-sans text-muted space-y-2">
              <p>Call: +1 (234) 567 890</p>
              <p>Email: hello@velvety.com</p>
              <p className="pt-4">Mon–Fri, 9am–5pm PT</p>
            </div>
          </div>
        </div>
        <section className="mt-16 pt-12 border-t border-border">
          <h2 className="font-sans text-xl font-medium text-text mb-6">FAQ</h2>
          <Accordion items={FAQ_ITEMS} />
        </section>
      </div>
    </div>
  );
}
