import lunar from "lunar-javascript";

const { Lunar, LunarUtil, Solar } = lunar;

const CALCULATION_VERSION = "bazi-v2.0.0";
const DEFAULT_TIMEZONE = "Asia/Shanghai";
const CHINA_STANDARD_MERIDIAN = 120;
const SOLAR_TERM_REVIEW_WINDOW_MINUTES = 24 * 60;

const ZI_HOUR_CONVENTIONS = {
  ZI_CHU: "zi-chu",
  MIDNIGHT: "midnight",
};

const CITY_LONGITUDES = {
  北京: 116.4074,
  上海: 121.4737,
  广州: 113.2644,
  深圳: 114.0579,
  杭州: 120.1551,
  长春: 125.3235,
  天津: 117.2008,
  重庆: 106.5516,
  成都: 104.0665,
  武汉: 114.3054,
  西安: 108.9398,
  南京: 118.7969,
  沈阳: 123.4315,
  哈尔滨: 126.6425,
  青岛: 120.3826,
  厦门: 118.0894,
  福州: 119.2965,
  济南: 117.1201,
  郑州: 113.6254,
  长沙: 112.9388,
  昆明: 102.8329,
  南宁: 108.3669,
  贵阳: 106.6302,
  海口: 110.1983,
  乌鲁木齐: 87.6168,
  拉萨: 91.1409,
};

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

function parseDate(date, field = "birthDate") {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
  if (!match) {
    throw new Error(`${field} must use YYYY-MM-DD`);
  }

  return match.slice(1).map((part) => Number.parseInt(part, 10));
}

function parseTime(time) {
  const source = time || "12:00";
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(source));
  if (!match) {
    throw new Error("birthTime must use HH:mm");
  }

  const values = match.slice(1).map((part) => Number.parseInt(part || "0", 10));
  const [hour, minute, second] = values;
  if (hour > 23 || minute > 59 || second > 59) {
    throw new Error("birthTime is outside the valid clock range");
  }
  return values;
}

function validateSolarDate(year, month, day, field = "birthDate") {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new Error(`${field} is not a valid solar date`);
  }
}

function formatDateTime(year, month, day, hour, minute, second = 0) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

function solarToParts(solar) {
  return [
    solar.getYear(),
    solar.getMonth(),
    solar.getDay(),
    solar.getHour(),
    solar.getMinute(),
    solar.getSecond(),
  ];
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

function getZiHourConvention(input) {
  return input.ziHourConvention === ZI_HOUR_CONVENTIONS.MIDNIGHT
    ? ZI_HOUR_CONVENTIONS.MIDNIGHT
    : ZI_HOUR_CONVENTIONS.ZI_CHU;
}

function getSectForConvention(convention) {
  return convention === ZI_HOUR_CONVENTIONS.MIDNIGHT ? 2 : 1;
}

function getHourPillar(eightChar, lunarDate) {
  const timeZhi = lunarDate.getTimeZhi();
  const timeZhiIndex = lunarDate.getTimeZhiIndex();
  const timeGanIndex = (eightChar.getDayGanIndex() % 5 * 2 + timeZhiIndex) % 10;
  const timeGan = LunarUtil.GAN[timeGanIndex + 1];
  const value = `${timeGan}${timeZhi}`;

  return buildPillar(
    value,
    LunarUtil.SHI_SHEN[`${eightChar.getDayGan()}${timeGan}`],
    LunarUtil.ZHI_HIDE_GAN[timeZhi],
    `${LunarUtil.WU_XING_GAN[timeGan]}${LunarUtil.WU_XING_ZHI[timeZhi]}`,
  );
}

function calculatePillars(lunarDate, convention) {
  const eightChar = lunarDate.getEightChar();
  eightChar.setSect(getSectForConvention(convention));

  return {
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
    hour: getHourPillar(eightChar, lunarDate),
  };
}

function resolveBirthSolar(input, dateParts, timeParts) {
  const [year, month, day] = dateParts;
  const [hour, minute, second] = timeParts;
  const calendarType = input.calendarType === "lunar" ? "lunar" : "solar";

  if (calendarType === "lunar") {
    const lunarMonth = input.isLeapMonth ? -month : month;
    try {
      const lunarDate = Lunar.fromYmdHms(year, lunarMonth, day, hour, minute, second);
      const resolvedSolar = lunarDate.getSolar();
      const resolvedLunar = resolvedSolar.getLunar();
      if (
        resolvedLunar.getYear() !== year
        || resolvedLunar.getMonth() !== lunarMonth
        || resolvedLunar.getDay() !== day
      ) {
        throw new Error("invalid lunar date");
      }
      return resolvedSolar;
    } catch {
      throw new Error("birthDate is not a valid lunar date");
    }
  }

  validateSolarDate(year, month, day);
  return Solar.fromYmdHms(year, month, day, hour, minute, second);
}

function resolveLongitude(input) {
  if (Number.isFinite(Number(input.birthLongitude))) {
    const longitude = Number(input.birthLongitude);
    if (longitude < -180 || longitude > 180) {
      throw new Error("birthLongitude must be between -180 and 180");
    }
    return { longitude, source: "explicit" };
  }

  const place = String(input.birthPlace || "");
  const city = Object.keys(CITY_LONGITUDES).find((name) => place.includes(name));
  if (!city) {
    return { longitude: null, source: "unresolved" };
  }
  return { longitude: CITY_LONGITUDES[city], source: `city:${city}` };
}

function getDayOfYear(year, month, day) {
  const start = Date.UTC(year, 0, 1);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86400000) + 1;
}

function getTrueSolarCorrectionMinutes(solar, longitude) {
  const dayOfYear = getDayOfYear(solar.getYear(), solar.getMonth(), solar.getDay());
  const angle = (2 * Math.PI / 365) * (dayOfYear - 81);
  const equationOfTime = 9.87 * Math.sin(2 * angle)
    - 7.53 * Math.cos(angle)
    - 1.5 * Math.sin(angle);
  const longitudeCorrection = 4 * (longitude - CHINA_STANDARD_MERIDIAN);
  return Math.round(longitudeCorrection + equationOfTime);
}

function shiftSolarByMinutes(solar, correctionMinutes) {
  const [year, month, day, hour, minute, second] = solarToParts(solar);
  const shifted = new Date(Date.UTC(year, month - 1, day, hour, minute + correctionMinutes, second));
  return Solar.fromYmdHms(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    shifted.getUTCHours(),
    shifted.getUTCMinutes(),
    shifted.getUTCSeconds(),
  );
}

function applyTrueSolarTime(input, civilSolar) {
  const requested = input.useTrueSolarTime === true;
  const longitudeResult = resolveLongitude(input);
  if (!requested) {
    return {
      solar: civilSolar,
      requested,
      applied: false,
      correctionMinutes: 0,
      ...longitudeResult,
    };
  }

  if (longitudeResult.longitude === null) {
    throw new Error("birthLongitude is required when true solar time is enabled");
  }

  const correctionMinutes = getTrueSolarCorrectionMinutes(
    civilSolar,
    longitudeResult.longitude,
  );
  return {
    solar: shiftSolarByMinutes(civilSolar, correctionMinutes),
    requested,
    applied: true,
    correctionMinutes,
    ...longitudeResult,
  };
}

function getSolarTermBoundary(lunarDate) {
  const current = lunarDate.getSolar();
  const previous = lunarDate.getPrevJie();
  const next = lunarDate.getNextJie();
  const previousMinutes = current.subtractMinute(previous.getSolar());
  const nextMinutes = next.getSolar().subtractMinute(current);
  const nearest = previousMinutes <= nextMinutes
    ? {
      name: previous.getName(),
      solar_time: previous.getSolar().toYmdHms(),
      direction: "previous",
      distance_minutes: previousMinutes,
    }
    : {
      name: next.getName(),
      solar_time: next.getSolar().toYmdHms(),
      direction: "next",
      distance_minutes: nextMinutes,
    };

  return {
    ...nearest,
    within_review_window: nearest.distance_minutes <= SOLAR_TERM_REVIEW_WINDOW_MINUTES,
    review_window_minutes: SOLAR_TERM_REVIEW_WINDOW_MINUTES,
  };
}

function getCurrentCycle(currentDate) {
  const [year, month, day] = parseDate(currentDate, "currentDate");
  validateSolarDate(year, month, day, "currentDate");
  const lunarDate = Solar.fromYmdHms(year, month, day, 12, 0, 0).getLunar();
  return {
    dayun: "",
    liunian: lunarDate.getYearInGanZhiExact(),
    liuyue: lunarDate.getMonthInGanZhiExact(),
  };
}

export function calculateBazi(input) {
  const missingBirthTime = !input.birthTime;
  const dateParts = parseDate(input.birthDate);
  const timeParts = parseTime(input.birthTime);
  const civilSolar = resolveBirthSolar(input, dateParts, timeParts);
  const trueSolar = applyTrueSolarTime(input, civilSolar);
  const effectiveSolar = trueSolar.solar;
  const effectiveHour = effectiveSolar.getHour();
  const ziHourBoundary = effectiveHour === 23;
  const ziHourConvention = getZiHourConvention(input);
  const lunarDate = effectiveSolar.getLunar();
  const pillars = calculatePillars(lunarDate, ziHourConvention);
  const birthTimeBranch = BRANCH_TO_TIME[pillars.hour.branch] || "";
  const wuxing = [
    pillars.year.wuxing,
    pillars.month.wuxing,
    pillars.day.wuxing,
    pillars.hour.wuxing,
  ];
  const alternateConvention = ziHourConvention === ZI_HOUR_CONVENTIONS.ZI_CHU
    ? ZI_HOUR_CONVENTIONS.MIDNIGHT
    : ZI_HOUR_CONVENTIONS.ZI_CHU;
  const currentDate = input.currentDate || new Date().toISOString().slice(0, 10);
  const solarTermBoundary = getSolarTermBoundary(lunarDate);
  const needsAdvisorReview = missingBirthTime
    || ziHourBoundary
    || solarTermBoundary.within_review_window;
  const civilParts = solarToParts(civilSolar);
  const effectiveParts = solarToParts(effectiveSolar);

  return {
    calculation_version: CALCULATION_VERSION,
    input: {
      calendar_type: input.calendarType === "lunar" ? "lunar" : "solar",
      is_leap_month: input.isLeapMonth === true,
      gender: input.gender || "",
      birth_date: input.birthDate,
      birth_time: input.birthTime || "12:00",
      birth_time_branch: birthTimeBranch,
      birth_place: input.birthPlace || "",
      birth_longitude: trueSolar.longitude,
      timezone: input.timezone || DEFAULT_TIMEZONE,
      zi_hour_convention: ziHourConvention,
      current_date: currentDate,
      resolved_civil_time: formatDateTime(...civilParts),
      resolved_effective_time: formatDateTime(...effectiveParts),
      resolved_solar_date: civilSolar.toYmd(),
      resolved_lunar_date: lunarDate.toString(),
    },
    calculation_rules: {
      calendar_conversion: "lunar-javascript",
      month_boundary: "jie",
      timezone_mode: "local-wall-time",
      true_solar_time: {
        requested: trueSolar.requested,
        applied: trueSolar.applied,
        longitude: trueSolar.longitude,
        longitude_source: trueSolar.source,
        standard_meridian: CHINA_STANDARD_MERIDIAN,
        correction_minutes: trueSolar.correctionMinutes,
      },
      zi_hour: {
        primary_convention: ziHourConvention,
        alternate_retained: ziHourBoundary,
      },
      nearest_solar_term: solarTermBoundary,
    },
    pillars,
    alternate_pillars: ziHourBoundary ? {
      convention: alternateConvention,
      pillars: calculatePillars(lunarDate, alternateConvention),
    } : null,
    elements: countElements(wuxing),
    current_cycle: getCurrentCycle(currentDate),
    next_12_months: [],
    quality_flags: {
      missing_birth_time: missingBirthTime,
      approximate_time: missingBirthTime,
      calendar_converted: input.calendarType === "lunar",
      timezone_adjusted: false,
      true_solar_time_requested: trueSolar.requested,
      true_solar_time_adjusted: trueSolar.applied,
      longitude_resolved: trueSolar.longitude !== null,
      zi_hour_boundary: ziHourBoundary,
      solar_term_boundary: solarTermBoundary.within_review_window,
      needs_advisor_review: needsAdvisorReview,
    },
  };
}
