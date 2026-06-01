import { app } from "./app.js";
import { env } from "./config/env.js";
import { testDBConnection } from "./db/index.js";

const PORT = env.PORT || 5000;

const startServer = async () => {
    // 1. Verify PostgreSQL DB Connection (Fail-fast strategy)
    await testDBConnection();

    // 2. Start Express HTTP Server
    app.listen(PORT, () => {
        console.log(`🚀 InkForge Server is live in ${env.NODE_ENV} mode at http://localhost:${PORT}`);
    });
};

startServer();
