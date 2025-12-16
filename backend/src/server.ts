import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import casesRouter from "./routes/cases";
import messagesRouter from "./routes/messages";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/cases", casesRouter);
app.use("/messages", messagesRouter);

// Test route
app.get("/", (req, res) => {
  res.send("Gods-Eye Backend Running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
