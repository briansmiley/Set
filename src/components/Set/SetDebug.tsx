import { BugIcon } from "lucide-react";
import { Button } from "../ui/button";
import { gameActions, setUtils } from "@/lib/SetLogic";
import { MenuSettings, SetGameState } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import { useState } from "react";

interface SetDebugProps {
  gameState: SetGameState;
  setGameState: (state: SetGameState) => void;
  setMenuSettings: (
    settings: MenuSettings | ((prev: MenuSettings) => MenuSettings),
  ) => void;
  setFlashBoard: (flash: boolean) => void;
  debugHighlightIndices: number[];
  setDebugHighlightIndices: (indices: number[]) => void;
}

export function SetDebug({
  gameState,
  setGameState,
  setMenuSettings,
  setFlashBoard,
  debugHighlightIndices,
  setDebugHighlightIndices,
}: SetDebugProps) {
  const [open, setOpen] = useState(false);

  const handleDebugNoSets = () => {
    setGameState(gameActions.debugSetNoSetBoard(gameState));
    setMenuSettings((prev) => ({
      ...prev,
      handleNoSets: "autoAdd",
      stickySetCount: true,
    }));
  };
  const handleDebugShowOneSet = () => {
    const firstSet = setUtils.findOneSet(gameState.board);
    if (!firstSet) {
      setFlashBoard(true);
      setTimeout(() => {
        setFlashBoard(false);
      }, 1000);
    } else {
      setDebugHighlightIndices(firstSet);
      console.log(firstSet);
      setOpen(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="size-8">
          <BugIcon />
          <span className="sr-only">Open debug menu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Debug Controls</DialogTitle>
          <DialogDescription className="sr-only">
            Debug commands
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Button variant="outline" onClick={handleDebugNoSets}>
            Generate No-Set Board
          </Button>
          <div className="flex w-full justify-between">
            <Button variant="outline" onClick={handleDebugShowOneSet}>
              Find Set
            </Button>
            <span className="text-sm text-muted-foreground">
              {debugHighlightIndices.join(", ")}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
