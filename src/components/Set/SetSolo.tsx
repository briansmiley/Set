import { useState, useEffect } from "react";
import { SetGameState } from "../../lib/SetLogic";
import { gameActions, setUtils } from "../../lib/SetLogic";
import SetBoard from "./SetBoard";
import { CircleHelpIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "../ui/button";

const baseDelayMs = 500;
export default function SetSolo() {
  const [gameState, setGameState] = useState<SetGameState>(
    gameActions.createNewGame()
  );
  const [fadingIndices, setFadingIndices] = useState<number[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [wrongSelection, setWrongSelection] = useState(false);
  const [showSetPresent, setShowSetPresent] = useState(false);
  // Set isInitialLoad to false after all cards have faded in
  useEffect(() => {
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 4000);
  }, []); // Only run on mount

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
  const handleDrawCards = () => setGameState(gameActions.drawCards(gameState));
  const handleQueryClick = () => {
    setShowSetPresent(!showSetPresent);
  };

  const gameOver = gameState.deck.length === 0 && !gameState.setPresent;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-full opacity-0 animate-fade-in"
        style={{ animationDelay: `${interfaceFadeDelay}ms` }}
      >
        <div className="flex justify-center">
          <Button
            className="rounded-full bg-transparent border border-white"
            size="icon"
            title="Add 3 cards"
            onClick={handleDrawCards}
          >
            <PlusIcon className="w-10 h-10 text-white" />
          </Button>
        </div>

        <div className="absolute right-0 top-0 flex items-center">
          {showSetPresent && (
            <div
              className={`${
                gameState.setPresent ? "bg-green-500" : "bg-red-500"
              } rounded-full w-4 h-4`}
            />
          )}
          <Button
            className="rounded-full bg-transparent"
            size="icon"
            title="Show if there is a set on board"
            onClick={handleQueryClick}
          >
            <CircleHelpIcon className="size-5 text-white" />
          </Button>
        </div>
      </div>

      <SetBoard
        selectedIndices={gameState.selectedIndices}
        fadingIndices={fadingIndices}
        board={gameState.board}
        onCardClick={handleCardClick}
        isInitialLoad={isInitialLoad}
        wrongSelection={wrongSelection}
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
              onClick={() => setGameState(gameActions.createNewGame())}
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
