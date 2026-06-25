import lunar from "lunar-javascript";

const { Solar } = lunar;

const BRANCH_TO_TIME = {
  子: "子时",
  丑: "丑时",
  寅: "寅时",
  卯: "卯时",
  辰: "辰时",
  巳: "巳时",
  午: "午时",
  未: "未时",
  申: "申时",
  酉: "酉时",
  戌: "戌时",
  亥: "亥时",
};

const ELEMENT_KEYS = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
};

function splitPillar(value) {
  const [stem, branch] = Array.from(value);
  return { stem, branch };
}

function splitList(value) {
  if (!value) {
    return [];
  }
  return String(value).split(",").filter(Boolean);
}

function countElements(values) {
  const counts = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  values.join("").split("").forEach((element) => {
    const key = ELEMENT_KEYS[element];
    if (key) {
      counts[key] += 1;
    }
  });

  return counts;
}

function parseDate(date) {
  const parts = String(date).split("-").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error("birthDate must use YYYY-MM-DD");
  }
  return parts;
}

function parseTime(time) {
  const source = time || "12:00";
  const parts = String(source).split(":").map((part) => Number.parseInt(part, 10));
  if (parts.length < 2 || parts.some((part) => Number.isNaN(part))) {
    throw new Error("birthTime must use HH:mm");
  }
  return [parts[0], parts[1], parts[2] || 0];
}

function buildPillar(value, tenGod, hiddenStems, wuxing, extra = {}) {
  const { stem, branch } = splitPillar(value);
  return {
    value,
    stem,
    branch,
    ten_god: tenGod,
    hidden_stems: splitList(hiddenStems),
    wuxing,
    ...extra,
  };
}

export function calculateBazi(input) {
  const missingBirthTime = !input.birthTime;
  const [year, month, day] = parseDate(input.birthDate);
  const [hour, minute, second] = parseTime(input.birthTime);
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, second);
  const lunarDate = solar.getLunar();
  const eightChar = lunarDate.getEightChar();
  const birthTimeBranch = BRANCH_TO_TIME[eightChar.getTimeZhi()] || "";
  const wuxing = [
    eightChar.getYearWuXing(),
    eightChar.getMonthWuXing(),
    eightChar.getDayWuXing(),
    eightChar.getTimeWuXing(),
  ];

  return {
    input: {
      calendar_type: input.calendarType || "solar",
      gender: input.gender || "",
      birth_date: input.birthDate,
      birth_time: input.birthTime || "12:00",
      birth_time_branch: birthTimeBranch,
      birth_place: input.birthPlace || "",
      timezone: input.timezone || "Asia/Shanghai",
      current_date: input.currentDate || new Date().toISOString().slice(0, 10),
    },
    pillars: {
      year: buildPillar(
        eightChar.getYear(),
        eightChar.getYearShiShenGan(),
        eightChar.getYearHideGan(),
        eightChar.getYearWuXing(),
      ),
      month: buildPillar(
        eightChar.getMonth(),
        eightChar.getMonthShiShenGan(),
        eightChar.getMonthHideGan(),
        eightChar.getMonthWuXing(),
      ),
      day: buildPillar(
        eightChar.getDay(),
        eightChar.getDayShiShenGan(),
        eightChar.getDayHideGan(),
        eightChar.getDayWuXing(),
        { day_master: eightChar.getDayGan() },
      ),
      hour: buildPillar(
        eightChar.getTime(),
        eightChar.getTimeShiShenGan(),
        eightChar.getTimeHideGan(),
        eightChar.getTimeWuXing(),
      ),
    },
    elements: countElements(wuxing),
    current_cycle: {
      dayun: "",
      liunian: lunarDate.getYearInGanZhiExact(),
      liuyue: lunarDate.getMonthInGanZhiExact(),
    },
    next_12_months: [],
    quality_flags: {
      missing_birth_time: missingBirthTime,
      approximate_time: missingBirthTime,
      timezone_adjusted: false,
      needs_advisor_review: true,
    },
  };
}
