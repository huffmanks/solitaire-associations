import type { LockColorId, NumberOfColumns } from "../types.ts";

export type LockConfig = {
  id: LockColorId;
  keysRequired: number;
};

export type LevelRequestConfig = {
  levelNumber: number;
  numberOfColumns: NumberOfColumns;
  numberOfCategories: number;
  locks?: LockConfig[];
  selectedCategories?: CategoryDataset[];
};

export type DynamicCategory = {
  name: string;
  words: string[];
};

export type CategoryDataset = {
  name: string;
  words: string[];
};
