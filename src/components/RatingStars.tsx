interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

export default function RatingStars({
  rating,
  reviewCount,
  className = "",
}: RatingStarsProps) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex" aria-label={`Rating: ${rating} out of 5`}>
        {Array.from({ length: full }).map((_, i) => (
          <span key={`full-${i}`} className="text-text">★</span>
        ))}
        {half && <span className="text-text opacity-70">★</span>}
        {Array.from({ length: empty }).map((_, i) => (
          <span key={`empty-${i}`} className="text-border">★</span>
        ))}
      </div>
      {reviewCount != null && (
        <span className="font-sans text-xs text-muted ml-1">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
