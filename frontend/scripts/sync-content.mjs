import { existsSync, copyFileSync } from "node:fs";
const files = ["projects", "tags"];
for (const name of files) {
  const source = new URL(`../../backend/data/${name}.json`, import.meta.url);
  if (existsSync(source))
    copyFileSync(source, new URL(`../src/data/${name}.json`, import.meta.url));
}
