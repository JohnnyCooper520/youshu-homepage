import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";

beforeEach(() => {
  window.history.pushState({}, "", "/");
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Youshu homepage", () => {
  it("presents a three-product premium landing page with account access", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "有数" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "首页主视觉" })).getByText("命盘有数，选择有光")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "首页主视觉" })).getByText("先看格局，再看选择。心里有数，路就不乱。")).toBeInTheDocument();
    expect(screen.queryByText(/AI/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("旋转阴阳动效")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "我的报告" })).toBeInTheDocument();
    expect(screen.getByText("先行洞察")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "先行洞察" })).getByText("先起一盘，看你此刻的气口。")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "先行洞察" })).queryByRole("link", { name: "看命盘关键词" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "先行洞察" })).queryByRole("link", { name: "看三项服务" })).not.toBeInTheDocument();
    expect(screen.queryByText("生成先行洞察")).not.toBeInTheDocument();
    expect(screen.getAllByText("命盘报告").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("问事解惑").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("今年运势解读").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("年度会员").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("人民币 ¥29.9")).toHaveLength(2);
    expect(screen.getAllByText("美元约 $4.2")).toHaveLength(2);
    expect(screen.getByText("人民币 ¥199")).toBeInTheDocument();
    expect(screen.getByText("美元约 $28")).toBeInTheDocument();
    expect(screen.getByText("人民币 ¥299/年")).toBeInTheDocument();
    expect(screen.getByText("美元约 $42/年")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByLabelText("购买项目")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("今年运势 · 起盘日起算")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("起盘日起，向后看完整 12 个月。")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("起盘日起 · 向后完整 12 个月")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("未来十二月")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("单次解读与全年会员，都在这里选。")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("先看眼前，再看一年里的转折。")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getAllByRole("link", { name: "看今年运势" })).toHaveLength(2);
    expect(within(screen.getByRole("region", { name: "购买选择" })).getAllByRole("link", { name: "开通年度会员" })).toHaveLength(2);
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByRole("link", { name: "生成命盘报告" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByRole("link", { name: "生成问事解惑" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).queryByText("春季蓄势")).not.toBeInTheDocument();
    expect(screen.getByText("近守远换")).toBeInTheDocument();
    expect(screen.queryByText("流年十二月解读")).not.toBeInTheDocument();
    expect(screen.queryByText("上半年蓄势，下半年换挡")).not.toBeInTheDocument();
    expect(screen.getAllByText("年度会员").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("年度会员 · 长期权益")).toBeInTheDocument();
    expect(screen.getByText("常看的人，把判断养成自己的底气。")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByLabelText("年度会员包含")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getAllByText("1 份")).toHaveLength(2);
    expect(within(screen.getByRole("region", { name: "购买选择" })).getAllByText("12 次/年")).toHaveLength(2);
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("12 期")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).queryByText("完整分析")).not.toBeInTheDocument();
    expect(screen.getByText("为什么值得信任")).toBeInTheDocument();
    expect(screen.queryByText("用一段先行洞察校准命盘倾向；若它贴近你的处境，再进入完整命盘、问事分析或年度路径。")).not.toBeInTheDocument();
    expect(screen.getAllByRole("region")).toHaveLength(6);
  });

  it("keeps the idle reading entry focused on inputs instead of a demo result", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("想看的方向"), "感情关系");

    expect(screen.getByLabelText("想看的方向")).toHaveValue("relationship");
    expect(screen.queryByText("有数 · 命盘关键词")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "慢热深情，先立边界" })).not.toBeInTheDocument();
    expect(screen.queryByText("后面的判断，留给深度报告慢慢展开")).not.toBeInTheDocument();
  });

  it("switches the entry form by product before generation", async () => {
    const user = userEvent.setup();
    render(<App />);
    const readingRegion = screen.getByRole("region", { name: "先行洞察" });
    const modeSwitcher = within(readingRegion).getByLabelText("选择服务");

    expect(within(modeSwitcher).getByRole("button", { name: /命盘报告/ })).toHaveAttribute("aria-pressed", "true");
    expect(within(readingRegion).queryByLabelText("想问的事")).not.toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成命盘报告" })).toBeInTheDocument();

    await user.click(within(modeSwitcher).getByRole("button", { name: /今年运势/ }));

    expect(within(modeSwitcher).getByRole("button", { name: /今年运势/ })).toHaveAttribute("aria-pressed", "true");
    expect(within(readingRegion).getByText("从起盘日起，向后看完整 12 个月。")).toBeInTheDocument();
    expect(within(readingRegion).queryByLabelText("想问的事")).not.toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成今年运势" })).toBeInTheDocument();

    await user.click(within(modeSwitcher).getByRole("button", { name: /问事解惑/ }));

    expect(within(modeSwitcher).getByRole("button", { name: /问事解惑/ })).toHaveAttribute("aria-pressed", "true");
    expect(within(readingRegion).getByText("把一件具体的事拆清趋势、风险和下一步。")).toBeInTheDocument();
    expect(within(readingRegion).getByLabelText("想问的事")).toBeInTheDocument();
    expect(within(readingRegion).getByPlaceholderText("例如：接下来半年适合换工作吗？")).toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成问事解惑" })).toBeInTheDocument();
  });

  it("switches the web page between simplified Chinese, traditional Chinese, and English", async () => {
    const user = userEvent.setup();
    render(<App />);

    const languageSelect = screen.getByLabelText("语言 / Language");
    expect(languageSelect).toHaveValue("zh-CN");
    expect(screen.getByRole("option", { name: "简体中文" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "繁體中文" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();

    await user.selectOptions(languageSelect, "zh-TW");

    expect(screen.getByRole("link", { name: "我的報告" })).toBeInTheDocument();
    expect(screen.getByText("命盤有數，選擇有光")).toBeInTheDocument();
    expect(screen.getAllByText("命盤報告").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("人民幣 ¥199")).toBeInTheDocument();
    expect(screen.getByText("美元約 $28")).toBeInTheDocument();

    await user.selectOptions(languageSelect, "en");

    expect(screen.getByRole("link", { name: "My reports" })).toBeInTheDocument();
    expect(screen.getByText("A clear chart, a clearer choice.")).toBeInTheDocument();
    expect(screen.queryByText(/AI/)).not.toBeInTheDocument();
    expect(screen.getAllByText("Bazi Report").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Annual Outlook").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("RMB ¥199")).toBeInTheDocument();
    expect(screen.getByText("approx. USD $28")).toBeInTheDocument();
  });

  it("does not expose DeepSeek key controls on the customer page", () => {
    render(<App />);

    expect(screen.queryByLabelText("服务端 DeepSeek Key")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存到后端" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "检查后端状态" })).not.toBeInTheDocument();
  });

  it("generates a report through the API without sending any API key from the page", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (url) => {
      if (url === "/api/generate") {
        return new Response(
          JSON.stringify({
            ok: true,
            type: "bazi",
            content: "# 命盘报告\n先知己。",
            paipan: {
              pillars: {
                year: { value: "丁卯" },
                month: { value: "癸丑" },
                day: { value: "戊辰" },
                hour: { value: "戊午" },
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "生成命盘报告" }));

    expect(window.location.pathname).toBe("/report");
    expect(screen.getByRole("heading", { name: "这份报告，单独慢慢看。" })).toBeInTheDocument();
    expect(await screen.findByText("丁卯 · 癸丑 · 戊辰 · 戊午")).toBeInTheDocument();
    expect(screen.getByText("报告已成")).toBeInTheDocument();
    expect(within(screen.getByLabelText("生成结果")).getByRole("heading", { name: "命盘报告" })).toBeInTheDocument();
    expect(screen.getByText("先知己。")).toBeInTheDocument();
    expect(screen.queryByText("后面的判断，留给深度报告慢慢展开")).not.toBeInTheDocument();
    expect(document.querySelector(".generated-report pre")).not.toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      type: "bazi",
      language: "zh-CN",
      birthDate: "1988-01-14",
      birthTime: "11:25",
      birthPlace: "长春",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/generate");
    expect(fetchMock.mock.calls[0][1].body).not.toContain("sk-");
  });

  it("keeps the homepage short after a generated report is available", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          ok: true,
          type: "bazi",
          content: "# 命盘报告\n先知己。",
          paipan: {
            pillars: {
              year: { value: "丁卯" },
              month: { value: "癸丑" },
              day: { value: "戊辰" },
              hour: { value: "戊午" },
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "生成命盘报告" }));
    await screen.findByRole("heading", { name: "这份报告，单独慢慢看。" });
    await user.click(screen.getByRole("button", { name: "回到首页" }));

    expect(window.location.pathname).toBe("/");
    expect(screen.queryByRole("heading", { name: "报告已生成" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "打开报告页" })).not.toBeInTheDocument();
    expect(screen.queryByText("有数 · 命盘关键词")).not.toBeInTheDocument();
    expect(screen.queryByText("先知己。")).not.toBeInTheDocument();
  });

  it("shows a transitional loading state while generating a report", async () => {
    const user = userEvent.setup();
    let resolveRequest;
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "生成命盘报告" }));

    expect(screen.getByText("正在起盘")).toBeInTheDocument();
    expect(screen.getByText("先定四柱，再把话说清。")).toBeInTheDocument();
    expect(screen.queryByText("后面的判断，留给深度报告慢慢展开")).not.toBeInTheDocument();

    resolveRequest(
      new Response(
        JSON.stringify({
          ok: true,
          type: "bazi",
          content: "# 命盘报告\n先知己。",
          paipan: {
            pillars: {
              year: { value: "丁卯" },
              month: { value: "癸丑" },
              day: { value: "戊辰" },
              hour: { value: "戊午" },
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    expect(await screen.findByText("报告已成")).toBeInTheDocument();
  });

  it("passes the selected language to report generation", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (url) => {
      if (url === "/api/generate") {
        return new Response(
          JSON.stringify({
            ok: true,
            type: "annual",
            content: "# Annual Outlook",
            paipan: {
              pillars: {
                year: { value: "丁卯" },
                month: { value: "癸丑" },
                day: { value: "戊辰" },
                hour: { value: "戊午" },
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    await user.selectOptions(screen.getByLabelText("语言 / Language"), "en");
    const readingRegion = screen.getByRole("region", { name: "First insight" });
    const modeSwitcher = within(readingRegion).getByLabelText("Choose a service");
    await user.click(within(modeSwitcher).getByRole("button", { name: /Annual Outlook/ }));
    await user.click(screen.getByRole("button", { name: "Generate annual outlook" }));

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      type: "annual",
      language: "en",
    });
    expect(await screen.findByText("Report ready")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/report");
  });
});
