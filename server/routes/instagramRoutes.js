
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");

const router = express.Router();

const graphVersion = process.env.META_GRAPH_VERSION || "v25.0";
const graphBaseUrl = `https://graph.facebook.com/${graphVersion}`;

// Instagram connection model
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

// Validate encryption key
function getEncryptionKey() {
  const key = Buffer.from(
    process.env.IG_TOKEN_ENCRYPTION_KEY || "",
    "hex"
  );

  if (key.length !== 32) {
    throw new Error(
      "IG_TOKEN_ENCRYPTION_KEY must be 64 hexadecimal characters"
    );
  }

  return key;
}

// Encrypt access token
function encryptToken(token) {
  const key = getEncryptionKey();
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

// Decrypt saved token
function decryptToken(connection) {
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(connection.iv, "hex")
  );

  decipher.setAuthTag(
    Buffer.from(connection.authTag, "hex")
  );

  return Buffer.concat([
    decipher.update(
      Buffer.from(connection.encryptedToken, "hex")
    ),
    decipher.final()
  ]).toString("utf8");
}

// Graph API helper
async function graphRequest(path, params = {}) {
  const url = new URL(`${graphBaseUrl}/${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Meta Graph API request failed"
    );
  }

  return data;
}

// Get saved connection
async function getSavedConnection() {
  const connection = await InstagramConnection.findOne({
    connectionKey: "primary"
  });

  if (!connection) {
    throw new Error("Instagram connection not found");
  }

  if (
    connection.expiresAt &&
    connection.expiresAt.getTime() <= Date.now()
  ) {
    throw new Error("Instagram access token has expired");
  }

  return connection;
}

// GET /api/instagram/status
router.get("/status", async (req, res) => {
  try {
    const connection = await InstagramConnection.findOne({
      connectionKey: "primary"
    }).select("connectedAt expiresAt tokenType");

    if (!connection) {
      return res.json({
        success: true,
        connected: false,
        message: "Instagram account is not connected"
      });
    }

    if (
      connection.expiresAt &&
      connection.expiresAt.getTime() <= Date.now()
    ) {
      return res.json({
        success: true,
        connected: false,
        message: "Instagram access token has expired"
      });
    }

    return res.json({
      success: true,
      connected: true,
      message: "Instagram connection found",
      connectedAt: connection.connectedAt,
      expiresAt: connection.expiresAt,
      tokenType: connection.tokenType
    });
  } catch (error) {
    console.error("Instagram status error:", error.message);

    return res.status(500).json({
      success: false,
      connected: false,
      message: "Unable to check Instagram connection"
    });
  }
});

// POST /api/instagram/exchange
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
      key => !process.env[key]
    );

    if (missing.length) {
      return res.status(500).json({
        success: false,
        message: "Missing Meta environment variables",
        missing
      });
    }

    const tokenUrl = new URL(
      `${graphBaseUrl}/oauth/access_token`
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
        "Meta exchange error:",
        tokenData.error?.message || "Unknown error"
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

// GET /api/instagram/diagnostics
router.get("/diagnostics", async (req, res) => {
  try {
    const connection = await getSavedConnection();

    if (
      !process.env.META_APP_ID ||
      !process.env.META_APP_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Meta App credentials are missing"
      });
    }

    const token = decryptToken(connection);

    const appToken =
      `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;

    const [debug, permissions, profile] = await Promise.all([
      graphRequest("debug_token", {
        input_token: token,
        access_token: appToken
      }),
      graphRequest("me/permissions", {
        access_token: token
      }),
      graphRequest("me", {
        fields: "id,name",
        access_token: token
      })
    ]);

    const permissionList = (permissions.data || []).map(item => ({
      permission: item.permission,
      status: item.status
    }));

    const granted = permissionList
      .filter(item => item.status === "granted")
      .map(item => item.permission);

    let pages = [];
    let pageError = null;

    try {
      const pageData = await graphRequest("me/accounts", {
        fields: "id,name,instagram_business_account",
        access_token: token
      });

      pages = (pageData.data || []).map(page => ({
        pageId: page.id,
        pageName: page.name,
        instagramAccountId:
          page.instagram_business_account?.id || null
      }));
    } catch (error) {
      pageError = error.message;
    }

    return res.json({
      success: true,
      token: {
        valid: debug.data?.is_valid === true,
        appId: debug.data?.app_id || null,
        expiresAt: debug.data?.expires_at || null,
        scopes: debug.data?.scopes || []
      },
      profile: {
        id: profile.id,
        name: profile.name
      },
      permissions: permissionList,
      requiredPermissions: {
        instagram_basic: granted.includes("instagram_basic"),
        instagram_content_publish: granted.includes("instagram_content_publish"),
        pages_show_list: granted.includes("pages_show_list"),
        pages_read_engagement: granted.includes("pages_read_engagement")
      },
      pages,
      pageLookupError: pageError,
      message: "Diagnostic check completed"
    });
  } catch (error) {
    console.error("Instagram diagnostics error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Instagram diagnostics failed",
      error: error.message
    });
  }
});

// GET /api/instagram/account-check
router.get("/account-check", async (req, res) => {
  try {
    const connection = await getSavedConnection();

    const instagramId = process.env.INSTAGRAM_ACCOUNT_ID;

    if (!instagramId) {
      return res.status(500).json({
        success: false,
        message: "INSTAGRAM_ACCOUNT_ID is missing"
      });
    }

    const token = decryptToken(connection);

    const account = await graphRequest(instagramId, {
      fields: "id,username,account_type",
      access_token: token
    });

    return res.json({
      success: true,
      instagram: account,
      message: "Instagram account access verified"
    });
  } catch (error) {
    console.error("Instagram account check error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Instagram account could not be accessed",
      error: error.message
    });
  }
});

module.exports = router;
