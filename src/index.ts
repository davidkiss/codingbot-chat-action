import fs from 'fs/promises';
import { CompositeBackend, createDeepAgent, FilesystemBackend, StoreBackend } from 'deepagents';
import path from 'path';

interface GitHubComment {
    author: {
        login: string;
    };
    body: string;
}

interface IssueData {
    body: string;
    comments: GitHubComment[];
    author: {
        login: string;
    };
    number: number;
    title: string;
}

const DEFAULT_PROMPT_TEMPLATE = `You're an expert AI coding assistant. Follow the steps below:

1. Brainstorm task from user {user} and save the generated specs.
2. Confirm tasks with user then save task breakdown and output it to the user.
3. Confirm if user is ready to implement the changes.
4. After user confirmed, implement the code changes based on the specs and task breakdown.
5. Final output should be <DONE> if the code changes are completed`;

async function runAgent(): Promise<void> {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Usage: npx tsx src/index.ts <issue_json_path>");
        process.exit(1);
    }

    const issuePath = path.resolve(args[0]);
    const issueData: IssueData = JSON.parse(await fs.readFile(issuePath, 'utf-8'));

    const model = process.env.MODEL || "google-genai:gemini-3-flash-preview";
    const promptTemplate = process.env.PROMPT_TEMPLATE || DEFAULT_PROMPT_TEMPLATE;
    const skillsPath = process.env.SKILLS_PATH || path.join(process.env.HOME || '', '.agents/skills/');

    const messages: { role: string; content: string }[] = [
        {
            role: "user",
            content: issueData.body
        }
    ];

    for (const comment of issueData.comments || []) {
        const isBot = comment.author.login.includes("[bot]") || comment.author.login === "github-actions";
        const role = isBot ? "ai" : "user";
        messages.push({
            role,
            content: comment.body || "No content"
        });
    }

    if (messages.length > 1 && messages[messages.length - 1].role === "ai") {
        console.log("Last message was assistant. Exiting.");
        process.exit(0);
    }

    const agent = createDeepAgent({
        model,
        systemPrompt: promptTemplate.replace('{user}', issueData.author.login),
        backend: (config) => new CompositeBackend(
            new FilesystemBackend({
                rootDir: process.cwd(),
            }),
            { "/conversation_history/": new StoreBackend(config) }
        ),
        skills: [skillsPath],
    });

    const responseFile = await fs.open("bot_response.md", "w");

    try {
        const stream = await agent.stream(
            { messages },
            { streamMode: "messages" }
        );

        for await (const chunks of stream) {
            for (const chunk of chunks) {
                if (chunk.content && !("tool_call_id" in chunk)) {
                    process.stdout.write(chunk.content);
                    await responseFile.write(chunk.content);
                }
            }
        }
    } finally {
        await responseFile.close();
    }
}

runAgent().catch(err => {
    console.error(err);
    process.exit(1);
});
