import { describe, expect, it } from "vitest";
import { calculateBazi } from "./calculateBazi.js";

describe("calculateBazi", () => {
  it("returns normalized four-pillar JSON for a known solar birth time", () => {
    const result = calculateBazi({
      calendarType: "solar",
      gender: "female",
      birthDate: "2005-12-23",
      birthTime: "08:37",
      birthPlace: "深圳",
      currentDate: "2026-06-25",
    });

    expect(result.input.birth_time_branch).toBe("辰时");
    expect(result.pillars.year.value).toBe("乙酉");
    expect(result.pillars.month.value).toBe("戊子");
    expect(result.pillars.day.value).toBe("辛巳");
    expect(result.pillars.hour.value).toBe("壬辰");
    expect(result.pillars.year.ten_god).toBe("偏财");
    expect(result.pillars.month.ten_god).toBe("正印");
    expect(result.pillars.day.day_master).toBe("辛");
    expect(result.pillars.hour.hidden_stems).toEqual(["戊", "乙", "癸"]);
    expect(result.calculation_version).toBe("bazi-v2.0.0");
    expect(result.input.resolved_civil_time).toBe("2005-12-23 08:37:00");
    expect(result.current_cycle).toEqual({
      dayun: "",
      liunian: "丙午",
      liuyue: "甲午",
    });
    expect(result.elements).toEqual({
      wood: 1,
      fire: 1,
      earth: 2,
      metal: 2,
      water: 2,
    });
    expect(result.quality_flags).toEqual(expect.objectContaining({
      missing_birth_time: false,
      approximate_time: false,
      timezone_adjusted: false,
      true_solar_time_adjusted: false,
      zi_hour_boundary: false,
      solar_term_boundary: false,
      needs_advisor_review: false,
    }));
  });

  it("marks missing birth time as approximate and defaults to noon", () => {
    const result = calculateBazi({
      birthDate: "1996-08-18",
      gender: "male",
      birthPlace: "广州",
      currentDate: "2026-06-25",
    });

    expect(result.input.birth_time).toBe("12:00");
    expect(result.input.birth_time_branch).toBe("午时");
    expect(result.quality_flags.missing_birth_time).toBe(true);
    expect(result.quality_flags.approximate_time).toBe(true);
  });

  it("uses one internally consistent convention for late zi hour and retains the alternative", () => {
    const result = calculateBazi({
      birthDate: "1988-01-14",
      birthTime: "23:30",
      gender: "male",
      birthPlace: "长春",
      currentDate: "2026-06-25",
    });

    expect(result.input.zi_hour_convention).toBe("zi-chu");
    expect(result.pillars.day.value).toBe("己巳");
    expect(result.pillars.hour.value).toBe("甲子");
    expect(result.alternate_pillars).toEqual(expect.objectContaining({
      convention: "midnight",
      pillars: expect.objectContaining({
        day: expect.objectContaining({ value: "戊辰" }),
        hour: expect.objectContaining({ value: "壬子" }),
      }),
    }));
    expect(result.quality_flags.zi_hour_boundary).toBe(true);
    expect(result.quality_flags.needs_advisor_review).toBe(true);
  });

  it("converts a lunar birth date before calculating the same known pillars", () => {
    const result = calculateBazi({
      calendarType: "lunar",
      birthDate: "2019-12-12",
      birthTime: "11:22",
      gender: "female",
      birthPlace: "北京",
      currentDate: "2026-06-25",
    });

    expect(result.input.resolved_solar_date).toBe("2020-01-06");
    expect(result.input.resolved_civil_time).toBe("2020-01-06 11:22:00");
    expect(result.input.resolved_lunar_date).toBe("二〇一九年腊月十二");
    expect(result.pillars.year.value).toBe("己亥");
    expect(result.pillars.month.value).toBe("丁丑");
    expect(result.pillars.day.value).toBe("戊申");
    expect(result.pillars.hour.value).toBe("戊午");
    expect(result.quality_flags.calendar_converted).toBe(true);
  });

  it("applies true solar time only when explicitly requested", () => {
    const result = calculateBazi({
      birthDate: "1988-01-14",
      birthTime: "23:30",
      gender: "male",
      birthPlace: "长春",
      useTrueSolarTime: true,
      currentDate: "2026-06-25",
    });

    expect(result.input.resolved_civil_time).toBe("1988-01-14 23:30:00");
    expect(result.input.resolved_effective_time).toBe("1988-01-14 23:42:00");
    expect(result.calculation_rules.true_solar_time).toEqual(expect.objectContaining({
      requested: true,
      applied: true,
      longitude_source: "city:长春",
      correction_minutes: 12,
    }));
    expect(result.quality_flags.true_solar_time_adjusted).toBe(true);
    expect(result.pillars.day.value).toBe("己巳");
    expect(result.pillars.hour.value).toBe("甲子");
  });

  it("marks births close to a solar-term boundary for manual review", () => {
    const result = calculateBazi({
      birthDate: "2020-01-06",
      birthTime: "05:30",
      gender: "male",
      birthPlace: "北京",
      currentDate: "2026-06-25",
    });

    expect(result.calculation_rules.nearest_solar_term).toEqual(expect.objectContaining({
      name: "小寒",
      solar_time: "2020-01-06 05:30:06",
      distance_minutes: 0,
      within_review_window: true,
    }));
    expect(result.quality_flags.solar_term_boundary).toBe(true);
    expect(result.quality_flags.needs_advisor_review).toBe(true);
  });

  it("rejects true solar time when a longitude cannot be resolved", () => {
    expect(() => calculateBazi({
      birthDate: "1990-01-01",
      birthTime: "10:00",
      birthPlace: "未知地点",
      useTrueSolarTime: true,
      currentDate: "2026-06-25",
    })).toThrow("birthLongitude is required");
  });

  it("rejects invalid solar dates rather than normalizing them", () => {
    expect(() => calculateBazi({
      birthDate: "2024-02-31",
      birthTime: "10:00",
      currentDate: "2026-06-25",
    })).toThrow("not a valid solar date");
  });
});
