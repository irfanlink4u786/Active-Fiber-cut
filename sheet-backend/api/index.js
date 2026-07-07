require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SHEET_ID = process.env.SHEET_ID;
const RANGE = process.env.SHEET_RANGE || "Sheet1";
const sheets = google.sheets({ version: "v4", auth: API_KEY });

// Serve static files from the "public" folder – note the path is now "../public"
app.use(express.static(path.join(__dirname, "../public")));

// Your API endpoint
app.get("/api/sheet-data", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No data found in the sheet." });
    }
    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = row[idx] || "";
      });
      return obj;
    });
    res.json({ headers, data });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

// For any other route, serve the main HTML (so refreshing works)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// 🔥 Export the app for Vercel (no app.listen!)
module.exports = app;