import { CheckIcon } from "lucide-react";

import { Player } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useState, useRef } from "react";

type PlayerEditDialogProps = {
  editingPlayer: Player | null;
  setEditingPlayer: (player: Player | null) => void;
  handleDeletePlayer: () => void;
  handleUpdatePlayerName: (name: string) => void;
  allowDelete: boolean;
};

export const PlayerEditDialog = ({
  editingPlayer,
  setEditingPlayer,
  handleDeletePlayer,
  handleUpdatePlayerName,
  allowDelete,
}: PlayerEditDialogProps) => {
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPlayer) {
      setEditingName(editingPlayer.name);
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
    }
  }, [editingPlayer]);

  return (
    <Dialog
      open={editingPlayer !== null}
      onOpenChange={() => setEditingPlayer(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Player Name</DialogTitle>
          <DialogDescription className="sr-only">
            Enter a new name for the player
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDeletePlayer}
            variant="ghost"
            disabled={!allowDelete}
            size="icon"
          >
            <TrashIcon className="text-red-500" />
          </Button>
          <Input
            ref={inputRef}
            autoFocus
            value={editingName}
            onChange={(e) => {
              setEditingName(e.target.value);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleUpdatePlayerName(editingName);
              }
            }}
          />
          <Button
            onClick={() => handleUpdatePlayerName(editingName)}
            variant="outline"
            className="size-8"
          >
            <CheckIcon />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
