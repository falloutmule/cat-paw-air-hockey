import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

try {
  const browserRunnerPackage = realpathSync(resolve(process.cwd(), "node_modules", "@sfhs", "browser-runner", "package.json"));
  const sfhsRoot = resolve(dirname(browserRunnerPackage), "..", "..");
  const cliEntry = join(sfhsRoot, "packages", "cli", "src", "main.ts");
  const packed = spawnSync(process.execPath, [cliEntry, "pack", "--json", "--project", process.cwd()], {
    cwd: process.cwd(), env: process.env, stdio: "inherit"
  });
  if (packed.error !== undefined) throw packed.error;
  if (packed.status !== 0) throw new Error(`Pinned SFHS pack failed with exit code ${packed.status ?? -1}.`);

  await import("./canonical-browser.ts");
} catch (error) {
  const reportDirectory = resolve(process.cwd(), "test-results");
  await mkdir(reportDirectory, { recursive: true });
  await writeFile(join(reportDirectory, "browser-smoke-error.txt"), `${error instanceof Error ? error.stack ?? error.message : String(error)}\n`, "utf8");
  throw error;
}
