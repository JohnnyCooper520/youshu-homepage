import { useEffect, useState } from "react";

const languageOptions = [
  { value: "zh-CN", label: "简体中文" },
  { value: "zh-TW", label: "繁體中文" },
  { value: "en", label: "English" },
];

const focusIds = ["career", "relationship", "emotion", "money"];
const entryModeIds = ["bazi", "annual", "question"];
const reportStorageKey = "youshu:last-report";

const copy = {
  "zh-CN": {
    brandHome: "有数首页",
    brandSmall: "东方命理人生顾问",
    navLabel: "主导航",
    nav: ["命盘", "问事", "今年运势", "会员", "方法"],
    navHrefs: ["#reading", "#products", "#products", "#membership", "#method"],
    account: "我的报告",
    heroRegion: "首页主视觉",
    heroSubtitle: "命盘有数，选择有光",
    heroLede: "先看格局，再看选择。心里有数，路就不乱。",
    primaryCta: "先看一盘",
    servicesCta: "看产品",
    orbLabel: "旋转阴阳动效",
    readingRegion: "先行洞察",
    readingKicker: "先行洞察",
    readingTitle: "先起一盘，看你此刻的气口。",
    readingText: "不急着要答案。先看这件事，在你的命盘里落在哪里。",
    generateBazi: "生成命盘报告",
    generateAnnual: "生成今年运势",
    askQuestion: "问事解惑",
    entryModeLabel: "选择服务",
    entryModes: {
      bazi: {
        title: "命盘报告",
        eyebrow: "先知己",
        summary: "看性格底色、用力方式与关系惯性。",
        focusLabel: "想看的方向",
        action: "生成命盘报告",
        previewTitle: "先知己，心不乱",
        previewText: "先把自己的底色看清，再谈选择。",
        tags: ["性格底色", "用力方式", "关系惯性"],
      },
      annual: {
        title: "今年运势",
        eyebrow: "看一年",
        summary: "从起盘日起，向后看完整 12 个月。",
        focusLabel: "今年重点",
        action: "生成今年运势",
        previewTitle: "先看眼前，再看一年里的转折",
        previewText: "不按自然年切开，而是从此刻往后看。",
        tags: ["未来十二月", "转折窗口", "避让处"],
      },
      question: {
        title: "问事解惑",
        eyebrow: "问一事",
        summary: "把一件具体的事拆清趋势、风险和下一步。",
        focusLabel: "问事方向",
        action: "生成问事解惑",
        previewTitle: "事到眼前，先辨轻重",
        previewText: "问题越具体，判断越能落到下一步。",
        tags: ["趋势", "风险边界", "下一步"],
      },
    },
    birthPlace: "出生地",
    gender: "性别",
    male: "男",
    female: "女",
    questionLabel: "想问的事",
    questionPlaceholder: "例如：接下来半年适合换工作吗？",
    generating: "正在起盘",
    generatingText: "先定四柱，再把话说清。",
    generatingSteps: ["校准出生信息", "推演命盘结构", "整理报告重点"],
    generatedTitle: "生成结果",
    reportReady: "报告已成",
    reportPillars: "四柱",
    reportFootnote: "以下内容基于确定性排盘与有数规则生成，仅作选择参考。",
    reportPageRegion: "报告详情",
    reportPageKicker: "我的报告",
    reportPageTitle: "这份报告，单独慢慢看。",
    reportPageText: "首页负责起盘，报告页负责沉下来看判断。日后接入账号后，这里会进入你的历史报告。",
    reportBackHome: "回到首页",
    noReportTitle: "还没有可查看的报告",
    noReportText: "先回首页起一盘，生成后会自动来到这里。",
    birthDate: "出生日期",
    birthTime: "出生时辰",
    currentFocus: "当前关注",
    timeOptions: ["子时 23:00-01:00", "卯时 05:00-07:00", "午时 11:00-13:00", "酉时 17:00-19:00", "亥时 21:00-23:00"],
    readings: {
      career: { option: "事业机会", title: "远方贵人，晚成之局", tags: ["先稳后起", "远方贵人", "蓄势换挡"], line: "机会未必在眼前。先把本事养稳，贵人才看得见你。" },
      relationship: { option: "感情关系", title: "慢热深情，先立边界", tags: ["慢热", "重承诺", "后知后觉"], line: "你不是不会爱，是要等一个让你安心的人。" },
      emotion: { option: "内耗与情绪", title: "心思重，责任也重", tags: ["思虑深", "责任重", "独自消化"], line: "事不一定难，难的是你总想一个人扛完。" },
      money: { option: "财务选择", title: "财来得慢，守得住才久", tags: ["慢热财", "重判断", "忌冲动"], line: "不怕慢，就怕心急时把节奏交出去。" },
    },
    productsRegion: "购买选择",
    purchaseLabel: "购买项目",
    productKicker: "购买选择",
    productTitle: "单次解读与全年会员，都在这里选。",
    badges: { single: "单次", featured: "主推", member: "会员" },
    prices: {
      basic: { cny: "人民币 ¥29.9", usd: "USD $4.2" },
      annual: { cny: "人民币 ¥199", usd: "USD $28" },
      membership: { cny: "人民币 ¥299/年", usd: "USD $42/year" },
    },
    products: [
      { title: "命盘报告", question: "先知己，再谈选择。", priceKey: "basic", action: "生成命盘报告" },
      { title: "问事解惑", question: "事到眼前，先辨轻重。", priceKey: "basic", action: "生成问事解惑" },
      { title: "今年运势解读", question: "起盘日起，向后看完整 12 个月。", priceKey: "annual", action: "看今年运势" },
    ],
    annualMembership: { title: "年度会员", question: "常看、常问、常复盘，都归入一处。", priceKey: "membership", action: "开通年度会员" },
    annualLabel: "今年运势 · 起盘日起算",
    annualTitle: "先看眼前，再看一年里的转折。",
    annualText: "不是按自然年切一刀，而是从你起盘这一刻，向后看完整十二个月。眼前怎么稳，后面哪里换挡，一并放进同一条路里。",
    timelineLabel: "未来十二月",
    coverageLabel: "报告区间",
    coverageValue: "起盘日起 · 向后完整 12 个月",
    annualTimeline: [["起盘当月", "先看眼前气口。"], ["近三个月", "辨机会先后。"], ["未来半年", "看转折窗口。"], ["未来十二月", "把起伏收成一条路。"]],
    memberLabel: "年度会员 · 长期权益",
    memberTitle: "常看的人，把判断养成自己的底气。",
    memberText: "会员不是另一套产品，而是把上面的解读、追问和归档合在一起。日后再问，不必从头来过。",
    memberBenefitsLabel: "年度会员包含",
    memberBenefits: [["命盘报告", "1 份", "完整底盘"], ["今年运势", "1 份", "未来 12 个月"], ["问事解惑", "12 次/年", "每月可问"], ["月度趋势", "12 期", "按月更新"], ["专属追问", "12 次/年", "接着问清"], ["历史归档", "长期", "报告留存"]],
    sampleRegion: "产品预览样例",
    sampleKicker: "判断样本",
    sampleTitle: "话不必多，先说中要害。",
    previews: [["命盘报告", "先知己，心不乱", "性格底色、用力方式、关系惯性"], ["问事解惑", "此事宜稳，不宜跳", "趋势、风险、下一步"], ["今年运势", "近守远换", "未来十二月、机会、避让处"]],
    methodRegion: "方法说明",
    methodKicker: "为什么值得信任",
    methodTitle: "盘先算准，话才说得稳。",
    proof: [["确定性排盘", "出生时间先入盘，先把底座算准。"], ["顾问规则", "老师定规则，表达不越界。"], ["清晰诠释", "把术语翻成能用的话。"], ["一致性记录", "同一张盘，前后判断不打架。"]],
    closingRegion: "我的报告入口",
    closingText: "命盘、问事、今年运势，都会归进我的报告。",
    closingTitle: "先看一眼，再决定往哪一层深入。",
    backToReading: "回到起盘入口",
    viewProducts: "查看购买选择",
  },
  "zh-TW": {
    brandHome: "有數首頁",
    brandSmall: "東方命理人生顧問",
    navLabel: "主導覽",
    nav: ["命盤", "問事", "今年運勢", "會員", "方法"],
    navHrefs: ["#reading", "#products", "#products", "#membership", "#method"],
    account: "我的報告",
    heroRegion: "首頁主視覺",
    heroSubtitle: "命盤有數，選擇有光",
    heroLede: "先看格局，再看選擇。心裡有數，路就不亂。",
    primaryCta: "先看一盤",
    servicesCta: "看產品",
    orbLabel: "旋轉陰陽動效",
    readingRegion: "先行洞察",
    readingKicker: "先行洞察",
    readingTitle: "先起一盤，看你此刻的氣口。",
    readingText: "不急著要答案。先看這件事，在你的命盤裡落在哪裡。",
    generateBazi: "生成命盤報告",
    generateAnnual: "生成今年運勢",
    askQuestion: "問事解惑",
    entryModeLabel: "選擇服務",
    entryModes: {
      bazi: {
        title: "命盤報告",
        eyebrow: "先知己",
        summary: "看性格底色、用力方式與關係慣性。",
        focusLabel: "想看的方向",
        action: "生成命盤報告",
        previewTitle: "先知己，心不亂",
        previewText: "先把自己的底色看清，再談選擇。",
        tags: ["性格底色", "用力方式", "關係慣性"],
      },
      annual: {
        title: "今年運勢",
        eyebrow: "看一年",
        summary: "從起盤日起，向後看完整 12 個月。",
        focusLabel: "今年重點",
        action: "生成今年運勢",
        previewTitle: "先看眼前，再看一年裡的轉折",
        previewText: "不按自然年切開，而是從此刻往後看。",
        tags: ["未來十二月", "轉折窗口", "避讓處"],
      },
      question: {
        title: "問事解惑",
        eyebrow: "問一事",
        summary: "把一件具體的事拆清趨勢、風險和下一步。",
        focusLabel: "問事方向",
        action: "生成問事解惑",
        previewTitle: "事到眼前，先辨輕重",
        previewText: "問題越具體，判斷越能落到下一步。",
        tags: ["趨勢", "風險邊界", "下一步"],
      },
    },
    birthPlace: "出生地",
    gender: "性別",
    male: "男",
    female: "女",
    questionLabel: "想問的事",
    questionPlaceholder: "例如：接下來半年適合換工作嗎？",
    generating: "正在起盤",
    generatingText: "先定四柱，再把話說清。",
    generatingSteps: ["校準出生資訊", "推演命盤結構", "整理報告重點"],
    generatedTitle: "生成結果",
    reportReady: "報告已成",
    reportPillars: "四柱",
    reportFootnote: "以下內容基於確定性排盤與有數規則生成，僅作選擇參考。",
    reportPageRegion: "報告詳情",
    reportPageKicker: "我的報告",
    reportPageTitle: "這份報告，單獨慢慢看。",
    reportPageText: "首頁負責起盤，報告頁負責沉下來看判斷。日後接入帳號後，這裡會進入你的歷史報告。",
    reportBackHome: "回到首頁",
    noReportTitle: "還沒有可查看的報告",
    noReportText: "先回首頁起一盤，生成後會自動來到這裡。",
    birthDate: "出生日期",
    birthTime: "出生時辰",
    currentFocus: "當前關注",
    timeOptions: ["子時 23:00-01:00", "卯時 05:00-07:00", "午時 11:00-13:00", "酉時 17:00-19:00", "亥時 21:00-23:00"],
    readings: {
      career: { option: "事業機會", title: "遠方貴人，晚成之局", tags: ["先穩後起", "遠方貴人", "蓄勢換擋"], line: "機會未必在眼前。先把本事養穩，貴人才看得見你。" },
      relationship: { option: "感情關係", title: "慢熱深情，先立邊界", tags: ["慢熱", "重承諾", "後知後覺"], line: "你不是不會愛，是要等一個讓你安心的人。" },
      emotion: { option: "內耗與情緒", title: "心思重，責任也重", tags: ["思慮深", "責任重", "獨自消化"], line: "事不一定難，難的是你總想一個人扛完。" },
      money: { option: "財務選擇", title: "財來得慢，守得住才久", tags: ["慢熱財", "重判斷", "忌衝動"], line: "不怕慢，就怕心急時把節奏交出去。" },
    },
    productsRegion: "購買選擇",
    purchaseLabel: "購買項目",
    productKicker: "購買選擇",
    productTitle: "單次解讀與全年會員，都在這裡選。",
    badges: { single: "單次", featured: "主推", member: "會員" },
    prices: {
      basic: { cny: "人民幣 ¥29.9", usd: "USD $4.2" },
      annual: { cny: "人民幣 ¥199", usd: "USD $28" },
      membership: { cny: "人民幣 ¥299/年", usd: "USD $42/year" },
    },
    products: [
      { title: "命盤報告", question: "先知己，再談選擇。", priceKey: "basic", action: "生成命盤報告" },
      { title: "問事解惑", question: "事到眼前，先辨輕重。", priceKey: "basic", action: "生成問事解惑" },
      { title: "今年運勢解讀", question: "起盤日起，向後看完整 12 個月。", priceKey: "annual", action: "看今年運勢" },
    ],
    annualMembership: { title: "年度會員", question: "常看、常問、常復盤，都歸入一處。", priceKey: "membership", action: "開通年度會員" },
    annualLabel: "今年運勢 · 起盤日起算",
    annualTitle: "先看眼前，再看一年裡的轉折。",
    annualText: "不是按自然年切一刀，而是從你起盤這一刻，向後看完整十二個月。眼前怎麼穩，後面哪裡換擋，一併放進同一條路裡。",
    timelineLabel: "未來十二月",
    coverageLabel: "報告區間",
    coverageValue: "起盤日起 · 向後完整 12 個月",
    annualTimeline: [["起盤當月", "先看眼前氣口。"], ["近三個月", "辨機會先後。"], ["未來半年", "看轉折窗口。"], ["未來十二月", "把起伏收成一條路。"]],
    memberLabel: "年度會員 · 長期權益",
    memberTitle: "常看的人，把判斷養成自己的底氣。",
    memberText: "會員不是另一套產品，而是把上面的解讀、追問和歸檔合在一起。日後再問，不必從頭來過。",
    memberBenefitsLabel: "年度會員包含",
    memberBenefits: [["命盤報告", "1 份", "完整底盤"], ["今年運勢", "1 份", "未來 12 個月"], ["問事解惑", "12 次/年", "每月可問"], ["月度趨勢", "12 期", "按月更新"], ["專屬追問", "12 次/年", "接著問清"], ["歷史歸檔", "長期", "報告留存"]],
    sampleRegion: "產品預覽樣例",
    sampleKicker: "判斷樣本",
    sampleTitle: "話不必多，先說中要害。",
    previews: [["命盤報告", "先知己，心不亂", "性格底色、用力方式、關係慣性"], ["問事解惑", "此事宜穩，不宜跳", "趨勢、風險、下一步"], ["今年運勢", "近守遠換", "未來十二月、機會、避讓處"]],
    methodRegion: "方法說明",
    methodKicker: "為什麼值得信任",
    methodTitle: "盤先算準，話才說得穩。",
    proof: [["確定性排盤", "出生時間先入盤，先把底座算準。"], ["顧問規則", "老師定規則，表達不越界。"], ["清晰詮釋", "把術語翻成能用的話。"], ["一致性記錄", "同一張盤，前後判斷不打架。"]],
    closingRegion: "我的報告入口",
    closingText: "命盤、問事、今年運勢，都會歸進我的報告。",
    closingTitle: "先看一眼，再決定往哪一層深入。",
    backToReading: "回到起盤入口",
    viewProducts: "查看購買選擇",
  },
  en: {
    brandHome: "Youshu home",
    brandSmall: "Eastern metaphysics advisor",
    navLabel: "Main navigation",
    nav: ["Chart", "Ask", "Annual", "Membership", "Method"],
    navHrefs: ["#reading", "#products", "#products", "#membership", "#method"],
    account: "My reports",
    heroRegion: "Hero",
    heroSubtitle: "A clear chart, a clearer choice.",
    heroLede: "Read the pattern first, then decide. When the mind has a number, the path feels less tangled.",
    primaryCta: "Read my chart",
    servicesCta: "View products",
    orbLabel: "Rotating yin-yang motion",
    readingRegion: "First insight",
    readingKicker: "First insight",
    readingTitle: "Open one chart. Read the weather around this moment.",
    readingText: "No need to rush the answer. First see where this matter lands in your chart.",
    generateBazi: "Generate Bazi report",
    generateAnnual: "Generate annual outlook",
    askQuestion: "Ask a question",
    entryModeLabel: "Choose a service",
    entryModes: {
      bazi: {
        title: "Bazi Report",
        eyebrow: "Know yourself",
        summary: "Read temperament, effort style, and relationship habits.",
        focusLabel: "Reading focus",
        action: "Generate Bazi report",
        previewTitle: "Know yourself; the mind steadies",
        previewText: "Read the base pattern first, then decide with more clarity.",
        tags: ["temperament", "effort style", "relationship habits"],
      },
      annual: {
        title: "Annual Outlook",
        eyebrow: "Read the year",
        summary: "From the reading date, look across the next full 12 months.",
        focusLabel: "Annual focus",
        action: "Generate annual outlook",
        previewTitle: "Read what is near, then the turnings of the year",
        previewText: "Not a calendar cut. It reads forward from this moment.",
        tags: ["next 12 months", "turning windows", "what to avoid"],
      },
      question: {
        title: "Question Reading",
        eyebrow: "Ask one thing",
        summary: "Separate one concrete matter into trend, risk, and next step.",
        focusLabel: "Question focus",
        action: "Generate question reading",
        previewTitle: "When the matter arrives, weigh it first",
        previewText: "The more concrete the question, the more usable the answer.",
        tags: ["trend", "risk boundary", "next step"],
      },
    },
    birthPlace: "Birth place",
    gender: "Gender",
    male: "Male",
    female: "Female",
    questionLabel: "Question",
    questionPlaceholder: "Example: Should I change jobs in the next six months?",
    generating: "Reading the chart",
    generatingText: "First fix the pillars, then make the words usable.",
    generatingSteps: ["Check birth data", "Map the chart structure", "Shape the report"],
    generatedTitle: "Generated result",
    reportReady: "Report ready",
    reportPillars: "Pillars",
    reportFootnote: "Generated from deterministic chart calculation and Youshu guidance rules. Use as decision support.",
    reportPageRegion: "Report detail",
    reportPageKicker: "My report",
    reportPageTitle: "A full report deserves its own page.",
    reportPageText: "The homepage opens the chart. The report page is where the reading can breathe. Once accounts are connected, this becomes report history.",
    reportBackHome: "Back home",
    noReportTitle: "No report yet",
    noReportText: "Return home and open a chart first. The report will appear here after generation.",
    birthDate: "Birth date",
    birthTime: "Birth hour",
    currentFocus: "Current focus",
    timeOptions: ["Zi hour 23:00-01:00", "Mao hour 05:00-07:00", "Wu hour 11:00-13:00", "You hour 17:00-19:00", "Hai hour 21:00-23:00"],
    readings: {
      career: { option: "Career opportunity", title: "Help comes from afar; timing matures late", tags: ["steady first", "distant ally", "shift after storing strength"], line: "The opening may not be right in front of you. Build your craft first; the right people notice steadiness." },
      relationship: { option: "Relationships", title: "Slow to warm, deep once settled", tags: ["slow warmth", "serious promise", "late realization"], line: "It is not that you cannot love. You need a person who lets your guard rest." },
      emotion: { option: "Overthinking", title: "A heavy mind, and a heavy sense of duty", tags: ["deep thought", "responsibility", "quiet digestion"], line: "The matter may not be hard. The hard part is always trying to carry it alone." },
      money: { option: "Money choices", title: "Money comes slowly; what stays is what matters", tags: ["slow wealth", "clear judgment", "avoid impulse"], line: "Slow is not the issue. The risk is handing away your rhythm when you get anxious." },
    },
    productsRegion: "Purchase options",
    purchaseLabel: "Purchase items",
    productKicker: "Purchase options",
    productTitle: "Choose a single reading, or keep the whole year in one account.",
    badges: { single: "single", featured: "recommended", member: "member" },
    prices: {
      basic: { cny: "RMB ¥29.9", usd: "USD $4.2" },
      annual: { cny: "RMB ¥199", usd: "USD $28" },
      membership: { cny: "RMB ¥299/year", usd: "USD $42/year" },
    },
    products: [
      { title: "Bazi Report", question: "Know yourself before you choose.", priceKey: "basic", action: "Generate bazi report" },
      { title: "Question Reading", question: "When the matter arrives, weigh it first.", priceKey: "basic", action: "Generate question reading" },
      { title: "Annual Outlook", question: "From the reading date, look across the next 12 months.", priceKey: "annual", action: "Read annual outlook" },
    ],
    annualMembership: { title: "Annual Membership", question: "For people who read, ask, and revisit often.", priceKey: "membership", action: "Start membership" },
    annualLabel: "Annual outlook · from reading date",
    annualTitle: "Read what is near, then the turnings of the year.",
    annualText: "This is not cut by the calendar year. It starts from the moment you open the chart and looks across a full twelve months: what to steady now, and where the later shift may come.",
    timelineLabel: "Next twelve months",
    coverageLabel: "Report range",
    coverageValue: "From reading date · full next 12 months",
    annualTimeline: [["Current month", "Read the immediate weather."], ["Next three months", "See the order of chances."], ["Next half year", "Find the turning windows."], ["Full twelve months", "Gather the rises and falls into one road."]],
    memberLabel: "Annual membership · long-term access",
    memberTitle: "Return often, and judgment becomes steadier.",
    memberText: "Membership is not another product. It keeps the readings, follow-ups, and archive together, so the next question does not start from zero.",
    memberBenefitsLabel: "Annual membership includes",
    memberBenefits: [["Bazi Report", "1", "full base chart"], ["Annual Outlook", "1", "next 12 months"], ["Question Reading", "12/year", "monthly question"], ["Monthly Trend", "12 issues", "updated monthly"], ["Follow-up", "12/year", "ask further"], ["Archive", "long-term", "reports saved"]],
    sampleRegion: "Product samples",
    sampleKicker: "Reading samples",
    sampleTitle: "Few words. The point first.",
    previews: [["Bazi Report", "Know yourself; the mind steadies", "temperament, effort style, relationship habits"], ["Question Reading", "This matter asks for steadiness", "trend, risk, next step"], ["Annual Outlook", "Hold near, shift far", "next twelve months, chances, things to avoid"]],
    methodRegion: "Method",
    methodKicker: "Why it earns trust",
    methodTitle: "The chart is calculated first; only then should the words be steady.",
    proof: [["Deterministic chart", "Birth data enters the chart before interpretation."], ["Advisor rules", "Human rules set the boundary for expression."], ["Clear interpretation", "Technical terms become usable language."], ["Consistency memory", "The same chart should not contradict itself later."]],
    closingRegion: "My reports entry",
    closingText: "Charts, questions, and annual outlooks all return to My reports.",
    closingTitle: "Read a little first, then decide how deep to go.",
    backToReading: "Back to chart entry",
    viewProducts: "View purchase options",
  },
};

function YinYangOrb({ label }) {
  return (
    <div className="orb-stage" aria-label={label}>
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

function ReportBody({ content }) {
  if (!content) {
    return null;
  }

  const sections = [];
  let current = { heading: "", lines: [] };

  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const heading = line.match(/^#{1,4}\s+(.+)$/);

      if (heading) {
        if (current.heading || current.lines.length) {
          sections.push(current);
        }
        current = { heading: heading[1], lines: [] };
        return;
      }

      current.lines.push(line.replace(/^[-*]\s+/, ""));
    });

  if (current.heading || current.lines.length) {
    sections.push(current);
  }

  return (
    <div className="report-body">
      {sections.map((section, sectionIndex) => (
        <section className="report-block" key={`${section.heading}-${sectionIndex}`}>
          {section.heading ? <h4>{section.heading}</h4> : null}
          {section.lines.map((line, lineIndex) => (
            <p key={`${section.heading}-${lineIndex}`}>{line}</p>
          ))}
        </section>
      ))}
    </div>
  );
}

function getStoredReport() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.sessionStorage.getItem(reportStorageKey);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getCurrentPage() {
  if (typeof window === "undefined") {
    return "home";
  }

  return window.location.pathname === "/report" ? "report" : "home";
}

function getDisplayPrice(price, language) {
  return language === "en" ? price.usd : price.cny;
}

function ReportPage({ t, report, onBackHome }) {
  return (
    <main className="report-page" lang={report?.language || undefined}>
      <section className="report-hero" aria-label={t.reportPageRegion} role="region">
        <div className="report-hero-copy">
          <p className="kicker">{t.reportPageKicker}</p>
          <h1>{report ? t.reportPageTitle : t.noReportTitle}</h1>
          <p>{report ? t.reportPageText : t.noReportText}</p>
          <button className="primary-btn" type="button" onClick={onBackHome}>
            {t.reportBackHome}
          </button>
        </div>
        <article className="generated-report report-page-card" aria-label={t.generatedTitle}>
          {report ? (
            <>
              <header className="report-heading">
                <span>{t.reportReady}</span>
                <h2>{report.title}</h2>
                {report.paipan ? (
                  <p className="report-meta">
                    <strong>{t.reportPillars}</strong>
                    {report.paipan.pillars.year.value} · {report.paipan.pillars.month.value} · {report.paipan.pillars.day.value} · {report.paipan.pillars.hour.value}
                  </p>
                ) : null}
              </header>
              <ReportBody content={report.content} />
              <p className="report-footnote">{t.reportFootnote}</p>
            </>
          ) : (
            <div className="empty-report">
              <h2>{t.noReportTitle}</h2>
              <p>{t.noReportText}</p>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default function App() {
  const [language, setLanguage] = useState("zh-CN");
  const [focus, setFocus] = useState("career");
  const [birthDate, setBirthDate] = useState("1988-01-14");
  const [birthTime, setBirthTime] = useState("11:25");
  const [gender, setGender] = useState("male");
  const [birthPlace, setBirthPlace] = useState("长春");
  const [question, setQuestion] = useState("");
  const [entryMode, setEntryMode] = useState("bazi");
  const [report, setReport] = useState(getStoredReport);
  const [page, setPage] = useState(getCurrentPage);
  const [isGenerating, setIsGenerating] = useState(false);
  const t = copy[language];
  const activeEntry = t.entryModes[entryMode];
  const featuredProduct = t.products[2];
  const purchaseOptions = [...t.products, t.annualMembership];

  useEffect(() => {
    function handlePopState() {
      setPage(getCurrentPage());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(path) {
    window.history.pushState({}, "", path);
    setPage(path === "/report" ? "report" : "home");
    if (!window.navigator.userAgent.includes("jsdom")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function storeAndOpenReport(nextReport) {
    setReport(nextReport);
    window.sessionStorage.setItem(reportStorageKey, JSON.stringify(nextReport));
    navigate("/report");
  }

  async function generate() {
    setIsGenerating(true);
    setReport(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: entryMode,
          language,
          birthDate,
          birthTime,
          gender,
          birthPlace,
          focus: t.readings[focus].option,
          question,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        storeAndOpenReport({ title: t.generatedTitle, content: json.error || "生成失败", language });
        return;
      }
      storeAndOpenReport({
        title: t.generatedTitle,
        content: json.content,
        paipan: json.paipan,
        language,
        type: entryMode,
      });
    } catch (error) {
      storeAndOpenReport({ title: t.generatedTitle, content: error.message, language });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label={t.brandHome}>
          <span className="brand-mark">有</span>
          <span>
            <strong>有数</strong>
            <small>{t.brandSmall}</small>
          </span>
        </a>
        <nav aria-label={t.navLabel}>
          {t.nav.map((item, index) => (
            <a href={t.navHrefs[index]} key={item}>
              {item}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <label className="language-switch">
            <span>语言 / Language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {languageOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <a className="account-link" href="#account">{t.account}</a>
        </div>
      </header>

      {page === "report" ? (
        <ReportPage t={t} report={report} onBackHome={() => navigate("/")} />
      ) : (
      <main id="top" lang={language}>
        <section className="hero" aria-label={t.heroRegion} role="region">
          <div className="hero-copy">
            <h1>有数</h1>
            <p className="hero-subtitle">{t.heroSubtitle}</p>
            <p className="hero-lede">{t.heroLede}</p>
            <div className="hero-actions">
              <a className="primary-btn" href="#reading">{t.primaryCta}</a>
              <a className="text-btn" href="#products">{t.servicesCta}</a>
            </div>
          </div>
          <div className="hero-visual compact">
            <YinYangOrb label={t.orbLabel} />
          </div>
        </section>

        <section className="reading" id="reading" aria-label={t.readingRegion} role="region">
          <div className="section-copy">
            <p className="kicker">{t.readingKicker}</p>
            <h2>{t.readingTitle}</h2>
            <p>{t.readingText}</p>
          </div>
          <div className="reading-panel">
            <div className="mode-switcher" aria-label={t.entryModeLabel}>
              {entryModeIds.map((modeId) => {
                const mode = t.entryModes[modeId];

                return (
                  <button
                    className="mode-option"
                    type="button"
                    aria-pressed={entryMode === modeId}
                    key={modeId}
                    onClick={() => setEntryMode(modeId)}
                  >
                    <span>{mode.eyebrow}</span>
                    <strong>{mode.title}</strong>
                    <em>{mode.summary}</em>
                  </button>
                );
              })}
            </div>

            <form className={`birth-form ${entryMode === "question" ? "with-question" : ""}`}>
              <label>
                {t.birthDate}
                <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
              </label>
              <label>
                {t.birthTime}
                <input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} />
              </label>
              <label>
                {t.birthPlace}
                <input value={birthPlace} onChange={(event) => setBirthPlace(event.target.value)} />
              </label>
              <label>
                {t.gender}
                <select value={gender} onChange={(event) => setGender(event.target.value)}>
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                </select>
              </label>
              <label>
                {activeEntry.focusLabel}
                <select value={focus} onChange={(event) => setFocus(event.target.value)}>
                  {focusIds.map((item) => (
                    <option value={item} key={item}>
                      {t.readings[item].option}
                    </option>
                  ))}
                </select>
              </label>
              {entryMode === "question" ? (
                <label className="question-field">
                  {t.questionLabel}
                  <textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder={t.questionPlaceholder}
                  />
                </label>
              ) : null}
              <div className="form-submit api-actions single-action" aria-live="polite">
                <button type="button" onClick={generate} disabled={isGenerating}>
                  {activeEntry.action}
                </button>
              </div>
            </form>

            {isGenerating ? (
              <div className="insight-stage" id="reading-result" aria-live="polite">
                <article className="loading-report" aria-label={t.generating}>
                  <div className="loading-oracle" aria-hidden="true">
                    <span />
                    <i />
                  </div>
                  <div>
                    <h3>{t.generating}</h3>
                    <p>{t.generatingText}</p>
                    <ol>
                      {t.generatingSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </article>
              </div>
            ) : null}
          </div>
        </section>

        <section className="product-section" id="products" aria-label={t.productsRegion} role="region">
          <div className="section-copy narrow">
            <p className="kicker">{t.productKicker}</p>
            <h2>{t.productTitle}</h2>
          </div>
          <div className="service-board">
            <div className="service-choices" aria-label={t.purchaseLabel}>
              {purchaseOptions.map((product) => {
                const price = t.prices[product.priceKey];
                const displayPrice = getDisplayPrice(price, language);
                const isFeatured = product.title === featuredProduct.title;
                const isMembership = product.title === t.annualMembership.title;

                return (
                  <article
                    className={`service-choice ${isFeatured ? "featured" : ""} ${
                      isMembership ? "membership-choice" : ""
                    }`}
                    key={product.title}
                  >
                    <span>{isMembership ? t.badges.member : isFeatured ? t.badges.featured : t.badges.single}</span>
                    <strong className="dual-price single-price" aria-label={displayPrice}>
                      <span>{displayPrice}</span>
                    </strong>
                    <h3>{product.title}</h3>
                    <p>{product.question}</p>
                    <a href={isMembership ? "#membership" : "#reading"}>{product.action}</a>
                  </article>
                );
              })}
            </div>

            <div className="service-detail-grid">
              <article className="service-feature annual-detail">
                <div className="service-feature-copy">
                  <span className="service-label">{t.annualLabel}</span>
                  <h3>{t.annualTitle}</h3>
                  <p>{t.annualText}</p>
                </div>
                <div className="timeline-preview" aria-label={t.timelineLabel}>
                  <div className="coverage-note">
                    <span>{t.coverageLabel}</span>
                    <strong>{t.coverageValue}</strong>
                  </div>
                  {t.annualTimeline.map(([season, text]) => (
                    <div className="timeline-row" key={season}>
                      <strong>{season}</strong>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
                <a href="#reading">{featuredProduct.action}</a>
              </article>

              <article className="service-feature membership-detail" id="membership">
                <div className="service-feature-copy">
                  <span className="service-label member-service-label">{t.memberLabel}</span>
                  <h3>{t.memberTitle}</h3>
                  <p>{t.memberText}</p>
                </div>
                <div className="membership-benefits inline-benefits" aria-label={t.memberBenefitsLabel}>
                  {t.memberBenefits.map(([title, amount, note]) => (
                    <div className="membership-benefit" key={title}>
                      <span>{title}</span>
                      <strong>{amount}</strong>
                      <em>{note}</em>
                    </div>
                  ))}
                </div>
                <a href="#products">{t.annualMembership.action}</a>
              </article>
            </div>
          </div>
        </section>

        <section className="sample-report" aria-label={t.sampleRegion} role="region">
          <div className="section-copy narrow">
            <p className="kicker">{t.sampleKicker}</p>
            <h2>{t.sampleTitle}</h2>
          </div>
          <div className="preview-grid">
            {t.previews.map(([title, visible, locked]) => (
              <article key={title}>
                <span>{title}</span>
                <h3>{visible}</h3>
                <p>{locked}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="method" id="method" aria-label={t.methodRegion} role="region">
          <div className="section-copy narrow">
            <p className="kicker">{t.methodKicker}</p>
            <h2>{t.methodTitle}</h2>
          </div>
          <div className="method-line">
            {t.proof.map(([title, text]) => (
              <article key={title}>
                <span>{title}</span>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="closing" id="account" aria-label={t.closingRegion} role="region">
          <p>{t.closingText}</p>
          <h2>{t.closingTitle}</h2>
          <div className="hero-actions center">
            <a className="primary-btn" href="#reading">{t.backToReading}</a>
            <a className="text-btn" href="#products">{t.viewProducts}</a>
          </div>
        </section>
      </main>
      )}
    </>
  );
}
