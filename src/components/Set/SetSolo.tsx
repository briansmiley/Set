import { useState, useEffect, useRef } from "react";
import { SetGameMode, SetGameState } from "../../lib/SetLogic";
import { gameActions, setUtils } from "../../lib/SetLogic";
import SetBoard from "./SetBoard";
import {
  // CircleHelpIcon,
  // InfinityIcon,
  // LayersIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react";
import { Button } from "../ui/button";

const baseDelayMs = 500;
export default function SetSolo() {
  const [gameMode /* , setGameMode */] = useState<SetGameMode>("soloInfinite");
  const [gameState, setGameState] = useState<SetGameState>(
    gameActions.createNewGame(gameMode),
  );
  const [fadingIndices, setFadingIndices] = useState<number[]>([]);
  const [applyIndexFadeDelay, setApplyIndexFadeDelay] = useState(true);
  const [wrongSelection, setWrongSelection] = useState(false);
  const [showSetPresent /*setShowSetPresent*/] = useState(false);
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
  // const handleQueryClick = () => {
  //   setShowSetPresent(!showSetPresent);
  // };
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

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex w-full animate-fade-in opacity-0"
        style={{ animationDelay: `${interfaceFadeDelay}ms` }}
      >
        <div className="flex basis-1/3 justify-start gap-1">
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
        <div className="flex basis-1/3 justify-center">
          <Button
            className="animate-pulse rounded-full border bg-transparent text-white delay-1000 disabled:animate-none disabled:opacity-0"
            size="icon"
            title="No set present: refresh board"
            onClick={handleDrawCards}
            // disabled={gameState.setPresent}
          >
            <PlusIcon className={`h-10 w-10`} />
          </Button>
        </div>
        <div className="relative flex basis-1/3 items-center justify-end">
          {showSetPresent && (
            <div
              className={`${
                gameState.setPresent ? "bg-green-500" : "bg-red-500"
              } h-4 w-4 rounded-full`}
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
        // refreshToggle={refreshToggle}
        baseDelay={baseDelayMs}
      />
      <div
        className="mt-4 flex animate-fade-in flex-col items-center gap-2 opacity-0"
        style={{ animationDelay: `${interfaceFadeDelay}ms` }}
      >
        <div className="text-2xl text-white">
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
