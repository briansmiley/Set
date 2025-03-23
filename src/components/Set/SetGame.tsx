import { useState, useEffect, useRef } from "react";
import { gameActions, setUtils } from "../../lib/SetLogic";
import SetBoard from "./SetBoard";
import {
  CircleHelpIcon,
  InfinityIcon,
  LayersIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import MyTooltip from "./MyTooltip";
import { SetMenu } from "./SetMenu";
import {
  MenuSettings,
  MenuSettingsUpdate,
  SetGameMode,
  SetGameState,
  menuSettingsSchema,
} from "@/lib/types";
import { SetDebug } from "./SetDebug";
import PlayerSelectModal from "./PlayerSelectModal";
import { z } from "zod";
import { PlayersDialog } from "./PlayersDialog";

const ENABLE_DEBUG = import.meta.env.DEV;

const baseDelayMs = 500;

const SETTINGS_KEY = "set-game-settings";

const defaultMenuSettings: MenuSettings = {
  deckMode: "finiteDeck",
  handleNoSets: "hint",
  stickySetCount: false,
  rotateCards: false,
};

// Translates menu settings to game settings
function syncSettingsToGame(menuSettings: MenuSettings) {
  return {
    deckMode: menuSettings.deckMode,
  };
}

export default function SetGame() {
  const [menuSettings, setMenuSettings] = useState<MenuSettings>(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const stored = JSON.parse(savedSettings);
        //initialize result with default settings
        const result = { ...defaultMenuSettings };
        // For each setting in our defaults, try to validate and apply stored value
        (Object.keys(defaultMenuSettings) as Array<keyof MenuSettings>).forEach(
          (key) => {
            if (key in stored) {
              try {
                // Validate individual fields using our Zod schema
                const fieldSchema = menuSettingsSchema.shape[key];
                const parsed = fieldSchema.parse(stored[key]);
                (result[key] as z.infer<typeof fieldSchema>) = parsed;
              } catch {
                console.warn(
                  `Invalid stored value for ${key}, removing from storage`,
                );
                // Remove invalid field from storage
                delete stored[key];
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(stored));
                // Keep default value for this setting
              }
            }
          },
        );

        return result;
      } catch (error) {
        console.warn("Invalid saved settings JSON, using defaults:", error);
        localStorage.removeItem(SETTINGS_KEY);
        return defaultMenuSettings;
      }
    }
    return defaultMenuSettings;
  });

  const [gameState, setGameState] = useState<SetGameState>(() => {
    const initialState = gameActions.createNewGame(menuSettings.deckMode, 1);
    return {
      ...initialState,
      settings: syncSettingsToGame(menuSettings),
    };
  });

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
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [boardBlurred, setBoardBlurred] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(0);
  const [showPlayersDialog, setShowPlayersDialog] = useState(false);

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

  // Update useEffect to set initial selected player
  useEffect(() => {
    if (showPlayerSelect) {
      setSelectedPlayerId(gameState.players[0].id);
    }
  }, [showPlayerSelect]);

  // Handle settings changes
  const handleSettingsChange = (update: MenuSettingsUpdate) => {
    setMenuSettings((prev) => {
      const newMenuSettings = { ...prev, ...update };

      // Get and merge with existing stored preferences
      const existingStored = localStorage.getItem(SETTINGS_KEY);
      const existingSettings = existingStored ? JSON.parse(existingStored) : {};
      const updatedStorage = { ...existingSettings, ...update };

      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedStorage));

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

  const addPlayerToGame = () => {
    setGameState((prev) => {
      const newState = gameActions.addPlayer(prev);
      return newState;
    });
  };

  const handleDeletePlayer = (playerId: number) => {
    setGameState((prev) => gameActions.deletePlayer(prev, playerId));
  };

  const handleUpdatePlayerName = (playerId: number, newName: string) => {
    setGameState((prev) => {
      const newPlayers = [...prev.players];
      const playerIndex = newPlayers.findIndex((p) => p.id === playerId);
      if (playerIndex !== -1) {
        newPlayers[playerIndex] = { ...newPlayers[playerIndex], name: newName };
      }
      return { ...prev, players: newPlayers };
    });
  };

  // Function to recursively add cards until we find a set
  const tryAddCardsUntilSet = (currentState: SetGameState) => {
    if (currentState.board.length >= 21 || currentState.gameOver || currentState.setPresent) {
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
        if (!nextState.setPresent && nextState.board.length < 21 && !nextState.gameOver) {
          setTimeout(() => {
            tryAddCardsUntilSet(nextState);
          }, 1000); // Pause before next attempt
        } else {
          setSelectionAllowed(true);
        }
      }, 1500); // Duration of flash
    }, 1200); // Pause before starting flash
  };

  const handleClaimSet = (playerId: number) => {
    setFadingIndices([]);
    const newState = gameActions.claimSet(gameState, playerId);
    setGameState(newState);

    // After claiming set, check if we need to auto-add cards
    if (
      !newState.setPresent &&
      menuSettings.handleNoSets === "autoAdd" &&
      newState.board.length < 21 &&
      newState.deck.length > 0
    ) {
      tryAddCardsUntilSet(newState);
    } else {
      setSelectionAllowed(true);
    }

    if (!menuSettings.stickySetCount) setShowSetCount(false);
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

        if (gameState.players.length > 1) {
          // In multiplayer mode, show the player select modal
          setTimeout(() => {
            setBoardBlurred(true);
            setShowPlayerSelect(true);
          }, 500);
        } else {
          // In single player mode, automatically assign to the only player after waiting for the fadeout
          setTimeout(() => {
            handleClaimSet(0); // Player ID 0
          }, 500);
        }
      } else {
        setWrongSelection(true);
        setTimeout(() => {
          setWrongSelection(false);
          setGameState(gameActions.clearSelection(gameState));
        }, 1000);
      }
    }
  }, [gameState.selectedIndices]);

  const handlePlayerSelect = () => {
    setShowPlayerSelect(false);
    setBoardBlurred(false);
    setTimeout(() => {
      handleClaimSet(selectedPlayerId);
    }, 500);
  };

  const interfaceFadeDelay = 3750;
  const handleCardClick = (index: number) => {
    if (!selectionAllowed) return;
    setGameState(gameActions.selectCard(gameState, index));
  };
  const handleDrawCards = () => setGameState(gameActions.drawCards(gameState));
  const handleQueryClick = () => {
    setShowSetCount(!showSetCount);
  };

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
      case "finiteDeck":
        return (
          <MyTooltip text="Cards remaining in the deck" defaultCursor>
            <div className="flex items-center gap-1">
              <LayersIcon className="size-3 md:size-4 lg:size-5" />
              <span className="text-sm md:text-base">
                {gameState.deck.length}
              </span>
            </div>
          </MyTooltip>
        );
      case "infiniteDeck":
        return (
          <MyTooltip text="Endless deck mode" defaultCursor>
            <div className="flex items-center gap-1">
              <InfinityIcon className="size-3 md:size-5" />
            </div>
          </MyTooltip>
        );
    }
  };
  const getWinningPlayer = () => {
    return gameState.players.reduce(
      (winningPlayer, curr) =>
        curr.score > winningPlayer.score ? curr : winningPlayer,
      gameState.players[0],
    );
  };
  return (
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
          className={`flex basis-1/3 items-center justify-start gap-1 ${
            menuSettings.rotateCards ? "landscape:flex-col landscape:gap-2" : ""
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
            className={`rounded-full ${addButtonClass()} size-8`}
            variant="outline"
            onClick={handleDrawCards}
            aria-label="Draw three more cards"
          >
            <PlusIcon className="aspect-square" />
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
              showSetCount ? "Hide board set count" : "Show board set count"
            }
          >
            <div
              onClick={handleQueryClick}
              aria-label={
                showSetCount ? "Hide board set count" : "Show board set count"
              }
            >
              <CircleHelpIcon className="size-4 md:size-5" />
            </div>
          </MyTooltip>
        </div>
      </div>

      {/* Game board - center */}
      <div className="flex flex-col items-center justify-center">
        <div className={boardBlurred ? "blur-lg transition-all" : ""}>
          <SetBoard
            gameOver={gameState.gameOver}
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
      </div>

      {/* Afterboard area */}
      <div
        className={`animate-fade-in opacity-0 ${
          menuSettings.rotateCards ? "portrait:w-full" : "w-full"
        }`}
        style={{ animationDelay: `${interfaceFadeDelay}ms` }}
      >
        <div
          className={`flex items-start justify-between ${
            menuSettings.rotateCards
              ? "portrait:w-full landscape:h-full landscape:flex-col landscape:justify-between"
              : "w-full"
          }`}
        >
          <div
            className={`${menuSettings.rotateCards ? "portrait:basis-1/3 landscape:justify-start" : "basis-1/3"} landscape:flex`}
          >
            {deckModeNode(menuSettings.deckMode)}
          </div>

          <div className="flex items-center justify-end gap-2">
            {gameState.players.length === 1 ? (
              <span>Score: {gameState.players[0].score}</span>
            ) : (
              <span>
                {getWinningPlayer().name}: {getWinningPlayer().score}
              </span>
            )}
            <MyTooltip text="Add/edit players">
              <Button
                onClick={() => setShowPlayersDialog(true)}
                variant="ghost"
                className="flex gap-1 p-1"
                aria-label="Add a second player"
              >
                <UsersIcon />{" "}
                <span className="text-base font-normal">
                  {gameState.players.length}
                </span>
              </Button>
            </MyTooltip>
          </div>
        </div>
      </div>

      {/* Modal to select player who found the set */}
      <PlayerSelectModal
        open={showPlayerSelect}
        handlePlayerSelect={handlePlayerSelect}
        selectedPlayerId={selectedPlayerId}
        setSelectedPlayerId={setSelectedPlayerId}
        gameState={gameState}
      />

      {/* Edit all players modal */}
      <PlayersDialog
        open={showPlayersDialog}
        setOpen={setShowPlayersDialog}
        players={gameState.players}
        updatePlayerName={handleUpdatePlayerName}
        addPlayerToGame={addPlayerToGame}
        deletePlayerFromGame={handleDeletePlayer}
      />
    </div>
  );
}
