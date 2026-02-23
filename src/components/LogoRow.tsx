import Image from "next/image";

interface Logo {
  name: string;
  src: string;
}

interface LogoRowProps {
  logos: Logo[];
  title?: string;
  className?: string;
}

export default function LogoRow({
  logos,
  title = "As seen in",
  className = "",
}: LogoRowProps) {
  return (
    <section className={`py-12 md:py-16 ${className}`}>
      {title ? (
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted text-center mb-8">
          {title}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-70">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="relative h-8 w-24 grayscale contrast-75"
            title={logo.name}
          >
            <Image
              src={logo.src}
              alt={logo.name}
              fill
              className="object-contain object-center"
              sizes="96px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
