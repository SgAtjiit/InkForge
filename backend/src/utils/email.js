import { env } from "../config/env.js";

export const sendTransactionalEmail = async ({ to, subject, html }) => {
    const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;

    if (!apiKey) {
        console.log(`[Email Dev Log] To: ${to} | Subject: "${subject}" | Content length: ${html?.length || 0} chars`);
        return { success: true, mode: "dev_log" };
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                from: "InkForge <notifications@inkforge.dev>",
                to: [to],
                subject,
                html,
            }),
        });

        if (!response.ok) {
            throw new Error(`Email provider error: status ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Failed to send transactional email:", error.message);
        return { success: false, error: error.message };
    }
};
