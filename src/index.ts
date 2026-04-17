import { OpenAI } from "openai";

const client = new OpenAI({
    baseURL: "http://localhost:11434/v1",
    apiKey: process.env.MODELSCOPE_API_KEY,
});

const MODEL = 'qwen3.5:2b';

const SYSTEM_PROMPT = `
    你是一个Coding Agent，只输出纯代码或Shell命令，不要任何解释、文字、注释。
    用户要代码就输出完整代码，要命令就输出纯命令。
  `;

async function startAgent() {
    console.log("🚀 Bun Coding Agent 已启动！输入 exit 退出");

    while (true) {
        // 接收用户输入
        const input = prompt("\n👉 输入编程需求：");
        if (!input || input.toLowerCase() === "exit") {
            console.log("👋 退出");
            process.exit(0);
        }

        // AI 生成内容
        console.log("🔄 AI 处理中...");
        const res = await client.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "user", content: input }
            ],
            stream: true,
        });

        // 实时输出 AI 生成的内容
        let thinking = true;

        for await (const chunk of res) {
            const reasoning = chunk.choices[0]?.delta?.reasoning || "";
            const content = chunk.choices[0]?.delta?.content || "";

            if (reasoning) {
                process.stdout.write(`\x1b[90m${reasoning}\x1b[0m`);
            }
            if (content && thinking) {
                thinking = false;
                console.log('\n');
            }
            if (content) {
                process.stdout.write(`\x1b[32m${content}\x1b[0m`);
            }
        }

        console.log();

    }
}

startAgent();
