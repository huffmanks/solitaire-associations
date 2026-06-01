import { type Config } from "prettier";

const config: Config = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: false,
  bracketSameLine: true,
  singleAttributePerLine: true,
  trailingComma: "es5",
  importOrder: [
    "^@?(react|expo)(-[a-zA-Z0-9-]+)?(/.*)?$",
    "<THIRD_PARTY_MODULES>",
    "^@/(?!components)(.*)$",
    "^@/components/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};

export default config;
