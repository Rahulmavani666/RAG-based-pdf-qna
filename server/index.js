const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());


const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });


const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}.pdf`);
  },
});
const upload = multer({ storage });
const projectDir = path.resolve(__dirname, "..");

// app.get("/", (req, res) => {
//     res.send("Hello World!")
// });
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file received." });
  }

  const ingest = spawn(process.env.PYTHON_COMMAND || "python3", [
    path.join(projectDir, "ingest.py"),
    req.file.path,
  ], {
    cwd: projectDir,
    env: process.env,
  });

  ingest.stdout.on("data", (data) => {
    process.stdout.write(`[ingest] ${data}`);
  });
  ingest.stderr.on("data", (data) => {
    process.stderr.write(`[ingest] ${data}`);
  });
  let responseSent = false;
  ingest.on("error", (error) => {
    console.error("Could not start PDF ingestion:", error);
    responseSent = true;
    return res.status(500).json({ error: "Could not start PDF ingestion." });
  });
  ingest.on("close", (code) => {
    if (responseSent) return;
    if (code !== 0) {
      console.error(`PDF ingestion failed with exit code ${code}`);
      responseSent = true;
      return res.status(500).json({ error: "PDF indexing failed." });
    }

    responseSent = true;
    return res.json({
      message: "PDF received and indexed.",
      filename: req.file.filename,
      indexing: "complete",
    });
  });
});

app.post("/api/ask", (req, res) => {
  const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
  if (!question) {
    return res.status(400).json({ error: "Question is required." });
  }

  const ask = spawn(process.env.PYTHON_COMMAND || "python3", [
    path.join(projectDir, "ask.py"),
    question,
  ], {
    cwd: projectDir,
    env: process.env,
  });
  let output = "";
  let errorOutput = "";

  ask.stdout.on("data", (data) => {
    output += data.toString();
  });
  ask.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });
  ask.on("error", (error) => {
    console.error("Could not start question answering:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Could not start question answering." });
    }
  });
  ask.on("close", (code) => {
    if (res.headersSent) return;
    if (code !== 0) {
      console.error(`Question answering failed with exit code ${code}: ${errorOutput}`);
      return res.status(500).json({ error: "Question answering failed." });
    }

    const answer = output.split("__ANSWER__")[1]?.trim();
    if (!answer) {
      console.error("Question answering returned no answer.");
      return res.status(500).json({ error: "Question answering returned no answer." });
    }
    return res.json({ answer });
  });
});


app.listen(8000, () => {
    console.log('Server is running on port 8000')
    });