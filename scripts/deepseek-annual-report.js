import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateAnnualReport } from "../src/report/generateAnnualReport.js";

function usage() {
  return [
    "Usage:",
    "  DEEPSEEK_API_KEY=<your-deepseek-api-key> npm run deepseek:annual -- <paipan-json-path> [output-md-path] [--lang zh-CN|zh-TW|en]",
    "",
    "Example:",
    "  npm run deepseek:annual -- dist/samples/paipan-19880114-1125.json --lang en",
  ].join("\n");
}

function defaultOutputPath(sourcePath) {
  const baseName = path.basename(sourcePath, ".json").replace(/^paipan-/, "");
  return path.join("dist", "reports", `deepseek-annual-report-${baseName}.md`);
}

function parseArgs(args) {
  const positional = [];
  let language = process.env.REPORT_LANGUAGE || "zh-CN";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--lang") {
      language = args[index + 1] || language;
      index += 1;
    } else {
      positional.push(arg);
    }
  }

  return {
    sourcePath: positional[0],
    requestedOutputPath: positional[1],
    language,
  };
}

const { sourcePath, requestedOutputPath, language } = parseArgs(process.argv.slice(2));

if (!sourcePath) {
  console.error(usage());
  process.exit(1);
}

const outputPath = requestedOutputPath || defaultOutputPath(sourcePath);
const paipanResult = JSON.parse(await readFile(sourcePath, "utf8"));
const result = await generateAnnualReport({ paipanResult, language });
const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const header = [
  "---",
  `source: ${sourcePath}`,
  `model: ${model}`,
  `language: ${language}`,
  `generated_at: ${new Date().toISOString()}`,
  "---",
  "",
].join("\n");

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${header}${result.content.trim()}\n`, "utf8");

console.log(outputPath);
