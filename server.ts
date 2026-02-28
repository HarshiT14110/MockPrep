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
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  console.log("Generate Questions hit. userId:", User);
  app.post(
  "/api/upload-resume",
  requireAuth(),
  upload.single("resume"),
  async (req: Request, res: Response) => {
    try {
      const { userId } = getAuth(req);

      console.log("🔥 Clerk userId:", userId);

      if (!userId) {
        console.log("❌ No userId found");
        return res.status(401).json({ error: "Unauthorized" });
      }

      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ error: "No resume uploaded" });
      }

      const data = await pdfParse(file.buffer);
      const extractedText = data.text;

      const updatedUser = await User.findOneAndUpdate(
        { clerk_user_id: userId },
        { resume_text: extractedText },
        { upsert: true, returnDocument: "after" }
      );

      console.log("✅ Updated user document:", updatedUser);

      res.json({
  success: true,
  text: extractedText,
  debug: "THIS_IS_NEW_SERVER"
});
    } catch (err: any) {
      console.error("Resume parse error:", err);
      res.status(500).json({ error: "Failed to parse PDF" });
    }
  }
);

  // ==============================
  // Generate Interview Questions (Gemini)
  // ==============================

    app.post("/api/generate-questions", requireAuth(), async (req, res) => {
  try {
    console.log("🔥 HIT generate-questions route");

    const { userId } = getAuth(req);
    console.log("🔥 userId:", userId);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ clerk_user_id: userId });
    const resumeText = user?.resume_text || "";

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY missing");
      return res.status(500).json({ error: "Gemini API key missing" });
    }

    const prompt = resumeText
      ? `You are an expert technical interviewer.
Based on this resume, generate exactly 5 tailored interview questions.

Resume:
${resumeText}

Return ONLY a valid JSON array of 5 question strings.
No markdown.
No explanation.
No extra text.
Example:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`
      : `Generate exactly 5 general software engineering interview questions.

Return ONLY a valid JSON array of 5 question strings.
No markdown.
No explanation.
No extra text.
Example:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;

    const response = await fetch(
   `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      
    }),
  }
);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Gemini HTTP Error:", errorText);

      return res.json({
        questions: getFallbackQuestions(),
      });
    }

    const data = await response.json();

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("🧠 Gemini RAW RESPONSE:\n", raw);

    // 🔥 Extract JSON array safely even if Gemini adds text
    const match = raw.match(/\[[\s\S]*\]/);

    let questions: string[] = [];

    if (match) {
      try {
        questions = JSON.parse(match[0]);
      } catch (err) {
        console.error("❌ JSON parse failed:", err);
      }
    }

    if (!questions || questions.length !== 5) {
      console.warn("⚠️ Using fallback questions");
      questions = getFallbackQuestions();
    }

    console.log("✅ Final questions:", questions);

    return res.json({ questions });

  } catch (err: any) {
    console.error("❌ Generate questions error:", err);
    return res.json({
      questions: getFallbackQuestions(),
    });
  }
});

function getFallbackQuestions(): string[] {
  return [
    "Tell me about yourself.",
    "Explain your most challenging project.",
    "What are your technical strengths?",
    "How do you debug complex issues?",
    "Why should we hire you?"
  ];
}
 
  // ==============================
  // Analyze Answer (Gemini)
  // ==============================

  app.post("/api/analyze-answer", requireAuth(), async (req, res) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { question, answer } = req.body;
      if (!question || !answer) {
        return res
          .status(400)
          .json({ error: "Question and answer are required" });
      }

      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key missing" });
      }

      const prompt = `You are an expert interviewer. Analyze this interview answer and provide structured feedback.

Question: ${question}
Candidate's Answer: ${answer}

Return ONLY a valid JSON object. No markdown, no extra text:
{
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "overall_feedback": "2-3 sentence summary of the answer quality",
  "rating": "Excellent"
}

The rating must be exactly one of: "Excellent", "Good", "Average", "Needs Work"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 800 },
          }),
        }
      );

      const data = await response.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const feedback = JSON.parse(cleaned);

      res.json({ feedback });
    } catch (err: any) {
      console.error("Analyze answer error:", err);
      res
        .status(500)
        .json({ error: "Failed to analyze answer", details: err.message });
    }
  });

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