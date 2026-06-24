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

const products = [
  {
    title: "命盘报告",
    question: "我是谁，我的底层模式是什么？",
    preview: "先行洞察呈现命盘关键词与核心性格判断。",
    unlocked: "完整报告包含性格底色、事业节奏、关系惯性与阶段提醒。",
    price: "¥29.9",
    action: "查看完整命盘",
  },
  {
    title: "问事解惑",
    question: "这件事我该怎么判断？",
    preview: "先行洞察识别问题象限与一条趋势提醒。",
    unlocked: "完整分析包含趋势判断、风险边界、下一步建议与追问空间。",
    price: "¥29.9",
    action: "获取问事建议",
  },
  {
    title: "今年运势解读",
    question: "这一年我该怎么走？",
    preview: "先行洞察呈现年度关键词与关键季度提醒。",
    unlocked: "完整分析包含年度趋势、月份节奏、事业/感情/财务建议。",
    price: "¥199",
    action: "查看年度路径",
  },
];

const previews = [
  ["命盘报告", "稳中求进的蓄势盘", "继续查看性格底色、事业节奏与关系惯性"],
  ["问事解惑", "这件事不急着做跳跃决定", "继续查看趋势判断、风险边界与下一步建议"],
  ["今年运势", "上半年蓄势，下半年换挡", "继续查看月份节奏、关键机会与回避事项"],
];

const memberPillars = [
  ["全年趋势跟踪", "把年度、月度和关键节点放在同一个时间轴里看。"],
  ["问事额度", "遇到具体选择时，不必每次重新开始说明背景。"],
  ["历史报告归档", "命盘、年度分析和问事记录会沉淀成个人档案。"],
];

const memberGroups = [
  ["完整分析", ["命盘报告", "今年运势解读"]],
  ["持续陪伴", ["每月趋势更新", "问事解惑额度"]],
  ["账户资产", ["历史报告长期保存", "会员专属追问"]],
];

const proof = [
  ["确定性排盘", "出生时间先进入程序计算，不让 AI 猜四柱、大运和流年。"],
  ["顾问规则", "命理顾问把判断链固化成规则，减少泛泛冷读。"],
  ["AI 诠释", "最后才用 AI 把术语翻译成现代人看得懂的话。"],
  ["一致性记录", "同一张盘的关键判断会被保存，复问时不自相矛盾。"],
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
          <a href="#reading">命盘</a>
          <a href="#products">问事</a>
          <a href="#products">今年运势</a>
          <a href="#membership">会员</a>
          <a href="#method">方法</a>
        </nav>
        <a className="account-link" href="#account">我的报告</a>
      </header>

      <main id="top">
        <section className="hero" aria-label="首页主视觉" role="region">
          <div className="hero-copy">
            <p className="kicker">东方命理 AI 人生顾问</p>
            <h1>有数</h1>
            <p className="hero-subtitle">命盘有数，选择有光</p>
            <p className="hero-lede">
              用一段先行洞察校准命盘倾向；若它贴近你的处境，再进入完整命盘、问事分析或年度路径。
            </p>
            <div className="hero-actions">
              <a className="primary-btn" href="#reading">生成先行洞察</a>
              <a className="text-btn" href="#products">选择深入方向</a>
            </div>
          </div>
          <div className="hero-visual compact">
            <YinYangOrb />
          </div>
        </section>

        <section className="reading" id="reading" aria-label="先行洞察" role="region">
          <div className="section-copy">
            <p className="kicker">先行洞察</p>
            <h2>先校准方向，再选择深入到哪一层。</h2>
            <p>
              有数会先呈现可感知的命盘倾向与关键提醒；你可以据此选择完整命盘、问事分析或年度路径。
            </p>
            <div className="hero-actions section-actions">
              <a className="primary-btn" href="#reading-result">生成先行洞察</a>
              <a className="text-btn" href="#products">选择深入方向</a>
            </div>
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

            <article className="result-card preview-card" id="reading-result" aria-live="polite">
              <span className="card-label">有数 · 命盘关键词</span>
              <h3>{reading.title}</h3>
              <p>{reading.line}</p>
              <ul>
                {reading.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <div className="locked-strip">
                <span>完整命盘、年度节奏与追问建议，可在深度分析中继续查看</span>
              </div>
            </article>
          </div>
        </section>

        <section className="product-section" id="products" aria-label="三项服务" role="region">
          <div className="section-copy narrow">
            <p className="kicker">三项服务</p>
            <h2>按你此刻的问题，选择对应的判断深度。</h2>
          </div>
          <div className="product-gates">
            {products.map((product) => (
              <article key={product.title}>
                <span>{product.question}</span>
                <strong>{product.price}</strong>
                <h3>{product.title}</h3>
                <p>{product.preview}</p>
                <p>{product.unlocked}</p>
                <a href="#reading">{product.action}</a>
              </article>
            ))}
          </div>
        </section>

        <section className="sample-report" aria-label="产品预览样例" role="region">
          <div className="section-copy narrow">
            <p className="kicker">判断样本</p>
            <h2>先看到方向，再进入完整分析。</h2>
          </div>
          <div className="preview-grid">
            {previews.map(([title, visible, locked]) => (
              <article key={title}>
                <span>{title}</span>
                <h3>{visible}</h3>
                <p>{locked}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="membership" id="membership" aria-label="年度会员" role="region">
          <div className="membership-copy">
            <p className="kicker">年度会员</p>
            <h2>把命盘、问事与年度节奏，放进一个长期账户。</h2>
            <p>
              适合持续看趋势、经常问事、希望保存历史报告的人。会员不是第四项服务，而是把有数变成长期顾问。
            </p>
            <div className="membership-points">
              {memberPillars.map(([title, text]) => (
                <article key={title}>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </article>
              ))}
            </div>
          </div>
          <article className="membership-card">
            <span className="membership-label">有数会员</span>
            <strong>¥299 / 年</strong>
            <p>适合持续使用有数的人</p>
            <div className="membership-groups">
              {memberGroups.map(([title, items]) => (
                <div className="membership-group" key={title}>
                  <h3>{title}</h3>
                  <ul>
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <a className="primary-btn membership-cta" href="#account">开通年度会员</a>
          </article>
        </section>

        <section className="method" id="method" aria-label="方法说明" role="region">
          <div className="section-copy narrow">
            <p className="kicker">为什么值得信任</p>
            <h2>排盘、解盘、表达分层，先把事实算准，再让语言有用。</h2>
          </div>
          <div className="method-line">
            {proof.map(([title, text]) => (
              <article key={title}>
                <span>{title}</span>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="closing" id="account" aria-label="我的报告入口" role="region">
          <p>我的报告会保存命盘、问事记录、今年运势和会员权益。</p>
          <h2>先生成一段先行洞察，再选择要深入的层级。</h2>
          <div className="hero-actions center">
            <a className="primary-btn" href="#reading">生成先行洞察</a>
            <a className="text-btn" href="#membership">查看年度会员</a>
          </div>
        </section>
      </main>
    </>
  );
}
