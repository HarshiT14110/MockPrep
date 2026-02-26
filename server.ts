import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import mongoose, { Schema, Document, Model } from "mongoose";
import { StreamClient } from "@stream-io/node-sdk";
import fileUpload from "express-fileupload";
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";

// ==============================
// Fix __dirname for ES Modules
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

// ==============================
// User Interface (TypeScript)
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
  name: { type: String },
  email: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  resume_text: { type: String },
});

// ==============================
// User Model
// ==============================

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

// ==============================
// Start Server
// ==============================

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(fileUpload());

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

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith("/api")) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });

  // ==============================
  // Health Route
  // ==============================

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // ==============================
  // Mongo Test Route
  // ==============================

  app.get("/api/test-db", async (req: Request, res: Response) => {
    try {
      const users = await User.find();
      res.json({ users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Mongo test failed" });
    }
  });

  // ==============================
  // Sync User Route
  // ==============================

  app.post("/api/sync-user", requireAuth(), async (req: Request, res: Response) => {
    try {
      const { userId } = getAuth(req);
      const { name, email, image } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

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

  app.get("/api/dashboard-data", requireAuth(), async (req: Request, res: Response) => {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await User.findOne({ clerk_user_id: userId });

      res.json({ user });
    } catch (err) {
      console.error("Dashboard error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ==============================
  // Stream Token Route (Video)
  // ==============================

  app.post("/api/stream-token", requireAuth(), async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: "User ID is required.",
        });
      }

      const STREAM_API_KEY = process.env.STREAM_API_KEY;
      const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

      if (!STREAM_API_KEY || !STREAM_API_SECRET) {
        return res.status(500).json({
          error: "Stream configuration error.",
        });
      }

      const client = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);
      const token = client.generateUserToken({ user_id: userId });

      res.json({ token });
    } catch (error) {
      console.error("Stream token error:", error);
      res.status(500).json({ error: "Failed to generate token." });
    }
  });

  // ==============================
  // Resume Parsing Route
  // ==============================

  

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
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), "dist", "index.html"));
    });
  }

  // ==============================
  // Global Error Handler
  // ==============================

  app.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {
      console.error("[SERVER ERROR]", err);
      res.status(500).json({
        error: "Internal Server Error",
        details: err.message,
      });
    }
  );

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();