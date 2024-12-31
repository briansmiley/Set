import { SET_PROPERTIES, SetCard, SetGameState, SetGameMode } from "./types";

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
    if (cards.some((card) => card === null)) return false;

    const properties: (keyof SetCard)[] = ["shape", "color", "fill", "number"];

    return properties.every((prop) => {
      const values = new Set(cards.map((card) => card![prop]));
      return values.size === 1 || values.size === 3;
    });
  },
  //Count the number of sets in a given board
  countSets: (cards: (SetCard | null)[]): number => {
    let setCount = 0;
    const validCards = cards.filter((card): card is SetCard => card !== null);
    for (let i = 0; i < validCards.length - 2; i++) {
      for (let j = i + 1; j < validCards.length - 1; j++) {
        for (let k = j + 1; k < validCards.length; k++) {
          if (setUtils.isSet([validCards[i], validCards[j], validCards[k]])) {
            setCount++;
          }
        }
      }
    }
    return setCount;
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
  cardsMatch: (a: SetCard, b: SetCard): boolean => {
    return (
      a.shape === b.shape &&
      a.color === b.color &&
      a.fill === b.fill &&
      a.number === b.number
    );
  },
  /**Generate a deck with at least 16 cards on top that wont form a set, for debugging */
  generateNoSetDeck: (): SetCard[] => {
    const cards: SetCard[] = [];
    const missingShape = "squiggle";
    const missingColor = "purple";
    const missingFill = "open";
    const missingNumber = 3;

    for (const shape of SET_PROPERTIES.shapes) {
      if (shape === missingShape) continue;
      for (const color of SET_PROPERTIES.colors) {
        if (color === missingColor) continue;
        for (const fill of SET_PROPERTIES.fills) {
          if (fill === missingFill) continue;
          for (const number of SET_PROPERTIES.numbers) {
            if (number === missingNumber) continue;
            cards.push({ shape, color, fill, number });
          }
        }
      }
    }
    cards.sort(() => Math.random() - 0.5);
    const openPurpleSquiggleSet: SetCard[] = [
      { shape: "squiggle", color: "purple", fill: "open", number: 1 },
      { shape: "squiggle", color: "purple", fill: "open", number: 2 },
      { shape: "squiggle", color: "purple", fill: "open", number: 3 },
    ];
    cards.unshift(...openPurpleSquiggleSet);
    const newDeck = setUtils
      .generateAndShuffleDeck()
      .filter((card) => !cards.some((c) => setUtils.cardsMatch(c, card)));
    cards.push(...newDeck);
    return cards;
  },
  /**Returns the indices of a set in the board, or null if no set is found */
  findOneSet: (cards: (SetCard | null)[]): number[] | null => {
    for (let i = 0; i < cards.length - 2; i++) {
      for (let j = i + 1; j < cards.length - 1; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (setUtils.isSet([cards[i], cards[j], cards[k]])) {
            return [i, j, k];
          }
        }
      }
    }
    return null;
  },
  /**Returns all sets in the board as an array of arrays of indices */
  getAllSets: (cards: (SetCard | null)[]): number[][] => {
    const sets: number[][] = [];
    for (let i = 0; i < cards.length - 2; i++) {
      for (let j = i + 1; j < cards.length - 1; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (setUtils.isSet([cards[i], cards[j], cards[k]])) {
            sets.push([i, j, k]);
          }
        }
      }
    }
    return sets;
  },
};
export const gameActions = {
  /** Select a card on the board */
  selectCard: (
    gameState: SetGameState,
    selectedIndex: number,
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
  setGameMode: (
    gameState: SetGameState,
    deckMode: SetGameMode,
  ): SetGameState => {
    if (deckMode === "soloInfinite" && gameState.deck.length === 0) {
      console.log("Regenerating deck");
      const currentBoardCards = gameState.board.filter(
        (card): card is SetCard => card !== null,
      );
      const newDeck = setUtils
        .generateAndShuffleDeck()
        .filter(
          (card) =>
            !currentBoardCards.some((boardCard) =>
              setUtils.cardsMatch(card, boardCard),
            ),
        );
      const newBoard = [...gameState.board];

      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] === null && newDeck.length > 0) {
          newBoard[i] = newDeck.pop()!;
        }
      }

      return {
        ...gameState,
        settings: { ...gameState.settings, deckMode },
        deck: newDeck,
        board: newBoard,
      };
    }
    return { ...gameState, settings: { ...gameState.settings, deckMode } };
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
        if (gameState.settings.deckMode === "soloInfinite") {
          // For infinite mode, keep generating new cards
          if (newDeck.length === 0) {
            // Regenerate deck when empty
            newDeck.push(...setUtils.generateAndShuffleDeck());
          }
          newBoard[index] = newDeck.shift()!;
        } else {
          // Original deck mode behavior
          if (newDeck.length > 0) {
            newBoard[index] = newDeck.shift()!;
          } else {
            newBoard[index] = null;
          }
        }
      }
    }

    const updatedState = {
      ...gameState,
      deck: newDeck,
      board: newBoard,
      selectedIndices: [],
      foundSets: [...gameState.foundSets, selectedCards],
      score: gameState.score + 1,
      setPresent: setUtils.hasAnySet(newBoard),
    };

    return updatedState;
  },

  clearSelection: (gameState: SetGameState): SetGameState => {
    return { ...gameState, selectedIndices: [] };
  },

  createNewGame: (gameMode: SetGameMode): SetGameState => {
    const deck = setUtils.generateAndShuffleDeck();
    let board = deck.splice(0, 12);

    while (!setUtils.hasAnySet(board)) {
      deck.push(...board);
      deck.sort(() => Math.random() - 0.5);
      board = deck.splice(0, 12);
    }

    return {
      deck,
      board,
      foundSets: [],
      score: 0,
      selectedIndices: [],
      setPresent: setUtils.hasAnySet(board),
      settings: {
        deckMode: gameMode,
      },
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
  shuffleDeck: (gameState: SetGameState): SetGameState => {
    const newDeck = [...gameState.deck];
    newDeck.sort(() => Math.random() - 0.5);
    return {
      ...gameState,
      deck: newDeck,
    };
  },
  reDealBoard: (gameState: SetGameState): SetGameState => {
    const newDeck = [...gameState.deck];
    newDeck.push(
      ...gameState.board.filter((card): card is SetCard => card !== null),
    );
    newDeck.sort(() => Math.random() - 0.5);
    let newBoard = newDeck.splice(0, 12);
    while (!setUtils.hasAnySet(newBoard)) {
      newDeck.push(...newBoard);
      newDeck.sort(() => Math.random() - 0.5);
      newBoard = newDeck.splice(0, 12);
    }
    return {
      ...gameState,
      deck: newDeck,
      board: newBoard,
      setPresent: setUtils.hasAnySet(newBoard),
    };
  },
  debugSetNoSetBoard: (gameState: SetGameState): SetGameState => {
    const deck = setUtils.generateNoSetDeck();
    const board = deck.splice(0, 12);

    return {
      deck,
      board,
      foundSets: [],
      score: 0,
      selectedIndices: [],
      setPresent: setUtils.hasAnySet(board),
      settings: gameState.settings,
    };
  },
};
