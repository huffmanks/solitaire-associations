import LEVEL_MANIFEST_JSON from "@/gen/levels-manifest.json";
import { theme } from "@/lib/theme";
import {
  LayoutRect,
  LevelDataResponse,
  LevelDifficulty,
  LockColorId,
  MoveCardTarget,
  StaticLevelPack,
  TargetCandidate,
} from "@/types";

const LEVEL_MANIFEST = LEVEL_MANIFEST_JSON as { meta: any; levels: StaticLevelPack[] };

export function loadLevelSession({ currentLevel }: { currentLevel: number }): LevelDataResponse {
  if (!LEVEL_MANIFEST || LEVEL_MANIFEST.levels.length === 0) {
    throw new Error("Level manifest is empty or undefined. Cannot load levels.");
  }

  const totalLevels = LEVEL_MANIFEST.levels.length;

  let matchedLevel = LEVEL_MANIFEST.levels.find((config) => config.levelNumber === currentLevel);
  const isCyclicFallback = !matchedLevel;

  if (!matchedLevel) {
    const cyclicIndex = currentLevel > 0 ? (currentLevel - 1) % totalLevels : 0;
    matchedLevel = LEVEL_MANIFEST.levels[cyclicIndex];
  }

  const maxUniqueLevelNumber = Math.max(...LEVEL_MANIFEST.levels.map((l) => l.levelNumber));
  const hasMoreLevels = currentLevel < maxUniqueLevelNumber;
  const nextLevelNumber = currentLevel + 1;

  return {
    levelPack: {
      ...matchedLevel,
      levelNumber: currentLevel,
    },
    metadata: {
      totalLevels,
      isCyclicFallback,
      maxUniqueLevelNumber,
      nextLevelNumber,
      hasMoreLevels,
    },
  };
}

export function getLockKeyCardColors({ lockColorId }: { lockColorId?: LockColorId }) {
  return {
    foregroundColor: lockColorId === "yellow" ? theme.colors.black : theme.colors.foreground,
    lightColor:
      lockColorId === "red"
        ? theme.colors.redLight
        : lockColorId === "orange"
          ? theme.colors.orangeLight
          : theme.colors.yellowLight,
    darkColor:
      lockColorId === "red"
        ? theme.colors.redDark
        : lockColorId === "orange"
          ? theme.colors.orangeDark
          : theme.colors.yellowDark,
    accentColor:
      lockColorId === "red"
        ? theme.colors.redButtonRim
        : lockColorId === "orange"
          ? theme.colors.orangeButtonRim
          : theme.colors.yellowButtonRim,
    borderColor:
      lockColorId === "red"
        ? theme.colors.redBorder
        : lockColorId === "orange"
          ? theme.colors.orangeBorder
          : theme.colors.yellowBorder,
  };
}

export function getDifficultyColors({
  active,
  diff,
}: {
  active: LevelDifficulty;
  diff: LevelDifficulty;
}) {
  return {
    backgroundColor: active === diff ? theme.colors.blueLight : theme.colors.black,
    borderColor: active === diff ? theme.colors.blueButtonRim : theme.colors.muted,
  };
}

export function isPointInside(
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  pointX: number,
  pointY: number,
  padding = 0
) {
  return (
    pointX >= rect.x - padding &&
    pointX <= rect.x + rect.width + padding &&
    pointY >= rect.y - padding &&
    pointY <= rect.y + rect.height + padding
  );
}

function scoreTarget(rect: LayoutRect, x: number, y: number, type: "foundation" | "tableau") {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  const dx = x - centerX;
  const dy = y - centerY;

  const distance = Math.hypot(dx, dy);
  const inside = isPointInside(rect, x, y, type === "foundation" ? 36 : 18);

  let score = 0;
  if (inside) {
    score += 1000;
  }

  score -= distance;
  if (type === "foundation") {
    score += 140;
  }

  score -= Math.abs(dx) * 0.35;
  return score;
}

export function resolveDropTarget(
  absoluteX: number,
  absoluteY: number,
  foundations: Array<LayoutRect | null>,
  tableaus: Array<LayoutRect | null>
): MoveCardTarget | null {
  const candidates: Array<TargetCandidate> = [];

  foundations.forEach((rect, index) => {
    if (!rect) return;

    candidates.push({
      target: {
        type: "foundation",
        index,
      },
      score: scoreTarget(rect, absoluteX, absoluteY, "foundation"),
    });
  });

  tableaus.forEach((rect, index) => {
    if (!rect) return;

    candidates.push({
      target: {
        type: "tableau",
        index,
      },
      score: scoreTarget(rect, absoluteX, absoluteY, "tableau"),
    });
  });

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  if (!best || best.score < 0) {
    return null;
  }

  return best.target;
}
