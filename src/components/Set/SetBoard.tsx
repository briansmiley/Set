import SetCard from "./SetCard";
import type { SetCard as SetCardType } from "@/lib/types";
import { useState, useEffect } from "react";

interface SetBoardProps {
  gameOver: boolean;
  board: (SetCardType | null)[];
  selectedIndices?: number[];
  fadingIndices?: number[];
  refreshToggle?: boolean;
  wrongSelection?: boolean;
  applyIndexFadeDelay?: boolean;
  onCardClick?: (index: number) => void;
  baseDelay?: number;
  flashBoard?: boolean;
  rotate?: boolean;
}

export default function SetBoard({
  gameOver,
  board,
  selectedIndices = [],
  fadingIndices = [],
  wrongSelection = false,
  applyIndexFadeDelay = true,
  onCardClick,
  baseDelay: baseDelayMs = 0,
  flashBoard = false,
  rotate = false,
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
    if (!isLandscape || !rotate) return 0;

    const maxButtonWidth = windowWidth * 0.12;
    const maxButtonHeight = windowHeight * 0.25;
    const buttonWidth = Math.min(maxButtonWidth, (maxButtonHeight * 3) / 5);
    // If window is wider than 1.15x height, cap the width
    // const maxWidth = windowHeight * 1.15;
    // const effectiveWidth = windowWidth > maxWidth ? maxWidth : windowWidth;

    // Button is 12vw wide in landscape
    // const buttonWidth = effectiveWidth * 0.12;
    // Card width is 5/3 of button width (since card rotates 90deg)
    return (buttonWidth * 5) / 3;
  };
  const getButtonStyle = () => {
    if (rotate)
      return isLandscape
        ? {
            width: `${(getCardWidth() * 3) / 5}px`,
            height: `${getCardWidth()}px`,
          }
        : {
            width: `${Math.min(windowWidth, windowHeight * 0.6) * 0.3}px`,
            aspectRatio: "5/3",
          };
    return !isLandscape
      ? {
          width: `min(30vw, ${windowHeight * 0.6 * 0.3}px)`,
          aspectRatio: "5/3",
        }
      : { width: "12vw", aspectRatio: "5/3" };
  };
  return (
    <div className="relative">
      <div className={`absolute inset-0 z-50 flex items-center justify-center  text-4xl font-bold transition-opacity duration-1000 delay-1000 ${gameOver ? "opacity-100" : "opacity-0 pointer-events-none"}`}> GAME OVER</div>
      <div className={`grid w-fit gap-2 will-change-transform portrait:grid-cols-3 landscape:grid-flow-col landscape:grid-rows-3 ${gameOver ? "blur-lg transition-all duration-1000 delay-1000" : ""}`}>
        {board.map((card, index) => {
          const cardKey = card
            ? `${card.shape}-${card.color}-${card.fill}-${card.number}`
            : `empty-${index}`;
          const invalid =
            (wrongSelection && selectedIndices.includes(index)) || flashBoard;
          const selected = selectedIndices.includes(index);
          const selectedClasses = invalid
            ? "shadow-[0_0_36px_0px_hsl(var(--destructive))] border-destructive border-[3px]"
            : selected
              ? "shadow-[0_0_36px_0_theme(colors.blue.500)] border-blue-500 border-2"
              : "shadow-[2px_2px_4px_0_hsl(var(--foreground)/5)] dark:shadow-[1px_1px_2px_0_hsl(var(--foreground)/5)] border border-foreground";

          return (
            card ? (
              <button
                key={cardKey}
                onClick={() => card && onCardClick?.(index)}
                className={`relative flex items-center justify-center overflow-hidden rounded-[8%] opacity-0 focus:outline-none ${
                fadingIndices.includes(index)
                  ? "animate-fade-out"
                  : "animate-fade-in"
              } ${selectedClasses}`}
              style={{
                animationDelay: applyIndexFadeDelay
                  ? `${index * 150 + baseDelayMs}ms`
                  : "0ms",
                ...getButtonStyle(),
              }}
            >
                <div
                  className={
                    isLandscape && rotate
                      ? "flex-shrink-0 flex-grow-0"
                      : "h-full w-full"
                  }
                >
                  <SetCard
                    card={card}
                    selected={selected}
                    invalid={invalid}
                    width={isLandscape && rotate ? getCardWidth() : "responsive"}
                    rotation={isLandscape && rotate ? 90 : 0}
                    selfStyle={false} //board will apply border etc because of transforms
                  />
                </div>
              </button>
            ) : (
              <div 
                key={cardKey}
                className="opacity-0" 
                style={getButtonStyle()}
              >
                {/* Empty placeholder to maintain grid layout */}
              </div>
            )
          );
        })}
      </div>
    </div>
  );
}
