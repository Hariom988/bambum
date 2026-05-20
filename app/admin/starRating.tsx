import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange?: (r: number) => void;
  size?: number;
}

export default function StarRating({
  rating,
  onChange,
  size = 16,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          style={{
            background: "none",
            border: "none",
            cursor: onChange ? "pointer" : "default",
            padding: 0,
            lineHeight: 0,
          }}
        >
          <Star
            size={size}
            fill={i <= rating ? "#b8945e" : "transparent"}
            strokeWidth={1.5}
            style={{ color: "#b8945e" }}
          />
        </button>
      ))}
    </div>
  );
}
