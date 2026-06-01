import { cleanEnv, str, port, email } from "envalid";
import dotenv from "dotenv";

dotenv.config();

export const env = cleanEnv(process.env, {
    PORT: port({ default: 5000 }),
    NODE_ENV: str({ choices: ["development", "test", "production"], default: "development" }),
    DB_URL: str({ desc: "PostgreSQL Database Connection URL (Neon)" }),
    CORS_ORIGIN: str({ default: "http://localhost:5173" }),
    JWT_ACCESS_SECRET: str({ default: "inkforge_access_secret_dev_key_123!" }),
    JWT_ACCESS_EXPIRY: str({ default: "15m" }),
    JWT_REFRESH_SECRET: str({ default: "inkforge_refresh_secret_dev_key_123!" }),
    JWT_REFRESH_EXPIRY: str({ default: "7d" }),
    CLOUDINARY_CLOUD_NAME: str({ default: "" }),
    CLOUDINARY_API_KEY: str({ default: "" }),
    CLOUDINARY_API_SECRET: str({ default: "" }),
    OPENROUTER_API_KEY: str({ default: "" }),
    OPENROUTER_MODEL: str({ default: "meta-llama/llama-3.3-70b-instruct" }),
    RESEND_API_KEY: str({ default: "" }),
    ADMIN_EMAIL: str({ default: "admin@inkforge.dev" }),
    ADMIN_PASSWORD: str({ default: "AdminPass123" }),
});
