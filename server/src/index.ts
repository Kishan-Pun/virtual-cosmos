const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import dotenv from "dotenv";
import { connectDB } from "./db";
import { createServer } from "./server";

dotenv.config();

const start = async () => {
  try {
    await connectDB(); // ✅ WAIT for DB

    const server = createServer();

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

start();
