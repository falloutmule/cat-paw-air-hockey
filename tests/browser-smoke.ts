import { spawnSync } from "node:child_process";

const pnpmEntry = process.env.npm_execpath;
const usesNodeEntry = process.platform === "win32" && pnpmEntry !== undefined;
const executable = usesNodeEntry ? process.execPath : "pnpm";
const arguments_ = usesNodeEntry
  ? [pnpmEntry, "--workspace-root", "sfhs", "pack", "--json", "--project", process.cwd()]
  : ["--workspace-root", "sfhs", "pack", "--json", "--project", process.cwd()];
const packed = spawnSync(executable, arguments_, { cwd: process.cwd(), env: process.env, stdio: "inherit" });
if (packed.error !== undefined) throw packed.error;
if (packed.status !== 0) process.exit(packed.status ?? 1);

await import("./canonical-browser.ts");
