import { useState } from "react";

const readings = {
  "事业机会": {
    title: "晚成型的远方贵人命",
    tags: ["先抑后扬", "远方贵人", "蓄势换挡"],
    line: "你不是没有机会，是太习惯在机会来之前先否定自己。",
  },
  "感情关系": {
    title: "慢热但深情的关系盘",
    tags: ["边界感强", "重承诺", "后知后觉"],
    line: "你不是不需要爱，是更怕把真心交给不懂珍惜的人。",
  },
  "内耗与情绪": {
    title: "一边扛事一边自省的盘",
    tags: ["思虑深", "责任重", "独自消化"],
    line: "让你累的从来不是事，是你总想一个人扛完所有。",
  },
  "财务选择": {
    title: "稳中求进的蓄势盘",
    tags: ["慢热财", "重判断", "忌冲动"],
    line: "你的好运不怕来得慢，怕的是在转折前先被焦虑带偏。",
  },
};

const abilities = [
  ["命盘报告", "把性格底色、关系惯性、事业节奏翻译成一份可读的自我说明书。"],
  ["流年趋势", "看一年里的推进、收缩、换挡与等待，不把短期波动当成命运。"],
  ["问事解惑", "围绕一个具体困惑，给趋势参考、风险提醒和下一步建议。"],
];

const proof = [
  ["确定性排盘", "出生时间先进入程序计算，不让 AI 猜四柱、大运和流年。"],
  ["顾问规则", "命理顾问把判断链固化成规则，减少泛泛冷读。"],
  ["AI 诠释", "最后才用 AI 把术语翻译成现代人看得懂的话。"],
];

function YinYangOrb() {
  return (
    <div className="orb-stage" aria-label="旋转阴阳动效">
      <div className="orb-glow" />
      <div className="orb-ring ring-one" />
      <div className="orb-ring ring-two" />
      <div className="orb-ring ring-three" />
      <div className="gua gua-top">
        <i />
        <i />
        <i />
      </div>
      <div className="gua gua-bottom">
        <i />
        <i />
        <i />
      </div>
      <div className="yin-orb">
        <span className="fish fish-light" />
        <span className="fish fish-dark" />
        <span className="eye eye-dark" />
        <span className="eye eye-light" />
      </div>
    </div>
  );
}

export default function App() {
  const [focus, setFocus] = useState("事业机会");
  const reading = readings[focus];

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="有数首页">
          <span className="brand-mark">有</span>
          <span>
            <strong>有数</strong>
            <small>命盘有数，选择有光</small>
          </span>
        </a>
        <nav aria-label="主导航">
          <a href="#reading">测算</a>
          <a href="#ability">能力</a>
          <a href="#method">方法</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-label="首页主视觉" role="region">
          <div className="hero-copy">
            <p className="kicker">东方命理 AI 人生顾问</p>
            <h1>有数</h1>
            <p className="hero-subtitle">命盘有数，选择有光</p>
            <p className="hero-lede">
              用确定性排盘和顾问规则，把命理翻译成清醒、克制、可执行的选择参考。
            </p>
            <div className="hero-actions">
              <a className="primary-btn" href="#reading">生成命盘关键词</a>
              <a className="text-btn" href="#method">看方法</a>
            </div>
          </div>
          <YinYangOrb />
        </section>

        <section className="reading" id="reading" aria-label="免费命盘关键词" role="region">
          <div className="section-copy">
            <p className="kicker">先看一张命盘卡</p>
            <h2>少一点玄虚，多一点可判断。</h2>
          </div>
          <div className="reading-panel">
            <form className="birth-form">
              <label>
                出生日期
                <input type="date" defaultValue="1996-08-18" />
              </label>
              <label>
                出生时辰
                <select defaultValue="午时 11:00-13:00">
                  <option>子时 23:00-01:00</option>
                  <option>卯时 05:00-07:00</option>
                  <option>午时 11:00-13:00</option>
                  <option>酉时 17:00-19:00</option>
                  <option>亥时 21:00-23:00</option>
                </select>
              </label>
              <label>
                当前关注
                <select value={focus} onChange={(event) => setFocus(event.target.value)}>
                  {Object.keys(readings).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </form>

            <article className="result-card" aria-live="polite">
              <span className="card-label">有数 · 命盘关键词</span>
              <h3>{reading.title}</h3>
              <p>{reading.line}</p>
              <ul>
                {reading.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="ability" id="ability" aria-label="核心能力" role="region">
          <div className="section-copy narrow">
            <p className="kicker">三种核心体验</p>
            <h2>认识自己，理解当下，问清一事。</h2>
          </div>
          <div className="quiet-list">
            {abilities.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="method" id="method" aria-label="方法说明" role="region">
          <div className="method-line">
            {proof.map(([title, text]) => (
              <article key={title}>
                <span>{title}</span>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="closing" aria-label="开始体验" role="region">
          <p>命不是判决书。</p>
          <h2>它更像一张地图。</h2>
          <a className="primary-btn" href="#reading">开始第一张命盘卡</a>
        </section>
      </main>
    </>
  );
}
