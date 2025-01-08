import { z } from "zod";
export const SET_PROPERTIES = {
  shapes: ["diamond", "oval", "squiggle"],
  colors: ["red", "green", "purple"],
  fills: ["solid", "striped", "open"],
  numbers: [1, 2, 3],
} as const;

export type SetShape = (typeof SET_PROPERTIES.shapes)[number];
export type SetColor = (typeof SET_PROPERTIES.colors)[number];
export type SetFill = (typeof SET_PROPERTIES.fills)[number];
export type SetNumber = (typeof SET_PROPERTIES.numbers)[number];

export const setGameModeSchema = z.enum(["finiteDeck", "infiniteDeck"]);
export type SetGameMode = z.infer<typeof setGameModeSchema>;

export interface SetCard {
  shape: SetShape;
  color: SetColor;
  fill: SetFill;
  number: SetNumber;
}

// Game-specific settings that affect game logic
export interface GameSettings {
  deckMode: SetGameMode;
}

export const menuSettingsSchema = z.object({
  deckMode: setGameModeSchema,
  handleNoSets: z.enum(["autoAdd", "hint", "none"]),
  stickySetCount: z.boolean(),
  rotateCards: z.boolean(),
});

export type MenuSettings = z.infer<typeof menuSettingsSchema>;

export type MenuSettingsUpdate = Partial<MenuSettings>;

export interface Player {
  id: number;
  name: string;
  foundSets: SetCard[][];
  score: number;
  penalties: number;
}

export interface SetGameState {
  deck: SetCard[];
  board: (SetCard | null)[];
  players: Player[];
  selectedIndices: number[];
  setPresent: boolean;
  settings: GameSettings;
}
