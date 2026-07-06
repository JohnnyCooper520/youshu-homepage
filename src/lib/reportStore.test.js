import { describe, expect, it, vi } from "vitest";
import { loadCloudReports, saveCloudReport } from "./reportStore.js";

describe("reportStore", () => {
  it("loads reports from Supabase ordered by latest first", async () => {
    const orderMock = vi.fn(async () => ({
      data: [
        {
          id: "row-1",
          report_payload: { id: "report-1", type: "bazi", content: "# 个人结构报告\n先知己。" },
          created_at: "2026-07-03T00:00:00.000Z",
        },
      ],
      error: null,
    }));
    const eqMock = vi.fn(() => ({ order: orderMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const client = { from: vi.fn(() => ({ select: selectMock })) };

    const reports = await loadCloudReports(client, { id: "user-1" });

    expect(client.from).toHaveBeenCalledWith("reports");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(eqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(reports).toEqual([{ id: "report-1", type: "bazi", content: "# 个人结构报告\n先知己。" }]);
  });

  it("saves a report payload for the signed-in user", async () => {
    const insertMock = vi.fn(async () => ({ error: null }));
    const client = { from: vi.fn(() => ({ insert: insertMock })) };
    const report = { id: "report-1", type: "annual", title: "生成结果", content: "# 年度节奏" };

    await saveCloudReport(client, { id: "user-1" }, report);

    expect(client.from).toHaveBeenCalledWith("reports");
    expect(insertMock).toHaveBeenCalledWith([
      {
        user_id: "user-1",
        report_type: "annual",
        title: "生成结果",
        report_payload: report,
      },
    ]);
  });
});
