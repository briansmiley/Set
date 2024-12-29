import { Bug } from "lucide-react";
import { Button } from "../ui/button";
import { gameActions } from "@/lib/SetLogic";
import { MenuSettings, SetGameState } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface SetDebugProps {
  gameState: SetGameState;
  setGameState: (state: SetGameState) => void;
  setMenuSettings: (
    settings: MenuSettings | ((prev: MenuSettings) => MenuSettings),
  ) => void;
}

export function SetDebug({
  gameState,
  setGameState,
  setMenuSettings,
}: SetDebugProps) {
  const handleDebugNoSets = () => {
    setGameState(gameActions.debugSetNoSetBoard(gameState));
    setMenuSettings((prev) => ({
      ...prev,
      handleNoSets: "autoAdd",
      stickySetCount: true,
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bug className="h-6 w-6" />
          <span className="sr-only">Open debug menu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Debug Controls</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Button variant="outline" onClick={handleDebugNoSets}>
            Generate No-Set Board
          </Button>
          {/* Add more debug controls here */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
