import "dotenv/config";
import dns from "dns";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

// Custom DNS lookup fallback resolver using Google/Cloudflare public DNS
const customDnsLookup = (hostname, options, cb) => {
    const callback = typeof options === "function" ? options : cb;
    const opts = typeof options === "object" ? options : {};

    dns.lookup(hostname, opts, (err, address, family) => {
        if (err || !address) {
            const resolver = new dns.Resolver();
            try {
                resolver.setServers(["8.8.8.8", "1.1.1.1"]);
            } catch (e) {}

            resolver.resolve4(hostname, (resErr, addresses) => {
                if (resErr || !addresses || addresses.length === 0) {
                    return callback(err || resErr);
                }
                if (opts.all) {
                    return callback(null, addresses.map((addr) => ({ address: addr, family: 4 })));
                }
                return callback(null, addresses[0], 4);
            });
        } else {
            return callback(null, address, family);
        }
    });
};

const pool = new pg.Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false,
        servername: "ep-billowing-butterfly-axx50gx3.c-4.us-east-2.aws.neon.tech",
    },
    lookup: customDnsLookup,
});

export const db = drizzle(pool, { schema });

export const testDBConnection = async () => {
    try {
        const client = await pool.connect();
        console.log("✅ PostgreSQL (Neon) Database connected successfully!");
        client.release();
    } catch (error) {
        console.error("💥 PostgreSQL Database Connection Error:", error.message);
        process.exit(1); // Crash server if DB connection fails
    }
};