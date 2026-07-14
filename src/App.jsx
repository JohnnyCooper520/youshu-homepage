import { useEffect, useState } from "react";
import { consumeEntitlement, getModeAccess, getProductStatus, grantProduct, mergeEntitlements, normalizeEntitlements } from "./lib/entitlements.js";
import { loadCloudEntitlements } from "./lib/cloudEntitlements.js";
import { getSupabaseClient } from "./lib/supabaseClient.js";
import { loadCloudReports, saveCloudReport } from "./lib/reportStore.js";
import { reportPromptVersion } from "./report/profileAnchor.js";

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
const entitlementStorageKey = "youshu:entitlements";
const maxStoredReports = 30;
const companyNameZh = "北京一叶泛舟文化科技有限公司";
const companyNameEn = "Beijing Yiye Fanzhou Culture Technology Co., Ltd.";
const supportEmail = "qinyuneo@gmail.com";

const copy = {
  "zh-CN": {
    brandHome: "有数首页",
    brandSmall: "东方文化人生参考",
    navLabel: "主导航",
    nav: ["个人结构", "一事", "年度节奏", "会员", "方法"],
    navHrefs: ["#reading", "#products", "#products", "#membership", "#method"],
    account: "我的报告",
    heroRegion: "首页主视觉",
    heroSubtitle: "心中有数，选择有光",
    heroLede: "先看结构，再看选择。心里有数，路就不乱。",
    primaryCta: "先看结构",
    servicesCta: "看产品",
    orbLabel: "旋转阴阳动效",
    readingRegion: "结构校准",
    readingKicker: "结构校准",
    readingTitle: "先把信息放准，再看当下方向。",
    readingText: "不急着要答案。先把信息与问题放清楚，再看选择从哪里开始。",
    generateBazi: "生成个人结构报告",
    generateAnnual: "生成年度节奏",
    askQuestion: "一事分析",
    entryModeLabel: "选择服务",
    entryModes: {
      bazi: {
        title: "个人结构报告",
        eyebrow: "先知己",
        summary: "看性格底色、用力方式与关系惯性。",
        focusLabel: "想看的方向",
        action: "生成个人结构报告",
        previewTitle: "先知己，心不乱",
        previewText: "先把自己的底色看清，再谈选择。",
        tags: ["性格底色", "用力方式", "关系惯性"],
      },
      annual: {
        title: "年度节奏",
        eyebrow: "看一年",
        summary: "从生成日起，向后看完整 12 个月。",
        focusLabel: "今年重点",
        action: "生成年度节奏",
        previewTitle: "先看眼前，再看一年里的转折",
        previewText: "不按自然年切开，而是从此刻往后看。",
        tags: ["后续十二月", "节奏窗口", "留意处"],
      },
      question: {
        title: "一事分析",
        eyebrow: "看一事",
        summary: "把一件具体的事拆清趋势、风险和下一步。",
        focusLabel: "分析方向",
        action: "生成一事分析",
        previewTitle: "事到眼前，先辨轻重",
        previewText: "问题越具体，判断越能落到下一步。",
        tags: ["趋势", "风险边界", "下一步"],
      },
    },
    birthPlace: "出生地",
    gender: "性别",
    male: "男",
    female: "女",
    questionLabel: "想分析的事",
    questionPlaceholder: "例如：接下来半年适合换工作吗？",
    generating: "正在生成",
    generatingText: "先定出生信息，再把话说清。",
    generatingSteps: ["校准出生信息", "推演个人结构", "整理报告重点"],
    generatedTitle: "生成结果",
    reportVerdict: "总断",
    reportHighlights: "要点",
    reportOutline: "报告目录",
    reportReady: "报告已成",
    reportPillars: "出生信息",
    reportFootnote: "以下内容基于确定性结构化分析与有数规则生成，仅作选择参考。",
    reportPageRegion: "报告详情",
    reportPageKicker: "我的报告",
    reportPageTitle: "这份报告，单独慢慢看。",
    reportPageText: "这份报告按你的信息归档，适合隔一段时间再回来读。",
    reportBackHome: "回到首页",
    noReportTitle: "还没有可查看的报告",
    noReportText: "先回首页生成一份报告，完成后会自动来到这里。",
    reportGeneratedAt: "生成于",
    reportBirthInfo: "出生信息",
    reportFocusInfo: "关注方向",
    reportQuestionInfo: "具体事项",
    reportsPageRegion: "报告归档",
    reportsPageKicker: "报告归档",
    reportsPageTitle: "我的报告",
    reportsPageText: "生成过的个人结构、一事和年度节奏，都会归在这里。日后再看，不必从头来过。",
    reportsCount: "份报告",
    reportFiltersLabel: "按报告类型筛选",
    reportFilters: { all: "全部", bazi: "个人结构", annual: "年度节奏", question: "一事分析" },
    reportFilterEmpty: "这一类报告还没有归档。",
    reportsEmptyTitle: "这里还没有报告",
    reportsEmptyText: "先生成一份报告，完成后会自动归档到这里。",
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
    birthTime: "出生时间",
    currentFocus: "当前关注",
    timeOptions: ["23:00-01:00", "05:00-07:00", "11:00-13:00", "17:00-19:00", "21:00-23:00"],
    readings: {
      career: { option: "事业机会", title: "机会不急，先稳住能力半径", tags: ["先稳后起", "外部机会", "节奏调整"], line: "机会未必马上出现。先把手上的能力与资源整理好。" },
      relationship: { option: "感情关系", title: "先立边界，再谈靠近", tags: ["慢热", "重承诺", "边界感"], line: "关系不是越急越近。先看清自己需要怎样的稳定。" },
      emotion: { option: "内耗与情绪", title: "心思重，责任也重", tags: ["思虑深", "责任重", "独自消化"], line: "事不一定难，难的是你总想一个人扛完。" },
      money: { option: "财务选择", title: "先看现金流，再谈选择", tags: ["稳现金流", "重判断", "忌冲动"], line: "不怕慢，就怕心急时把节奏交出去。" },
    },
    productsRegion: "购买选择",
    purchaseLabel: "购买项目",
    productKicker: "购买选择",
    productTitle: "单次报告与年度会员，都在这里选。",
    badges: { single: "单次", featured: "主推", member: "会员" },
    prices: {
      basic: { cny: "人民币 ¥29.9", usd: "USD $4.2" },
      annual: { cny: "人民币 ¥199", usd: "USD $28" },
      membership: { cny: "人民币 ¥299/年", usd: "USD $42/year" },
    },
    products: [
      { key: "bazi", title: "个人结构报告", question: "先知己，再谈选择。", priceKey: "basic", action: "生成个人结构报告" },
      { key: "question", title: "一事分析", question: "事到眼前，先辨轻重。", priceKey: "basic", action: "生成一事分析" },
      { key: "annual", title: "年度节奏报告", question: "生成日起，向后看完整 12 个月。", priceKey: "annual", action: "看年度节奏" },
    ],
    annualMembership: { key: "membership", title: "年度会员", question: "常看、常分析、常复盘，都归入一处。", priceKey: "membership", action: "开通年度会员" },
    entitlementStatusLabel: "权益状态",
    entitlementLockedTitle: "这一项还未开通",
    entitlementLockedText: "可以先看页面里的判断样本；完整报告开通后生成。",
    entitlementReady: "已开通，可生成",
    entitlementMemberReady: "年度会员已包含",
    entitlementRemaining: "剩余 {count} 次",
    entitlementUsedUp: "已用完",
    simulateUnlock: "测试开通",
    simulateUnlockAria: "测试开通：{product}",
    testUnlockCurrent: "测试开通当前服务",
    testUnlockHint: "测试入口，仅本地或测试链接显示。",
    entitlementActive: "已开通",
    entitlementIncluded: "会员已含",
    entitlementLocked: "未开通",
    annualLabel: "年度节奏 · 生成日起算",
    annualTitle: "先看眼前，再看一年里的节奏。",
    annualText: "不是按自然年切一刀，而是从你生成这一刻，向后整理完整十二个月。眼前怎么稳，后面哪里调整，一并放进同一条路里。",
    timelineLabel: "后续十二月",
    coverageLabel: "报告区间",
    coverageValue: "生成日起 · 向后完整 12 个月",
    annualTimeline: [["生成当月", "先整理眼前重点。"], ["近三个月", "看选择的先后。"], ["后续半年", "看节奏变化。"], ["后续十二月", "把重点收成一条线。"]],
    memberLabel: "年度会员 · 长期权益",
    memberTitle: "常看的人，把判断养成自己的底气。",
    memberText: "会员不是另一套产品，而是把上面的解读、追问和归档合在一起。日后再问，不必从头来过。",
    memberBenefitsLabel: "年度会员包含",
    memberBenefits: [["个人结构报告", "1 份", "完整底层结构"], ["年度节奏", "1 份", "后续 12 个月"], ["一事分析", "12 次/年", "每月可分析"], ["月度提醒", "12 期", "按月更新"], ["专属追问", "12 次/年", "接着问清"], ["历史归档", "长期", "报告留存"]],
    sampleRegion: "产品预览样例",
    sampleKicker: "判断样本",
    sampleTitle: "话不必多，先说中要害。",
    previews: [["个人结构报告", "先知己，心不乱", "性格底色、用力方式、关系惯性"], ["一事分析", "此事宜稳，不宜跳", "趋势、风险、下一步"], ["年度节奏", "近处先稳，远处再调", "后续十二月、机会、留意处"]],
    methodRegion: "方法说明",
    methodKicker: "为什么值得信任",
    methodTitle: "信息先校准，建议才说得稳。",
    proof: [["结构化计算", "出生信息先进入规则系统，先把底座算准。"], ["顾问规则", "顾问定规则，表达不越界。"], ["清晰诠释", "把术语翻成能用的话。"], ["一致性记录", "同一份结构，前后判断不打架。"]],
    closingRegion: "我的报告入口",
    closingText: "个人结构、一事、年度节奏，都会归进我的报告。",
    closingTitle: "先看一眼，再决定往哪一层深入。",
    backToReading: "回到生成入口",
    viewProducts: "查看购买选择",
    footerTagline: "有数提供东方文化视角下的自我认知与选择参考。",
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
          ["服务性质", "有数提供基于传统文化结构、规则化解读与大模型生成的个人结构报告、一事分析和年度节奏参考。内容用于自我认知、情绪整理和选择辅助，不承诺预测结果必然发生。"],
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
          ["如何使用", "这些信息用于结构化分析、生成报告、改进提示词与服务质量、处理客服请求，以及在接入账户后帮助你找回历史报告。"],
          ["大模型处理", "生成报告时，必要的结构化分析结果、问题背景和语言选项会发送给我们使用的大模型服务商。我们不会在前端展示或要求用户提交 DeepSeek API Key。"],
          ["保存与删除", "P0 阶段报告可能保存在浏览器会话中；接入账户后会按账户保存。你可以通过客服邮箱请求删除与更正相关信息。"],
          ["第三方服务", "我们可能使用 Vercel 托管、DeepSeek 生成报告，未来可能接入 Supabase、支付服务商和基础分析工具。第三方会按其政策处理必要数据。"],
          ["联系我们", `隐私相关请求请发送至 ${supportEmail}。`],
        ],
      },
      refund: {
        title: "退款政策",
        intro: "东方文化报告属于按用户输入生成的数字内容。原则上，报告一经生成或交付，不支持无理由退款。",
        sections: [
          ["原则", "已生成、已展示或已发送的个人结构报告、一事分析、年度节奏报告，通常不予退款。购买前请确认服务性质为参考性数字内容。"],
          ["可退款或补偿情形", "如发生重复扣款、付款成功但报告未生成、系统故障导致无法交付、明显错误订单，用户可在付款后 7 日内联系处理。我们会根据情况退款、补发或提供等值额度。"],
          ["不支持退款情形", "因个人主观感受不符、对解读结论不满意、输入信息错误、已阅读后改变主意，通常不构成退款理由。"],
          ["会员退款", "年度会员开通后，如已使用任一付费报告、分析额度或会员权益，原则上不支持全额退款。未使用且在 7 日内提出的异常订单可人工评估。"],
          ["处理方式", `退款申请请发送至 ${supportEmail}，并提供付款邮箱、订单时间、购买项目和问题描述。`],
        ],
      },
      contact: {
        title: "联系我们",
        intro: "产品仍在 P0 测试期。报告、订单、退款、隐私和合作问题都可以通过邮箱联系。",
        sections: [
          ["客服邮箱", supportEmail],
          ["运营主体", companyNameZh],
          ["服务范围", "个人结构报告、一事分析、年度节奏报告、年度会员与报告归档相关问题。"],
          ["回复时间", "我们会尽量在 2 个工作日内回复。复杂订单、退款或隐私请求可能需要更多时间核对。"],
        ],
      },
    },
    generationErrorTitle: "生成暂时未完成",
    apiErrors: {
      backendKey: "服务端模型配置正在调整，请稍后再试或联系客服。",
      questionRequired: "请先写下你想问的具体事情，再生成一事分析。",
      default: "生成暂时没有完成，请稍后重试。",
    },
  },
  "zh-TW": {
    brandHome: "有數首頁",
    brandSmall: "東方文化人生參考",
    navLabel: "主導覽",
    nav: ["個人結構", "一事", "年度節奏", "會員", "方法"],
    navHrefs: ["#reading", "#products", "#products", "#membership", "#method"],
    account: "我的報告",
    heroRegion: "首頁主視覺",
    heroSubtitle: "心中有數，選擇有光",
    heroLede: "先看結構，再看選擇。心裡有數，路就不亂。",
    primaryCta: "先看結構",
    servicesCta: "看產品",
    orbLabel: "旋轉陰陽動效",
    readingRegion: "結構校準",
    readingKicker: "結構校準",
    readingTitle: "先把資訊放準，再看當下方向。",
    readingText: "不急著要答案。先把資訊與問題放清楚，再看選擇從哪裡開始。",
    generateBazi: "生成個人結構報告",
    generateAnnual: "生成年度節奏",
    askQuestion: "一事分析",
    entryModeLabel: "選擇服務",
    entryModes: {
      bazi: {
        title: "個人結構報告",
        eyebrow: "先知己",
        summary: "看性格底色、用力方式與關係慣性。",
        focusLabel: "想看的方向",
        action: "生成個人結構報告",
        previewTitle: "先知己，心不亂",
        previewText: "先把自己的底色看清，再談選擇。",
        tags: ["性格底色", "用力方式", "關係慣性"],
      },
      annual: {
        title: "年度節奏",
        eyebrow: "看一年",
        summary: "從生成日起，向後看完整 12 個月。",
        focusLabel: "今年重點",
        action: "生成年度節奏",
        previewTitle: "先看眼前，再看一年裡的轉折",
        previewText: "不按自然年切開，而是從此刻往後看。",
        tags: ["後續十二月", "節奏窗口", "留意處"],
      },
      question: {
        title: "一事分析",
        eyebrow: "看一事",
        summary: "把一件具體的事拆清趨勢、風險和下一步。",
        focusLabel: "分析方向",
        action: "生成一事分析",
        previewTitle: "事到眼前，先辨輕重",
        previewText: "問題越具體，判斷越能落到下一步。",
        tags: ["趨勢", "風險邊界", "下一步"],
      },
    },
    birthPlace: "出生地",
    gender: "性別",
    male: "男",
    female: "女",
    questionLabel: "想分析的事",
    questionPlaceholder: "例如：接下來半年適合換工作嗎？",
    generating: "正在生成",
    generatingText: "先定出生資訊，再把話說清。",
    generatingSteps: ["校準出生資訊", "推演個人結構", "整理報告重點"],
    generatedTitle: "生成結果",
    reportVerdict: "總斷",
    reportHighlights: "要點",
    reportOutline: "報告目錄",
    reportReady: "報告已成",
    reportPillars: "出生資訊",
    reportFootnote: "以下內容基於確定性結構化分析與有數規則生成，僅作選擇參考。",
    reportPageRegion: "報告詳情",
    reportPageKicker: "我的報告",
    reportPageTitle: "這份報告，單獨慢慢看。",
    reportPageText: "這份報告會依你的資訊歸檔，適合隔一段時間再回來讀。",
    reportBackHome: "回到首頁",
    noReportTitle: "還沒有可查看的報告",
    noReportText: "先回首頁生成一份報告，完成後會自動來到這裡。",
    reportGeneratedAt: "生成於",
    reportBirthInfo: "出生資訊",
    reportFocusInfo: "關注方向",
    reportQuestionInfo: "具體事項",
    reportsPageRegion: "報告歸檔",
    reportsPageKicker: "報告歸檔",
    reportsPageTitle: "我的報告",
    reportsPageText: "生成過的個人結構、一事和年度節奏，都會歸在這裡。日後再看，不必從頭來過。",
    reportsCount: "份報告",
    reportFiltersLabel: "按報告類型篩選",
    reportFilters: { all: "全部", bazi: "個人結構", annual: "年度節奏", question: "一事分析" },
    reportFilterEmpty: "這一類報告還沒有歸檔。",
    reportsEmptyTitle: "這裡還沒有報告",
    reportsEmptyText: "先生成一份報告，完成後會自動歸檔到這裡。",
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
    birthTime: "出生時間",
    currentFocus: "當前關注",
    timeOptions: ["23:00-01:00", "05:00-07:00", "11:00-13:00", "17:00-19:00", "21:00-23:00"],
    readings: {
      career: { option: "事業機會", title: "機會不急，先穩住能力半徑", tags: ["先穩後起", "外部機會", "節奏調整"], line: "機會未必馬上出現。先把手上的能力與資源整理好。" },
      relationship: { option: "感情關係", title: "先立邊界，再談靠近", tags: ["慢熱", "重承諾", "邊界感"], line: "關係不是越急越近。先看清自己需要怎樣的穩定。" },
      emotion: { option: "內耗與情緒", title: "心思重，責任也重", tags: ["思慮深", "責任重", "獨自消化"], line: "事不一定難，難的是你總想一個人扛完。" },
      money: { option: "財務選擇", title: "先看現金流，再談選擇", tags: ["穩現金流", "重判斷", "忌衝動"], line: "不怕慢，就怕心急時把節奏交出去。" },
    },
    productsRegion: "購買選擇",
    purchaseLabel: "購買項目",
    productKicker: "購買選擇",
    productTitle: "單次報告與年度會員，都在這裡選。",
    badges: { single: "單次", featured: "主推", member: "會員" },
    prices: {
      basic: { cny: "人民幣 ¥29.9", usd: "USD $4.2" },
      annual: { cny: "人民幣 ¥199", usd: "USD $28" },
      membership: { cny: "人民幣 ¥299/年", usd: "USD $42/year" },
    },
    products: [
      { key: "bazi", title: "個人結構報告", question: "先知己，再談選擇。", priceKey: "basic", action: "生成個人結構報告" },
      { key: "question", title: "一事分析", question: "事到眼前，先辨輕重。", priceKey: "basic", action: "生成一事分析" },
      { key: "annual", title: "年度節奏報告", question: "生成日起，向後看完整 12 個月。", priceKey: "annual", action: "看年度節奏" },
    ],
    annualMembership: { key: "membership", title: "年度會員", question: "常看、常分析、常復盤，都歸入一處。", priceKey: "membership", action: "開通年度會員" },
    entitlementStatusLabel: "權益狀態",
    entitlementLockedTitle: "這一項尚未開通",
    entitlementLockedText: "可以先看頁面裡的判斷樣本；完整報告開通後生成。",
    entitlementReady: "已開通，可生成",
    entitlementMemberReady: "年度會員已包含",
    entitlementRemaining: "剩餘 {count} 次",
    entitlementUsedUp: "已用完",
    simulateUnlock: "測試開通",
    simulateUnlockAria: "測試開通：{product}",
    testUnlockCurrent: "測試開通目前服務",
    testUnlockHint: "測試入口，僅本地或測試連結顯示。",
    entitlementActive: "已開通",
    entitlementIncluded: "會員已含",
    entitlementLocked: "未開通",
    annualLabel: "年度節奏 · 生成日起算",
    annualTitle: "先看眼前，再看一年裡的節奏。",
    annualText: "不是按自然年切一刀，而是從你生成這一刻，向後整理完整十二個月。眼前怎麼穩，後面哪裡調整，一併放進同一條路裡。",
    timelineLabel: "後續十二月",
    coverageLabel: "報告區間",
    coverageValue: "生成日起 · 向後完整 12 個月",
    annualTimeline: [["生成當月", "先整理眼前重點。"], ["近三個月", "看選擇的先後。"], ["後續半年", "看節奏變化。"], ["後續十二月", "把重點收成一條線。"]],
    memberLabel: "年度會員 · 長期權益",
    memberTitle: "常看的人，把判斷養成自己的底氣。",
    memberText: "會員不是另一套產品，而是把上面的解讀、追問和歸檔合在一起。日後再問，不必從頭來過。",
    memberBenefitsLabel: "年度會員包含",
    memberBenefits: [["個人結構報告", "1 份", "完整底層結構"], ["年度節奏", "1 份", "後續 12 個月"], ["一事分析", "12 次/年", "每月可分析"], ["月度提醒", "12 期", "按月更新"], ["專屬追問", "12 次/年", "接著問清"], ["歷史歸檔", "長期", "報告留存"]],
    sampleRegion: "產品預覽樣例",
    sampleKicker: "判斷樣本",
    sampleTitle: "話不必多，先說中要害。",
    previews: [["個人結構報告", "先知己，心不亂", "性格底色、用力方式、關係慣性"], ["一事分析", "此事宜穩，不宜跳", "趨勢、風險、下一步"], ["年度節奏", "近處先穩，遠處再調", "後續十二月、機會、留意處"]],
    methodRegion: "方法說明",
    methodKicker: "為什麼值得信任",
    methodTitle: "資訊先校準，建議才說得穩。",
    proof: [["結構化計算", "出生資訊先進入規則系統，先把底座算準。"], ["顧問規則", "顧問定規則，表達不越界。"], ["清晰詮釋", "把術語翻成能用的話。"], ["一致性記錄", "同一份結構，前後判斷不打架。"]],
    closingRegion: "我的報告入口",
    closingText: "個人結構、一事、年度節奏，都會歸進我的報告。",
    closingTitle: "先看一眼，再決定往哪一層深入。",
    backToReading: "回到生成入口",
    viewProducts: "查看購買選擇",
    footerTagline: "有數提供東方文化視角下的自我認知與選擇參考。",
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
          ["服務性質", "有數提供基於傳統文化結構、規則化解讀與大模型生成的個人結構報告、一事分析和年度節奏參考。內容用於自我認知、情緒整理和選擇輔助，不承諾預測結果必然發生。"],
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
          ["如何使用", "這些資訊用於結構化分析、生成報告、改進提示詞與服務品質、處理客服請求，以及在接入帳戶後幫助你找回歷史報告。"],
          ["大模型處理", "生成報告時，必要的結構化分析結果、問題背景和語言選項會發送給我們使用的大模型服務商。我們不會在前端展示或要求用戶提交 DeepSeek API Key。"],
          ["保存與刪除", "P0 階段報告可能保存在瀏覽器會話中；接入帳戶後會按帳戶保存。你可以透過客服信箱請求刪除與更正相關資訊。"],
          ["第三方服務", "我們可能使用 Vercel 託管、DeepSeek 生成報告，未來可能接入 Supabase、支付服務商和基礎分析工具。第三方會按其政策處理必要資料。"],
          ["聯絡我們", `隱私相關請求請發送至 ${supportEmail}。`],
        ],
      },
      refund: {
        title: "退款政策",
        intro: "個性化數位報告屬於按用戶輸入生成的數位內容。原則上，報告一經生成或交付，不支持無理由退款。",
        sections: [
          ["原則", "已生成、已展示或已發送的個人結構報告、一事分析、年度節奏報告，通常不予退款。購買前請確認服務性質為參考性數位內容。"],
          ["可退款或補償情形", "如發生重複扣款、付款成功但報告未生成、系統故障導致無法交付、明顯錯誤訂單，用戶可在付款後 7 日內聯絡處理。我們會根據情況退款、補發或提供等值額度。"],
          ["不支持退款情形", "因個人主觀感受不符、對解讀結論不滿意、輸入資訊錯誤、已閱讀後改變主意，通常不構成退款理由。"],
          ["會員退款", "年度會員開通後，如已使用任一付費報告、分析額度或會員權益，原則上不支持全額退款。未使用且在 7 日內提出的異常訂單可人工評估。"],
          ["處理方式", `退款申請請發送至 ${supportEmail}，並提供付款信箱、訂單時間、購買項目和問題描述。`],
        ],
      },
      contact: {
        title: "聯絡我們",
        intro: "產品仍在 P0 測試期。報告、訂單、退款、隱私和合作問題都可以透過信箱聯絡。",
        sections: [
          ["客服信箱", supportEmail],
          ["營運主體", companyNameZh],
          ["服務範圍", "個人結構報告、一事分析、年度節奏報告、年度會員與報告歸檔相關問題。"],
          ["回覆時間", "我們會盡量在 2 個工作日內回覆。複雜訂單、退款或隱私請求可能需要更多時間核對。"],
        ],
      },
    },
    generationErrorTitle: "生成暫時未完成",
    apiErrors: {
      backendKey: "服務端模型配置正在調整，請稍後再試或聯絡客服。",
      questionRequired: "請先寫下你想問的具體事情，再生成一事分析。",
      default: "生成暫時沒有完成，請稍後重試。",
    },
  },
  en: {
    brandHome: "Youshu home",
    brandSmall: "Eastern culture life reference",
    navLabel: "Main navigation",
    nav: ["Structure", "Analyze", "Year rhythm", "Membership", "Method"],
    navHrefs: ["#reading", "#products", "#products", "#membership", "#method"],
    account: "My reports",
    heroRegion: "Hero",
    heroSubtitle: "A clear structure, a calmer choice.",
    heroLede: "Read the structure first, then decide. When the mind has a number, the path feels less tangled.",
    primaryCta: "Start a report",
    servicesCta: "View products",
    orbLabel: "Rotating yin-yang motion",
    readingRegion: "Structure Check",
    readingKicker: "Structure Check",
    readingTitle: "Set the information clearly, then read the direction.",
    readingText: "No need to rush the answer. Put the information and the question in order first.",
    generateBazi: "Generate personal structure report",
    generateAnnual: "Generate annual rhythm report",
    askQuestion: "Analyze one matter",
    entryModeLabel: "Choose a service",
    entryModes: {
      bazi: {
        title: "Personal Structure Report",
        eyebrow: "Know yourself",
        summary: "Read temperament, effort style, and relationship habits.",
        focusLabel: "Reading focus",
        action: "Generate personal structure report",
        previewTitle: "Know yourself; the mind steadies",
        previewText: "Read the base pattern first, then decide with more clarity.",
        tags: ["temperament", "effort style", "relationship habits"],
      },
      annual: {
        title: "Annual Rhythm Report",
        eyebrow: "Read the year",
        summary: "From the reading date, look across the next full 12 months.",
        focusLabel: "Annual focus",
        action: "Generate annual rhythm report",
        previewTitle: "Read what is near, then the turnings of the year",
        previewText: "Not a calendar cut. It reads forward from this moment.",
        tags: ["next 12 months", "rhythm windows", "what to notice"],
      },
      question: {
        title: "One-Matter Analysis",
        eyebrow: "Ask one thing",
        summary: "Separate one concrete matter into trend, risk, and next step.",
        focusLabel: "Question focus",
        action: "Generate one-matter analysis",
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
    generating: "Reading the structure",
    generatingText: "First fix the pillars, then make the words usable.",
    generatingSteps: ["Check birth data", "Map the personal structure", "Shape the report"],
    generatedTitle: "Generated result",
    reportVerdict: "Main reading",
    reportHighlights: "Highlights",
    reportOutline: "Report outline",
    reportReady: "Report ready",
    reportPillars: "Birth fields",
    reportFootnote: "Generated from deterministic structure calculation and Youshu guidance rules. Use as decision support.",
    reportPageRegion: "Report detail",
    reportPageKicker: "My report",
    reportPageTitle: "A full report deserves its own page.",
    reportPageText: "This reading is archived with your information, ready to return to when the timing is right.",
    reportBackHome: "Back home",
    noReportTitle: "No report yet",
    noReportText: "Return home and open a structure first. The report will appear here after generation.",
    reportGeneratedAt: "Generated",
    reportBirthInfo: "Birth info",
    reportFocusInfo: "Focus",
    reportQuestionInfo: "Question",
    reportsPageRegion: "Report archive",
    reportsPageKicker: "Report archive",
    reportsPageTitle: "My reports",
    reportsPageText: "Generated structures, questions, and annual rhythm reports return here. Next time, you do not start from zero.",
    reportsCount: "reports",
    reportFiltersLabel: "Filter by report type",
    reportFilters: { all: "All", bazi: "Structure", annual: "Annual rhythm", question: "One matter" },
    reportFilterEmpty: "There are no archived reports in this category yet.",
    reportsEmptyTitle: "No saved reports yet",
    reportsEmptyText: "Open a structure first. The report will be saved here after generation.",
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
      career: { option: "Career opportunity", title: "Do not rush the opening; steady your range first", tags: ["steady first", "outside chances", "rhythm adjustment"], line: "The opening may not arrive immediately. Put your skills and resources in order first." },
      relationship: { option: "Relationships", title: "Set the boundary, then move closer", tags: ["slow warmth", "serious promise", "boundaries"], line: "Closeness is not made by rushing. First know what kind of steadiness you need." },
      emotion: { option: "Overthinking", title: "A heavy mind, and a heavy sense of duty", tags: ["deep thought", "responsibility", "quiet digestion"], line: "The matter may not be hard. The hard part is always trying to carry it alone." },
      money: { option: "Money choices", title: "Read cash flow first, then decide", tags: ["cash flow", "clear judgment", "avoid impulse"], line: "Slow is not the issue. The risk is handing away your rhythm when you get anxious." },
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
      { key: "bazi", title: "Personal Structure Report", question: "Know yourself before you choose.", priceKey: "basic", action: "Generate personal structure report" },
      { key: "question", title: "One-Matter Analysis", question: "When the matter arrives, weigh it first.", priceKey: "basic", action: "Generate one-matter analysis" },
      { key: "annual", title: "Annual Rhythm Report", question: "From the reading date, look across the next 12 months.", priceKey: "annual", action: "Read annual rhythm report" },
    ],
    annualMembership: { key: "membership", title: "Annual Membership", question: "For people who read, ask, and revisit often.", priceKey: "membership", action: "Start membership" },
    entitlementStatusLabel: "Access status",
    entitlementLockedTitle: "This reading is not opened yet",
    entitlementLockedText: "Preview the sample judgments first. The full report generates after access is opened.",
    entitlementReady: "Opened, ready to generate",
    entitlementMemberReady: "Included in membership",
    entitlementRemaining: "{count} left",
    entitlementUsedUp: "Used",
    simulateUnlock: "Test unlock",
    simulateUnlockAria: "Test unlock: {product}",
    testUnlockCurrent: "Test unlock current reading",
    testUnlockHint: "Test entry, shown only locally or through a test link.",
    entitlementActive: "Opened",
    entitlementIncluded: "Member access",
    entitlementLocked: "Locked",
    annualLabel: "Annual rhythm · from generation date",
    annualTitle: "Read what is near, then the rhythm of the year.",
    annualText: "This is not cut by the calendar year. It starts from the moment you generate the report and organizes a full twelve months: what to steady now, and where to adjust later.",
    timelineLabel: "Next twelve months",
    coverageLabel: "Report range",
    coverageValue: "From reading date · full next 12 months",
    annualTimeline: [["Current month", "Settle the immediate priorities."], ["Next three months", "See the order of choices."], ["Next half year", "Watch the rhythm change."], ["Full twelve months", "Gather the priorities into one line."]],
    memberLabel: "Annual membership · long-term access",
    memberTitle: "Return often, and judgment becomes steadier.",
    memberText: "Membership is not another product. It keeps the readings, follow-ups, and archive together, so the next question does not start from zero.",
    memberBenefitsLabel: "Annual membership includes",
    memberBenefits: [["Personal Structure Report", "1", "full base structure"], ["Annual Rhythm Report", "1", "next 12 months"], ["One-Matter Analysis", "12/year", "monthly analysis"], ["Monthly Notes", "12 issues", "updated monthly"], ["Follow-up", "12/year", "ask further"], ["Archive", "long-term", "reports saved"]],
    sampleRegion: "Product samples",
    sampleKicker: "Reading samples",
    sampleTitle: "Few words. The point first.",
    previews: [["Personal Structure Report", "Know yourself; the mind steadies", "temperament, effort style, relationship habits"], ["One-Matter Analysis", "This matter asks for steadiness", "trend, risk, next step"], ["Annual Rhythm Report", "Steady what is near, adjust what is far", "next twelve months, chances, things to notice"]],
    methodRegion: "Method",
    methodKicker: "Why it earns trust",
    methodTitle: "Information is checked first; only then should advice be steady.",
    proof: [["Structured calculation", "Birth data enters a rule system before interpretation."], ["Advisor rules", "Human rules set the boundary for expression."], ["Clear interpretation", "Technical terms become usable language."], ["Consistency memory", "The same structure should not contradict itself later."]],
    closingRegion: "My reports entry",
    closingText: "Structures, questions, and annual rhythm reports all return to My reports.",
    closingTitle: "Read a little first, then decide how deep to go.",
    backToReading: "Back to structure entry",
    viewProducts: "View purchase options",
    footerTagline: "Youshu offers self-insight and decision support through an Eastern culture lens.",
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
          ["Service nature", "Youshu provides personal structure reports, one-matter analysis, and annual rhythm references generated from traditional-culture structures, interpretation rules, and large language model output. The content supports self-insight and decision-making; it does not guarantee that any predicted event will happen."],
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
          ["How we use it", "We use this information to calculate structures, generate reports, improve prompts and service quality, handle support requests, and, once accounts are connected, help you retrieve report history."],
          ["Large model processing", "When generating a report, necessary structure data, question context, and language options may be sent to our large model provider. We do not display or ask users to submit a DeepSeek API key on the customer page."],
          ["Retention and deletion", "During P0, reports may be stored in your browser session. After account support is added, reports may be stored by account. You may request deletion or correction through the support email."],
          ["Third-party services", "We may use Vercel for hosting and DeepSeek for report generation. We may later add Supabase, payment providers, and basic analytics. These providers process necessary data under their own policies."],
          ["Contact", `Privacy requests can be sent to ${supportEmail}.`],
        ],
      },
      refund: {
        title: "Refund Policy",
        intro: "Youshu readings are personalized digital content generated from user input. In general, once a report is generated or delivered, it is not eligible for a no-reason refund.",
        sections: [
          ["General rule", "Generated, displayed, or delivered personal structure reports, one-matter analysis, and annual rhythm reports are usually non-refundable. Please confirm that the service is reference-based digital content before purchase."],
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
          ["Service scope", "Personal structure reports, one-matter analysis, annual rhythm reports, annual membership, and report archive questions."],
          ["Response time", "We try to reply within 2 business days. Complex order, refund, or privacy requests may take longer to verify."],
        ],
      },
    },
    generationErrorTitle: "Generation paused",
    apiErrors: {
      backendKey: "The model service is being configured. Please try again later or contact support.",
      questionRequired: "Please write the specific question first, then generate a one-matter analysis.",
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

function parseReportSections(content) {
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

  return sections;
}

function getBlockText(block) {
  if (!block) {
    return "";
  }

  if (block.type === "list") {
    return block.items[0] || "";
  }

  return block.text || "";
}

function firstMeaningfulText(sections) {
  for (const section of sections) {
    for (const block of section.blocks) {
      const rawText = getBlockText(block);
      if (stripMarkdownMarkers(rawText)) {
        return rawText;
      }
    }
  }
  return "";
}

function firstMeaningfulLocator(sections) {
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    const section = sections[sectionIndex];
    for (let blockIndex = 0; blockIndex < section.blocks.length; blockIndex += 1) {
      const text = stripMarkdownMarkers(getBlockText(section.blocks[blockIndex]));
      if (text) {
        return { sectionIndex, blockIndex };
      }
    }
  }
  return null;
}

function getDisplayReportSections(sections, openingLocator) {
  return sections
    .map((section, sectionIndex) => {
      const blocks = section.blocks.filter((block, blockIndex) => {
        if (openingLocator?.sectionIndex === sectionIndex && openingLocator?.blockIndex === blockIndex) {
          return false;
        }

        return Boolean(stripMarkdownMarkers(getBlockText(block)));
      });

      return { ...section, blocks };
    })
    .filter((section) => section.blocks.length > 0);
}

function ReportBody({ content, t }) {
  if (!content) {
    return null;
  }

  const sections = parseReportSections(content);
  const openingText = firstMeaningfulText(sections);
  const openingLocator = firstMeaningfulLocator(sections);
  const displaySections = getDisplayReportSections(sections, openingLocator);

  return (
    <div className="report-body report-scroll">
      {openingText ? (
        <section className="report-verdict">
          <span>{t.reportVerdict}</span>
          <p>{renderInlineMarkdown(openingText)}</p>
        </section>
      ) : null}

      {displaySections.length ? (
        <nav className="report-outline" aria-label={t.reportOutline}>
          <span>{t.reportOutline}</span>
          <div>
            {displaySections.map((section, sectionIndex) => (
              <a href={`#report-section-${sectionIndex}`} key={`outline-${section.heading}-${sectionIndex}`}>
                <b>{String(sectionIndex + 1).padStart(2, "0")}</b>
                {section.heading || t.reportHighlights}
              </a>
            ))}
          </div>
        </nav>
      ) : null}

      <div className="report-chapters">
        {displaySections.map((section, sectionIndex) => (
          <section className="report-block" id={`report-section-${sectionIndex}`} key={`${section.heading}-${sectionIndex}`}>
            <div className="chapter-mark">{String(sectionIndex + 1).padStart(2, "0")}</div>
            <div>
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
            </div>
          </section>
        ))}
      </div>
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

function getStoredEntitlements() {
  if (typeof window === "undefined") {
    return normalizeEntitlements();
  }

  return normalizeEntitlements(readJsonStorage(window.localStorage, entitlementStorageKey, {}));
}

function saveStoredEntitlements(entitlements) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(entitlementStorageKey, JSON.stringify(normalizeEntitlements(entitlements)));
  } catch {
    // Entitlements stay in memory if local storage is unavailable.
  }
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

function buildConsistencyProfile(content) {
  const sections = parseReportSections(content);
  const openingLocator = firstMeaningfulLocator(sections);
  const displaySections = getDisplayReportSections(sections, openingLocator);
  const opening = stripMarkdownMarkers(firstMeaningfulText(sections));
  const points = displaySections.slice(0, 3).map((section) => {
    const detail = stripMarkdownMarkers(getBlockText(section.blocks[0]));
    return detail ? `${section.heading || "判断"}：${detail}` : "";
  });

  return [opening, ...points].filter(Boolean).join("\n").slice(0, 900);
}

function getLatestCoreProfile(reports) {
  const latestProfileReport = reports.find((savedReport) => savedReport.type === "bazi" && savedReport.content);
  if (!latestProfileReport) {
    return "";
  }

  return latestProfileReport.consistencyProfile || buildConsistencyProfile(latestProfileReport.content);
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
    consistencyProfile: buildConsistencyProfile(report.content),
    promptVersion: reportPromptVersion,
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

function isTestUnlockMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  return isLocalHost || new URLSearchParams(window.location.search).get("test") === "1";
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

function fillTemplate(template, values) {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);
}

function getAccessTitle(access, t) {
  if (access.unlocked && access.source === "membership") {
    return t.entitlementMemberReady;
  }
  if (access.unlocked) {
    return t.entitlementReady;
  }
  if (access.source === "used") {
    return t.entitlementUsedUp;
  }
  return t.entitlementLockedTitle;
}

function getProductStatusLabel(status, t) {
  if (status === "included") {
    return t.entitlementIncluded;
  }
  if (status === "active") {
    return t.entitlementActive;
  }
  if (status === "used") {
    return t.entitlementUsedUp;
  }
  return t.entitlementLocked;
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
  const companyName = t.nav[0] === "Structure" ? companyNameEn : companyNameZh;

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
  const [activeFilter, setActiveFilter] = useState("all");
  const reportTypes = ["all", "bazi", "annual", "question"];
  const filteredReports = activeFilter === "all" ? reports : reports.filter((savedReport) => savedReport.type === activeFilter);

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
                <div>
                  <span>
                    {reports.length} {t.reportsCount}
                  </span>
                </div>
                <div className="report-filter" role="group" aria-label={t.reportFiltersLabel}>
                  {reportTypes.map((type) => (
                    <button
                      className={activeFilter === type ? "is-active" : ""}
                      type="button"
                      key={type}
                      aria-pressed={activeFilter === type}
                      onClick={() => setActiveFilter(type)}
                    >
                      {t.reportFilters[type]}
                    </button>
                  ))}
                </div>
              </div>
              {filteredReports.length ? (
                <div className="report-list">
                  {filteredReports.map((savedReport) => {
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
              ) : (
                <p className="report-filter-empty">{t.reportFilterEmpty}</p>
              )}
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
    <main className="report-page report-detail-page" lang={report?.language || undefined}>
      <section className="report-hero" aria-label={t.reportPageRegion} role="region">
        <div className="report-hero-copy report-detail-intro">
          <p className="kicker">{t.reportPageKicker}</p>
          <h1>{report ? reportType : t.noReportTitle}</h1>
          <p>{report ? t.reportPageText : t.noReportText}</p>
          <button className="primary-btn" type="button" onClick={onBackHome}>
            {t.reportBackHome}
          </button>
        </div>
        <article className={`generated-report report-page-card report-type-${report?.type || "unknown"}`} aria-label={t.generatedTitle}>
          {report ? (
            <>
              <header className="report-heading">
                <div className="report-heading-status">
                  <span>{t.reportReady}</span>
                  <em>{getReportTypeEyebrow(report, t)}</em>
                </div>
                <div className="report-context-line">
                  {generatedAt ? <span>{t.reportGeneratedAt} {generatedAt}</span> : null}
                  {birthInfo ? <span>{t.reportBirthInfo} {birthInfo}</span> : null}
                  {report.focus ? <span>{t.reportFocusInfo} {report.focus}</span> : null}
                </div>
                {report.question ? <p className="report-question"><span>{t.reportQuestionInfo}</span>{report.question}</p> : null}
                {report.paipan ? (
                  <p className="report-meta">
                    <strong>{t.reportPillars}</strong>
                    {report.paipan.pillars.year.value} · {report.paipan.pillars.month.value} · {report.paipan.pillars.day.value} · {report.paipan.pillars.hour.value}
                  </p>
                ) : null}
              </header>
              <ReportBody content={report.content} t={t} />
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
  const [entitlements, setEntitlements] = useState(getStoredEntitlements);
  const [reports, setReports] = useState(getStoredReports);
  const [report, setReport] = useState(getStoredReport);
  const [page, setPage] = useState(getCurrentPage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cloudUser, setCloudUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const t = copy[language];
  const activeEntry = t.entryModes[entryMode];
  const activeAccess = getModeAccess(entitlements, entryMode);
  const featuredProduct = t.products[2];
  const purchaseOptions = [...t.products, t.annualMembership];
  const cloudEnabled = Boolean(supabaseClient);
  const reportIdFromUrl = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("id");
  const displayedReport = reportIdFromUrl ? reports.find((savedReport) => savedReport.id === reportIdFromUrl) || report : report;
  const testUnlockEnabled = isTestUnlockMode();

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
        await refreshCloudData(nextUser);
      }
    }

    const subscription = supabaseClient.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      setCloudUser(nextUser);
      if (nextUser) {
        refreshCloudData(nextUser);
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

  async function refreshCloudData(user = cloudUser) {
    if (!supabaseClient || !user) {
      return;
    }

    try {
      const [cloudReports, cloudEntitlements] = await Promise.all([
        loadCloudReports(supabaseClient, user),
        loadCloudEntitlements(supabaseClient, user),
      ]);
      setReports((currentReports) => mergeReports(cloudReports, currentReports));
      setEntitlements((currentEntitlements) => {
        const nextEntitlements = mergeEntitlements(currentEntitlements, cloudEntitlements);
        saveStoredEntitlements(nextEntitlements);
        return nextEntitlements;
      });
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

  function updateEntitlements(updater) {
    setEntitlements((currentEntitlements) => {
      const nextEntitlements = updater(currentEntitlements);
      saveStoredEntitlements(nextEntitlements);
      return nextEntitlements;
    });
  }

  function openTestEntitlement(productKey) {
    updateEntitlements((currentEntitlements) => grantProduct(currentEntitlements, productKey));
  }

  function consumeCurrentEntitlement() {
    updateEntitlements((currentEntitlements) => consumeEntitlement(currentEntitlements, entryMode));
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
    const nextAccess = getModeAccess(entitlements, entryMode);
    if (!nextAccess.unlocked) {
      return;
    }

    const coreProfile = getLatestCoreProfile(reports);
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
          coreProfile,
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
      consumeCurrentEntitlement();
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
              <aside className={`entitlement-state ${activeAccess.unlocked ? "is-open" : "is-locked"}`} aria-live="polite">
                <span>{t.entitlementStatusLabel}</span>
                <strong>{getAccessTitle(activeAccess, t)}</strong>
                <p>
                  {activeAccess.unlocked
                    ? fillTemplate(t.entitlementRemaining, { count: activeAccess.remaining })
                    : t.entitlementLockedText}
                </p>
              </aside>
              {testUnlockEnabled ? (
                <div className="test-unlock-panel">
                  <button type="button" onClick={() => openTestEntitlement(entryMode)}>
                    {t.testUnlockCurrent}
                  </button>
                  <span>{t.testUnlockHint}</span>
                </div>
              ) : null}
              <div className="form-submit api-actions single-action" aria-live="polite">
                <button type="button" onClick={generate} disabled={isGenerating || !activeAccess.unlocked}>
                  {activeEntry.action}
                </button>
              </div>
            </form>

            {isGenerating ? (
              <div className="insight-stage" id="reading-result" aria-live="polite">
                <article className="loading-report" aria-label={t.generating}>
                  <div className="loading-yinyang" aria-hidden="true">
                    <YinYangOrb label="" />
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
          <div className="section-copy narrow product-intro">
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
                const productStatus = getProductStatus(entitlements, product.key);
                const unlockLabel = fillTemplate(t.simulateUnlockAria, { product: product.title });

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
                    <em className="entitlement-pill">{getProductStatusLabel(productStatus, t)}</em>
                    <div className="product-card-actions">
                      <a
                        href={isMembership ? "#membership" : "#reading"}
                        onClick={() => {
                          if (!isMembership) {
                            setEntryMode(product.key);
                          }
                        }}
                      >
                        {product.action}
                      </a>
                      {testUnlockEnabled ? (
                        <button type="button" aria-label={unlockLabel} onClick={() => openTestEntitlement(product.key)}>
                          {t.simulateUnlock}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="service-detail-grid compact-service-detail">
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

        <section className="method compact-method" id="method" aria-label={t.methodRegion} role="region">
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
      </main>
      )}
      <SiteFooter t={t} navigate={navigate} />
    </>
  );
}
