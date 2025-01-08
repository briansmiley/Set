import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import type { SetGameState } from "@/lib/types";
import SetCard from "./SetCard";

type PlayerSelectModalProps = {
  open: boolean;
  handlePlayerSelect: () => void;
  selectedPlayerId: number;
  setSelectedPlayerId: (id: number) => void;
  gameState: SetGameState;
};
export default function PlayerSelectModal({
  open,
  handlePlayerSelect,
  selectedPlayerId,
  setSelectedPlayerId,
  gameState,
}: PlayerSelectModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handlePlayerSelect();
      }}
    >
      <DialogContent transparent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Who found the set?</DialogTitle>
        </DialogHeader>
        <RadioGroup
          value={selectedPlayerId.toString()}
          onValueChange={(value) => setSelectedPlayerId(parseInt(value))}
          className="flex flex-col gap-4"
        >
          {gameState.players.map((player) => (
            <div key={player.id} className="flex items-center">
              <RadioGroupItem
                value={player.id.toString()}
                id={`player-${player.id}`}
              />
              <Label
                htmlFor={`player-${player.id}`}
                className="flex-1 pl-4 text-lg font-medium"
              >
                {`${player.name}: ${player.score}`}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Button onClick={handlePlayerSelect} className="mt-6 w-full">
          Confirm
        </Button>
        <div className="flex w-full gap-2">
          {gameState.selectedIndices.map((index) => (
            <div className="basis-1/3">
              <SetCard key={index} responsive card={gameState.board[index]!} />
            </div>
          ))}
        </div>
      </DialogContent>
      {/* Set cards display */}
    </Dialog>
  );
}
