import RatingStars from "./RatingStars";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  rating?: number;
  className?: string;
}

export default function TestimonialCard({
  quote,
  author,
  role,
  rating,
  className = "",
}: TestimonialCardProps) {
  return (
    <blockquote
      className={`rounded-sm border border-border bg-surface p-6 md:p-8 ${className}`}
    >
      {rating != null && (
        <div className="mb-4">
          <RatingStars rating={rating} />
        </div>
      )}
      <p className="font-display text-lg md:text-xl text-text leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
      <footer className="mt-4">
        <cite className="font-sans text-sm font-medium text-text not-italic">
          {author}
        </cite>
        {role && (
          <span className="font-sans text-sm text-muted before:content-['—'] before:mr-2 before:ml-1">
            {role}
          </span>
        )}
      </footer>
    </blockquote>
  );
}
