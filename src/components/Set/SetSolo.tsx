import { useState, useEffect, useRef } from "react";
import { gameActions, setUtils } from "../../lib/SetLogic";
import SetBoard from "./SetBoard";
import {
  CircleHelpIcon,
  InfinityIcon,
  LayersIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import MyTooltip from "./MyTooltip";
import { SetMenu } from "./SetMenu";
import {
  MenuSettings,
  MenuSettingsUpdate,
  SetGameMode,
  SetGameState,
} from "@/lib/types";
import { SetDebug } from "./SetDebug";

const ENABLE_DEBUG = import.meta.env.DEV;

const baseDelayMs = 500;

const SETTINGS_KEY = "set-game-settings";

const defaultMenuSettings: MenuSettings = {
  deckMode: "soloDeck",
  handleNoSets: "hint",
  stickySetCount: false,
  rotateCards: true,
};

// Translates menu settings to game settings
function syncSettingsToGame(menuSettings: MenuSettings) {
  return {
    deckMode: menuSettings.deckMode,
  };
}

export default function SetSolo() {
  const [menuSettings, setMenuSettings] = useState<MenuSettings>(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return { ...defaultMenuSettings, ...parsed };
    }
    return defaultMenuSettings;
  });

  const [gameState, setGameState] = useState<SetGameState>(() => {
    const initialState = gameActions.createNewGame(menuSettings.deckMode);
    return {
      ...initialState,
      settings: syncSettingsToGame(menuSettings),
    };
  });

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(menuSettings));
  }, [menuSettings]);

  const [selectionAllowed, setSelectionAllowed] = useState(true);
  const [fadingIndices, setFadingIndices] = useState<number[]>([]);
  const [applyIndexFadeDelay, setApplyIndexFadeDelay] = useState(true);
  const [wrongSelection, setWrongSelection] = useState(false);
  const [showSetCount, setShowSetCount] = useState(false);
  const [debugHighlightIndices, setDebugHighlightIndices] = useState<number[]>(
    [],
  );
  const fadeTimeoutRef = useRef<number>();
  const [flashBoard, setFlashBoard] = useState(false);
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
  const handleSettingsChange = (update: MenuSettingsUpdate) => {
    setMenuSettings((prev) => {
      const newMenuSettings = { ...prev, ...update };

      // Sync game settings
      setGameState((prevState: SetGameState) => {
        const newGameSettings = syncSettingsToGame(newMenuSettings);
        let nextState = { ...prevState, settings: newGameSettings };

        // Handle deck mode changes
        if (newGameSettings.deckMode !== prevState.settings.deckMode) {
          nextState = gameActions.setGameMode(
            nextState,
            newGameSettings.deckMode,
          );
        }

        return nextState;
      });

      return newMenuSettings;
    });
  };

  // Function to recursively add cards until we find a set
  const tryAddCardsUntilSet = (currentState: SetGameState) => {
    if (currentState.board.length >= 21) {
      setSelectionAllowed(true);
      return;
    }

    // First flash the board to indicate no sets
    setTimeout(() => {
      setFlashBoard(true);
      setShowSetCount(true);
      // After flash, draw cards
      setTimeout(() => {
        setFlashBoard(false);
        if (!menuSettings.stickySetCount) setShowSetCount(false);
        const nextState = gameActions.drawCards(currentState);
        setGameState(nextState);

        // If still no sets, wait a beat and try again
        if (!nextState.setPresent && nextState.board.length < 21) {
          setTimeout(() => {
            tryAddCardsUntilSet(nextState);
          }, 1000); // Pause before next attempt
        } else {
          setSelectionAllowed(true);
        }
      }, 1500); // Duration of flash
    }, 1200); // Pause before starting flash
  };

  //Handle animations/game processing around finding sets
  useEffect(() => {
    if (gameState.selectedIndices.length === 3) {
      const selectedCards = gameState.selectedIndices.map(
        (i) => gameState.board[i],
      );
      const isValidSet = setUtils.isSet(selectedCards);
      if (isValidSet) {
        setDebugHighlightIndices([]);
        setSelectionAllowed(false);
        setFadingIndices(gameState.selectedIndices);
        setTimeout(() => {
          setFadingIndices([]);
          const newState = gameActions.claimSet(gameState);
          setGameState(newState);

          // After claiming set, check if we need to auto-add cards
          if (
            !newState.setPresent &&
            menuSettings.handleNoSets === "autoAdd" &&
            newState.board.length < 21
          ) {
            tryAddCardsUntilSet(newState);
          } else {
            setSelectionAllowed(true);
          }

          if (!menuSettings.stickySetCount) setShowSetCount(false);
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
  const handleCardClick = (index: number) => {
    if (!selectionAllowed) return;
    setGameState(gameActions.selectCard(gameState, index));
  };
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
    switch (menuSettings.handleNoSets) {
      case "none":
      case "autoAdd":
        return "";
      case "hint":
        return gameState.setPresent ? "" : "animate-pulse-2 ";
    }
  };
  const deckModeNode = (deckMode: SetGameMode) => {
    switch (deckMode) {
      case "soloDeck":
        return (
          <MyTooltip text="Cards remaining in the deck" defaultCursor>
            <div className="flex items-center gap-1">
              <LayersIcon className="size-5" />
              {gameState.deck.length}
            </div>
          </MyTooltip>
        );
      case "soloInfinite":
        return (
          <MyTooltip text="Endless deck mode" defaultCursor>
            <div className="flex items-center gap-1">
              <InfinityIcon className="size-5" />
            </div>
          </MyTooltip>
        );
    }
  };
  return (
    <div className="flex w-full items-center justify-center p-4">
      <div
        className={`grid gap-3 ${
          menuSettings.rotateCards
            ? "portrait:grid-rows-[auto_1fr_auto] landscape:grid-cols-[auto_1fr_auto] landscape:gap-4"
            : "grid-rows-[auto_1fr_auto]"
        }`}
      >
        {/* Controls - left side in landscape (when rotated), top otherwise */}
        <div
          className={`relative flex w-full animate-fade-in opacity-0 ${
            menuSettings.rotateCards
              ? "portrait:flex-row portrait:justify-between landscape:flex-col landscape:justify-between"
              : "flex-row justify-between"
          }`}
          style={{ animationDelay: `${interfaceFadeDelay}ms` }}
        >
          <div
            className={`flex basis-1/3 justify-start gap-1 ${
              menuSettings.rotateCards
                ? "landscape:flex-col landscape:gap-2"
                : ""
            }`}
          >
            <SetMenu
              settings={menuSettings}
              onSettingsChange={handleSettingsChange}
            />
            {ENABLE_DEBUG && (
              <SetDebug
                gameState={gameState}
                setGameState={setGameState}
                setMenuSettings={setMenuSettings}
                setFlashBoard={setFlashBoard}
                debugHighlightIndices={debugHighlightIndices}
                setDebugHighlightIndices={setDebugHighlightIndices}
              />
            )}
          </div>
          <div
            className={`flex basis-1/3 justify-center ${
              menuSettings.rotateCards ? "landscape:flex-col" : ""
            }`}
          >
            <Button
              className={`rounded-full ${addButtonClass()}`}
              size="icon"
              variant="outline"
              onClick={handleDrawCards}
            >
              <PlusIcon className="h-10 w-10" />
            </Button>
          </div>
          <div
            className={`relative flex basis-1/3 items-center justify-end gap-0 sm:gap-2 ${
              menuSettings.rotateCards ? "landscape:flex-col" : ""
            }`}
          >
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

        {/* Game board - center */}
        <div className="flex flex-col items-center justify-center">
          <SetBoard
            board={gameState.board}
            selectedIndices={gameState.selectedIndices.concat(
              debugHighlightIndices,
            )}
            fadingIndices={fadingIndices}
            wrongSelection={wrongSelection}
            applyIndexFadeDelay={applyIndexFadeDelay}
            onCardClick={handleCardClick}
            baseDelay={baseDelayMs}
            flashBoard={flashBoard}
            rotate={menuSettings.rotateCards}
          />
        </div>

        {/* Score area - right side in landscape (when rotated), bottom otherwise */}
        <div
          className={`animate-fade-in opacity-0 ${
            menuSettings.rotateCards ? "portrait:w-full" : "w-full"
          }`}
          style={{ animationDelay: `${interfaceFadeDelay}ms` }}
        >
          <div
            className={`flex ${
              menuSettings.rotateCards
                ? "portrait:w-full landscape:h-full landscape:flex-col landscape:justify-between"
                : "w-full"
            }`}
          >
            <div
              className={
                menuSettings.rotateCards
                  ? "portrait:basis-1/3 landscape:flex landscape:justify-start"
                  : "basis-1/3"
              }
            >
              {deckModeNode(menuSettings.deckMode)}
            </div>
            <div
              className={`flex items-center text-sm md:text-base ${
                menuSettings.rotateCards
                  ? "portrait:basis-1/3 portrait:justify-center landscape:justify-center"
                  : "basis-1/3 justify-center"
              }`}
            >
              Found: {gameState.foundSets.length}
            </div>
          </div>
          {gameOver && (
            <div className="flex flex-col items-center">
              <span>Game over! No sets remaining. </span>
              <Button
                onClick={() => {
                  const newState = gameActions.createNewGame(
                    menuSettings.deckMode,
                  );
                  setGameState({
                    ...newState,
                    settings: syncSettingsToGame(menuSettings),
                  });
                }}
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
