import { v4 as uuidv4 } from "uuid";

import type {
  CardType,
  LevelData,
  LevelDifficulty,
  LockColorId,
  ModeLayout,
  NumberOfColumns,
} from "../types.ts";
import { CATEGORY_POOL } from "./category-pool.ts";
import type { CategoryDataset, LevelRequestConfig, LockConfig } from "./types.ts";

const COLUMN_DISTRIBUTIONS: Record<NumberOfColumns, Array<number>> = {
  3: [3, 4, 5],
  4: [4, 5, 6, 7],
  5: [5, 6, 7, 8, 9],
};

// --- LAYOUT GENERATOR ---
class LayoutGenerator {
  public static generateRawLayout(
    config: LevelRequestConfig,
    selectedCategories: Array<CategoryDataset>,
    difficulty: LevelDifficulty
  ): { columns: CardType[][]; deck: CardType[]; maxMoves: number } {
    const categoryCards: CardType[] = [];
    const wordCards: CardType[] = [];

    selectedCategories.forEach((catData) => {
      const wordCount = catData.words.length;
      categoryCards.push({
        id: uuidv4(),
        content: catData.name,
        category: catData.name,
        isFaceUp: false,
        type: "category",
        totalInCategory: wordCount,
      });

      catData.words.forEach((word) => {
        wordCards.push({
          id: uuidv4(),
          content: word,
          category: catData.name,
          isFaceUp: false,
          type: "word",
          totalInCategory: wordCount,
        });
      });
    });

    let shuffledCategories = this.shuffle(categoryCards);
    let shuffledWords = this.shuffle(wordCards);

    const columnDistribution = COLUMN_DISTRIBUTIONS[config.numberOfColumns];
    const columns: CardType[][] = Array.from({ length: config.numberOfColumns }, () => []);
    const deck: CardType[] = [];

    const totalCardCount = shuffledWords.length + shuffledCategories.length;
    const targetDeckCount = Math.floor(totalCardCount * 0.25);

    while (deck.length < targetDeckCount && shuffledWords.length > 0) {
      deck.push(shuffledWords.pop()!);
    }

    let columnPool: CardType[] = [];
    if (difficulty === "hard") {
      columnPool = [];
      const wordsPerCat = Math.floor(shuffledWords.length / shuffledCategories.length);
      for (let i = 0; i < shuffledCategories.length; i++) {
        columnPool.push(shuffledCategories[i]);
        for (let w = 0; w < wordsPerCat; w++) {
          if (shuffledWords.length > 0) columnPool.push(shuffledWords.pop()!);
        }
      }
      columnPool = [...columnPool, ...shuffledWords];
    } else {
      columnPool = this.shuffle([...shuffledCategories, ...shuffledWords]);
    }

    for (let c = 0; c < config.numberOfColumns; c++) {
      const targetCount = columnDistribution[c];
      while (columns[c].length < targetCount && columnPool.length > 0) {
        const potentialCard = columnPool.pop()!;

        const len = columns[c].length;
        if (
          potentialCard.type === "category" &&
          len >= 2 &&
          columns[c][len - 1].type === "category" &&
          columns[c][len - 2].type === "category"
        ) {
          columnPool.unshift(potentialCard);
          const wordIdx = columnPool.findIndex((card) => card.type === "word");
          if (wordIdx !== -1) {
            columns[c].push(columnPool.splice(wordIdx, 1)[0]);
          } else {
            columns[c].push(potentialCard);
          }
        } else {
          columns[c].push(potentialCard);
        }
      }
    }

    for (let c = 0; c < config.numberOfColumns; c++) {
      const col = columns[c];
      if (col.length > 0) {
        col[col.length - 1].isFaceUp = true;
      }
    }

    while (columnPool.length > 0) {
      const potentialCard = columnPool.pop()!;
      if (
        potentialCard.type === "category" &&
        deck.length >= 2 &&
        deck[deck.length - 1].type === "category" &&
        deck[deck.length - 2].type === "category"
      ) {
        const wordIdx = columnPool.findIndex((card) => card.type === "word");
        if (wordIdx !== -1) {
          deck.push(columnPool.splice(wordIdx, 1)[0]);
          columnPool.push(potentialCard);
        } else {
          deck.push(potentialCard);
        }
      } else {
        deck.push(potentialCard);
      }
    }

    const canHaveLocks = config.numberOfColumns === 4 || config.numberOfColumns === 5;
    if (canHaveLocks && config.locks && config.locks.length > 0) {
      const locksToPlace = config.locks.slice(0, 3);
      const availableCols = this.shuffle(Array.from({ length: columns.length }, (_, i) => i));

      locksToPlace.forEach((lockSpec, index) => {
        let lockColumn = availableCols[index % columns.length];
        let keyColumn = availableCols[(index + 1) % columns.length];
        if (lockColumn === keyColumn) {
          keyColumn = availableCols[(index + 2) % columns.length];
        }

        if (difficulty === "easy") {
          lockColumn = index % columns.length;
          keyColumn = (columns.length - 1 - index) % columns.length;
          if (lockColumn === keyColumn) keyColumn = (keyColumn + 1) % columns.length;
        }

        const lockColHeight = columns[lockColumn].length;
        let targetLockRow = -1;
        const minLockRowIndex = Math.max(0, lockColHeight - 4);

        for (let r = lockColHeight - 1; r >= minLockRowIndex; r--) {
          if (
            columns[lockColumn][r] &&
            columns[lockColumn][r].type === "word" &&
            !columns[lockColumn][r].isKey &&
            !columns[lockColumn][r].isLock
          ) {
            targetLockRow = r;
            break;
          }
        }

        if (targetLockRow === -1) targetLockRow = Math.max(0, lockColHeight - 2);

        if (columns[lockColumn][targetLockRow]) {
          columns[lockColumn][targetLockRow].isLock = true;
          columns[lockColumn][targetLockRow].lockColorId = lockSpec.id;
          columns[lockColumn][targetLockRow].keysRequired = lockSpec.keysRequired;
          columns[lockColumn][targetLockRow].keysCollected = 0;
          columns[lockColumn][targetLockRow].isKey = false;
        }

        let keysPlaced = 0;
        let currentKeyColumnTarget = keyColumn;
        let attempts = 0;

        while (keysPlaced < lockSpec.keysRequired && attempts < columns.length) {
          if (currentKeyColumnTarget === lockColumn) {
            currentKeyColumnTarget = (currentKeyColumnTarget + 1) % columns.length;
            continue;
          }

          const keyColHeight = columns[currentKeyColumnTarget].length;
          let startSearchRow = keyColHeight - 2;
          let endSearchRow = difficulty === "easy" ? Math.max(0, keyColHeight - 3) : 1;

          for (let r = startSearchRow; r >= endSearchRow; r--) {
            const card = columns[currentKeyColumnTarget][r];

            const cardAboveIsSameKey =
              columns[currentKeyColumnTarget][r + 1]?.isKey &&
              columns[currentKeyColumnTarget][r + 1]?.lockColorId === lockSpec.id;
            const cardBelowIsSameKey =
              columns[currentKeyColumnTarget][r - 1]?.isKey &&
              columns[currentKeyColumnTarget][r - 1]?.lockColorId === lockSpec.id;

            if (
              card &&
              !card.isLock &&
              !card.isKey &&
              card.type === "word" &&
              !cardAboveIsSameKey &&
              !cardBelowIsSameKey
            ) {
              card.isKey = true;
              card.lockColorId = lockSpec.id;
              card.isLock = false;
              delete card.keysRequired;
              delete card.keysCollected;

              keysPlaced++;
              if (keysPlaced >= lockSpec.keysRequired) break;
            }
          }

          if (keysPlaced >= lockSpec.keysRequired) break;
          currentKeyColumnTarget = (currentKeyColumnTarget + 1) % columns.length;
          attempts++;
        }

        if (keysPlaced < lockSpec.keysRequired) {
          for (let c = 0; c < columns.length; c++) {
            if (c === lockColumn) continue;
            const targetHeight = columns[c].length;
            for (let r = targetHeight - 2; r >= 0; r--) {
              const card = columns[c][r];
              const cardAboveIsSameKey =
                columns[c][r + 1]?.isKey && columns[c][r + 1]?.lockColorId === lockSpec.id;
              const cardBelowIsSameKey =
                columns[c][r - 1]?.isKey && columns[c][r - 1]?.lockColorId === lockSpec.id;

              if (
                card &&
                !card.isLock &&
                !card.isKey &&
                !cardAboveIsSameKey &&
                !cardBelowIsSameKey
              ) {
                card.isKey = true;
                card.lockColorId = lockSpec.id;
                card.isLock = false;
                delete card.keysRequired;
                delete card.keysCollected;

                keysPlaced++;
                if (keysPlaced >= lockSpec.keysRequired) break;
              }
            }
            if (keysPlaced >= lockSpec.keysRequired) break;
          }
        }
      });
    }

    return {
      columns,
      deck,
      maxMoves: config.numberOfCategories * 45,
    };
  }

  private static shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

// --- STATIC VALIDATOR ---
class LevelValidator {
  public static validateStructure(
    columns: CardType[][],
    deck: CardType[],
    config: LevelRequestConfig
  ): { valid: boolean; error?: string } {
    const hasLocks = columns.some((col) => col.some((card) => card.isLock));
    if (hasLocks && columns.length !== 4 && columns.length !== 5) {
      // ISSUE: Lock configurations require exactly 4 or 5 columns
      return {
        valid: false,
        error: `Columns count is ${columns.length}, but locks are only allowed on 4 or 5 columns.`,
      };
    }

    let lockCount = 0;
    let keyCount = 0;

    columns.forEach((col) =>
      col.forEach((card) => {
        if (card.isLock) lockCount++;
        if (card.isKey) keyCount++;
      })
    );

    if (config.locks && config.locks.length > 0) {
      if (lockCount !== config.locks.length) {
        // ISSUE: Active board lock count deviates from the requested level parameters
        return {
          valid: false,
          error: `Lock Count Mutation: Level configured for ${config.locks.length} locks but engine initialized ${lockCount} locks.`,
        };
      }
      const totalExpectedKeys = config.locks.reduce((acc, curr) => acc + curr.keysRequired, 0);

      // ISSUE: Generated total key count mismatches total targets requested
      if (keyCount !== totalExpectedKeys) {
        return {
          valid: false,
          error: `Key Count Mutation: Expected exactly ${totalExpectedKeys} keys total, but found ${keyCount}.`,
        };
      }
    }

    // ISSUE: Total number of board locks exceeds structural cap of 3
    if (lockCount > 3)
      return {
        valid: false,
        error: `Too many locks injected (${lockCount}). Maximum allowed is 3.`,
      };

    const deckHasLocksOrKeys = deck.some((card) => card.isLock || card.isKey);
    // ISSUE: Game rules breached because a key or lock item dropped out of columns into draw pile
    if (deckHasLocksOrKeys)
      return {
        valid: false,
        error:
          "A lock or key accidentally spilled into the draw pile deck (Must only exist in columns).",
      };

    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      for (let r = 0; r < col.length - 1; r++) {
        if (col[r].isKey && col[r + 1].isKey && col[r].lockColorId === col[r + 1].lockColorId) {
          // ISSUE: Proximity violation where identical color keys are stacked vertically touching
          return {
            valid: false,
            error: `Key Proximity Violation: Multi-stacking identical key trackers "${col[r].lockColorId}" touching sequentially in column ${c} at rows ${r} and ${r + 1}.`,
          };
        }
      }
    }

    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      let consecutiveCategories = 0;
      for (let r = 0; r < col.length; r++) {
        if (col[r].type === "category") {
          consecutiveCategories++;
          if (consecutiveCategories > 2) {
            // ISSUE: Clumping layout breach with 3 or more consecutive category cards in a column
            return {
              valid: false,
              error: `Category Clumping Violation: Column ${c} contains ${consecutiveCategories} category cards stacked directly on top of each other.`,
            };
          }
        } else {
          consecutiveCategories = 0;
        }
      }
    }

    let deckConsecutiveCategories = 0;
    for (let i = 0; i < deck.length; i++) {
      if (deck[i].type === "category") {
        deckConsecutiveCategories++;
        if (deckConsecutiveCategories > 2) {
          // ISSUE: Clumping layout breach with 3 or more consecutive category cards inside the draw deck
          return {
            valid: false,
            error: `Category Clumping Violation: Draw pile deck contains ${deckConsecutiveCategories} category cards touching consecutively in a row.`,
          };
        }
      } else {
        deckConsecutiveCategories = 0;
      }
    }

    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      for (let r = 0; r < col.length; r++) {
        if (col[r].isLock) {
          const depthFromTop = col.length - 1 - r;
          if (depthFromTop > 3)
            // ISSUE: Lock is buried deeper than maximum threshold of 4 slots down from top card
            return {
              valid: false,
              error: `Lock "${col[r].lockColorId}" in column ${c} is buried too deep (${depthFromTop + 1} cards down). Max depth limit is 4.`,
            };
        }
      }
    }

    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      if (col.length > 0 && col[col.length - 1].isKey)
        // ISSUE: Key item positioned on the open top card row, rendering it exposed on frame 1
        return {
          valid: false,
          error: `Key "${col[col.length - 1].lockColorId}" in column ${c} is fully exposed as the top card initially.`,
        };
    }

    return { valid: true };
  }
}

// --- LOGICAL SOLVER ---
class LevelSolver {
  public static isSolvable(
    columns: CardType[][],
    deck: CardType[]
  ): { solvable: boolean; error?: string } {
    const activeLocks = new Map<LockColorId, { lockCol: number; lockRow: number }>();
    const activeKeys = new Map<LockColorId, { keyCol: number; keyRow: number }>();

    for (let c = 0; c < columns.length; c++) {
      for (let r = 0; r < columns[c].length; r++) {
        const card = columns[c][r];
        if (card.isLock && card.lockColorId) {
          activeLocks.set(card.lockColorId, { lockCol: c, lockRow: r });
        }
        if (card.isKey && card.lockColorId) {
          activeKeys.set(card.lockColorId, { keyCol: c, keyRow: r });
        }
      }
    }

    for (const [color, keyPos] of activeKeys.entries()) {
      const lockPos = activeLocks.get(color);
      if (lockPos) {
        if (keyPos.keyCol === lockPos.lockCol && keyPos.keyRow > lockPos.lockRow) {
          // ISSUE: Hard gridlock logic trap with key positioned lower than its matching lock item in the same column
          return {
            solvable: false,
            error: `Hard gridlock: Key "${color}" is trapped directly underneath its own matching lock structure in column ${keyPos.keyCol}.`,
          };
        }
      }
    }

    let blockedColumnsCount = 0;
    for (let c = 0; c < columns.length; c++) {
      if (columns[c].length > 0 && columns[c][0].isLock) {
        blockedColumnsCount++;
      }
    }

    if (blockedColumnsCount === columns.length) {
      // ISSUE: Gridlock where locks simultaneously sit on top positions of every single column layout
      return {
        solvable: false,
        error:
          "Total board lockdown: Every single column has an active lock blocking the playable top spot.",
      };
    }

    const cleanMovableColumns = columns.filter((col) => col.length > 0 && !col[0].isLock);
    if (cleanMovableColumns.length === 0 && deck.length === 0) {
      // ISSUE: Solvability path failed due to zero active playable top cards combined with an empty draw pile
      return {
        solvable: false,
        error:
          "No operational starter paths: Zero non-locked cards are open on columns, and draw deck is entirely empty.",
      };
    }

    return { solvable: true };
  }
}

// --- PROGRESSION CORE PIPELINE ---
export class LevelProgressionPipeline {
  private static COLUMN_PATTERN = [3, 4, 3, 4, 5, 3, 4, 3, 4, 5];

  private categoryHistory: Array<string> = [];

  public buildPipelineConfigs(totalLevelsToGenerate: number): LevelRequestConfig[] {
    const configs: LevelRequestConfig[] = [];

    for (let currentLevel = 1; currentLevel <= totalLevelsToGenerate; currentLevel++) {
      const patternIndex = (currentLevel - 1) % LevelProgressionPipeline.COLUMN_PATTERN.length;
      const calculatedColumns = LevelProgressionPipeline.COLUMN_PATTERN[
        patternIndex
      ] as NumberOfColumns;

      let levelLocks: LockConfig[] | undefined = undefined;
      const isClimaxOfSequence =
        patternIndex === 3 || patternIndex === 4 || patternIndex === 8 || patternIndex === 9;

      if (isClimaxOfSequence && currentLevel > 10) {
        const maxBudget = currentLevel <= 200 ? 2 : currentLevel <= 500 ? 4 : 5;

        let keyBudget = Math.floor(1 + Math.random() * maxBudget);

        const colorPool: LockColorId[] = ["red", "orange", "yellow"];
        const selectedLocks: LockConfig[] = [];

        while (keyBudget > 0 && selectedLocks.length < 3) {
          const lockColor = colorPool[selectedLocks.length];
          const maxKeysForThisLock = Math.min(3, keyBudget);
          const assignedKeys = Math.floor(1 + Math.random() * maxKeysForThisLock);

          selectedLocks.push({
            id: lockColor,
            keysRequired: assignedKeys,
          });
          keyBudget -= assignedKeys;
        }
        levelLocks = selectedLocks;
      }

      let targetTotalMin = 32;
      let targetTotalMax = 40;

      if (calculatedColumns === 4) {
        targetTotalMin = 56;
        targetTotalMax = 72;
      } else if (calculatedColumns === 5) {
        targetTotalMin = 118;
        targetTotalMax = 138;
      }

      const selectedCategories = this.gatherBalancedCategories(targetTotalMin, targetTotalMax);

      configs.push({
        levelNumber: currentLevel,
        numberOfColumns: calculatedColumns,
        numberOfCategories: selectedCategories.length,
        locks: levelLocks,
        selectedCategories: selectedCategories,
      });
    }

    return configs;
  }

  private gatherBalancedCategories(minCards: number, maxCards: number): Array<CategoryDataset> {
    const choices: CategoryDataset[] = [];
    let currentCardAccumulation = 0;
    let usablePool = CATEGORY_POOL.filter((cat) => !this.categoryHistory.includes(cat.name));

    if (usablePool.length < 5) {
      this.categoryHistory = [];
      usablePool = CATEGORY_POOL;
    }

    const randomizedPool = [...usablePool].sort(() => Math.random() - 0.5);

    for (const cat of randomizedPool) {
      const remainingSpace = maxCards - currentCardAccumulation;
      if (remainingSpace < 4) break;

      const shuffledWords = [...cat.words].sort(() => Math.random() - 0.5);
      const maxWordsAllowed = remainingSpace - 1;

      const targetWordCount = Math.min(
        shuffledWords.length,
        Math.max(4, Math.floor(4 + Math.random() * 5)),
        maxWordsAllowed
      );

      const dynamicWords = shuffledWords.slice(0, targetWordCount);
      const costForThisCategory = 1 + dynamicWords.length;

      choices.push({
        name: cat.name,
        words: dynamicWords,
      });

      currentCardAccumulation += costForThisCategory;
      this.categoryHistory.push(cat.name);

      if (this.categoryHistory.length > 5) this.categoryHistory.shift();
      if (currentCardAccumulation >= minCards) break;
    }

    return choices;
  }
}

// --- ENGINE CORE ---
export class LevelGeneratorEngine {
  public generateBatch(configs: LevelRequestConfig[]): string {
    const finalLevelsOutput: LevelData[] = [];

    let totalStructuralFailures = 0;
    let totalGridlockFailures = 0;

    for (const config of configs) {
      const selectedCategories = config.selectedCategories || [];

      const easyMode = this.buildModeLayout(config, selectedCategories, "easy");
      const mediumMode = this.buildModeLayout(config, selectedCategories, "medium");
      const hardMode = this.buildModeLayout(config, selectedCategories, "hard");

      [easyMode, mediumMode, hardMode].forEach((mode) => {
        mode.validationErrors.forEach((err) => {
          if (err.includes("Structural Rule Breached")) totalStructuralFailures++;
          if (err.includes("Board State Gridlocked")) totalGridlockFailures++;
        });
      });

      const unifiedLevelEntry: LevelData = {
        levelNumber: config.levelNumber,
        numberOfColumns: config.numberOfColumns,
        numberOfCategories: config.numberOfCategories,
        categories: selectedCategories.map((c) => c.name),
        modes: {
          easy: easyMode,
          medium: mediumMode,
          hard: hardMode,
        },
      };

      finalLevelsOutput.push(unifiedLevelEntry);
    }

    const totalFailures = totalStructuralFailures + totalGridlockFailures;
    const totalModesRequested = configs.length * 3;

    const completeOutputJson = {
      meta: {
        generatedAt: new Date().toISOString(),
        totalRequestedLevels: configs.length,
        successfullyValidated: totalModesRequested - totalFailures,
        failedValidation: totalFailures,
        breakdown: {
          structuralFailures: totalStructuralFailures,
          gridlockFailures: totalGridlockFailures,
        },
      },
      levels: finalLevelsOutput,
    };

    return JSON.stringify(completeOutputJson);
  }

  private buildModeLayout(
    config: LevelRequestConfig,
    selectedCategories: Array<CategoryDataset>,
    difficulty: LevelDifficulty
  ): ModeLayout {
    const issues: Array<string> = [];
    let layout: { columns: CardType[][]; deck: CardType[]; maxMoves: number } | null = null;

    const errorPrefix = `[LVL ${config.levelNumber} - ${difficulty.toUpperCase()}]`;
    try {
      layout = LayoutGenerator.generateRawLayout(config, selectedCategories, difficulty);

      const structuralCheck = LevelValidator.validateStructure(layout.columns, layout.deck, config);
      if (!structuralCheck.valid) {
        issues.push(`${errorPrefix} Structural Rule Breached -> ${structuralCheck.error}`);
      }

      const solverCheck = LevelSolver.isSolvable(layout.columns, layout.deck);
      if (!solverCheck.solvable) {
        issues.push(`${errorPrefix} Board State Gridlocked -> ${solverCheck.error}`);
      }
    } catch (error: any) {
      issues.push(`${errorPrefix} Critical generation exception: ${error.message}`);
    }

    return {
      columns: layout ? layout.columns : [],
      deck: layout ? layout.deck : [],
      maxMoves: layout ? layout.maxMoves : 0,
      status: issues.length === 0 ? "valid" : "failed_validation",
      validationErrors: issues,
    };
  }
}
