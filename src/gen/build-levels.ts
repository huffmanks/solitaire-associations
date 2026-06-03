import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import type { PuzzleDataPool, RawLevelConfig, StaticLevelPack } from "../types.ts";
import { LevelPipeline } from "./level-pipeline.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const puzzleDataPool: PuzzleDataPool = {
  Animals: ["Sheep", "Pig", "Goat", "Horse", "Monkey", "Bear", "Lion", "Tiger", "Wolf", "Deer"],
  Cinema: ["Western", "Drama", "Comedy", "Horror", "Popcorn", "Ticket", "Action", "SciFi", "Oscar"],
  Calendar: ["Day", "Week", "Month", "Year", "Monday", "Urgency", "Hour", "Minute", "Second"],
  Burger: ["Beef", "Bun", "Sauce", "Cheese", "Lettuce", "Tomato", "Pickle", "Bacon"],
  Book: ["Page", "Paper", "Cover", "Author", "Novel", "Chapter", "Index", "Library"],
  Landmass: [
    "Asia",
    "Africa",
    "Europe",
    "America",
    "Oceania",
    "Antarctica",
    "Greenland",
    "Iceland",
  ],
  One: ["10", "11", "12", "13", "14", "15", "16", "17"],
  Two: ["20", "21", "22", "23", "24", "25", "26", "27"],
  Three: ["30", "31", "32", "33", "34", "35", "36", "37"],
  Space: ["Mars", "Venus", "Earth", "Pluto", "Moon", "Sun", "Star", "Rocket"],
};

function compileLevels() {
  const finalOutputManifest: StaticLevelPack[] = [];

  const rawDefinitions: RawLevelConfig[] = [
    {
      levelNumber: 1,
      numberOfColumns: 4,
      categories: [
        "Animals",
        "Cinema",
        "Calendar",
        "Burger",
        "Book",
        "Landmass",
        "One",
        "Two",
        "Space",
      ],
    },
    {
      levelNumber: 2,
      numberOfColumns: 3,
      categories: ["One", "Two", "Three", "Burger", "Book", "Landmass"],
    },
    {
      levelNumber: 3,
      numberOfColumns: 5,
      categories: [
        "Animals",
        "Cinema",
        "Calendar",
        "Burger",
        "Book",
        "Landmass",
        "One",
        "Two",
        "Three",
        "Space",
      ],
      locks: [
        { id: "red", keysRequired: 3 },
        { id: "orange", keysRequired: 2 },
        { id: "yellow", keysRequired: 1 },
      ],
    },
  ];

  rawDefinitions.forEach((def) => {
    console.log(`Baking guaranteed winnable variations for Level ${def.levelNumber}...`);

    const pack = LevelPipeline.buildLevelPack(def, { ...puzzleDataPool });
    finalOutputManifest.push(pack);
  });

  const writePath = path.join(__dirname, "levels-manifest.json");
  fs.writeFileSync(writePath, JSON.stringify(finalOutputManifest, null, 2), "utf-8");
  console.log(`Success! Pre-baked level data matrix saved at: ${writePath}`);
}

compileLevels();
