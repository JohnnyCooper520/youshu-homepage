import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App.jsx";

describe("Youshu homepage", () => {
  it("presents a concise premium landing page with a yin-yang orb", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "有数" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "首页主视觉" })).getByText("命盘有数，选择有光")).toBeInTheDocument();
    expect(screen.getByLabelText("旋转阴阳动效")).toBeInTheDocument();
    expect(screen.getAllByRole("region")).toHaveLength(5);
  });

  it("updates the share card immediately when focus changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("当前关注"), "感情关系");

    expect(screen.getByText("慢热但深情的关系盘")).toBeInTheDocument();
    expect(screen.getByText("你不是不需要爱，是更怕把真心交给不懂珍惜的人。")).toBeInTheDocument();
  });
});
