const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");

const router = express.Router();

const graphVersion = process.env.META_GRAPH_VERSION || "v25.0";

// Instagram token model
const InstagramConnection =
  mongoose.models.InstagramConnection ||
  mongoose.model(
    "InstagramConnection",
    new mongoose.Schema(
      {
        connectionKey: {
          type: String,
          default: "primary",
          unique: true
        },
        encryptedToken: {
          type: String,
          required: true
        },
        iv: {
          type: String,
          required: true
        },
        authTag: {
          type: String,
          required: true
        },
        tokenType: String,
        expiresAt: Date,
        connectedAt: {
          type: Date,
          default: Date.now
        }
      },
      { timestamps: true }
    )
  );

// Encrypt access token before saving
function encryptToken(token) {
  const key = Buffer.from(
    process.env.IG_TOKEN_ENCRYPTION_KEY || "",
    "hex"
  );

  if (key.length !== 32) {
    throw new Error(
      "IG_TOKEN_ENCRYPTION_KEY must be 64 hexadecimal characters"
    );
  }

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final()
  ]);

  return {
    encryptedToken: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex")
  };
}

// Exchange authorization code for access token
router.post("/exchange", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required"
      });
    }

    const required = [
      "META_APP_ID",
      "META_APP_SECRET",
      "IG_TOKEN_ENCRYPTION_KEY"
    ];

    const missing = required.filter(
      (key) => !process.env[key]
    );

    if (missing.length) {
      return res.status(500).json({
        success: false,
        message: "Missing Meta environment variables",
        missing
      });
    }

    const tokenUrl = new URL(
      `https://graph.facebook.com/${graphVersion}/oauth/access_token`
    );

    tokenUrl.search = new URLSearchParams({
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      code
    }).toString();

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error(
        "Meta token exchange failed:",
        tokenData.error?.message || tokenData
      );

      return res.status(400).json({
        success: false,
        message: "Meta token exchange failed",
        error: tokenData.error?.message || "Invalid authorization code"
      });
    }

    const encrypted = encryptToken(tokenData.access_token);

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null;

    await InstagramConnection.findOneAndUpdate(
      { connectionKey: "primary" },
      {
        ...encrypted,
        tokenType: tokenData.token_type || "bearer",
        expiresAt,
        connectedAt: new Date()
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return res.json({
      success: true,
      message: "Instagram authorization successful",
      tokenStored: true
    });

  } catch (error) {
    console.error("Instagram exchange error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Instagram authorization failed"
    });
  }
});

module.exports = router;