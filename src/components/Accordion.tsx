"use client";

import { useState } from "react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-b-0 px-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 font-sans text-left text-text hover:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-sage-2 focus:ring-inset rounded"
        aria-expanded={open}
      >
        {title}
        <span className="text-muted shrink-0 ml-2">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="pb-4 font-sans text-sm text-muted leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  items: { title: string; content: React.ReactNode }[];
  defaultOpenIndex?: number;
  className?: string;
}

export default function Accordion({
  items,
  defaultOpenIndex = 0,
  className = "",
}: AccordionProps) {
  return (
    <div className={`border border-border rounded-lg bg-surface overflow-hidden ${className}`}>
      {items.map((item, i) => (
        <AccordionItem
          key={item.title}
          title={item.title}
          defaultOpen={i === defaultOpenIndex}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
