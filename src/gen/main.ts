import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { LevelGeneratorEngine, LevelProgressionPipeline } from "./level-generator.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
  const LEVELS_TO_BUILD = 1000;

  const factory = new LevelProgressionPipeline();
  const engine = new LevelGeneratorEngine();

  console.log(`Generating ${LEVELS_TO_BUILD} structural balanced layouts configurations...`);
  const levelConfigs = factory.buildPipelineConfigs(LEVELS_TO_BUILD);

  console.log("Executing generator pipeline engine sweeps...");
  const jsonPayload = engine.generateBatch(levelConfigs);

  const writePath = path.join(__dirname, "levels-manifest.json");
  fs.writeFileSync(writePath, jsonPayload, "utf-8");
}

main();
