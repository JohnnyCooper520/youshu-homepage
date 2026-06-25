import { existsSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("deepseek-smoke CLI", () => {
  it("writes dry-run prompts for bazi, annual, and question reports", async () => {
    const outputDir = "dist/reports/deepseek-smoke-19880114-1125";
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true, force: true });
    }

    const { stdout } = await execFileAsync("node", [
      "scripts/deepseek-smoke.js",
      "1988-01-14",
      "11:25",
      "male",
      "长春",
      "--lang",
      "en",
      "--focus",
      "Career",
      "--question",
      "Should I change jobs?",
      "--dry-run",
    ]);

    expect(stdout).toContain(`${outputDir}/bazi-prompt.json`);
    expect(stdout).toContain(`${outputDir}/annual-prompt.json`);
    expect(stdout).toContain(`${outputDir}/question-prompt.json`);

    const bazi = JSON.parse(await readFile(`${outputDir}/bazi-prompt.json`, "utf8"));
    const annual = JSON.parse(await readFile(`${outputDir}/annual-prompt.json`, "utf8"));
    const question = JSON.parse(await readFile(`${outputDir}/question-prompt.json`, "utf8"));

    expect(bazi.messages[1].content).toContain("命盘报告");
    expect(annual.messages[1].content).toContain("今年运势解读");
    expect(question.messages[1].content).toContain("Should I change jobs?");
    expect(question.language).toBe("en");
  });
});
