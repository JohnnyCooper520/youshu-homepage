import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { calculateBazi } from "../src/paipan/calculateBazi.js";
import { generateReport } from "../src/report/generateReport.js";
import { buildReportMessages } from "../src/report/reportPrompts.js";

const REPORT_TYPES = ["bazi", "annual", "question"];

function usage() {
  return [
    "Usage:",
    "  DEEPSEEK_API_KEY=<your-deepseek-api-key> npm run deepseek:smoke -- <YYYY-MM-DD> <HH:mm> <gender> <birthPlace> [--lang zh-CN|zh-TW|en] [--focus text] [--question text] [--dry-run]",
    "",
    "Example:",
    "  npm run deepseek:smoke -- 1988-01-14 11:25 male 长春 --question 接下来半年适合换工作吗？ --dry-run",
  ].join("\n");
}

function parseArgs(args) {
  const positional = [];
  const options = {
    language: process.env.REPORT_LANGUAGE || "zh-CN",
    focus: "事业机会",
    question: "接下来半年适合换工作吗？",
    dryRun: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--lang") {
      options.language = args[index + 1] || options.language;
      index += 1;
    } else if (arg === "--focus") {
      options.focus = args[index + 1] || options.focus;
      index += 1;
    } else if (arg === "--question") {
      options.question = args[index + 1] || options.question;
      index += 1;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else {
      positional.push(arg);
    }
  }

  return {
    birthDate: positional[0],
    birthTime: positional[1],
    gender: positional[2] || "",
    birthPlace: positional[3] || "",
    ...options,
  };
}

function outputDirectory({ birthDate, birthTime }) {
  const stamp = `${birthDate.replaceAll("-", "")}-${birthTime.replace(":", "")}`;
  return path.join("dist", "reports", `deepseek-smoke-${stamp}`);
}

function markdownHeader({ type, language }) {
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  return [
    "---",
    `type: ${type}`,
    `model: ${model}`,
    `language: ${language}`,
    `generated_at: ${new Date().toISOString()}`,
    "---",
    "",
  ].join("\n");
}

async function writeDryRunPrompt({ outputDir, type, paipan, language, question, focus }) {
  const messages = buildReportMessages(type, paipan, { language, question, focus });
  const outputPath = path.join(outputDir, `${type}-prompt.json`);
  await writeFile(outputPath, `${JSON.stringify({ type, language, messages }, null, 2)}\n`, "utf8");
  return outputPath;
}

async function writeRealReport({ outputDir, type, paipan, language, question, focus }) {
  const result = await generateReport({ type, paipanResult: paipan, language, question, focus });
  const outputPath = path.join(outputDir, `${type}.md`);
  await writeFile(outputPath, `${markdownHeader({ type, language })}${result.content.trim()}\n`, "utf8");
  return outputPath;
}

const args = parseArgs(process.argv.slice(2));

if (!args.birthDate || !args.birthTime) {
  console.error(usage());
  process.exit(1);
}

const paipan = calculateBazi({
  calendarType: "solar",
  birthDate: args.birthDate,
  birthTime: args.birthTime,
  gender: args.gender,
  birthPlace: args.birthPlace,
  currentDate: new Date().toISOString().slice(0, 10),
});
const outputDir = outputDirectory(args);
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "paipan.json"), `${JSON.stringify(paipan, null, 2)}\n`, "utf8");

const outputs = [];
for (const type of REPORT_TYPES) {
  const outputPath = args.dryRun
    ? await writeDryRunPrompt({ outputDir, type, paipan, ...args })
    : await writeRealReport({ outputDir, type, paipan, ...args });
  outputs.push(outputPath);
}

console.log(outputs.join("\n"));
