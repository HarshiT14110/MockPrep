import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import mongoose, { Schema, Document, Model } from "mongoose";
import { StreamClient } from "@stream-io/node-sdk";
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";
import multer from "multer";
import pdfParse from "@cedrugs/pdf-parse";
import cors from "cors";

// ==============================
// Fix __dirname for ESM
// ==============================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================
// MongoDB Connection
// ==============================

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI missing in .env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });
  mongoose.set("returnDocument", "after");

// ==============================
// User Interface
// ==============================

interface IUser extends Document {
  clerk_user_id: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt: Date;
  resume_text?: string;
}

// ==============================
// User Schema
// ==============================

const userSchema: Schema<IUser> = new Schema({
  clerk_user_id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
  resume_text: String,
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

// ==============================
// Start Server
// ==============================

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // ==============================
  // Clerk Middleware
  // ==============================

  app.use(
    clerkMiddleware({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    })
  );

  // ==============================
  // API Logger
  // ==============================

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.url.startsWith("/api")) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });

  // ==============================
  // Health Route
  // ==============================

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ==============================
  // Sync User
  // ==============================

  app.post("/api/sync-user", requireAuth(), async (req, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { name, email, image } = req.body;

      let user = await User.findOne({ clerk_user_id: userId });

      if (!user) {
        user = await User.create({
          clerk_user_id: userId,
          name,
          email,
          image,
        });
      }

      res.json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sync failed" });
    }
  });

  // ==============================
  // Dashboard Route
  // ==============================

  app.get("/api/dashboard-data", requireAuth(), async (req, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const user = await User.findOne({ clerk_user_id: userId });
      res.json({ user });
    } catch (err) {
      console.error("Dashboard error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ==============================
  // Stream Token Route
  // ==============================

  app.post("/api/stream-token", requireAuth(), async (req, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const STREAM_API_KEY = process.env.STREAM_API_KEY;
      const STREAM_SECRET_KEY = process.env.STREAM_SECRET_KEY;

      if (!STREAM_API_KEY || !STREAM_SECRET_KEY) {
        return res.status(500).json({ error: "Stream config missing" });
      }

      const client = new StreamClient(STREAM_API_KEY, STREAM_SECRET_KEY);
      const token = client.createToken(userId);

      res.json({
        token,
        apiKey: STREAM_API_KEY,
      });
    } catch (error) {
      console.error("Stream token error:", error);
      res.status(500).json({ error: "Failed to generate token." });
    }
  });

  // ==============================
  // Resume Upload + Parse + Save
  // ==============================

  const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });

  app.post(
    "/api/upload-resume",
    requireAuth(),
    upload.single("resume"),
    async (req: Request, res: Response) => {
      try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const file = (req as any).file;

        if (!file) {
          return res.status(400).json({ error: "No resume uploaded" });
        }

        if (file.mimetype !== "application/pdf") {
          return res.status(400).json({ error: "Only PDF allowed" });
        }

        const data = await pdfParse(file.buffer);
        const extractedText = data.text;

        await User.findOneAndUpdate(
        { clerk_user_id: userId },
        { resume_text: extractedText },
        { returnDocument: "after" }
);

        res.json({
        success: true,
        text: extractedText,
});
      } catch (err: any) {
        console.error("Resume parse error:", err);
        res.status(500).json({
          error: "Failed to parse PDF",
          details: err.message,
        });
      }
    }
  );

  // ==============================
  // Vite Middleware
  // ==============================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: process.cwd(),
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist", "index.html"));
    });
  }

  // ==============================
  // Global Error Handler
  // ==============================

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[SERVER ERROR]", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();