import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "hero" | "text-arrow";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  arrow?: boolean;
  disabled?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-sans text-sm tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sage-2 focus:ring-offset-2";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-surface border border-border text-text px-6 py-3 rounded-lg hover:border-text/30 hover:shadow-sm",
  secondary:
    "bg-sage-1 border border-border text-text px-6 py-3 rounded-lg hover:bg-sage-2/50 hover:border-sage-2",
  hero:
    "bg-white text-sage-dark px-6 py-3 rounded-lg hover:bg-hero-text/10 transition-colors",
  "text-arrow":
    "text-text hover:text-muted border-0 bg-transparent px-0 py-2",
};

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  arrow = true,
  disabled = false,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className} ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
        {arrow && variant !== "text-arrow" && (
          <span className="text-muted" aria-hidden>→</span>
        )}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
      {arrow && variant !== "text-arrow" && (
        <span className="text-muted" aria-hidden>→</span>
      )}
    </button>
  );
}
