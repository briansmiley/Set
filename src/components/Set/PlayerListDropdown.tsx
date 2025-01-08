import { UserPlusIcon, Users } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Player } from "@/lib/types";

interface PlayerListDropdownProps {
  players: Player[];
  onEditPlayer: (player: Player) => void;
  onAddPlayer: () => void;
}

export default function PlayerListDropdown({
  players,
  onEditPlayer,
  onAddPlayer,
}: PlayerListDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {players.map((player) => (
          <DropdownMenuItem
            key={player.id}
            className="group flex cursor-pointer justify-between"
            onClick={() => onEditPlayer(player)}
          >
            <span className="truncate">
              {player.name}: {player.score}
              {player.penalties > 0 && (
                <span className="text-red-500">(-{player.penalties})</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
        {players.length < 50 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={onAddPlayer}>
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Add Player
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
