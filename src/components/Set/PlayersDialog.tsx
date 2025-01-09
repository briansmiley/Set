import { CheckIcon, PencilIcon, TrashIcon, UserPlusIcon } from "lucide-react";
import { Player } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect, useState, useRef } from "react";

type EditAllPlayersDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  players: Player[];
  updatePlayerName: (playerId: number, name: string) => void;
  deletePlayerFromGame: (playerId: number) => void;
  addPlayerToGame: () => void;
};

export function PlayersDialog({
  open,
  setOpen,
  players,
  updatePlayerName,
  deletePlayerFromGame,
  addPlayerToGame,
}: EditAllPlayersDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [editingNames, setEditingNames] = useState<Record<number, string>>({});
  const lastAddedPlayerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize editing names when dialog opens or edit mode is enabled
    if (open || editMode) {
      const names: Record<number, string> = {};
      players.forEach((player) => {
        names[player.id] = player.name;
      });
      setEditingNames(names);
    }
  }, [open, players, editMode]);

  const handleSaveChanges = () => {
    Object.entries(editingNames).forEach(([playerId, name]) => {
      const id = parseInt(playerId);
      const currentName = players.find((p) => p.id === id)?.name;
      if (name && name !== currentName) {
        updatePlayerName(id, name);
      }
    });
    setEditMode(false);
  };

  const handleAddPlayer = () => {
    // Buffer any in progress edit changes

    addPlayerToGame();
    setEditMode(true);
    // Wait for the next render cycle when the new player is added
    setTimeout(() => {
      if (lastAddedPlayerRef.current) {
        lastAddedPlayerRef.current.focus();
        lastAddedPlayerRef.current.select();
      }
    }, 1);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setEditMode(false);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Players</DialogTitle>

          <DialogDescription className="sr-only">
            View and edit players
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 p-1">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex h-12 items-center gap-2 p-0.5"
              >
                {editMode ? (
                  <>
                    <Button
                      onClick={() => deletePlayerFromGame(player.id)}
                      variant="ghost"
                      disabled={players.length <= 1}
                      size="icon"
                      tabIndex={-1}
                    >
                      <TrashIcon className="text-red-500" />
                    </Button>
                    <Input
                      ref={
                        index === players.length - 1
                          ? lastAddedPlayerRef
                          : undefined
                      }
                      autoFocus={index === players.length - 1}
                      value={editingNames[player.id] || ""}
                      onChange={(e) => {
                        updatePlayerName(player.id, e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveChanges();
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-4 rounded-md px-3 py-2">
                    <span>{player.name}</span>
                    <span className="text-muted-foreground">
                      Sets: {player.score}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <Button
            onClick={handleAddPlayer}
            variant="ghost"
            className="size-10"
            aria-label="Add player"
          >
            <UserPlusIcon />
          </Button>
          <Button
            variant={editMode ? "outline" : "ghost"}
            onClick={() => setEditMode(!editMode)}
            aria-label={editMode ? "Finish editing" : "Edit player names"}
          >
            {editMode ? <CheckIcon /> : <PencilIcon />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
