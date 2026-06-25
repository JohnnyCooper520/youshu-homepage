# DeepSeek 接入说明

> 用途：P0 阶段本地测试「今年运势解读」报告生成。密钥只放在本机环境变量，不写进前端代码和仓库。

## 1. 模型选择

- 默认模型：`deepseek-v4-flash`
- 接口：`https://api.deepseek.com/chat/completions`
- 模式：关闭 thinking，优先保证 P0 报告生成的速度、成本和输出稳定性。

## 2. 本地运行

网页接入需要同时启动后端 API 和前端 Vite。所有命令都要在项目目录执行：

```bash
cd /Users/johnny/Documents/算命产品
```

终端 1：

```bash
export DEEPSEEK_API_KEY="你的 DeepSeek API Key"
npm run api:dev
```

终端 2：

```bash
npm run dev
```

然后打开：

```text
http://127.0.0.1:5173/
```

API Key 只能放在服务端或运维端，不出现在 C 端网页里：

1. 本地开发：在启动 `npm run api:dev` 前执行 `export DEEPSEEK_API_KEY="你的 DeepSeek API Key"`。
2. Vercel/线上：在项目的 Environment Variables 里配置 `DEEPSEEK_API_KEY`。
3. 运维临时写入：只有显式设置 `ALLOW_RUNTIME_DEEPSEEK_KEY=true` 时，`/api/deepseek/key` 才允许写入运行时 Key。默认关闭，不提供给 C 端页面。

`/api/deepseek/status` 只返回是否已配置和来源（`env` 或 `runtime`），不会返回 Key 明文。

先生成排盘 JSON：

```bash
npm run paipan:demo -- 1988-01-14 11:25 male 长春
```

再设置 DeepSeek Key，并生成报告：

```bash
export DEEPSEEK_API_KEY="你的 DeepSeek API Key"
npm run deepseek:annual -- dist/samples/paipan-19880114-1125.json
```

指定报告语言：

```bash
npm run deepseek:annual -- dist/samples/paipan-19880114-1125.json --lang zh-CN
npm run deepseek:annual -- dist/samples/paipan-19880114-1125.json --lang zh-TW
npm run deepseek:annual -- dist/samples/paipan-19880114-1125.json --lang en
```

生成结果会写入：

```text
dist/reports/deepseek-annual-report-19880114-1125.md
```

也可以一次验收三类生成：命盘报告、今年运势解读、问事解惑。

不请求模型，只检查三类 Prompt：

```bash
npm run deepseek:smoke -- 1988-01-14 11:25 male 长春 --lang zh-CN --focus 事业机会 --question "接下来半年适合换工作吗？" --dry-run
```

放入真实 DeepSeek Key 后，请求模型并分别保存三类报告：

```bash
export DEEPSEEK_API_KEY="你的 DeepSeek API Key"
npm run deepseek:smoke -- 1988-01-14 11:25 male 长春 --lang zh-CN --focus 事业机会 --question "接下来半年适合换工作吗？"
```

输出目录：

```text
dist/reports/deepseek-smoke-19880114-1125/
```

## 3. 安全边界

- 不要把 `DEEPSEEK_API_KEY` 写入 `src/`、网页代码或 GitHub。
- 真正上线时，前端不直接请求 DeepSeek；应由后端接口接收表单、调用排盘和模型，再把报告返回给用户。
- 当前 Prompt 已要求模型把输出定位为文化参考和决策辅助，并避免发财、复合、升职、疾病好转等确定性承诺。
- 当前网页已接入三类生成：命盘报告、今年运势解读、问事解惑。三类都先走确定性排盘，再把排盘 JSON 交给 DeepSeek 解读。
- 网页语言选择会传入 `/api/generate`，报告支持简体中文、繁体中文和英文三种输出。
- 三类报告的结构、语气和安全边界见 `docs/报告与问答框架规则.md`。

## 4. 下一步

1. 用 10-20 个真实样本生成报告。
2. 创始人先评估「像不像我、有无价值、是否愿意付费」。
3. 命理顾问评估「判断是否离谱、边界是否安全」。
4. 再把稳定 Prompt 接进网页体验。
