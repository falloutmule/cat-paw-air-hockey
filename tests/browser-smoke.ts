import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const browserRunnerPackage = realpathSync(resolve(process.cwd(), "node_modules", "@sfhs", "browser-runner", "package.json"));
const sfhsRoot = resolve(dirname(browserRunnerPackage), "..", "..");
const cliEntry = join(sfhsRoot, "packages", "cli", "src", "main.ts");
const packed = spawnSync(process.execPath, [cliEntry, "pack", "--json", "--project", process.cwd()], {
  cwd: process.cwd(), env: process.env, stdio: "inherit"
});
if (packed.error !== undefined) throw packed.error;
if (packed.status !== 0) process.exit(packed.status ?? 1);

await import("./canonical-browser.ts");
