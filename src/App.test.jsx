import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App.jsx";

describe("Youshu homepage", () => {
  it("presents a three-product premium landing page with account access", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "有数" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "首页主视觉" })).getByText("命盘有数，选择有光")).toBeInTheDocument();
    expect(screen.getByLabelText("旋转阴阳动效")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "我的报告" })).toBeInTheDocument();
    expect(screen.getByText("先行洞察")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "先行洞察" })).getByRole("link", { name: "选择深入方向" })).toBeInTheDocument();
    expect(screen.getAllByText("命盘报告").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("问事解惑").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("今年运势解读").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("¥29.9")).toHaveLength(2);
    expect(screen.getByText("¥199")).toBeInTheDocument();
    expect(screen.getByText("年度会员")).toBeInTheDocument();
    expect(screen.getByText("把命盘、问事与年度节奏，放进一个长期账户。")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "年度会员" })).getByText("完整分析")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "年度会员" })).getByText("持续陪伴")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "年度会员" })).getByText("账户资产")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "开通年度会员" })).toBeInTheDocument();
    expect(screen.getByText("为什么值得信任")).toBeInTheDocument();
    expect(screen.getAllByRole("region")).toHaveLength(7);
  });

  it("updates the share card immediately when focus changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("当前关注"), "感情关系");

    expect(screen.getByText("慢热但深情的关系盘")).toBeInTheDocument();
    expect(screen.getByText("你不是不需要爱，是更怕把真心交给不懂珍惜的人。")).toBeInTheDocument();
  });
});
