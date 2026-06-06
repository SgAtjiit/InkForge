import { env } from "../config/env.js";

export const analyzeContentWithAI = async ({ title, content }) => {
    const apiKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        // Fallback rule-based moderation in development mode when key is missing
        const prohibitedKeywords = ["hate", "spam", "abuse", "scam", "malware"];
        const lowerContent = `${title} ${content}`.toLowerCase();

        const foundIssues = prohibitedKeywords.filter((word) => lowerContent.includes(word));
        const isFlagged = foundIssues.length > 0;

        return {
            flagged: isFlagged,
            severity: isFlagged ? "high" : "none",
            issues: isFlagged ? foundIssues.map((w) => `Detected potential prohibited term: "${w}"`) : [],
            suggestedContent: null,
            provider: "OpenRouter (Dev Fallback)",
            analyzedAt: new Date().toISOString(),
        };
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "HTTP-Referer": env.CORS_ORIGIN || "http://localhost:5000",
                "X-Title": "InkForge AI Moderation",
            },
            body: JSON.stringify({
                model: env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an automated AI content moderation engine for a blog platform. Analyze the provided title and content for hate speech, extreme violence, spam, malware, or harassment. Output strictly raw JSON without markdown formatting code blocks.",
                    },
                    {
                        role: "user",
                        content: `Analyze this post. Return strictly JSON matching schema:
{
  "flagged": boolean,
  "severity": "high" | "medium" | "low" | "none",
  "issues": ["string"],
  "suggestedContent": "string" | null
}

Title: ${title}
Content: ${content}`,
                    },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: status ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content || "{}";
        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedText);

        return {
            ...parsed,
            provider: `OpenRouter (${env.OPENROUTER_MODEL})`,
            analyzedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("OpenRouter AI Moderation Error:", error.message);
        return {
            flagged: false,
            severity: "none",
            issues: ["OpenRouter moderation service error fallback"],
            suggestedContent: null,
            provider: "OpenRouter Error Fallback",
            analyzedAt: new Date().toISOString(),
        };
    }
};
