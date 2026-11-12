import { Star } from "lucide-react";

export default function StarRating({ value = 0, onRate, size = 15, disabled = false }) {
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Rate this thumbnail">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          disabled={disabled}
          onClick={() => onRate(score === value ? 0 : score)}
          aria-label={`${score} out of 5`}
          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-[#FFD60A] disabled:opacity-50"
        >
          <Star
            width={size}
            height={size}
            strokeWidth={1.9}
            style={score <= value ? { color: "#FFD60A", fill: "#FFD60A" } : undefined}
          />
        </button>
      ))}
    </div>
  );
}