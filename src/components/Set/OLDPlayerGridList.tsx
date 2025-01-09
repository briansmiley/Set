/** Deprecated/consolidated into PlayersDialog.tsx */
import { UserPlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Player } from "@/lib/types";
import { MenuSettings } from "@/lib/types";
import { SetGameState } from "@/lib/types";

type PlayerGridListProps = {
  gameState: SetGameState;
  menuSettings: MenuSettings;
  handleStartEdit: (player: Player) => void;
  handleAddPlayer: () => void;
};
//Old code for the grid based full player list I replaced with a dropdown
export default function PlayerGridList({
  gameState,
  menuSettings,
  handleStartEdit,
  handleAddPlayer,
}: PlayerGridListProps) {
  return (
    <div
      className={`flex basis-2/3 items-center text-sm ${
        menuSettings.rotateCards
          ? "portrait:justify-center landscape:justify-center"
          : "justify-center"
      }`}
      aria-live="polite"
    >
      <div
        className={`grid w-full gap-1 ${
          menuSettings.rotateCards
            ? `landscape:grid-flow-col landscape:grid-rows-6 ${
                gameState.players.length < 6
                  ? "landscape:grid-cols-1"
                  : "landscape:grid-cols-2"
              }`
            : "grid-cols-3 portrait:grid-cols-2"
        }`}
      >
        {gameState.players.map((player) => (
          <div key={player.id} className="flex h-6 items-center gap-1">
            <Button
              onClick={() => handleStartEdit(player)}
              variant="ghost"
              className="min-w-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <span
                className={`min-w-0 flex-1 truncate ${player.name.length > 9 ? "text-xs" : ""}`}
              >
                {player.name}:
              </span>
            </Button>
            <span className="flex-none">
              {player.score}
              {player.penalties > 0 && (
                <span className="text-red-500">(-{player.penalties})</span>
              )}
            </span>
          </div>
        ))}
        {gameState.players.length < 12 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddPlayer}
            className="place-self-center"
            aria-label="Add player"
          >
            <UserPlusIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
