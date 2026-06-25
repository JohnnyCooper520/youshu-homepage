import { mkdir, writeFile } from "node:fs/promises";
import { calculateBazi } from "../src/paipan/calculateBazi.js";

function usage() {
  return [
    "Usage:",
    "  node scripts/paipan-demo.js <YYYY-MM-DD> <HH:mm> <gender> <birthPlace>",
    "",
    "Example:",
    "  node scripts/paipan-demo.js 1996-08-18 12:00 female 深圳",
  ].join("\n");
}

function outputName(date, time) {
  return `paipan-${date.replaceAll("-", "")}-${time.replace(":", "")}.json`;
}

const [birthDate, birthTime, gender = "", birthPlace = ""] = process.argv.slice(2);

if (!birthDate || !birthTime) {
  console.error(usage());
  process.exit(1);
}

const result = calculateBazi({
  calendarType: "solar",
  birthDate,
  birthTime,
  gender,
  birthPlace,
  currentDate: new Date().toISOString().slice(0, 10),
});

await mkdir("dist/samples", { recursive: true });

const outputPath = `dist/samples/${outputName(birthDate, birthTime)}`;
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

console.log(outputPath);
