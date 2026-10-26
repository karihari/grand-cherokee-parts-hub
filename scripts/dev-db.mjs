// Runs `vite dev` with the secrets from .env.local and restarts it whenever
// .env.local is saved, so a changed password or DATABASE_URL takes effect at once.
// Usage: npm run dev:db [-- --port 5173]
import { spawn } from "node:child_process";
import { existsSync, watch } from "node:fs";

const ENV_FILE = ".env.local";
const args = process.argv.slice(2);
let child;
let restartTimer;
let restarting = false;

function start() {
  const envArgs = existsSync(ENV_FILE) ? [`--env-file=${ENV_FILE}`] : [];
  child = spawn(process.execPath, [...envArgs, "node_modules/vite/bin/vite.js", "dev", ...args], {
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    // Exit with Vite unless we stopped it ourselves to restart.
    if (restarting) {
      restarting = false;
      start();
    } else {
      process.exit(code ?? 0);
    }
  });
}

function restart() {
  console.log(`\n${ENV_FILE} changed, restarting…\n`);
  restarting = true;
  child.kill("SIGTERM");
}

if (existsSync(ENV_FILE)) {
  watch(ENV_FILE, () => {
    // Editors often write a file in several steps; wait for them to finish.
    clearTimeout(restartTimer);
    restartTimer = setTimeout(restart, 300);
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
    process.exit(0);
  });
}

start();
