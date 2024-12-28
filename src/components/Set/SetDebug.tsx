import { Button } from "../ui/button";
import { gameActions } from "@/lib/SetLogic";
import { MenuSettings, SetGameState } from "@/lib/types";

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
    <Button className="ml-2" variant="outline" onClick={handleDebugNoSets}>
      Debug: No Sets
    </Button>
  );
}
