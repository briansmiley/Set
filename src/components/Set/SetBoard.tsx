import SetCard from "./SetCard";
import type { SetCard as SetCardType } from "../../lib/SetLogic";

interface SetBoardProps {
  board: (SetCardType | null)[];
  selectedIndices?: number[];
  fadingIndices?: number[];
  wrongSelection?: boolean;
  onCardClick?: (index: number) => void;
  size?: "sm" | "md" | "lg";
  responsive?: boolean;
  isInitialLoad?: boolean;
  baseDelay?: number;
}

export default function SetBoard({
  board,
  selectedIndices = [],
  fadingIndices = [],
  wrongSelection = false,
  onCardClick,
  size = "md",
  responsive = true,
  baseDelay: baseDelayMs = 0,
  isInitialLoad = true,
}: SetBoardProps) {
  return (
    <div
      className="
        grid gap-2 sm:gap-4 mx-auto
        portrait:w-[min(90dvw,50rem)] portrait:grid-cols-3
        landscape:w-[min(90dvw,50rem)] landscape:grid-rows-3 landscape:grid-flow-col
      "
    >
      {board.map((card, index) => {
        const cardKey = card
          ? `${card.shape}-${card.color}-${card.fill}-${card.number}`
          : `empty-${index}`;

        return (
          <button
            key={cardKey}
            onClick={() => card && onCardClick?.(index)}
            className={`
              focus:outline-none 
              w-full aspect-[5/3]
              opacity-0 
              ${
                fadingIndices.includes(index)
                  ? "animate-fade-out"
                  : "animate-fade-in"
              }
            `}
            style={{
              animationDelay: isInitialLoad
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
