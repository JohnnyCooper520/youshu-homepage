import { spawn } from "node:child_process";

const processes = [];
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function start(name, args, env = {}) {
  const child = spawn(npmCommand, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...env,
    },
  });

  processes.push(child);
  child.on("exit", (code, signal) => {
    if (signal || code) {
      stopAll(child);
      process.exit(code || 0);
    }
  });

  return child;
}

function stopAll(except) {
  for (const child of processes) {
    if (child !== except && !child.killed) {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});

console.log("Starting Youshu local mock mode: frontend 5173 + mock API 8787");
start("api", ["run", "api:dev"], { MOCK_REPORTS: "true" });
start("web", ["run", "dev"]);
