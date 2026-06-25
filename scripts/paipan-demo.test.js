import { existsSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("paipan-demo CLI", () => {
  it("writes a normalized sample JSON file", async () => {
    const outputPath = "dist/samples/paipan-19960818-1200.json";
    if (existsSync(outputPath)) {
      rmSync(outputPath);
    }

    await execFileAsync("node", [
      "scripts/paipan-demo.js",
      "1996-08-18",
      "12:00",
      "female",
      "深圳",
    ]);

    const json = JSON.parse(await readFile(outputPath, "utf8"));
    expect(json.input.birth_date).toBe("1996-08-18");
    expect(json.input.birth_time_branch).toBe("午时");
    expect(json.pillars.year.value).toBe("丙子");
    expect(json.pillars.month.value).toBe("丙申");
    expect(json.pillars.day.value).toBe("丁亥");
    expect(json.pillars.hour.value).toBe("丙午");
  });
});
