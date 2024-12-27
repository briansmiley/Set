import { SetGameMode } from "./SetLogic";

export interface GameSettings {
  deckMode: SetGameMode;
  autoAddCards: boolean;
  handleNoSets:
    | "autoAdd" //automatically add 3 cards until there is a set
    | "none" //do nothing and let the player add cards whenever they want like irl
    | "hint"; //subtly indicate no sets present by fading in add button
  stickySetCount: boolean;
}

export type GameSettingsUpdate = Partial<GameSettings>;
