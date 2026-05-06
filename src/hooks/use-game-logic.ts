import { generateInitialColumns } from "@/lib/utils";
import { CardType, GameState } from "@/types";
import { useState } from "react";

export const useGameLogic = (level: number) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const columnCount = Math.min(3 + Math.floor((level - 1) / 2), 7);
    return generateInitialColumns(columnCount, level);
  });
  const [selectedCardInfo, setSelectedCardInfo] = useState<{
    type: "tableau" | "waste";
    colIndex?: number;
  } | null>(null);

  const revealCard = (colIndex: number, cardIndex: number) => {
    setGameState((prev) => {
      const newColumns = [...prev.columns];
      const column = [...newColumns[colIndex]];
      const card = column[cardIndex];

      // Only allow interaction with the top-most card of the stack
      const isTopCard = cardIndex === column.length - 1;
      if (!isTopCard) return prev;

      // Handle Lock Logic
      const isLocked = (card.lockCount ?? 0) > prev.keysCollected;
      if (isLocked) return prev;

      // Flip card
      if (!card.isFaceUp) {
        card.isFaceUp = true;
        let newKeys = prev.keysCollected;
        if (card.type === "key") newKeys += 1;

        newColumns[colIndex] = column;
        return { ...prev, columns: newColumns, keysCollected: newKeys };
      }

      return prev;
    });
  };

  const moveCard = (targetColIndex: number) => {
    setGameState((prev) => {
      const newColumns = prev.columns.map((col) => [...col]);
      let movingCard: CardType | undefined;
      let sourceCol: CardType[] | undefined;

      // 1. Identify where the card is coming from
      if (selectedCardInfo?.type === "tableau" && selectedCardInfo.colIndex !== undefined) {
        sourceCol = newColumns[selectedCardInfo.colIndex];
        movingCard = sourceCol[sourceCol.length - 1];
      } else if (selectedCardInfo?.type === "waste") {
        movingCard = prev.waste[prev.waste.length - 1];
      }

      if (!movingCard) return prev;

      // 2. Target Column Logic
      const targetCol = newColumns[targetColIndex];
      const topTargetCard = targetCol[targetCol.length - 1];

      // Logic: Allowed if column is empty OR categories match
      const canMove = targetCol.length === 0 || topTargetCard.category === movingCard.category;

      if (canMove) {
        // Remove from source
        if (selectedCardInfo?.type === "tableau" && sourceCol) {
          sourceCol.pop();
          if (sourceCol.length > 0) sourceCol[sourceCol.length - 1].isFaceUp = true;
        } else if (selectedCardInfo?.type === "waste") {
          prev.waste.pop();
        }

        // Add to target
        targetCol.push(movingCard);
        setSelectedCardInfo(null); // Clear selection after move
        return { ...prev, columns: newColumns, waste: [...prev.waste] };
      }

      setSelectedCardInfo(null); // Clear selection if move was illegal
      return prev;
    });
  };

  const moveToFoundation = (colIndex: number) => {
    setGameState((prev) => {
      const newColumns = [...prev.columns];
      const column = [...newColumns[colIndex]];
      const card = column[column.length - 1]; // Get top card

      if (!card || !card.isFaceUp) return prev;

      // If it's a Category Anchor, it must go into an empty slot
      if (card.type === "category") {
        const existingFoundation = prev.foundation[card.category];
        if (!existingFoundation) {
          const newFoundation = { ...prev.foundation, [card.category]: [card] };
          column.pop();
          newColumns[colIndex] = column;
          return { ...prev, columns: newColumns, foundation: newFoundation };
        }
      }

      // If it's a Word, it must match an existing foundation category
      if (card.type === "word") {
        const targetStack = prev.foundation[card.category];
        if (targetStack) {
          const newFoundation = {
            ...prev.foundation,
            [card.category]: [...targetStack, card],
          };
          column.pop();
          newColumns[colIndex] = column;
          return { ...prev, columns: newColumns, foundation: newFoundation };
        }
      }

      return prev;
    });
  };

  // Inside useGameLogic.ts

  const drawCard = () => {
    setGameState((prev) => {
      // If deck is empty, recycle waste (Rule: "can be recycled")
      if (prev.deck.length === 0) {
        return {
          ...prev,
          deck: [...prev.waste].reverse().map((c) => ({ ...c, isFaceUp: false })),
          waste: [],
        };
      }

      const newDeck = [...prev.deck];
      const card = newDeck.pop();

      if (card) {
        card.isFaceUp = true;
        return {
          ...prev,
          deck: newDeck,
          waste: [...prev.waste, card],
        };
      }
      return prev;
    });
  };

  const moveWasteToFoundation = () => {
    setGameState((prev) => {
      if (prev.waste.length === 0) return prev;

      const card = prev.waste[prev.waste.length - 1];

      // Check if it matches an anchor in foundation
      if (prev.foundation[card.category]) {
        const newWaste = [...prev.waste];
        newWaste.pop();

        return {
          ...prev,
          waste: newWaste,
          foundation: {
            ...prev.foundation,
            [card.category]: [...prev.foundation[card.category], card],
          },
        };
      }
      return prev;
    });
  };

  return { gameState, selectedCardInfo, setSelectedCardInfo, moveCard, revealCard, moveToFoundation, drawCard, moveWasteToFoundation };
};
