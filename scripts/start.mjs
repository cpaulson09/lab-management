// One command to run the app: `pnpm start`.
// Each step is skipped when it is already done.
//   1. Install packages   (skipped when node_modules matches pnpm-lock.yaml)
//   2. Migrate database   (only applies migrations that are not applied yet)
//   3. Seed database      (skipped when the database already has data)
//   4. Start API + web    (pnpm dev)
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function run(label, args) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync("pnpm", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`\n✖ ${label} failed`);
    process.exit(result.status ?? 1);
  }
}

function installIsCurrent() {
  const installed = "node_modules/.pnpm/lock.yaml";
  if (!existsSync(installed)) return false;
  return (
    readFileSync(installed, "utf8") === readFileSync("pnpm-lock.yaml", "utf8")
  );
}

if (installIsCurrent()) {
  console.log("✔ Packages already installed");
} else {
  run("Installing packages", ["install", "--frozen-lockfile"]);
}

run("Migrating database", ["db:migrate"]);
run("Seeding database (only if empty)", [
  "--filter",
  "@lab/api",
  "db:seed:if-empty",
]);
run("Starting API (http://localhost:3000) and web (http://localhost:5173)", [
  "dev",
]);
