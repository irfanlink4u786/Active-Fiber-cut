require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SHEET_ID = process.env.SHEET_ID;
const RANGE = process.env.SHEET_RANGE || "Sheet1";

const sheets = google.sheets({ version: "v4", auth: API_KEY });
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.get("/api/sheet-data", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No data found." });
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
  res.send("Backend is running");
});

app.get("/", (req, res) => {
  res.send("Welcome! Use /api/health or /api/sheet-data");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
