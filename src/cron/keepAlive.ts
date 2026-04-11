import cron from "node-cron";
import { pool } from "../db/pool";

cron.schedule("*/10 * * * *", async () => {
    try {
        const client = await pool.connect();
        await client.query("SELECT 1");
        client.release();
        console.log("🟢 DB keep-alive ping successful");
    } catch (error) {
        console.error("🔴 DB keep-alive ping failed:", error);
    }
});