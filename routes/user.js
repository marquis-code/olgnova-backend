const express = require("express");
const { google } = require("googleapis");
const router = express.Router();
require("dotenv").config();

// Spreadsheet configuration
const SPREADSHEET_ID = "1RXK6s4qEw_oXq_RywKnnnS8-7nUX707BFjW5nVAqZt4";
const SHEETS = {
  GENERAL: "General Enquires",
  PROGRAM: "Pro Bono Enquires",
  EMAIL: "Email Subscriptions"
};

// Helper function to authenticate with Google Sheets API
async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  return await auth.getClient();
}

// Helper function to get Google Sheets instance
function getGoogleSheets(client) {
  return google.sheets({
    version: "v4",
    auth: client,
  });
}

// Helper function to append data to a specific sheet
async function appendToSheet(googleSheets, sheetName, values) {
  try {
    await googleSheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`, // Using A:Z to accommodate any number of columns
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [values],
      },
    });
    return true;
  } catch (error) {
    console.error(`Error appending to ${sheetName}:`, error);
    return false;
  }
}

// 1. General Enquiries Route
router.post("/general-enquiry", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;
    
    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        error: "Missing required fields. Please provide firstName, lastName, email, and message."
      });
    }

    const client = await getAuthClient();
    const googleSheets = getGoogleSheets(client);
    
    // Add timestamp to the data
    const timestamp = new Date().toISOString();
    const values = [timestamp, firstName, lastName, email, phone || "N/A", message];
    
    const success = await appendToSheet(googleSheets, SHEETS.GENERAL, values);
    
    if (success) {
      return res.status(200).json({
        successMessage: "Thank you for your enquiry. We will get back to you shortly!"
      });
    } else {
      throw new Error("Failed to save data");
    }
  } catch (error) {
    console.error("General enquiry error:", error);
    return res.status(500).json({
      error: "Something went wrong. Please try again later."
    });
  }
});

// 2. Program/Pro Bono Enquiries Route
router.post("/program-enquiry", async (req, res) => {
  try {
    const { organization_name, contact_name, contact_email, focus_area, organization_description} = req.body;
    
    // Basic validation
    if (!firstName || !lastName || !email || !programName) {
      return res.status(400).json({
        error: "Missing required fields. Please provide firstName, lastName, email, and programName."
      });
    }

    const client = await getAuthClient();
    const googleSheets = getGoogleSheets(client);
    
    // Add timestamp to the data
    const timestamp = new Date().toISOString();
    const values = [
      timestamp, 
      organization_name, contact_name, contact_email, focus_area, organization_description
    ];
    
    const success = await appendToSheet(googleSheets, SHEETS.PROGRAM, values);
    
    if (success) {
      return res.status(200).json({
        successMessage: "Thank you for your program enquiry. Our team will contact you soon!"
      });
    } else {
      throw new Error("Failed to save data");
    }
  } catch (error) {
    console.error("Program enquiry error:", error);
    return res.status(500).json({
      error: "Something went wrong. Please try again later."
    });
  }
});

// 3. Email Subscription Route
router.post("/subscribe", async (req, res) => {
  try {
    const { email, interests } = req.body;
    
    // Basic validation
    if (!email) {
      return res.status(400).json({
        error: "Email address is required."
      });
    }

    const client = await getAuthClient();
    const googleSheets = getGoogleSheets(client);
    
    // Add timestamp to the data
    const timestamp = new Date().toISOString();
    const values = [
      timestamp, 
      email, 
      interests ? interests.join(", ") : "General"
    ];
    
    const success = await appendToSheet(googleSheets, SHEETS.EMAIL, values);
    
    if (success) {
      return res.status(200).json({
        successMessage: "You have been successfully subscribed to our newsletter!"
      });
    } else {
      throw new Error("Failed to save subscription");
    }
  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({
      error: "Something went wrong. Please try again later."
    });
  }
});

module.exports = router;