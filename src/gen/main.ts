import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { LevelGeneratorEngine, type LevelRequestConfig } from "./level-generator.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const levelsToBuild: LevelRequestConfig[] = [
  {
    levelNumber: 1,
    numberOfColumns: 3,
    numberOfCategories: 5,
  },
  {
    levelNumber: 2,
    numberOfColumns: 4,
    numberOfCategories: 6,
  },
  {
    levelNumber: 3,
    numberOfColumns: 5,
    numberOfCategories: 7,
  },
  {
    levelNumber: 4,
    numberOfColumns: 3,
    numberOfCategories: 5,
  },
  {
    levelNumber: 5,
    numberOfColumns: 4,
    numberOfCategories: 6,
    locks: [{ id: "red", keysRequired: 3 }],
  },
  {
    levelNumber: 6,
    numberOfColumns: 5,
    numberOfCategories: 7,
    locks: [
      { id: "red", keysRequired: 2 },
      { id: "orange", keysRequired: 1 },
      { id: "yellow", keysRequired: 1 },
    ],
  },
];

function main() {
  const generator = new LevelGeneratorEngine();

  const jsonPayload = generator.generateBatch(levelsToBuild);
  const writePath = path.join(__dirname, "levels-manifest.json");
  fs.writeFileSync(writePath, jsonPayload, "utf-8");
}

main();
