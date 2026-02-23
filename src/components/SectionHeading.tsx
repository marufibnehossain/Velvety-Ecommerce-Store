interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  light?: boolean;
  centered?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className = "",
  light = false,
  centered = false,
}: SectionHeadingProps) {
  const textClass = light ? "text-hero-text" : "text-text";
  const mutedClass = light ? "text-hero-text/80" : "text-muted";
  return (
    <div className={`max-w-2xl ${centered ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow && (
        <p className={`font-sans text-xs uppercase tracking-[0.2em] mb-2 ${mutedClass}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`font-sans text-3xl md:text-4xl lg:text-5xl font-medium leading-tight tracking-tight ${textClass}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 font-sans text-base leading-relaxed ${mutedClass}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
