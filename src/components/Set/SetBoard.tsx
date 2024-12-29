import SetCard from "./SetCard";
import type { SetCard as SetCardType } from "@/lib/types";
import { useState, useEffect } from "react";

interface SetBoardProps {
  board: (SetCardType | null)[];
  selectedIndices?: number[];
  fadingIndices?: number[];
  refreshToggle?: boolean;
  wrongSelection?: boolean;
  applyIndexFadeDelay?: boolean;
  onCardClick?: (index: number) => void;
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
  baseDelay: baseDelayMs = 0,
  flashBoard = false,
}: SetBoardProps) {
  const [isLandscape, setIsLandscape] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateDimensions = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const getCardWidth = () => {
    if (!isLandscape) return "responsive";

    // If window is wider than 1.4x height, cap the width
    const maxWidth = windowHeight * 1.4;
    const effectiveWidth = windowWidth > maxWidth ? maxWidth : windowWidth;

    // Button is 12vw wide in landscape
    const buttonWidth = effectiveWidth * 0.12;
    // Card width is 5/3 of button width (since card rotates 90deg)
    return (buttonWidth * 5) / 3;
  };

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
            className={`relative flex items-center justify-center opacity-0 focus:outline-none ${
              fadingIndices.includes(index)
                ? "animate-fade-out"
                : "animate-fade-in"
            }`}
            style={{
              animationDelay: applyIndexFadeDelay
                ? `${index * 150 + baseDelayMs}ms`
                : "0ms",
              transform: "translate3d(0,0,0)",
              ...(isLandscape
                ? {
                    width: `${Math.min(windowWidth, windowHeight * 1.4) * 0.12}px`,
                    height: `${(Math.min(windowWidth, windowHeight * 1.4) * 0.12 * 5) / 3}px`,
                  }
                : {
                    width: `${Math.min(windowWidth, windowHeight * 0.6) * 0.3}px`,
                    aspectRatio: "5/3",
                  }),
            }}
          >
            {card ? (
              <div
                className={
                  isLandscape ? "flex-shrink-0 flex-grow-0" : "h-full w-full"
                }
              >
                <SetCard
                  card={card}
                  selected={selectedIndices.includes(index)}
                  invalid={
                    (wrongSelection && selectedIndices.includes(index)) ||
                    flashBoard
                  }
                  width={isLandscape ? getCardWidth() : "responsive"}
                  rotation={isLandscape ? 90 : 0}
                />
              </div>
            ) : (
              <div className="bg-dark-500/50 aspect-[5/3] w-full rounded-[8%] border-2 border-gray-700" />
            )}
          </button>
        );
      })}
    </div>
  );
}
