import { useState, useEffect, useRef } from "react";
import { SetGameState } from "../../lib/SetLogic";
import { gameActions, setUtils } from "../../lib/SetLogic";
import SetBoard from "./SetBoard";
import { CircleHelpIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "../ui/button";
import MyTooltip from "./MyTooltip";
import { SetMenu } from "./SetMenu";
import { GameSettings, GameSettingsUpdate } from "@/lib/types";

const baseDelayMs = 500;

const defaultSettings: GameSettings = {
  deckMode: "soloDeck",
  autoAddCards: false,
  handleNoSets: "hint",
  stickySetCount: false,
};

export default function SetSolo() {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [gameState, setGameState] = useState<SetGameState>(
    gameActions.createNewGame(settings.deckMode),
  );
  const [fadingIndices, setFadingIndices] = useState<number[]>([]);
  const [applyIndexFadeDelay, setApplyIndexFadeDelay] = useState(true);
  const [wrongSelection, setWrongSelection] = useState(false);
  const [showSetCount, setShowSetCount] = useState(false);
  const fadeTimeoutRef = useRef<number>();

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

  // Handle settings changes
  const handleSettingsChange = (update: GameSettingsUpdate) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...update };
      return newSettings;
    });
  };

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
          if (!settings.stickySetCount) setShowSetCount(false);
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

  const gameOver = gameState.deck.length === 0 && !gameState.setPresent;
  const setCountElement = () => {
    const count = setUtils.countSets(gameState.board);
    return (
      <span
        className={`text-xs sm:text-sm ${count === 0 ? "text-red-500" : ""}`}
      >
        {count} set{count === 1 ? "" : "s"}
      </span>
    );
  };

  const addButtonClass = () => {
    switch (settings.handleNoSets) {
      case "none":
      case "autoAdd":
        return "";
      case "hint":
        return gameState.setPresent ? "" : "animate-pulse-2 ";
    }
  };
  return (
    <div className="flex w-full items-center justify-center p-4 pt-16">
      <div className="grid grid-rows-[auto_1fr_auto] gap-3">
        {/* Controls bar - fixed at top */}
        <div
          className="relative flex w-full animate-fade-in opacity-0"
          style={{ animationDelay: `${interfaceFadeDelay}ms` }}
        >
          <div className="flex basis-1/3 justify-start gap-1">
            <SetMenu
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          </div>
          <div className="flex basis-1/3 justify-center">
            <Button
              className={`rounded-full ${addButtonClass()}`}
              size="icon"
              variant="outline"
              onClick={() => {
                handleDrawCards();
              }}
            >
              <PlusIcon className="h-10 w-10" />
            </Button>
          </div>
          <div className="relative flex basis-1/3 items-center justify-end gap-0 sm:gap-2">
            {showSetCount && setCountElement()}
            <MyTooltip
              text={
                showSetCount
                  ? "Hide set count"
                  : "Show number of sets on the board"
              }
            >
              <Button variant="ghost" onClick={handleQueryClick} size="icon">
                <CircleHelpIcon />
              </Button>
            </MyTooltip>
          </div>
        </div>

        {/* Game board - will scroll if needed */}
        <div className="flex flex-col items-center justify-center">
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
          <div className="flex w-full">
            <div className="basis-1/3" />
            <div className="flex basis-1/3 items-center justify-center text-base md:text-lg">
              Found: {gameState.foundSets.length}
            </div>
            <div className="flex basis-1/3 items-center justify-end" />
          </div>
          {gameOver && (
            <div className="flex flex-col items-center">
              <span>Game over! No sets remaining. </span>
              <Button
                onClick={() =>
                  setGameState(gameActions.createNewGame(settings.deckMode))
                }
                className="rounded-full bg-transparent"
                size="icon"
              >
                <RotateCcwIcon className="text-white" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
