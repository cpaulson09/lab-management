import { fileURLToPath } from "node:url";

/** Absolute path to the generated migrations, so any working directory works. */
export const MIGRATIONS_FOLDER = fileURLToPath(
  new URL("./migrations", import.meta.url),
);
