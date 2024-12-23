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
  refreshToggle = false,
  applyIndexFadeDelay = true,
  onCardClick,
  size = "md",
  responsive = true,
  baseDelay: baseDelayMs = 0,
}: SetBoardProps) {
  return (
    <div
      className="
        grid gap-2 sm:gap-4 mx-auto
        max-w-full
        portrait:w-[min(90dvw,50rem)] portrait:grid-cols-3
        landscape:w-[min(90dvw,50rem)] landscape:grid-rows-3 landscape:grid-flow-col
      "
    >
      {board.map((card, index) => {
        const cardKey = card
          ? `${refreshToggle ? "r-" : ""}${card.shape}-${card.color}-${
              card.fill
            }-${card.number}`
          : `empty-${index}`;

        return (
          <button
            key={cardKey}
            onClick={() => card && onCardClick?.(index)}
            className={`
              focus:outline-none 
               aspect-[5/3]
              opacity-0 
              ${
                fadingIndices.includes(index)
                  ? "animate-fade-out"
                  : "animate-fade-in"
              }
            `}
            style={{
              animationDelay: applyIndexFadeDelay
                ? `${index * 150 + baseDelayMs}ms`
                : "0ms",
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
              <div className="aspect-[5/3] w-full rounded-[8%] border-2 border-gray-700 bg-dark-500/50" />
            )}
          </button>
        );
      })}
    </div>
  );
}
