import SetCard from "./SetCard";
import type { SetCard as SetCardType } from "../../lib/SetLogic";

interface SetBoardProps {
  board: (SetCardType | null)[];
  selectedIndices?: number[];
  fadingIndices?: number[];
  refreshToggle?: boolean;
  wrongSelection?: boolean;
  applyIndexFadeDelay?: boolean;
  onCardClick?: (index: number) => void;
  size?: "sm" | "md" | "lg";
  responsive?: boolean;
  baseDelay?: number;
}

export default function SetBoard({
  board,
  selectedIndices = [],
  fadingIndices = [],
  wrongSelection = false,
  applyIndexFadeDelay = true,
  onCardClick,
  size = "md",
  responsive = true,
  baseDelay: baseDelayMs = 0,
}: SetBoardProps) {
  const cardSizeClasses =
    "relative landscape:w-16 landscape:sm:w-20 landscape:md:w-24 landscape:lg:w-32 portrait:w-20 portrait:min-[470px]:w-24 portrait:md:w-40 portrait:lg:w-48 portrait:[900px]:w-64 will-change-transform";
  return (
    <div className="grid gap-2 will-change-transform portrait:grid-cols-3 landscape:grid-flow-col landscape:grid-rows-3">
      {board.map((card, index) => {
        const cardKey = card
          ? `${card.shape}-${card.color}-${card.fill}-${card.number}`
          : `empty-${index}`;
        return (
          <button
            key={cardKey}
            onClick={() => card && onCardClick?.(index)}
            className={`${cardSizeClasses} opacity-0 focus:outline-none ${
              fadingIndices.includes(index)
                ? "animate-fade-out"
                : "animate-fade-in"
            }`}
            style={{
              animationDelay: applyIndexFadeDelay
                ? `${index * 150 + baseDelayMs}ms`
                : "0ms",
              transform: "translate3d(0,0,0)",
            }}
          >
            {card ? (
              <SetCard
                card={card}
                selected={selectedIndices.includes(index)}
                invalid={wrongSelection && selectedIndices.includes(index)}
                size={size}
                responsive={responsive}
              />
            ) : (
              <div className="bg-dark-500/50 aspect-[5/3] w-full rounded-[8%] border-2 border-gray-700" />
            )}
          </button>
        );
      })}
    </div>
  );
}
