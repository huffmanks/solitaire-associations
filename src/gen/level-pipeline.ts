import crypto from "crypto";

import { LEVEL_DIFFICULTIES } from "@/lib/constants.ts";

import type {
  CardType,
  LevelDifficulty,
  LockRegistry,
  NumberOfColumns,
  PackDifficultyVariant,
  PackDifficultyVariants,
  PuzzleDataPool,
  RawLevelConfig,
  SimState,
  StaticLevelPack,
} from "../types.ts";

const HARDCODED_LAYOUTS: Record<
  NumberOfColumns,
  { columnSizes: number[]; deckSize: number; totalCards: number }
> = {
  3: { columnSizes: [3, 4, 5], deckSize: 24, totalCards: 36 },
  4: { columnSizes: [4, 5, 6, 7], deckSize: 42, totalCards: 64 },
  5: { columnSizes: [5, 6, 7, 8, 9], deckSize: 63, totalCards: 98 },
};

export class LevelPipeline {
  private static findExactCombination(
    categories: string[],
    dataPool: PuzzleDataPool,
    target: number
  ): Array<{ name: string; wordCount: number }> {
    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
    const randomizedCats = shuffle([...categories]);
    const allowedWordSizes = [8, 5, 4, 3];
    const result: Array<{ name: string; wordCount: number }> = [];

    function backtrack(index: number, currentSum: number): boolean {
      if (currentSum === target) return true;
      if (currentSum > target || index >= randomizedCats.length) return false;

      const catName = randomizedCats[index];
      const maxAvailable = dataPool[catName]?.length || 0;

      for (const size of allowedWordSizes) {
        if (maxAvailable >= size) {
          const cost = 1 + size;
          if (currentSum + cost <= target) {
            result.push({ name: catName, wordCount: size });
            if (backtrack(index + 1, currentSum + cost)) return true;
            result.pop();
          }
        }
      }
      return backtrack(index + 1, currentSum);
    }

    if (backtrack(0, 0)) return result;

    console.warn(
      `[Pipeline Warning] Requested categories short of target (${target}). Rebalancing from global data pool...`
    );
    result.length = 0;

    let currentSum = 0;
    for (const catName of randomizedCats) {
      const avail = dataPool[catName]?.length || 0;
      let size = 0;
      if (avail >= 8) size = 8;
      else if (avail >= 5) size = 5;
      else if (avail >= 4) size = 4;
      else if (avail >= 3) size = 3;

      if (size > 0 && currentSum + 1 + size <= target) {
        result.push({ name: catName, wordCount: size });
        currentSum += 1 + size;
      }
    }

    if (currentSum < target) {
      const remainingNeeded = target - currentSum;
      const allUsedWords = new Set(result.flatMap((r) => dataPool[r.name] || []));
      const fallbackWordsPool: string[] = [];

      Object.keys(dataPool).forEach((cat) => {
        (dataPool[cat] || []).forEach((w) => {
          if (!allUsedWords.has(w)) fallbackWordsPool.push(w);
        });
      });

      const neededWordsCount = remainingNeeded - 1;

      if (fallbackWordsPool.length >= neededWordsCount && [3, 4, 5, 8].includes(neededWordsCount)) {
        dataPool["Extra Pool"] = fallbackWordsPool.slice(0, neededWordsCount);
        result.push({ name: "Extra Pool", wordCount: neededWordsCount });
      } else {
        for (let i = 0; i < result.length; i++) {
          const currentSize = result[i].wordCount;
          const delta = target - currentSum;
          for (const nextSmallerSize of allowedWordSizes) {
            if (nextSmallerSize < currentSize) {
              const savings = currentSize - nextSmallerSize;
              const missingAfterSavings = delta + savings;
              const structuralWordsNeeded = missingAfterSavings - 1;
              if (
                allowedWordSizes.includes(structuralWordsNeeded) &&
                fallbackWordsPool.length >= structuralWordsNeeded
              ) {
                result[i].wordCount = nextSmallerSize;
                currentSum -= savings;

                dataPool["Extra Pool"] = fallbackWordsPool.slice(0, structuralWordsNeeded);
                result.push({ name: "Extra Pool", wordCount: structuralWordsNeeded });
                return result;
              }
            }
          }
        }
        throw new Error(
          `Fatal: Data pool completely exhausted. Provide more total words in puzzleDataPool configuration.`
        );
      }
    }

    return result;
  }

  private static generateVariantLayout(
    input: RawLevelConfig,
    dataPool: PuzzleDataPool,
    difficulty: LevelDifficulty
  ): PackDifficultyVariant {
    const { numberOfColumns, categories, locks } = input;

    const layoutRule = HARDCODED_LAYOUTS[numberOfColumns];
    if (!layoutRule) {
      throw new Error(`Unsupported column layout scale constraint: ${numberOfColumns}`);
    }

    const columns: CardType[][] = Array.from({ length: numberOfColumns }, () => []);
    const deck: CardType[] = [];
    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    const chosenCombination = this.findExactCombination(
      categories,
      dataPool,
      layoutRule.totalCards
    );

    const finalWordPool: Array<{ word: string; category: string }> = [];
    const balancedCategories: string[] = [];

    chosenCombination.forEach((selection) => {
      balancedCategories.push(selection.name);
      const shuffledPoolWords = shuffle([...dataPool[selection.name]]);
      const selectedWords = shuffledPoolWords.slice(0, selection.wordCount);

      selectedWords.forEach((word) => {
        finalWordPool.push({ word, category: selection.name });
      });
    });

    const categoryCards: CardType[] = balancedCategories.map((catName) => ({
      id: crypto.randomUUID(),
      content: catName,
      category: catName,
      isFaceUp: false,
      type: "category",
      totalInCategory: finalWordPool.filter((w) => w.category === catName).length,
    }));

    const wordCards: CardType[] = finalWordPool.map((item) => ({
      id: crypto.randomUUID(),
      content: item.word,
      category: item.category,
      isFaceUp: false,
      type: "word",
    }));

    let pooledCategories = shuffle(categoryCards);
    let pooledWords = shuffle(wordCards);

    let anchoredCategories: CardType[] = [];
    let floatingCategories: CardType[] = [];

    if (difficulty === "easy") {
      anchoredCategories = pooledCategories.slice(0, 1);
      floatingCategories = pooledCategories.slice(1);
    } else if (difficulty === "hard") {
      const anchorCount = Math.min(2, pooledCategories.length);
      anchoredCategories = pooledCategories.slice(0, anchorCount);
      floatingCategories = pooledCategories.slice(anchorCount);
    } else {
      floatingCategories = [...pooledCategories];
    }

    if (difficulty === "hard") {
      anchoredCategories.forEach((cat, index) => {
        columns[index % numberOfColumns].push(cat);
      });
    }

    let mainCardPool = shuffle([...pooledWords, ...floatingCategories]);

    for (let c = 0; c < numberOfColumns; c++) {
      const targetSize = layoutRule.columnSizes[c];
      let attempts = 0;
      while (
        columns[c].length < targetSize &&
        mainCardPool.length > 0 &&
        attempts < mainCardPool.length
      ) {
        const candidateCard = mainCardPool[0];
        const wouldBuryOwnCategory = columns[c].some(
          (existingCard) =>
            existingCard.type === "category" && existingCard.category === candidateCard.category
        );

        if (candidateCard.type === "word" && wouldBuryOwnCategory) {
          mainCardPool.push(mainCardPool.shift()!);
          attempts++;
        } else {
          columns[c].push(mainCardPool.shift()!);
          attempts = 0;
        }
      }

      while (columns[c].length < targetSize && mainCardPool.length > 0) {
        columns[c].push(mainCardPool.shift()!);
      }
    }

    if (difficulty === "easy" && anchoredCategories.length > 0) {
      const targetColumn = Math.floor(Math.random() * numberOfColumns);
      if (columns[targetColumn].length > 0) {
        columns[targetColumn][columns[targetColumn].length - 1] = anchoredCategories[0];
      } else {
        columns[targetColumn].push(anchoredCategories[0]);
      }
    }

    deck.push(...mainCardPool);

    if (locks && (numberOfColumns === 4 || numberOfColumns === 5)) {
      locks.forEach((lock) => {
        const lockColumn = Math.floor(Math.random() * numberOfColumns);
        const targetColumnCards = columns[lockColumn];

        const maxAvailableIndex = Math.min(3, targetColumnCards.length - 1);
        let lockRow = maxAvailableIndex;
        while (
          lockRow >= 0 &&
          (targetColumnCards[lockRow]?.isLock || targetColumnCards[lockRow]?.isKey)
        ) {
          lockRow--;
        }

        if (lockRow < 0) {
          for (let columnFallback = 0; columnFallback < numberOfColumns; columnFallback++) {
            let rowFallback = Math.min(3, columns[columnFallback].length - 1);
            while (
              rowFallback >= 0 &&
              (columns[columnFallback][rowFallback]?.isLock ||
                columns[columnFallback][rowFallback]?.isKey)
            ) {
              rowFallback--;
            }
            if (rowFallback >= 0) {
              columns[columnFallback][rowFallback].isLock = true;
              columns[columnFallback][rowFallback].lockColorId = lock.id;
              columns[columnFallback][rowFallback].keysRequired = lock.keysRequired;
              columns[columnFallback][rowFallback].keysCollected = 0;
              break;
            }
          }
        } else if (targetColumnCards[lockRow]) {
          targetColumnCards[lockRow].isLock = true;
          targetColumnCards[lockRow].lockColorId = lock.id;
          targetColumnCards[lockRow].keysRequired = lock.keysRequired;
          targetColumnCards[lockRow].keysCollected = 0;
        }

        let keysPlaced = 0;
        let protectionCounter = 0;

        while (keysPlaced < lock.keysRequired && protectionCounter < 300) {
          protectionCounter++;
          const targetColIdx = Math.floor(Math.random() * numberOfColumns);
          const targetColumn = columns[targetColIdx];

          if (targetColumn.length <= 1) continue;

          const targetRowIdx = Math.floor(Math.random() * (targetColumn.length - 1));
          const potentialCard = targetColumn[targetRowIdx];

          if (potentialCard && !potentialCard.isLock && !potentialCard.isKey) {
            potentialCard.isKey = true;
            potentialCard.lockColorId = lock.id;
            keysPlaced++;
          }
        }

        if (keysPlaced < lock.keysRequired) {
          for (let i = 0; i < deck.length; i++) {
            if (keysPlaced === lock.keysRequired) break;
            if (!deck[i].isLock && !deck[i].isKey) {
              deck[i].isKey = true;
              deck[i].lockColorId = lock.id;
              keysPlaced++;
            }
          }
        }
      });
    }

    columns.forEach((col) => {
      col.forEach((card, index) => {
        card.isFaceUp = index === col.length - 1;
      });
    });

    deck.forEach((card) => {
      card.isFaceUp = false;
    });

    return { columns, deck: shuffle(deck) };
  }

  public static verifyLayoutWinnable(
    layout: PackDifficultyVariant,
    targetCategoryCount: number
  ): boolean {
    const getStateHash = (
      cols: CardType[][],
      dk: CardType[],
      fnd: string[],
      wste: CardType[],
      cycles: number
    ) => {
      const colStr = cols
        .map((c) =>
          c
            .map(
              (card) =>
                `${card.content}:${card.isFaceUp ? "U" : "D"}:${card.isKey ? "K" : "NK"}:${card.isLock ? "L" : "NL"}`
            )
            .join(",")
        )
        .join("|");
      const deckStr = dk.map((c) => c.content).join(",");
      const fndStr = fnd.sort().join(",");
      const wasteStr = wste.map((c) => c.content).join(",");
      return `${colStr}#${deckStr}#${fndStr}#${wasteStr}#C:${cycles}`;
    };

    let initialColumns = layout.columns.map((col) => col.map((c) => ({ ...c })));
    let initialDeck = layout.deck.map((c) => ({ ...c }));

    const lockRegistry: LockRegistry = {} as any;
    layout.columns
      .flat()
      .concat(layout.deck)
      .forEach((c) => {
        if (c.isLock && c.lockColorId && c.keysRequired) {
          lockRegistry[c.lockColorId] = { needed: c.keysRequired, collected: 0, open: false };
        }
      });

    const queue: Array<SimState> = [
      {
        columns: initialColumns,
        deck: initialDeck,
        waste: [],
        foundations: [],
        activeLocks: lockRegistry,
        deckCycles: 0,
      },
    ];

    const visited = new Set<string>();
    let runs = 0;

    while (queue.length > 0) {
      runs++;
      if (runs > 8000) return false;

      const current = queue.shift()!;

      if (current.foundations.length === targetCategoryCount) {
        return true;
      }

      const hash = getStateHash(
        current.columns,
        current.deck,
        current.foundations,
        current.waste,
        current.deckCycles
      );
      if (visited.has(hash)) continue;
      visited.add(hash);

      let altered = false;
      const nextCols = current.columns.map((col) => col.map((c) => ({ ...c })));
      const nextLocks = JSON.parse(JSON.stringify(current.activeLocks));
      let nextWaste = current.waste.map((c) => ({ ...c }));

      if (nextWaste.length > 0) {
        const topWasteCard = nextWaste[nextWaste.length - 1];
        if (topWasteCard.isKey && topWasteCard.lockColorId) {
          const lid = topWasteCard.lockColorId;
          if (nextLocks[lid] && !nextLocks[lid].open) {
            nextLocks[lid].collected += 1;
            if (nextLocks[lid].collected >= nextLocks[lid].needed) {
              nextLocks[lid].open = true;
            }
            topWasteCard.isKey = false;
            altered = true;
          }
        }
      }

      nextCols.forEach((col) => {
        if (col.length > 0) {
          const topCard = col[col.length - 1];
          if (!topCard.isFaceUp) {
            topCard.isFaceUp = true;
            altered = true;
          }

          if (topCard.isKey && topCard.lockColorId) {
            const lid = topCard.lockColorId;
            if (nextLocks[lid] && !nextLocks[lid].open) {
              nextLocks[lid].collected += 1;
              if (nextLocks[lid].collected >= nextLocks[lid].needed) {
                nextLocks[lid].open = true;
              }
              topCard.isKey = false;
              altered = true;
            }
          }

          if (topCard.isLock && topCard.lockColorId && nextLocks[topCard.lockColorId]?.open) {
            topCard.isLock = false;
            altered = true;
          }
        }
      });

      if (altered) {
        queue.push({ ...current, columns: nextCols, activeLocks: nextLocks, waste: nextWaste });
        continue;
      }

      let foundationChanged = false;
      for (let i = 0; i < nextCols.length; i++) {
        const col = nextCols[i];
        if (col.length > 0) {
          const top = col[col.length - 1];
          const isBlockedByLock =
            top.isLock && top.lockColorId && !nextLocks[top.lockColorId]?.open;

          if (
            top.type === "category" &&
            !isBlockedByLock &&
            !current.foundations.includes(top.category)
          ) {
            const branch = nextCols.map((c, index) => (index === i ? c.slice(0, -1) : c));
            queue.push({
              ...current,
              columns: branch,
              foundations: [...current.foundations, top.category],
              deckCycles: 0,
            });
            foundationChanged = true;
          }
        }
      }

      if (nextWaste.length > 0) {
        const top = nextWaste[nextWaste.length - 1];
        if (top.type === "category" && !current.foundations.includes(top.category)) {
          queue.push({
            ...current,
            waste: nextWaste.slice(0, -1),
            foundations: [...current.foundations, top.category],
            deckCycles: 0,
          });
          foundationChanged = true;
        }
      }

      if (foundationChanged) continue;

      for (let i = 0; i < nextCols.length; i++) {
        const col = nextCols[i];
        if (col.length > 0) {
          const top = col[col.length - 1];
          const isBlockedByLock =
            top.isLock && top.lockColorId && !nextLocks[top.lockColorId]?.open;

          if (
            top.type === "word" &&
            !isBlockedByLock &&
            current.foundations.includes(top.category)
          ) {
            const branch = nextCols.map((c, index) => (index === i ? c.slice(0, -1) : c));
            queue.push({ ...current, columns: branch, deckCycles: 0 });
          }
        }
      }

      if (nextWaste.length > 0) {
        const top = nextWaste[nextWaste.length - 1];
        if (top.type === "word" && current.foundations.includes(top.category)) {
          queue.push({
            ...current,
            waste: nextWaste.slice(0, -1),
            deckCycles: 0,
          });
        }
      }

      if (current.deck.length > 0) {
        const nextDeck = [...current.deck];
        const drawn = { ...nextDeck.pop()!, isFaceUp: true };
        queue.push({
          ...current,
          deck: nextDeck,
          waste: [...current.waste, drawn],
        });
      } else if (current.waste.length > 0 && current.deckCycles < 2) {
        const recycled = [...current.waste].reverse().map((c) => ({ ...c, isFaceUp: false }));
        queue.push({
          ...current,
          deck: recycled,
          waste: [],
          deckCycles: current.deckCycles + 1,
        });
      }
    }

    return false;
  }

  public static buildLevelPack(input: RawLevelConfig, dataPool: PuzzleDataPool): StaticLevelPack {
    const modesPayload: Partial<PackDifficultyVariants> = {};

    let runtimeCategoriesCount = 0;
    let finalUsedCategoriesList: string[] = [];

    for (const diff of LEVEL_DIFFICULTIES) {
      let passed = false;
      let layout: PackDifficultyVariant = { columns: [], deck: [] };
      let loops = 0;

      while (!passed) {
        loops++;
        layout = this.generateVariantLayout(input, dataPool, diff);

        const activeCategories = new Set<string>();
        layout.columns
          .flat()
          .concat(layout.deck)
          .forEach((c) => activeCategories.add(c.category));

        runtimeCategoriesCount = activeCategories.size;
        finalUsedCategoriesList = Array.from(activeCategories);

        passed = this.verifyLayoutWinnable(layout, runtimeCategoriesCount);

        if (loops > 4000) {
          console.warn(
            `High generation variance lookup on Level ${input.levelNumber} [${diff.toUpperCase()}]. Continuing loop searches...`
          );
          loops = 0;
        }
      }

      modesPayload[diff] = layout;
    }

    return {
      levelNumber: input.levelNumber,
      numberOfColumns: input.numberOfColumns,
      numberOfCategories: runtimeCategoriesCount,
      categories: finalUsedCategoriesList,
      modes: modesPayload as PackDifficultyVariants,
    };
  }
}
