import SetCard from "./SetCard";
import type { SetCard as SetCardType } from "@/lib/types";

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
  flashBoard?: boolean;
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
  flashBoard = false,
}: SetBoardProps) {
  const cardSizeClasses =
    "relative landscape:w-16 portrait:w-[30vw] landscape:sm:w-20 landscape:md:w-24 landscape:lg:w-[130px] landscape:xl:w-[165px] landscape:2xl:w-[200px] will-change-transform";
  return (
    <div className="grid w-fit gap-2 will-change-transform portrait:grid-cols-3 landscape:grid-flow-col landscape:grid-rows-3">
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
                invalid={
                  (wrongSelection && selectedIndices.includes(index)) ||
                  flashBoard
                }
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
