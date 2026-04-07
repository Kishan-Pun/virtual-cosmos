const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import dotenv from "dotenv";
import { connectDB } from "./db";
import { createServer } from "./server";

dotenv.config();

// connect DB
connectDB();

// create server
const server = createServer();

// start server
server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});