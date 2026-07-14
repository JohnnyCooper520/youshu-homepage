import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";

beforeEach(() => {
  window.history.pushState({}, "", "/");
  window.sessionStorage.clear();
  window.localStorage.clear();
  delete window.__youshuSupabaseClient;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function testUnlock(user, productName = "个人结构报告") {
  const purchaseRegion = screen.getByRole("region", { name: "购买选择" });
  await user.click(within(purchaseRegion).getByRole("button", { name: `测试开通：${productName}` }));
}

describe("Youshu homepage", () => {
  it("presents a three-product premium landing page with account access", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "有数" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "首页主视觉" })).getByText("心中有数，选择有光")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "首页主视觉" })).getByText("先看结构，再看选择。心里有数，路就不乱。")).toBeInTheDocument();
    expect(screen.queryByText(/AI/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("旋转阴阳动效")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "我的报告" })).toBeInTheDocument();
    expect(screen.getByText("结构校准")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "结构校准" })).getByText("先把信息放准，再看当下方向。")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "结构校准" })).queryByRole("link", { name: "看结构关键词" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "结构校准" })).queryByRole("link", { name: "看三项服务" })).not.toBeInTheDocument();
    expect(screen.queryByText("生成结构校准")).not.toBeInTheDocument();
    expect(screen.getAllByText("个人结构报告").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("一事分析").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("年度节奏报告").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("年度会员").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("人民币 ¥29.9")).toHaveLength(2);
    expect(screen.getByText("人民币 ¥199")).toBeInTheDocument();
    expect(screen.getByText("人民币 ¥299/年")).toBeInTheDocument();
    expect(screen.queryByText(/美元约/)).not.toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByLabelText("购买项目")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("年度节奏 · 生成日起算")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("生成日起，向后看完整 12 个月。")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("生成日起 · 向后完整 12 个月")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("后续十二月")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("单次报告与年度会员，都在这里选。")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("先看眼前，再看一年里的节奏。")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getAllByRole("link", { name: "看年度节奏" })).toHaveLength(2);
    expect(within(screen.getByRole("region", { name: "购买选择" })).getAllByRole("link", { name: "开通年度会员" })).toHaveLength(2);
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByRole("link", { name: "生成个人结构报告" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByRole("link", { name: "生成一事分析" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByRole("button", { name: "测试开通：个人结构报告" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByRole("button", { name: "测试开通：年度会员" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).queryByText("春季蓄势")).not.toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "购买选择" })).getByText("报告区间")).toBeInTheDocument();
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
    expect(screen.queryByText("用一段结构校准校准个人结构倾向；若它贴近你的处境，再进入完整个人结构、一事分析或年度路径。")).not.toBeInTheDocument();
    expect(screen.getByText("内容仅供自我认知、情绪整理和选择参考，不构成医疗、法律、投资、心理治疗或其他专业建议。")).toBeInTheDocument();
    expect(screen.getByText(/北京一叶泛舟文化科技有限公司/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "服务条款" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "隐私政策" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "退款政策" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "联系我们" })).toBeInTheDocument();
    expect(screen.getAllByRole("region")).toHaveLength(4);
  });

  it("opens legal pages with company, support, and refund rules", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "退款政策" }));

    expect(window.location.pathname).toBe("/refund");
    expect(screen.getByRole("heading", { name: "退款政策" })).toBeInTheDocument();
    expect(screen.getByText("原则上，报告一经生成或交付，不支持无理由退款。", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("重复扣款", { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "联系我们" }));

    expect(window.location.pathname).toBe("/contact");
    expect(screen.getByRole("heading", { name: "联系我们" })).toBeInTheDocument();
    expect(screen.getAllByText("qinyuneo@gmail.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("北京一叶泛舟文化科技有限公司").length).toBeGreaterThanOrEqual(1);
  });

  it("keeps the idle reading entry focused on inputs instead of a demo result", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("想看的方向"), "感情关系");

    expect(screen.getByLabelText("想看的方向")).toHaveValue("relationship");
    expect(screen.queryByText("有数 · 结构关键词")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "慢热深情，先立边界" })).not.toBeInTheDocument();
    expect(screen.queryByText("后面的判断，留给深度报告慢慢展开")).not.toBeInTheDocument();
  });

  it("switches the entry form by product before generation", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const readingRegion = screen.getByRole("region", { name: "结构校准" });
    const modeSwitcher = within(readingRegion).getByLabelText("选择服务");
    const birthForm = container.querySelector(".birth-form");

    expect(within(modeSwitcher).getByRole("button", { name: /个人结构报告/ })).toHaveAttribute("aria-pressed", "true");
    expect(within(readingRegion).queryByLabelText("想分析的事")).not.toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成个人结构报告" })).toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成个人结构报告" })).toBeDisabled();
    expect(within(readingRegion).getByText("这一项还未开通")).toBeInTheDocument();
    expect(within(birthForm).getByRole("button", { name: "生成个人结构报告" })).toBeInTheDocument();

    await user.click(within(modeSwitcher).getByRole("button", { name: /年度节奏/ }));

    expect(within(modeSwitcher).getByRole("button", { name: /年度节奏/ })).toHaveAttribute("aria-pressed", "true");
    expect(within(readingRegion).getByText("从生成日起，向后看完整 12 个月。")).toBeInTheDocument();
    expect(within(readingRegion).queryByLabelText("想分析的事")).not.toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成年度节奏" })).toBeInTheDocument();
    expect(within(readingRegion).getByText("这一项还未开通")).toBeInTheDocument();

    await user.click(within(modeSwitcher).getByRole("button", { name: /一事分析/ }));

    expect(within(modeSwitcher).getByRole("button", { name: /一事分析/ })).toHaveAttribute("aria-pressed", "true");
    expect(within(readingRegion).getByText("把一件具体的事拆清趋势、风险和下一步。")).toBeInTheDocument();
    expect(within(readingRegion).getByLabelText("想分析的事")).toBeInTheDocument();
    expect(within(readingRegion).getByPlaceholderText("例如：接下来半年适合换工作吗？")).toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成一事分析" })).toBeInTheDocument();
    expect(within(readingRegion).getByText("这一项还未开通")).toBeInTheDocument();
  });

  it("locks paid report generation until the matching entitlement is opened", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    const readingRegion = screen.getByRole("region", { name: "结构校准" });
    expect(within(readingRegion).getByRole("button", { name: "生成个人结构报告" })).toBeDisabled();
    expect(within(readingRegion).getByText("这一项还未开通")).toBeInTheDocument();

    await testUnlock(user, "个人结构报告");

    expect(within(readingRegion).getByText("已开通，可生成")).toBeInTheDocument();
    expect(within(readingRegion).getByText("剩余 1 次")).toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成个人结构报告" })).toBeEnabled();
  });

  it("lets testers open the current reading directly from the form", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/?test=1");
    render(<App />);

    const readingRegion = screen.getByRole("region", { name: "结构校准" });
    expect(within(readingRegion).getByRole("button", { name: "生成个人结构报告" })).toBeDisabled();

    await user.click(within(readingRegion).getByRole("button", { name: "测试开通当前服务" }));

    expect(within(readingRegion).getByText("已开通，可生成")).toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成个人结构报告" })).toBeEnabled();
  });

  it("loads paid entitlements from Supabase after sign in", async () => {
    const user = { id: "user-1", email: "qinyuneo@gmail.com" };
    const reportsOrderMock = vi.fn(async () => ({ data: [], error: null }));
    const reportsEqMock = vi.fn(() => ({ order: reportsOrderMock }));
    const reportsSelectMock = vi.fn(() => ({ eq: reportsEqMock }));
    const entitlementsOrderMock = vi.fn(async () => ({
      data: [{ product_key: "bazi", included_quantity: 1, used_quantity: 0, status: "active", expires_at: null }],
      error: null,
    }));
    const entitlementsEqMock = vi.fn(() => ({ order: entitlementsOrderMock }));
    const entitlementsSelectMock = vi.fn(() => ({ eq: entitlementsEqMock }));

    window.__youshuSupabaseClient = {
      auth: {
        getSession: vi.fn(async () => ({ data: { session: { user } }, error: null })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
      from: vi.fn((table) => {
        if (table === "reports") {
          return { select: reportsSelectMock };
        }
        if (table === "user_entitlements") {
          return { select: entitlementsSelectMock };
        }
        throw new Error(`Unexpected table: ${table}`);
      }),
    };

    render(<App />);

    const readingRegion = screen.getByRole("region", { name: "结构校准" });
    expect(await within(readingRegion).findByText("已开通，可生成")).toBeInTheDocument();
    expect(within(readingRegion).getByText("剩余 1 次")).toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成个人结构报告" })).toBeEnabled();
    expect(entitlementsSelectMock).toHaveBeenCalledWith("product_key,included_quantity,used_quantity,status,expires_at");
  });

  it("shows annual membership entitlements and unlocks all three report types for testing", async () => {
    const user = userEvent.setup();
    render(<App />);

    await testUnlock(user, "年度会员");

    const readingRegion = screen.getByRole("region", { name: "结构校准" });
    const modeSwitcher = within(readingRegion).getByLabelText("选择服务");
    expect(within(readingRegion).getByText("年度会员已包含")).toBeInTheDocument();

    await user.click(within(modeSwitcher).getByRole("button", { name: /一事分析/ }));

    expect(within(readingRegion).getByText("年度会员已包含")).toBeInTheDocument();
    expect(within(readingRegion).getByText("剩余 12 次")).toBeInTheDocument();
    expect(within(readingRegion).getByRole("button", { name: "生成一事分析" })).toBeEnabled();
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
    expect(screen.getByText("心中有數，選擇有光")).toBeInTheDocument();
    expect(screen.getAllByText("個人結構報告").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("人民幣 ¥199")).toBeInTheDocument();
    expect(screen.queryByText(/美元約/)).not.toBeInTheDocument();

    await user.selectOptions(languageSelect, "en");

    expect(screen.getByRole("link", { name: "My reports" })).toBeInTheDocument();
    expect(screen.getByText("A clear structure, a calmer choice.")).toBeInTheDocument();
    expect(screen.queryByText(/AI/)).not.toBeInTheDocument();
    expect(screen.getAllByText("Personal Structure Report").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Annual Rhythm Report").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("USD $28")).toBeInTheDocument();
    expect(screen.queryByText(/RMB/)).not.toBeInTheDocument();
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
            content: "# 个人结构报告\n先知己。",
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

    await testUnlock(user, "个人结构报告");
    await user.click(screen.getByRole("button", { name: "生成个人结构报告" }));

    expect(window.location.pathname).toBe("/report");
    expect(screen.getByRole("heading", { name: "个人结构报告", level: 1 })).toBeInTheDocument();
    expect(await screen.findByText("丁卯 · 癸丑 · 戊辰 · 戊午")).toBeInTheDocument();
    expect(screen.getByText("报告已成")).toBeInTheDocument();
    expect(within(screen.getByLabelText("生成结果")).getByText("先知己")).toBeInTheDocument();
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

  it("saves generated reports under My reports and opens a saved detail", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          ok: true,
          type: "bazi",
          content: "# 个人结构报告\n先知己。\n\n## 用力方式\n先稳住节奏。",
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

    await testUnlock(user, "个人结构报告");
    await user.click(screen.getByRole("button", { name: "生成个人结构报告" }));
    await screen.findByText("报告已成");
    await user.click(screen.getByRole("link", { name: "我的报告" }));

    expect(window.location.pathname).toBe("/reports");
    expect(screen.getByRole("heading", { name: "我的报告" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /个人结构报告/ })).toBeInTheDocument();
    expect(screen.getByText("1988/01/14 · 长春")).toBeInTheDocument();
    expect(screen.getByText("先知己。")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /个人结构报告/ }));

    expect(window.location.pathname).toBe("/report");
    expect(window.location.search).toMatch(/id=/);
    expect(screen.getByText("丁卯 · 癸丑 · 戊辰 · 戊午")).toBeInTheDocument();
    expect(screen.getByText("先稳住节奏。")).toBeInTheDocument();
  });

  it("renders report markdown emphasis and lists without leaking raw markers", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          ok: true,
          type: "bazi",
          content: "# 个人结构报告\n**先知己**，再谈选择。\n\n## 用力方式\n- 先稳住节奏\n1. 再看取舍",
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

    await testUnlock(user, "个人结构报告");
    await user.click(screen.getByRole("button", { name: "生成个人结构报告" }));

    const reportCard = await screen.findByLabelText("生成结果");
    expect(reportCard).not.toHaveTextContent("**");
    expect(reportCard.querySelector(".report-body strong")).toHaveTextContent("先知己");
    expect(within(reportCard).getByText("先稳住节奏")).toBeInTheDocument();
    expect(within(reportCard).getByText("再看取舍")).toBeInTheDocument();
  });

  it("distinguishes report products in the archive and shows detail metadata", async () => {
    const reports = [
      {
        id: "annual-1",
        type: "annual",
        title: "生成结果",
        content: "# 年度节奏\n先看眼前。",
        createdAt: "2026-06-26T10:30:00.000Z",
        birthDate: "1988-01-14",
        birthTime: "11:25",
        birthPlace: "长春",
        focus: "事业机会",
        summary: "先看眼前。",
      },
      {
        id: "question-1",
        type: "question",
        title: "生成结果",
        content: "# 一事分析\n此事宜稳。",
        createdAt: "2026-06-26T09:30:00.000Z",
        birthDate: "1988-01-14",
        birthTime: "11:25",
        birthPlace: "长春",
        focus: "事业机会",
        question: "接下来半年适合换工作吗？",
        summary: "此事宜稳。",
      },
      {
        id: "bazi-1",
        type: "bazi",
        title: "生成结果",
        content: "# 个人结构报告\n先知己。",
        createdAt: "2026-06-26T08:30:00.000Z",
        birthDate: "1988-01-14",
        birthTime: "11:25",
        birthPlace: "长春",
        focus: "事业机会",
        summary: "先知己。",
      },
    ];
    window.localStorage.setItem("youshu:reports", JSON.stringify(reports));
    window.history.pushState({}, "", "/reports");
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole("heading", { name: "我的报告" })).toBeInTheDocument();
    expect(screen.getByText("3 份报告")).toBeInTheDocument();
    const archive = screen.getByRole("region", { name: "报告归档" });
    expect(within(archive).getByRole("button", { name: /年度节奏.*先看眼前/ })).toBeInTheDocument();
    expect(within(archive).getByRole("button", { name: /一事分析.*此事宜稳/ })).toBeInTheDocument();
    expect(within(archive).getByRole("button", { name: /个人结构报告.*先知己/ })).toBeInTheDocument();
    expect(screen.getByText("接下来半年适合换工作吗？")).toBeInTheDocument();

    await user.click(within(archive).getByRole("button", { name: /一事分析.*此事宜稳/ }));

    expect(window.location.pathname).toBe("/report");
    expect(screen.getAllByText("一事分析").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/生成于 2026\/06\/26 17:30/)).toBeInTheDocument();
    expect(screen.getByText(/出生信息 1988\/01\/14.*长春/)).toBeInTheDocument();
    expect(screen.getByText(/关注方向.*事业机会/)).toBeInTheDocument();
    expect(screen.getByText("接下来半年适合换工作吗？")).toBeInTheDocument();
  });

  it("shows a lightweight sign-in panel when cloud reports are available but the user is signed out", async () => {
    const user = userEvent.setup();
    window.__youshuSupabaseClient = {
      auth: {
        getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signInWithOAuth: vi.fn(async () => ({ error: null })),
        signInWithOtp: vi.fn(async () => ({ error: null })),
      },
    };
    render(<App />);

    await user.click(screen.getByRole("link", { name: "我的报告" }));

    expect(screen.getByRole("heading", { name: "我的报告" })).toBeInTheDocument();
    expect(screen.getByText("登录后，报告会跟着你走。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Google 登录" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发送登录链接" })).toBeInTheDocument();
  });

  it("saves generated reports to Supabase when a user is signed in", async () => {
    const user = userEvent.setup();
    const insertMock = vi.fn(async () => ({ error: null }));
    window.__youshuSupabaseClient = {
      auth: {
        getSession: vi.fn(async () => ({ data: { session: { user: { id: "user-1", email: "user@example.com" } } }, error: null })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
      from: vi.fn((table) => {
        if (table !== "reports") {
          throw new Error(`Unexpected table ${table}`);
        }
        return {
          select: () => ({
            eq: () => ({
              order: async () => ({ data: [], error: null }),
            }),
          }),
          insert: insertMock,
        };
      }),
    };
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          ok: true,
          type: "bazi",
          content: "# 个人结构报告\n先知己。",
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

    await testUnlock(user, "个人结构报告");
    await user.click(screen.getByRole("button", { name: "生成个人结构报告" }));
    await screen.findByText("报告已成");

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: "user-1",
        report_type: "bazi",
        title: "生成结果",
        report_payload: expect.objectContaining({ content: "# 个人结构报告\n先知己。" }),
      }),
    ]);
  });

  it("shows a localized support message when backend generation is not configured", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ error: "DeepSeek API key is not configured on the backend" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    await testUnlock(user, "个人结构报告");
    await user.click(screen.getByRole("button", { name: "生成个人结构报告" }));

    expect(await screen.findByRole("heading", { name: "有数报告", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("服务端模型配置正在调整，请稍后再试或联系客服。")).toBeInTheDocument();
    expect(screen.queryByText(/DeepSeek API key is not configured/)).not.toBeInTheDocument();
  });

  it("keeps the homepage short after a generated report is available", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          ok: true,
          type: "bazi",
          content: "# 个人结构报告\n先知己。",
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

    await testUnlock(user, "个人结构报告");
    await user.click(screen.getByRole("button", { name: "生成个人结构报告" }));
    await screen.findByRole("heading", { name: "个人结构报告", level: 1 });
    await user.click(screen.getByRole("button", { name: "回到首页" }));

    expect(window.location.pathname).toBe("/");
    expect(screen.queryByRole("heading", { name: "报告已生成" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "打开报告页" })).not.toBeInTheDocument();
    expect(screen.queryByText("有数 · 结构关键词")).not.toBeInTheDocument();
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

    await testUnlock(user, "个人结构报告");
    await user.click(screen.getByRole("button", { name: "生成个人结构报告" }));

    expect(screen.getByText("正在生成")).toBeInTheDocument();
    expect(screen.getByText("先定出生信息，再把话说清。")).toBeInTheDocument();
    expect(screen.queryByText("后面的判断，留给深度报告慢慢展开")).not.toBeInTheDocument();

    resolveRequest(
      new Response(
        JSON.stringify({
          ok: true,
          type: "bazi",
          content: "# 个人结构报告\n先知己。",
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
            content: "# Annual Rhythm Report",
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
    const readingRegion = screen.getByRole("region", { name: "Structure Check" });
    const modeSwitcher = within(readingRegion).getByLabelText("Choose a service");
    await user.click(within(modeSwitcher).getByRole("button", { name: /Annual Rhythm Report/ }));
    await user.click(within(screen.getByRole("region", { name: "Purchase options" })).getByRole("button", { name: "Test unlock: Annual Rhythm Report" }));
    await user.click(screen.getByRole("button", { name: "Generate annual rhythm report" }));

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      type: "annual",
      language: "en",
    });
    expect(await screen.findByText("Report ready")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/report");
  });
});
