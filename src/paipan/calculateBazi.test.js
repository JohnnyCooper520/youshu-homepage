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
    expect(result.elements).toEqual({
      wood: 1,
      fire: 1,
      earth: 2,
      metal: 2,
      water: 2,
    });
    expect(result.quality_flags).toEqual({
      missing_birth_time: false,
      approximate_time: false,
      timezone_adjusted: false,
      true_solar_time_adjusted: false,
      zi_hour_boundary: false,
      needs_advisor_review: true,
    });
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
});
