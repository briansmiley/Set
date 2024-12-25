import { useState, useEffect, useRef } from "react";
import { SetGameMode, SetGameState } from "../../lib/SetLogic";
import { gameActions, setUtils } from "../../lib/SetLogic";
import SetBoard from "./SetBoard";
import {
  CircleHelpIcon,
  // InfinityIcon,
  // LayersIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const baseDelayMs = 500;
export default function SetSolo() {
  const [gameMode /* , setGameMode */] = useState<SetGameMode>("soloInfinite");
  const [gameState, setGameState] = useState<SetGameState>(
    gameActions.createNewGame(gameMode),
  );
  const [fadingIndices, setFadingIndices] = useState<number[]>([]);
  const [applyIndexFadeDelay, setApplyIndexFadeDelay] = useState(true);
  const [wrongSelection, setWrongSelection] = useState(false);
  const [showSetCount, setShowSetCount] = useState(false);
  // const [refreshToggle, setRefreshToggle] = useState(false);
  const fadeTimeoutRef = useRef<number>(); // Store timeout ID

  // Clear initial fade delay
  useEffect(() => {
    fadeTimeoutRef.current = window.setTimeout(() => {
      setApplyIndexFadeDelay(false);
    }, 4000);

    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  //Handle animations/game processing around finding sets
  useEffect(() => {
    if (gameState.selectedIndices.length === 3) {
      const selectedCards = gameState.selectedIndices.map(
        (i) => gameState.board[i],
      );
      const isValidSet = setUtils.isSet(selectedCards);
      if (isValidSet) {
        setFadingIndices(gameState.selectedIndices);
        setTimeout(() => {
          setFadingIndices([]);
          setGameState(gameActions.claimSet(gameState));
          setShowSetCount(false);
        }, 500);
      } else {
        setWrongSelection(true);
        setTimeout(() => {
          setWrongSelection(false);
          setGameState(gameActions.clearSelection(gameState));
        }, 1000);
      }
    }
  }, [gameState.selectedIndices]);
  const interfaceFadeDelay = 3750;
  const handleCardClick = (index: number) =>
    setGameState(gameActions.selectCard(gameState, index));
  const handleDrawCards = () => setGameState(gameActions.drawCards(gameState));
  const handleQueryClick = () => {
    setShowSetCount(!showSetCount);
  };
  // const handleReDealBoard = () => {
  //   // Clear any existing timeout
  //   if (fadeTimeoutRef.current) {
  //     clearTimeout(fadeTimeoutRef.current);
  //   }

  //   setRefreshToggle((toggle) => !toggle);
  //   setApplyIndexFadeDelay(true);
  //   setGameState(gameActions.reDealBoard(gameState));

  //   // Set new timeout
  //   fadeTimeoutRef.current = window.setTimeout(() => {
  //     setApplyIndexFadeDelay(false);
  //   }, 4000);
  // };

  const gameOver = gameState.deck.length === 0 && !gameState.setPresent;
  const setCountElement = () => {
    const count = setUtils.countSets(gameState.board);
    return (
      <span
        className={`text-base ${count === 0 ? "text-red-500" : "text-white"}`}
      >
        {count} set{count === 1 ? "" : "s"}
      </span>
    );
  };
  return (
    <div className="grid grid-rows-[auto_1fr_auto] gap-3 p-4">
      {/* Controls bar - fixed at top */}
      <div
        className="relative flex w-full animate-fade-in opacity-0"
        style={{ animationDelay: `${interfaceFadeDelay}ms` }}
      >
        <div className="flex basis-1/3 justify-start gap-1">
          {/* Left controls */}
        </div>
        <div className="flex basis-1/3 justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  className={`rounded-full border bg-transparent text-white ${
                    gameState.setPresent
                      ? "opacity-10"
                      : "animate-pulse delay-1000"
                  }`}
                  size="icon"
                  onClick={() => {
                    if (!gameState.setPresent) handleDrawCards();
                  }}
                  onDoubleClick={
                    gameState.setPresent ? () => handleDrawCards() : undefined
                  }
                >
                  <PlusIcon className="h-10 w-10" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {gameState.setPresent
                  ? "There's a set on the board! (double-click to add cards anyway)"
                  : "No set present: add 3 cards"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative flex basis-1/3 items-center justify-end gap-2">
          {/* Right controls */}
          {showSetCount && setCountElement()}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="ghost" onClick={handleQueryClick} size="icon">
                  <CircleHelpIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showSetCount
                  ? "Hide set count"
                  : "Show number of sets on the board"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Game board - will scroll if needed */}
      <div className="landscape:pver flex flex-col justify-center portrait:overflow-auto">
        <SetBoard
          selectedIndices={gameState.selectedIndices}
          fadingIndices={fadingIndices}
          board={gameState.board}
          onCardClick={handleCardClick}
          wrongSelection={wrongSelection}
          applyIndexFadeDelay={applyIndexFadeDelay}
          baseDelay={baseDelayMs}
        />
      </div>

      {/* Score area - fixed at bottom */}
      <div
        className="animate-fade-in opacity-0"
        style={{ animationDelay: `${interfaceFadeDelay}ms` }}
      >
        <div className="text-center text-base text-white md:text-lg">
          Found: {gameState.foundSets.length}
        </div>
        {gameOver && (
          <div className="flex flex-col items-center">
            <span>Game over! No sets remaining. </span>
            <Button
              onClick={() => setGameState(gameActions.createNewGame(gameMode))}
              className="rounded-full bg-transparent"
              size="icon"
            >
              <RotateCcwIcon className="text-white" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
