import { useState, useEffect, useRef } from "react";
import { SetGameMode, SetGameState } from "../../lib/SetLogic";
import { gameActions, setUtils } from "../../lib/SetLogic";
import SetBoard from "./SetBoard";
import {
  // CircleHelpIcon,
  // InfinityIcon,
  // LayersIcon,
  // PlusIcon,
  RotateCcwIcon,
} from "lucide-react";
import { Button } from "../ui/button";

const baseDelayMs = 500;
export default function SetSolo() {
  const [gameMode /* , setGameMode */] = useState<SetGameMode>("soloInfinite");
  const [gameState, setGameState] = useState<SetGameState>(
    gameActions.createNewGame(gameMode)
  );
  const [fadingIndices, setFadingIndices] = useState<number[]>([]);
  const [applyIndexFadeDelay, setApplyIndexFadeDelay] = useState(true);
  const [wrongSelection, setWrongSelection] = useState(false);
  const [showSetPresent, setShowSetPresent] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);
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
        (i) => gameState.board[i]
      );
      const isValidSet = setUtils.isSet(selectedCards);
      if (isValidSet) {
        setFadingIndices(gameState.selectedIndices);
        setTimeout(() => {
          setFadingIndices([]);
          setGameState(gameActions.claimSet(gameState));
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
  // const handleDrawCards = () => setGameState(gameActions.drawCards(gameState));
  const handleQueryClick = () => {
    setShowSetPresent(!showSetPresent);
  };
  const handleReDealBoard = () => {
    // Clear any existing timeout
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }

    setRefreshToggle((toggle) => !toggle);
    setApplyIndexFadeDelay(true);
    setGameState(gameActions.reDealBoard(gameState));

    // Set new timeout
    fadeTimeoutRef.current = window.setTimeout(() => {
      setApplyIndexFadeDelay(false);
    }, 4000);
  };

  const gameOver = gameState.deck.length === 0 && !gameState.setPresent;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex w-full opacity-0 animate-fade-in"
        style={{ animationDelay: `${interfaceFadeDelay}ms` }}
      >
        <div className="flex justify-start gap-1 basis-1/3">
          {/* <Button
            className="rounded-full bg-transparent border border-white"
            size="icon"
            title="Add 3 cards"
            onClick={handleDrawCards}
          >
            <LayersIcon className="w-10 h-10 text-white" />
          </Button>
          <Button
            className="rounded-full bg-transparent border border-white"
            size="icon"
            title="Add 3 cards"
            onClick={handleDrawCards}
          >
            <InfinityIcon className="w-10 h-10 text-white" />
          </Button> */}
        </div>
        <div className="flex justify-center basis-1/3">
          <Button
            className="rounded-full bg-transparent border disabled:animate-none animate-pulse delay-1000
             disabled:opacity-0 text-white "
            size="icon"
            title="No set present: refresh board"
            onClick={handleReDealBoard}
            disabled={gameState.setPresent}
          >
            <RotateCcwIcon className={`w-10 h-10 `} />
          </Button>
        </div>
        <div className="basis-1/3 flex justify-end items-center relative">
          {showSetPresent && (
            <div
              className={`${
                gameState.setPresent ? "bg-green-500" : "bg-red-500"
              } rounded-full w-4 h-4`}
            />
          )}
          {/* <Button
            className="rounded-full bg-transparent"
            size="icon"
            title="Show if there is a set on board"
            onClick={handleQueryClick}
          >
            <CircleHelpIcon className="size-5 text-white" />
          </Button> */}
        </div>
      </div>

      <SetBoard
        selectedIndices={gameState.selectedIndices}
        fadingIndices={fadingIndices}
        board={gameState.board}
        onCardClick={handleCardClick}
        wrongSelection={wrongSelection}
        applyIndexFadeDelay={applyIndexFadeDelay}
        refreshToggle={refreshToggle}
        baseDelay={baseDelayMs}
      />
      <div
        className="flex flex-col items-center gap-2 mt-4 opacity-0 animate-fade-in"
        style={{ animationDelay: `${interfaceFadeDelay}ms` }}
      >
        <div className="text-white text-2xl">
          Found: {gameState.foundSets.length}
        </div>
        {gameOver && (
          <div className="flex flex-col items-center">
            <span>Game over! No sets remaining. </span>
            <Button
              onClick={() => setGameState(gameActions.createNewGame(gameMode))}
              className="bg-transparent rounded-full"
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
