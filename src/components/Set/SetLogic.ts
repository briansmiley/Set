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

export interface SetCard {
  shape: SetShape;
  color: SetColor;
  fill: SetFill;
  number: SetNumber;
}

// Helper to check if three cards form a valid set
export function isSet(card1: SetCard, card2: SetCard, card3: SetCard): boolean {
  const properties: (keyof SetCard)[] = ["shape", "color", "fill", "number"];
  return properties.every((prop) => {
    const values = new Set([card1[prop], card2[prop], card3[prop]]);
    return values.size === 1 || values.size === 3;
  });
}

type SetBoardMode = "random" | "exactlyOne" | "atLeastOne";

// Factored out helper function
export function generateRandomCard(): SetCard {
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
}

function countSets(cards: SetCard[]): number {
  let setCount = 0;
  for (let i = 0; i < cards.length - 2; i++) {
    for (let j = i + 1; j < cards.length - 1; j++) {
      for (let k = j + 1; k < cards.length; k++) {
        if (isSet(cards[i], cards[j], cards[k])) {
          setCount++;
        }
      }
    }
  }
  return setCount;
}
/**
 * Generates a board of 12 Set cards
 * @param mode - How to generate the board: "random" (default), "exactlyOne", or "atLeastOne"
 * @returns An array of 12 Set cards
 */
export function generateSetBoard(mode: SetBoardMode = "random"): SetCard[] {
  function generateBoard(): SetCard[] {
    const board: SetCard[] = [];
    while (board.length < 12) {
      const newCard = generateRandomCard();
      // Ensure no duplicate cards
      if (
        !board.some(
          (card) =>
            card.shape === newCard.shape &&
            card.color === newCard.color &&
            card.fill === newCard.fill &&
            card.number === newCard.number,
        )
      ) {
        board.push(newCard);
      }
    }
    return board;
  }

  // For random boards, just generate and return
  if (mode === "random") {
    return generateBoard();
  }

  // Keep generating boards until we find one that matches our criteria
  while (true) {
    const board = generateBoard();
    const setCount = countSets(board);

    if (mode === "exactlyOne" && setCount === 1) {
      return board;
    }
    if (mode === "atLeastOne" && setCount >= 1) {
      return board;
    }
  }
}

/**Refills a set board up to 12 cards with at least one set */
export function refilledBoard(board: SetCard[], replacedIndices: number[]) {
  // First, get the remaining cards (ones we're keeping)
  const remainingCards = board.filter((_, i) => !replacedIndices.includes(i));

  const makeNewCardSet = () => {
    const newCardCount = replacedIndices.length;
    const newCards: SetCard[] = [];
    for (let i = 0; i < newCardCount; i++) {
      let found = false;
      while (!found) {
        const newCard = generateRandomCard();
        // Check against both remaining cards AND previously added new cards
        const isDuplicate =
          remainingCards.some(
            (card) =>
              card.shape === newCard.shape &&
              card.color === newCard.color &&
              card.fill === newCard.fill &&
              card.number === newCard.number,
          ) ||
          newCards.some(
            (card) =>
              card.shape === newCard.shape &&
              card.color === newCard.color &&
              card.fill === newCard.fill &&
              card.number === newCard.number,
          );

        if (!isDuplicate) {
          newCards.push(newCard);
          found = true;
        }
      }
    }
    return newCards;
  };

  let newCards = makeNewCardSet();
  // Ensure the resulting board has at least one set
  while (countSets([...remainingCards, ...newCards]) < 1) {
    newCards = makeNewCardSet();
  }

  // Reconstruct the board with new cards in the replaced positions
  return board.map((card, i) =>
    replacedIndices.includes(i) ? newCards[replacedIndices.indexOf(i)] : card,
  );
}

/** Generates and shuffles a new full set deck */
export function generateAndShuffleDeck() {

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
}

