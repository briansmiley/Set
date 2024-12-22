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
export type SetGameMode = "soloDeck" | "soloInfinite";
export interface SetCard {
  shape: SetShape;
  color: SetColor;
  fill: SetFill;
  number: SetNumber;
}

export interface SetGameState {
  gameMode: SetGameMode;
  deck: SetCard[];
  board: (SetCard | null)[];
  foundSets: SetCard[][];
  score: number;
  selectedIndices: number[];
  setPresent: boolean;
}
export const setUtils = {
  generateAndShuffleDeck: (): SetCard[] => {
    const deck: SetCard[] = [];

    // Generate the full set deck
    for (const shape of SET_PROPERTIES.shapes) {
      for (const color of SET_PROPERTIES.colors) {
        for (const fill of SET_PROPERTIES.fills) {
          for (const number of SET_PROPERTIES.numbers) {
            deck.push({ shape, color, fill, number });
          }
        }
      }
    }

    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  },
  generateRandomCard: (): SetCard => {
    return {
      shape:
        SET_PROPERTIES.shapes[
          Math.floor(Math.random() * SET_PROPERTIES.shapes.length)
        ],
      color:
        SET_PROPERTIES.colors[
          Math.floor(Math.random() * SET_PROPERTIES.colors.length)
        ],
      fill: SET_PROPERTIES.fills[
        Math.floor(Math.random() * SET_PROPERTIES.fills.length)
      ],
      number:
        SET_PROPERTIES.numbers[
          Math.floor(Math.random() * SET_PROPERTIES.numbers.length)
        ],
    };
  },
  isSet: (cards: (SetCard | null)[]): boolean => {
    const validCards = cards.filter((card): card is SetCard => card !== null);
    if (validCards.length !== 3) return false;

    const properties: (keyof SetCard)[] = ["shape", "color", "fill", "number"];

    return properties.every((prop) => {
      const values = new Set(validCards.map((card) => card[prop]));
      return values.size === 1 || values.size === 3;
    });
  },
  //Count the number of sets in a given board
  countSets: (cards: SetCard[]): number => {
    let setCount = 0;
    for (let i = 0; i < cards.length - 2; i++) {
      for (let j = i + 1; j < cards.length - 1; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (setUtils.isSet([cards[i], cards[j], cards[k]])) {
            setCount++;
          }
        }
      }
    }
    return setCount;
  },
  validateAndProcessSet: (
    gameState: SetGameState,
    selectedCards: SetCard[]
  ): SetGameState | null => {
    if (!setUtils.isSet(selectedCards)) return null;

    const newDeck = [...gameState.deck];
    const newBoard = [...gameState.board];

    // Replace cards if deck isn't empty
    const indices = gameState.selectedIndices.sort((a, b) => b - a);
    for (const index of indices) {
      if (newDeck.length > 0) {
        newBoard[index] = newDeck.pop()!;
      } else {
        newBoard.splice(index, 1);
      }
    }

    return {
      ...gameState,
      deck: newDeck,
      board: newBoard,
      selectedIndices: [],
      foundSets: [...gameState.foundSets, selectedCards],
      score: gameState.score + 1,
    };
  },
  hasAnySet: (cards: (SetCard | null)[]): boolean => {
    for (let i = 0; i < cards.length - 2; i++) {
      for (let j = i + 1; j < cards.length - 1; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (setUtils.isSet([cards[i], cards[j], cards[k]])) {
            return true; // Return as soon as we find one
          }
        }
      }
    }
    return false;
  },
};
export const gameActions = {
  /** Select a card on the board */
  selectCard: (
    gameState: SetGameState,
    selectedIndex: number
  ): SetGameState => {
    if (gameState.board[selectedIndex] === null) return gameState;

    const newSelectedIndices = [...gameState.selectedIndices];

    // If card is already selected, deselect it
    const existingIndex = newSelectedIndices.indexOf(selectedIndex);
    if (existingIndex !== -1) {
      newSelectedIndices.splice(existingIndex, 1);
      return { ...gameState, selectedIndices: newSelectedIndices };
    }

    // Don't allow new selections when 3 cards are already selected
    if (gameState.selectedIndices.length === 3) return gameState;

    // Add new selection
    newSelectedIndices.push(selectedIndex);
    return { ...gameState, selectedIndices: newSelectedIndices };
  },

  claimSet: (gameState: SetGameState): SetGameState => {
    const newDeck = [...gameState.deck];
    const newBoard = [...gameState.board];
    const selectedCards = gameState.selectedIndices
      .map((i) => gameState.board[i])
      .filter((card): card is SetCard => card !== null);

    const indices = gameState.selectedIndices.sort((a, b) => b - a);
    const remainingCards = newBoard.filter((card) => card !== null).length - 3;

    if (remainingCards >= 12) {
      // If we'll have 12+ cards, just remove the selected ones
      for (const index of indices) {
        newBoard.splice(index, 1);
      }
    } else {
      // Handle card replacement
      for (const index of indices) {
        if (gameState.gameMode === "soloInfinite") {
          // For infinite mode, keep generating new cards
          if (newDeck.length === 0) {
            // Regenerate deck when empty
            newDeck.push(...setUtils.generateAndShuffleDeck());
          }
          newBoard[index] = newDeck.pop()!;
        } else {
          // Original deck mode behavior
          if (newDeck.length > 0) {
            newBoard[index] = newDeck.pop()!;
          } else {
            newBoard[index] = null;
          }
        }
      }
    }

    return {
      ...gameState,
      deck: newDeck,
      board: newBoard,
      selectedIndices: [],
      foundSets: [...gameState.foundSets, selectedCards],
      score: gameState.score + 1,
      setPresent: setUtils.hasAnySet(newBoard),
    };
  },

  clearSelection: (gameState: SetGameState): SetGameState => {
    return { ...gameState, selectedIndices: [] };
  },

  createNewGame: (gameMode: "soloDeck" | "soloInfinite"): SetGameState => {
    const deck = setUtils.generateAndShuffleDeck();
    let board = deck.splice(0, 12);

    while (!setUtils.hasAnySet(board)) {
      deck.push(...board);
      deck.sort(() => Math.random() - 0.5);
      board = deck.splice(0, 12);
    }

    return {
      gameMode,
      deck,
      board,
      foundSets: [],
      score: 0,
      selectedIndices: [],
      setPresent: setUtils.hasAnySet(board),
    };
  },
  drawCards: (gameState: SetGameState, numCards: number = 3): SetGameState => {
    if (gameState.board.length >= 21) return gameState; //21 cards always includes a set
    if (gameState.deck.length < numCards) return gameState; //No cards left to draw
    const newDeck = [...gameState.deck];
    const newBoard = [...gameState.board];
    const drawnCards = newDeck.splice(0, numCards);
    newBoard.push(...drawnCards);
    return {
      ...gameState,
      deck: newDeck,
      board: newBoard,
      setPresent: setUtils.hasAnySet(newBoard),
    };
  },
};
