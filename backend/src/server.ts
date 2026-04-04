import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import casesRouter from "./routes/cases";
import messagesRouter from "./routes/messages";
import invigilatorRouter from "./routes/invigilator";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use("/api/cases", casesRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/inv", invigilatorRouter);

// Test route
app.get("/", (req, res) => {
  res.send("Gods-Eye Backend Running!");
});

// Tor Check proxy route
app.get("/api/tor-check", async (req, res) => {
  try {
    const response = await fetch("https://check.torproject.org/api/ip");
    if (!response.ok) {
      throw new Error(`Tor API responded with status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error("Tor check error:", err.message);
    res.status(500).json({ IsTor: false, error: err.message });
  }
});

// Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// app.listen(PORT, "127.0.0.1", () => {
//   console.log(`Server running on http://127.0.0.1:${PORT}`);
// });

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
