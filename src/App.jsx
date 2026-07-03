import { useEffect, useState } from "react";
import { getSupabaseClient } from "./lib/supabaseClient.js";
import { loadCloudReports, saveCloudReport } from "./lib/reportStore.js";

const languageOptions = [
  { value: "zh-CN", label: "简体中文" },
  { value: "zh-TW", label: "繁體中文" },
  { value: "en", label: "English" },
];

const focusIds = ["career", "relationship", "emotion", "money"];
const entryModeIds = ["bazi", "annual", "question"];
const legalPageIds = ["terms", "privacy", "refund", "contact"];
const reportStorageKey = "youshu:last-report";
const reportArchiveStorageKey = "youshu:reports";
const maxStoredReports = 30;
const companyNameZh = "北京一叶泛舟文化科技有限公司";
const companyNameEn = "Beijing Yiye Fanzhou Culture Technology Co., Ltd.";
const supportEmail = "qinyuneo@gmail.com";

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
    reportGeneratedAt: "生成于",
    reportBirthInfo: "出生信息",
    reportFocusInfo: "关注方向",
    reportQuestionInfo: "所问之事",
    reportsPageRegion: "报告归档",
    reportsPageKicker: "我的报告",
    reportsPageTitle: "我的报告",
    reportsPageText: "生成过的命盘、问事和今年运势，都会归在这里。日后再看，不必从头来过。",
    reportsCount: "份报告",
    reportsEmptyTitle: "这里还没有报告",
    reportsEmptyText: "先起一盘，报告生成后会自动归档到这里。",
    reportOpenAction: "打开报告",
    reportUnknownType: "有数报告",
    authTitle: "登录后，报告会跟着你走。",
    authText: "当前浏览器会先保存报告。登录后，可把报告留到云端，之后换设备也能找回。",
    authEmailLabel: "邮箱",
    authEmailPlaceholder: "you@example.com",
    authGoogle: "Google 登录",
    authMagicLink: "发送登录链接",
    authSignedIn: "已登录",
    authSignOut: "退出登录",
    authCheckEmail: "登录链接已发送，请检查邮箱。",
    authUnavailable: "云端归档尚未配置，当前先保存到这台设备。",
    authError: "登录暂时没有完成，请稍后再试。",
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
    footerTagline: "有数提供东方命理视角下的自我认知与选择参考。",
    footerDisclaimer: "内容仅供自我认知、情绪整理和选择参考，不构成医疗、法律、投资、心理治疗或其他专业建议。",
    footerAge: "建议 18 岁以上用户使用。",
    footerCompanyLabel: "运营主体",
    footerSupportLabel: "客服邮箱",
    footerLinks: { terms: "服务条款", privacy: "隐私政策", refund: "退款政策", contact: "联系我们" },
    legalBackHome: "回到首页",
    legalUpdated: "更新日期：2026 年 6 月 26 日",
    legalPages: {
      terms: {
        title: "服务条款",
        intro: "使用有数，即表示你理解并同意以下服务边界。本页面为上线测试版条款，正式商业化前可能继续更新。",
        sections: [
          ["服务性质", "有数提供基于确定性排盘、规则化解读与大模型生成的命理报告、问事解读和年度趋势参考。内容用于自我认知、情绪整理和选择辅助，不承诺预测结果必然发生。"],
          ["适用人群", "本服务建议 18 岁以上用户使用。若你正在处理医疗、法律、投资、心理危机或人身安全等高风险事项，请优先咨询合资格专业人士或当地紧急服务。"],
          ["用户责任", "你应提供相对准确的出生日期、出生时间、出生地和问题背景。若输入信息不准确，报告可能偏离你的实际情况。你也应自行判断是否采纳报告建议。"],
          ["数字内容交付", "报告生成后即视为数字内容已交付。当前 P0 阶段可能通过网页会话保存报告，后续接入账户后会支持更稳定的历史归档。"],
          ["禁止用途", "不得将本服务用于违法、骚扰、歧视、操纵他人、医疗诊断、金融承诺或其他高风险决策自动化。"],
          ["变更与联系", `我们可能根据产品测试情况调整页面、价格、权益和条款。如有问题，请联系 ${supportEmail}。`],
        ],
      },
      privacy: {
        title: "隐私政策",
        intro: "我们只收集生成报告所需的信息，并尽量让数据用途清楚、克制。",
        sections: [
          ["我们收集什么", "你主动填写的出生日期、出生时间、出生地、性别、关注方向、具体问题、语言偏好，以及生成报告所需的基础技术信息。"],
          ["如何使用", "这些信息用于排盘、生成报告、改进提示词与服务质量、处理客服请求，以及在接入账户后帮助你找回历史报告。"],
          ["大模型处理", "生成报告时，必要的排盘结果、问题背景和语言选项会发送给我们使用的大模型服务商。我们不会在前端展示或要求用户提交 DeepSeek API Key。"],
          ["保存与删除", "P0 阶段报告可能保存在浏览器会话中；接入账户后会按账户保存。你可以通过客服邮箱请求删除与更正相关信息。"],
          ["第三方服务", "我们可能使用 Vercel 托管、DeepSeek 生成报告，未来可能接入 Supabase、支付服务商和基础分析工具。第三方会按其政策处理必要数据。"],
          ["联系我们", `隐私相关请求请发送至 ${supportEmail}。`],
        ],
      },
      refund: {
        title: "退款政策",
        intro: "命理报告属于按用户输入生成的数字内容。原则上，报告一经生成或交付，不支持无理由退款。",
        sections: [
          ["原则", "已生成、已展示或已发送的命盘报告、问事解惑、年度运势解读，通常不予退款。购买前请确认服务性质为参考性数字内容。"],
          ["可退款或补偿情形", "如发生重复扣款、付款成功但报告未生成、系统故障导致无法交付、明显错误订单，用户可在付款后 7 日内联系处理。我们会根据情况退款、补发或提供等值额度。"],
          ["不支持退款情形", "因个人主观感受不符、对解读结论不满意、输入信息错误、已阅读后改变主意，通常不构成退款理由。"],
          ["会员退款", "年度会员开通后，如已使用任一付费报告、问事额度或会员权益，原则上不支持全额退款。未使用且在 7 日内提出的异常订单可人工评估。"],
          ["处理方式", `退款申请请发送至 ${supportEmail}，并提供付款邮箱、订单时间、购买项目和问题描述。`],
        ],
      },
      contact: {
        title: "联系我们",
        intro: "产品仍在 P0 测试期。报告、订单、退款、隐私和合作问题都可以通过邮箱联系。",
        sections: [
          ["客服邮箱", supportEmail],
          ["运营主体", companyNameZh],
          ["服务范围", "命盘报告、问事解惑、今年运势解读、年度会员与报告归档相关问题。"],
          ["回复时间", "我们会尽量在 2 个工作日内回复。复杂订单、退款或隐私请求可能需要更多时间核对。"],
        ],
      },
    },
    generationErrorTitle: "生成暂时未完成",
    apiErrors: {
      backendKey: "服务端模型配置正在调整，请稍后再试或联系客服。",
      questionRequired: "请先写下你想问的具体事情，再生成问事解惑。",
      default: "生成暂时没有完成，请稍后重试。",
    },
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
    reportGeneratedAt: "生成於",
    reportBirthInfo: "出生資訊",
    reportFocusInfo: "關注方向",
    reportQuestionInfo: "所問之事",
    reportsPageRegion: "報告歸檔",
    reportsPageKicker: "我的報告",
    reportsPageTitle: "我的報告",
    reportsPageText: "生成過的命盤、問事和今年運勢，都會歸在這裡。日後再看，不必從頭來過。",
    reportsCount: "份報告",
    reportsEmptyTitle: "這裡還沒有報告",
    reportsEmptyText: "先起一盤，報告生成後會自動歸檔到這裡。",
    reportOpenAction: "打開報告",
    reportUnknownType: "有數報告",
    authTitle: "登入後，報告會跟著你走。",
    authText: "目前瀏覽器會先保存報告。登入後，可把報告留到雲端，之後換設備也能找回。",
    authEmailLabel: "信箱",
    authEmailPlaceholder: "you@example.com",
    authGoogle: "Google 登入",
    authMagicLink: "發送登入連結",
    authSignedIn: "已登入",
    authSignOut: "退出登入",
    authCheckEmail: "登入連結已發送，請檢查信箱。",
    authUnavailable: "雲端歸檔尚未配置，目前先保存到這台設備。",
    authError: "登入暫時沒有完成，請稍後再試。",
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
    footerTagline: "有數提供東方命理視角下的自我認知與選擇參考。",
    footerDisclaimer: "內容僅供自我認知、情緒整理和選擇參考，不構成醫療、法律、投資、心理治療或其他專業建議。",
    footerAge: "建議 18 歲以上用戶使用。",
    footerCompanyLabel: "營運主體",
    footerSupportLabel: "客服信箱",
    footerLinks: { terms: "服務條款", privacy: "隱私政策", refund: "退款政策", contact: "聯絡我們" },
    legalBackHome: "回到首頁",
    legalUpdated: "更新日期：2026 年 6 月 26 日",
    legalPages: {
      terms: {
        title: "服務條款",
        intro: "使用有數，即表示你理解並同意以下服務邊界。本頁面為上線測試版條款，正式商業化前可能繼續更新。",
        sections: [
          ["服務性質", "有數提供基於確定性排盤、規則化解讀與大模型生成的命理報告、問事解讀和年度趨勢參考。內容用於自我認知、情緒整理和選擇輔助，不承諾預測結果必然發生。"],
          ["適用人群", "本服務建議 18 歲以上用戶使用。若你正在處理醫療、法律、投資、心理危機或人身安全等高風險事項，請優先諮詢合資格專業人士或當地緊急服務。"],
          ["用戶責任", "你應提供相對準確的出生日期、出生時間、出生地和問題背景。若輸入資訊不準確，報告可能偏離你的實際情況。你也應自行判斷是否採納報告建議。"],
          ["數位內容交付", "報告生成後即視為數位內容已交付。當前 P0 階段可能透過網頁會話保存報告，後續接入帳戶後會支持更穩定的歷史歸檔。"],
          ["禁止用途", "不得將本服務用於違法、騷擾、歧視、操縱他人、醫療診斷、金融承諾或其他高風險決策自動化。"],
          ["變更與聯絡", `我們可能根據產品測試情況調整頁面、價格、權益和條款。如有問題，請聯絡 ${supportEmail}。`],
        ],
      },
      privacy: {
        title: "隱私政策",
        intro: "我們只收集生成報告所需的資訊，並盡量讓資料用途清楚、克制。",
        sections: [
          ["我們收集什麼", "你主動填寫的出生日期、出生時間、出生地、性別、關注方向、具體問題、語言偏好，以及生成報告所需的基礎技術資訊。"],
          ["如何使用", "這些資訊用於排盤、生成報告、改進提示詞與服務品質、處理客服請求，以及在接入帳戶後幫助你找回歷史報告。"],
          ["大模型處理", "生成報告時，必要的排盤結果、問題背景和語言選項會發送給我們使用的大模型服務商。我們不會在前端展示或要求用戶提交 DeepSeek API Key。"],
          ["保存與刪除", "P0 階段報告可能保存在瀏覽器會話中；接入帳戶後會按帳戶保存。你可以透過客服信箱請求刪除與更正相關資訊。"],
          ["第三方服務", "我們可能使用 Vercel 託管、DeepSeek 生成報告，未來可能接入 Supabase、支付服務商和基礎分析工具。第三方會按其政策處理必要資料。"],
          ["聯絡我們", `隱私相關請求請發送至 ${supportEmail}。`],
        ],
      },
      refund: {
        title: "退款政策",
        intro: "命理報告屬於按用戶輸入生成的數位內容。原則上，報告一經生成或交付，不支持無理由退款。",
        sections: [
          ["原則", "已生成、已展示或已發送的命盤報告、問事解惑、年度運勢解讀，通常不予退款。購買前請確認服務性質為參考性數位內容。"],
          ["可退款或補償情形", "如發生重複扣款、付款成功但報告未生成、系統故障導致無法交付、明顯錯誤訂單，用戶可在付款後 7 日內聯絡處理。我們會根據情況退款、補發或提供等值額度。"],
          ["不支持退款情形", "因個人主觀感受不符、對解讀結論不滿意、輸入資訊錯誤、已閱讀後改變主意，通常不構成退款理由。"],
          ["會員退款", "年度會員開通後，如已使用任一付費報告、問事額度或會員權益，原則上不支持全額退款。未使用且在 7 日內提出的異常訂單可人工評估。"],
          ["處理方式", `退款申請請發送至 ${supportEmail}，並提供付款信箱、訂單時間、購買項目和問題描述。`],
        ],
      },
      contact: {
        title: "聯絡我們",
        intro: "產品仍在 P0 測試期。報告、訂單、退款、隱私和合作問題都可以透過信箱聯絡。",
        sections: [
          ["客服信箱", supportEmail],
          ["營運主體", companyNameZh],
          ["服務範圍", "命盤報告、問事解惑、今年運勢解讀、年度會員與報告歸檔相關問題。"],
          ["回覆時間", "我們會盡量在 2 個工作日內回覆。複雜訂單、退款或隱私請求可能需要更多時間核對。"],
        ],
      },
    },
    generationErrorTitle: "生成暫時未完成",
    apiErrors: {
      backendKey: "服務端模型配置正在調整，請稍後再試或聯絡客服。",
      questionRequired: "請先寫下你想問的具體事情，再生成問事解惑。",
      default: "生成暫時沒有完成，請稍後重試。",
    },
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
    reportGeneratedAt: "Generated",
    reportBirthInfo: "Birth info",
    reportFocusInfo: "Focus",
    reportQuestionInfo: "Question",
    reportsPageRegion: "Report archive",
    reportsPageKicker: "My reports",
    reportsPageTitle: "My reports",
    reportsPageText: "Generated charts, questions, and annual outlooks return here. Next time, you do not start from zero.",
    reportsCount: "reports",
    reportsEmptyTitle: "No saved reports yet",
    reportsEmptyText: "Open a chart first. The report will be saved here after generation.",
    reportOpenAction: "Open report",
    reportUnknownType: "Youshu report",
    authTitle: "Sign in and your reports can travel with you.",
    authText: "This browser keeps reports first. After sign-in, reports can be saved to the cloud and recovered on another device.",
    authEmailLabel: "Email",
    authEmailPlaceholder: "you@example.com",
    authGoogle: "Continue with Google",
    authMagicLink: "Send sign-in link",
    authSignedIn: "Signed in",
    authSignOut: "Sign out",
    authCheckEmail: "Sign-in link sent. Please check your inbox.",
    authUnavailable: "Cloud archive is not configured yet. Reports are saved on this device for now.",
    authError: "Sign-in could not finish. Please try again later.",
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
    footerTagline: "Youshu offers self-insight and decision support through an Eastern metaphysics lens.",
    footerDisclaimer: "Content is for self-reflection, emotional organization, and decision support only. It is not medical, legal, financial, psychotherapy, or other professional advice.",
    footerAge: "Recommended for users aged 18 and above.",
    footerCompanyLabel: "Operator",
    footerSupportLabel: "Support",
    footerLinks: { terms: "Terms", privacy: "Privacy", refund: "Refunds", contact: "Contact" },
    legalBackHome: "Back home",
    legalUpdated: "Last updated: June 26, 2026",
    legalPages: {
      terms: {
        title: "Terms of Service",
        intro: "By using Youshu, you acknowledge the service boundaries below. These terms are written for the current public test and may be updated before full commercial launch.",
        sections: [
          ["Service nature", "Youshu provides Bazi chart reports, question readings, and annual outlooks generated from deterministic chart calculation, structured interpretation rules, and large language model output. The content supports self-insight and decision-making; it does not guarantee that any predicted event will happen."],
          ["Who should use it", "The service is recommended for users aged 18 and above. For medical, legal, investment, mental health crisis, personal safety, or other high-risk matters, consult a qualified professional or local emergency service first."],
          ["Your responsibility", "You should provide reasonably accurate birth date, birth time, birth place, and question context. Inaccurate input may affect the report. You remain responsible for deciding whether and how to use any suggestion."],
          ["Digital delivery", "Once a report is generated, the digital content is considered delivered. In this P0 stage, reports may be kept in the browser session; after accounts are connected, report history will be stored more reliably."],
          ["Prohibited use", "Do not use the service for unlawful activity, harassment, discrimination, manipulation, medical diagnosis, financial promises, or automated high-risk decisions."],
          ["Changes and contact", `We may update pages, pricing, benefits, and terms as the product test evolves. Questions can be sent to ${supportEmail}.`],
        ],
      },
      privacy: {
        title: "Privacy Policy",
        intro: "We collect only the information needed to generate and support your readings, and we aim to keep the purpose of that data clear.",
        sections: [
          ["What we collect", "Information you provide, including birth date, birth time, birth place, gender, reading focus, question content, language preference, and basic technical information required to operate the service."],
          ["How we use it", "We use this information to calculate charts, generate reports, improve prompts and service quality, handle support requests, and, once accounts are connected, help you retrieve report history."],
          ["Large model processing", "When generating a report, necessary chart data, question context, and language options may be sent to our large model provider. We do not display or ask users to submit a DeepSeek API key on the customer page."],
          ["Retention and deletion", "During P0, reports may be stored in your browser session. After account support is added, reports may be stored by account. You may request deletion or correction through the support email."],
          ["Third-party services", "We may use Vercel for hosting and DeepSeek for report generation. We may later add Supabase, payment providers, and basic analytics. These providers process necessary data under their own policies."],
          ["Contact", `Privacy requests can be sent to ${supportEmail}.`],
        ],
      },
      refund: {
        title: "Refund Policy",
        intro: "Youshu readings are personalized digital content generated from user input. In general, once a report is generated or delivered, it is not eligible for a no-reason refund.",
        sections: [
          ["General rule", "Generated, displayed, or delivered Bazi reports, question readings, and annual outlooks are usually non-refundable. Please confirm that the service is reference-based digital content before purchase."],
          ["Refund or remedy cases", "If there is duplicate payment, successful payment without report generation, a system failure that prevents delivery, or an obviously mistaken order, contact us within 7 days. We may refund, regenerate, or provide equivalent credit depending on the case."],
          ["Non-refundable cases", "A mismatch with personal expectations, disagreement with interpretation, incorrect user input, or changing your mind after reading the report usually does not qualify for a refund."],
          ["Membership refunds", "After annual membership is activated, if any paid report, question quota, or member benefit has been used, full refunds are generally not available. Unused abnormal orders reported within 7 days may be reviewed manually."],
          ["How to request", `Send refund requests to ${supportEmail} with payment email, order time, purchased item, and a short description of the issue.`],
        ],
      },
      contact: {
        title: "Contact",
        intro: "Youshu is currently in P0 testing. Report, order, refund, privacy, and partnership questions can be sent by email.",
        sections: [
          ["Support email", supportEmail],
          ["Operator", companyNameEn],
          ["Service scope", "Bazi reports, question readings, annual outlooks, annual membership, and report archive questions."],
          ["Response time", "We try to reply within 2 business days. Complex order, refund, or privacy requests may take longer to verify."],
        ],
      },
    },
    generationErrorTitle: "Generation paused",
    apiErrors: {
      backendKey: "The model service is being configured. Please try again later or contact support.",
      questionRequired: "Please write the specific question first, then generate a question reading.",
      default: "The report could not be generated. Please try again later.",
    },
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

function stripMarkdownMarkers(text = "") {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

function renderInlineMarkdown(text) {
  const parts = [];
  const pattern = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={`strong-${match.index}`}>{match[1]}</strong>);
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : text;
}

function ReportBody({ content }) {
  if (!content) {
    return null;
  }

  const sections = [];
  let current = { heading: "", blocks: [] };

  function pushListItem(item) {
    const previousBlock = current.blocks[current.blocks.length - 1];
    if (previousBlock?.type === "list") {
      previousBlock.items.push(item);
      return;
    }
    current.blocks.push({ type: "list", items: [item] });
  }

  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const heading = line.match(/^#{1,4}\s+(.+)$/);
      const listItem = line.match(/^(?:[-*+]|\d+[.)])\s+(.+)$/);

      if (heading) {
        if (current.heading || current.blocks.length) {
          sections.push(current);
        }
        current = { heading: stripMarkdownMarkers(heading[1]), blocks: [] };
        return;
      }

      if (listItem) {
        pushListItem(stripMarkdownMarkers(listItem[1]));
        return;
      }

      current.blocks.push({ type: "paragraph", text: line });
    });

  if (current.heading || current.blocks.length) {
    sections.push(current);
  }

  return (
    <div className="report-body">
      {sections.map((section, sectionIndex) => (
        <section className="report-block" key={`${section.heading}-${sectionIndex}`}>
          {section.heading ? <h4>{section.heading}</h4> : null}
          {section.blocks.map((block, blockIndex) => {
            if (block.type === "list") {
              return (
                <ul key={`${section.heading}-list-${blockIndex}`}>
                  {block.items.map((item, itemIndex) => (
                    <li key={`${section.heading}-item-${blockIndex}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
                  ))}
                </ul>
              );
            }

            return <p key={`${section.heading}-${blockIndex}`}>{renderInlineMarkdown(block.text)}</p>;
          })}
        </section>
      ))}
    </div>
  );
}

function readJsonStorage(storage, key, fallback) {
  if (!storage) {
    return fallback;
  }

  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getStoredReport() {
  if (typeof window === "undefined") {
    return null;
  }

  return readJsonStorage(window.sessionStorage, reportStorageKey, null);
}

function getStoredReports() {
  if (typeof window === "undefined") {
    return [];
  }

  const reports = readJsonStorage(window.localStorage, reportArchiveStorageKey, []);
  return Array.isArray(reports) ? reports : [];
}

function saveStoredReports(reports) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(reportArchiveStorageKey, JSON.stringify(reports.slice(0, maxStoredReports)));
  } catch {
    // Local archive is a P0 convenience; report delivery should not fail if storage is unavailable.
  }
}

function createReportId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatArchiveDate(value) {
  if (!value) {
    return "";
  }
  return value.replaceAll("-", "/");
}

function formatReportDateTime(value, language = "zh-CN") {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  if (language === "en") {
    return new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});

  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}`;
}

function formatBirthInfo(report) {
  return [formatArchiveDate(report?.birthDate), report?.birthTime, report?.birthPlace].filter(Boolean).join(" · ");
}

function getReportSummary(content) {
  if (!content) {
    return "";
  }

  const summaryLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .find((line) => !line.startsWith("#"));

  return summaryLine ? stripMarkdownMarkers(summaryLine) : "";
}

function buildArchivedReport(report, context) {
  const createdAt = new Date().toISOString();

  return {
    ...report,
    id: report.id || createReportId(),
    createdAt,
    birthDate: context.birthDate,
    birthTime: context.birthTime,
    birthPlace: context.birthPlace,
    focus: context.focus,
    question: context.question,
    summary: getReportSummary(report.content),
  };
}

function getCurrentPage() {
  if (typeof window === "undefined") {
    return "home";
  }

  const pathname = window.location.pathname.replace(/^\/+/, "") || "home";
  if (pathname === "reports") {
    return "reports";
  }
  if (pathname === "report") {
    return "report";
  }
  if (legalPageIds.includes(pathname)) {
    return pathname;
  }
  return "home";
}

function getDisplayPrice(price, language) {
  return language === "en" ? price.usd : price.cny;
}

function friendlyApiError(rawError, t) {
  if (!rawError) {
    return t.apiErrors.default;
  }
  if (/DeepSeek API key is not configured/i.test(rawError)) {
    return t.apiErrors.backendKey;
  }
  if (/question is required/i.test(rawError)) {
    return t.apiErrors.questionRequired;
  }
  return t.apiErrors.default;
}

function LegalPage({ t, pageId, onBackHome }) {
  const page = t.legalPages[pageId] || t.legalPages.terms;

  return (
    <main className="legal-page">
      <section className="legal-hero" aria-label={page.title} role="region">
        <div className="legal-copy">
          <p className="kicker">{t.legalUpdated}</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
          <button className="primary-btn" type="button" onClick={onBackHome}>
            {t.legalBackHome}
          </button>
        </div>
        <article className="legal-card">
          {page.sections.map(([heading, text]) => (
            <section className="legal-block" key={heading}>
              <h2>{heading}</h2>
              <p>{text}</p>
            </section>
          ))}
        </article>
      </section>
    </main>
  );
}

function SiteFooter({ t, navigate }) {
  const companyName = t.nav[0] === "Chart" ? companyNameEn : companyNameZh;

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="brand-mark">有</span>
        <div>
          <strong>有数</strong>
          <p>{t.footerTagline}</p>
        </div>
      </div>
      <nav aria-label={t.footerLinks.terms}>
        {legalPageIds.map((pageId) => (
          <a href={`/${pageId}`} key={pageId} onClick={(event) => {
            event.preventDefault();
            navigate(`/${pageId}`);
          }}>
            {t.footerLinks[pageId]}
          </a>
        ))}
      </nav>
      <div className="footer-meta">
        <p>{t.footerDisclaimer}</p>
        <p>{t.footerAge}</p>
        <p>
          {t.footerCompanyLabel}：{companyName}
        </p>
        <p>
          {t.footerSupportLabel}：<a href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </p>
      </div>
    </footer>
  );
}

function getReportTypeLabel(report, t) {
  return t.entryModes[report?.type]?.title || t.reportUnknownType;
}

function getReportTypeEyebrow(report, t) {
  return t.entryModes[report?.type]?.eyebrow || t.reportPageKicker;
}

function getReportArchiveContext(report, t) {
  if (report?.type === "question" && report.question) {
    return report.question;
  }
  if (report?.type === "annual") {
    return t.entryModes.annual.summary;
  }
  return report?.focus || t.entryModes.bazi.summary;
}

function AuthPanel({ t, cloudEnabled, user, email, status, onEmailChange, onGoogleSignIn, onMagicLink, onSignOut }) {
  if (!cloudEnabled) {
    return <p className="auth-note">{t.authUnavailable}</p>;
  }

  if (user) {
    return (
      <div className="auth-panel signed-in">
        <div>
          <span>{t.authSignedIn}</span>
          <strong>{user.email}</strong>
        </div>
        <button type="button" onClick={onSignOut}>
          {t.authSignOut}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <div>
        <h2>{t.authTitle}</h2>
        <p>{t.authText}</p>
      </div>
      <div className="auth-actions">
        <button type="button" onClick={onGoogleSignIn}>
          {t.authGoogle}
        </button>
        <label>
          {t.authEmailLabel}
          <input value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder={t.authEmailPlaceholder} />
        </label>
        <button type="button" onClick={onMagicLink}>
          {t.authMagicLink}
        </button>
      </div>
      {status ? <p className="auth-note">{status}</p> : null}
    </div>
  );
}

function ReportsPage({
  t,
  reports,
  onOpenReport,
  onBackHome,
  cloudEnabled,
  cloudUser,
  authEmail,
  authStatus,
  onAuthEmailChange,
  onGoogleSignIn,
  onMagicLink,
  onSignOut,
}) {
  return (
    <main className="report-page reports-page">
      <section className="report-hero reports-hero" aria-label={t.reportsPageRegion} role="region">
        <div className="report-hero-copy">
          <p className="kicker">{t.reportsPageKicker}</p>
          <h1>{t.reportsPageTitle}</h1>
          <p>{t.reportsPageText}</p>
          <button className="primary-btn" type="button" onClick={onBackHome}>
            {t.backToReading}
          </button>
        </div>
        <article className="report-archive-card" aria-label={t.reportsPageRegion}>
          <AuthPanel
            t={t}
            cloudEnabled={cloudEnabled}
            user={cloudUser}
            email={authEmail}
            status={authStatus}
            onEmailChange={onAuthEmailChange}
            onGoogleSignIn={onGoogleSignIn}
            onMagicLink={onMagicLink}
            onSignOut={onSignOut}
          />
          {reports.length ? (
            <>
              <div className="report-archive-head">
                <span>
                  {reports.length} {t.reportsCount}
                </span>
                <p>{t.reportsPageText}</p>
              </div>
              <div className="report-list">
                {reports.map((savedReport) => {
                  const reportType = getReportTypeLabel(savedReport, t);
                  const birthLine = [formatArchiveDate(savedReport.birthDate), savedReport.birthPlace].filter(Boolean).join(" · ");
                  const createdAt = formatReportDateTime(savedReport.createdAt, savedReport.language || "zh-CN");
                  const context = getReportArchiveContext(savedReport, t);

                  return (
                    <button
                      className={`report-list-item report-type-${savedReport.type || "unknown"}`}
                      type="button"
                      key={savedReport.id}
                      onClick={() => onOpenReport(savedReport)}
                    >
                      <span>{reportType}</span>
                      <strong>{savedReport.summary || reportType}</strong>
                      <p>{context}</p>
                      <div className="report-list-meta">
                        {birthLine ? <small>{birthLine}</small> : null}
                        {createdAt ? <small>{createdAt}</small> : null}
                      </div>
                      <em>{t.reportOpenAction}</em>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="empty-report">
              <h2>{t.reportsEmptyTitle}</h2>
              <p>{t.reportsEmptyText}</p>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

function ReportPage({ t, report, onBackHome }) {
  const reportType = getReportTypeLabel(report, t);
  const generatedAt = formatReportDateTime(report?.createdAt, report?.language || "zh-CN");
  const birthInfo = formatBirthInfo(report);

  return (
    <main className="report-page" lang={report?.language || undefined}>
      <section className="report-hero" aria-label={t.reportPageRegion} role="region">
        <div className="report-hero-copy">
          <p className="kicker">{t.reportPageKicker}</p>
          <h1>{report ? reportType : t.noReportTitle}</h1>
          <p>{report ? t.reportPageText : t.noReportText}</p>
          <button className="primary-btn" type="button" onClick={onBackHome}>
            {t.reportBackHome}
          </button>
        </div>
        <article className="generated-report report-page-card" aria-label={t.generatedTitle}>
          {report ? (
            <>
              <header className="report-heading">
                <div className="report-heading-status">
                  <span>{t.reportReady}</span>
                  <em>{getReportTypeEyebrow(report, t)}</em>
                </div>
                <h2>{reportType}</h2>
                <div className="report-detail-grid">
                  {generatedAt ? (
                    <p>
                      <span>{t.reportGeneratedAt}</span>
                      <strong>{generatedAt}</strong>
                    </p>
                  ) : null}
                  {birthInfo ? (
                    <p>
                      <span>{t.reportBirthInfo}</span>
                      <strong>{birthInfo}</strong>
                    </p>
                  ) : null}
                  {report.focus ? (
                    <p>
                      <span>{t.reportFocusInfo}</span>
                      <strong>{report.focus}</strong>
                    </p>
                  ) : null}
                  {report.question ? (
                    <p className="wide">
                      <span>{t.reportQuestionInfo}</span>
                      <strong>{report.question}</strong>
                    </p>
                  ) : null}
                </div>
                {report.paipan ? (
                  <p className="report-meta">
                    <strong>{t.reportPillars}</strong>
                    {report.paipan.pillars.year.value} · {report.paipan.pillars.month.value} · {report.paipan.pillars.day.value} · {report.paipan.pillars.hour.value}
                  </p>
                ) : null}
              </header>
              <ReportBody content={report.content} />
              <p className="report-footnote">{t.reportFootnote}</p>
              <p className="report-footnote">{t.footerDisclaimer}</p>
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
  const supabaseClient = getSupabaseClient();
  const [language, setLanguage] = useState("zh-CN");
  const [focus, setFocus] = useState("career");
  const [birthDate, setBirthDate] = useState("1988-01-14");
  const [birthTime, setBirthTime] = useState("11:25");
  const [gender, setGender] = useState("male");
  const [birthPlace, setBirthPlace] = useState("长春");
  const [question, setQuestion] = useState("");
  const [entryMode, setEntryMode] = useState("bazi");
  const [reports, setReports] = useState(getStoredReports);
  const [report, setReport] = useState(getStoredReport);
  const [page, setPage] = useState(getCurrentPage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cloudUser, setCloudUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const t = copy[language];
  const activeEntry = t.entryModes[entryMode];
  const featuredProduct = t.products[2];
  const purchaseOptions = [...t.products, t.annualMembership];
  const cloudEnabled = Boolean(supabaseClient);
  const reportIdFromUrl = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("id");
  const displayedReport = reportIdFromUrl ? reports.find((savedReport) => savedReport.id === reportIdFromUrl) || report : report;

  useEffect(() => {
    function handlePopState() {
      setPage(getCurrentPage());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!supabaseClient) {
      return undefined;
    }

    let mounted = true;

    async function loadUserAndReports() {
      const { data } = await supabaseClient.auth.getSession();
      const nextUser = data?.session?.user || null;
      if (!mounted) {
        return;
      }
      setCloudUser(nextUser);
      if (nextUser) {
        await refreshCloudReports(nextUser);
      }
    }

    const subscription = supabaseClient.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      setCloudUser(nextUser);
      if (nextUser) {
        refreshCloudReports(nextUser);
      }
    });

    loadUserAndReports();

    return () => {
      mounted = false;
      subscription?.data?.subscription?.unsubscribe?.();
    };
  }, [supabaseClient]);

  function mergeReports(primaryReports, fallbackReports) {
    const seen = new Set();
    return [...primaryReports, ...fallbackReports].filter((item) => {
      if (!item?.id || seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }

  async function refreshCloudReports(user = cloudUser) {
    if (!supabaseClient || !user) {
      return;
    }

    try {
      const cloudReports = await loadCloudReports(supabaseClient, user);
      setReports((currentReports) => mergeReports(cloudReports, currentReports));
    } catch {
      setAuthStatus(t.authError);
    }
  }

  async function signInWithGoogle() {
    if (!supabaseClient) {
      setAuthStatus(t.authUnavailable);
      return;
    }

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    setAuthStatus(error ? t.authError : "");
  }

  async function sendMagicLink() {
    if (!supabaseClient || !authEmail.trim()) {
      setAuthStatus(t.authError);
      return;
    }

    const { error } = await supabaseClient.auth.signInWithOtp({
      email: authEmail.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setAuthStatus(error ? t.authError : t.authCheckEmail);
  }

  async function signOut() {
    if (!supabaseClient) {
      return;
    }

    await supabaseClient.auth.signOut();
    setCloudUser(null);
  }

  function navigate(path) {
    window.history.pushState({}, "", path);
    setPage(getCurrentPage());
    if (!window.navigator.userAgent.includes("jsdom")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function openSavedReport(savedReport) {
    setReport(savedReport);
    try {
      window.sessionStorage.setItem(reportStorageKey, JSON.stringify(savedReport));
    } catch {
      // Session storage is only a convenience for reloads.
    }
    navigate(`/report?id=${encodeURIComponent(savedReport.id)}`);
  }

  function storeAndOpenReport(nextReport, { archive = true } = {}) {
    let reportToOpen = nextReport;

    if (archive) {
      reportToOpen = buildArchivedReport(nextReport, {
        birthDate,
        birthTime,
        birthPlace,
        focus: t.readings[focus].option,
        question,
      });
      const nextReports = [reportToOpen, ...reports.filter((savedReport) => savedReport.id !== reportToOpen.id)].slice(0, maxStoredReports);
      setReports(nextReports);
      saveStoredReports(nextReports);
      if (supabaseClient && cloudUser) {
        saveCloudReport(supabaseClient, cloudUser, reportToOpen).catch(() => {
          setAuthStatus(t.authError);
        });
      }
    }

    setReport(reportToOpen);
    try {
      window.sessionStorage.setItem(reportStorageKey, JSON.stringify(reportToOpen));
    } catch {
      // Session storage is only a convenience for reloads.
    }
    navigate(archive ? `/report?id=${encodeURIComponent(reportToOpen.id)}` : "/report");
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
        storeAndOpenReport({ title: t.generationErrorTitle, content: friendlyApiError(json.error, t), language }, { archive: false });
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
      storeAndOpenReport({ title: t.generationErrorTitle, content: friendlyApiError(error.message, t), language }, { archive: false });
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
          <a
            className="account-link"
            href="/reports"
            onClick={(event) => {
              event.preventDefault();
              navigate("/reports");
            }}
          >
            {t.account}
          </a>
        </div>
      </header>

      {page === "report" ? (
        <ReportPage t={t} report={displayedReport} onBackHome={() => navigate("/")} />
      ) : page === "reports" ? (
        <ReportsPage
          t={t}
          reports={reports}
          onOpenReport={openSavedReport}
          onBackHome={() => navigate("/#reading")}
          cloudEnabled={cloudEnabled}
          cloudUser={cloudUser}
          authEmail={authEmail}
          authStatus={authStatus}
          onAuthEmailChange={setAuthEmail}
          onGoogleSignIn={signInWithGoogle}
          onMagicLink={sendMagicLink}
          onSignOut={signOut}
        />
      ) : legalPageIds.includes(page) ? (
        <LegalPage t={t} pageId={page} onBackHome={() => navigate("/")} />
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
      <SiteFooter t={t} navigate={navigate} />
    </>
  );
}
