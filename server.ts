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
import Question from "./Question.model";
import InterviewQuestion from "./InterviewQuestion.model";
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
  completed_sessions?: number;

  // Bits system
  bits?: number;
  plan?: "free" | "pro";
  requests_today?: number;
  last_request_date?: Date;

  // ATS
  ats_score?: number;
  ats_summary?: string;
  ats_missing_keywords?: string[];
  ats_detected_skills?: string[];
  ats_improvements?: string[];
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
  completed_sessions: { type: Number, default: 0 },

bits: { type: Number, default: 96 },

plan: { type: String, enum: ["free", "pro"], default: "free" },

requests_today: { type: Number, default: 0 },

last_request_date: { type: Date, default: Date.now },

  ats_score: Number,
  ats_summary: String,
  ats_missing_keywords: [String],
  ats_detected_skills: [String],
  ats_improvements: [String],
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);



// ==============================
// Bit Deduction Function
// ==============================

async function deductBits(userId: string, cost: number) {

  const user = await User.findOne({ clerk_user_id: userId }).exec();

  if (!user) return false;

  // FREE PLAN
  if (user?.plan === "free") {

  const today = new Date().toDateString();

  const last = user.last_request_date
    ? new Date(user.last_request_date).toDateString()
    : "";

    // reset daily usage
    if (today !== last) {
      user.requests_today = 0;
      user.last_request_date = new Date();
    }

    if ((user.requests_today ?? 0) + cost > 12) {
      return false;
    }

    user.requests_today = (user.requests_today ?? 0) + cost;

    await user.save();
    return true;
  }

  // PRO PLAN

  if ((user.bits || 0) < cost) {
    return false;
  }

  user.bits = (user.bits || 0) - cost;

  await user.save();
  return true;
}

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

      await User.findOneAndUpdate(
  { clerk_user_id: userId },
  {
    $set: {
      clerk_user_id: userId,
      name,
      email,
      image
    },
    $setOnInsert: {
      bits: 96,
      plan: "free",
      requests_today: 0,
      last_request_date: new Date()
    }
  },
  { upsert: true, new: true }
); res.json({ User });

      res.json({ User });
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

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ clerk_user_id: userId });

    if (!user) {
      return res.json({ user: null });
    }

    // ==============================
    // FREE PLAN LOGIC
    // ==============================

    if (user?.plan === "free") {

  const today = new Date().toDateString();

  const last = user.last_request_date
    ? new Date(user.last_request_date).toDateString()
    : ""; 

      // Reset daily usage if new day

      if (today !== last) {

        user.requests_today = 0;
        user.last_request_date = new Date();

        await user.save();
      }

      const usedToday = user.requests_today ?? 0;

const remainingBits = Math.max(12 - usedToday, 0);

      return res.json({
        user: {
          ...user.toObject(),
          bits: remainingBits
        }
      });

    }

    // ==============================
    // PRO PLAN LOGIC
    // ==============================

    return res.json({ user });

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
  {
    resume_text: extractedText,

    // reset ATS cache when resume changes
    ats_score: undefined,
    ats_summary: undefined,
    ats_missing_keywords: undefined,
    ats_detected_skills: undefined,
    ats_improvements: undefined
  },
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

    const allowed = await deductBits(userId, 3);

if (!allowed) {
 return res.status(403).json({
  error: "Not enough Bits",
  code: "BITS_EXHAUSTED"
});
}

    const user = await User.findOne({ clerk_user_id: userId });
    const resumeText = user?.resume_text || "";

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key missing" });
    }

    const prompt = resumeText
      ? `You are an expert technical interviewer. Based on this resume, generate exactly 5 tailored interview questions specific to this candidate.

Resume:
${resumeText}

Return ONLY a valid JSON array of 5 question strings.`
      : `Generate exactly 5 general software engineering interview questions.

Return ONLY a valid JSON array of 5 question strings.`;

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
      return res.json({ questions: getFallbackQuestions() });
    }

    const data = await response.json();

    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    console.log("🧠 Gemini RAW RESPONSE:\n", raw);

    let cleaned = raw.replace(/```json|```/g, "").trim();

    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);

    let questions: string[] = [];

    if (arrayMatch) {
      try {
        questions = JSON.parse(arrayMatch[0]);
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
    return res.json({ questions: getFallbackQuestions() });
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


    //ATS Score Route -------------------------------

         
              app.post("/api/ats-score", requireAuth(), async (req, res) => {
                try {
                  const { userId } = getAuth(req);
                  if (!userId) return res.status(401).json({ error: "Unauthorized" });

                  const allowed = await deductBits(userId, 2);

if (!allowed) {
  return res.status(403).json({
    error: "Not enough Bits"
  });
}

                 const user = await User.findOne({ clerk_user_id: userId });
                  const resumeText = user?.resume_text;

                  // ✅ Return cached ATS score if already exists

                  if (user?.ats_score) {
                    return res.json({
                      score: user.ats_score,
                      summary: user.ats_summary,
                      missing_keywords: user.ats_missing_keywords,
                      detected_skills: user.ats_detected_skills,
                      improvements: user.ats_improvements
                    });
                  }

                  if (!resumeText) {
                    return res.json({ score: 0, summary: "No resume uploaded." });
                  }

                  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
                  if (!GEMINI_API_KEY) {
                    return res.status(500).json({ error: "Gemini API key missing" });
                  }

                  const prompt = `
                    You are an ATS resume analyzer.

                    Analyze the resume and return structured ATS analysis.

                    Return ONLY JSON:

                    {
                      "score": 78,
                      "summary": "short explanation",
                      "missing_keywords": ["keyword1","keyword2"],
                      "detected_skills": ["skill1","skill2"],
                      "improvements": ["improvement1","improvement2"]
                    }

                    Resume:
                    ${resumeText}
                    `;
                  

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

                  const data = await response.json();
                  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
                  const cleaned = raw.replace(/```json|```/g, "").trim();
                  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

                  let result = {
                    score: 0,
                    summary: "",
                    missing_keywords: [],
                    detected_skills: [],
                    improvements: []
                  };

                  if (jsonMatch) {
                    result = JSON.parse(jsonMatch[0]);
                  }

                  // ✅ Save ATS result in MongoDB

                await User.findOneAndUpdate(
                  { clerk_user_id: userId },
                  {
                    ats_score: result.score,
                    ats_summary: result.summary,
                    ats_missing_keywords: result.missing_keywords,
                    ats_detected_skills: result.detected_skills,
                    ats_improvements: result.improvements
                  }
                );

                  res.json(result);

                } catch (err) {
                  console.error("ATS score error:", err);
                  res.status(500).json({ error: "ATS scoring failed" });
                }
              });

 
  // Result Analysis and Report Generation Route ---------------------------------

    app.post(
  "/api/generate-report",
  requireAuth(),
  async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const allowed = await deductBits(userId, 5);

if (!allowed) {
  return res.status(403).json({
    error: "Not enough Bits"
  });
}

    const { feedbackList } = req.body;

    if (!feedbackList || !feedbackList.length) {
      return res.status(400).json({ error: "No feedback data provided" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
  return res.status(500).json({ error: "Gemini API key missing" });
}

    const prompt = `
You are an expert interview evaluator.

Based on the following interview feedback data, generate a structured final interview report.

Return ONLY valid JSON in this format:

{
  "strengths": ["point1", "point2", "point3"],
  "improvements": ["point1", "point2", "point3"],
  "overall_summary": "short professional summary paragraph",
  "overall_rating": "X/10"
}

Interview Feedback:
${JSON.stringify(feedbackList)}
`;

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

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let cleaned = raw.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    let report = {};

    if (jsonMatch) {
      try {
        report = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error("Report parse error:", err);
      }
    }

    await User.findOneAndUpdate(
  { clerk_user_id: userId },
  { $inc: { completed_sessions: 1 } }
);

    return res.json({ report });

  } catch (err: any) {
    console.error("Generate report error:", err);
    return res.status(500).json({ error: "Failed to generate report" });
  }
});


    //Question Model Route  ==============================


      app.get("/api/questions/random", async (req, res) => {
  try {
    const { topic, difficulty } = req.query;

    if (!topic || !difficulty) {
      return res.status(400).json({ message: "Missing filters" });
    }

    const count = await Question.countDocuments({
      topic,
      difficulty,
    });

    if (count === 0) {
      return res.status(404).json({ message: "No questions found" });
    }

    const random = Math.floor(Math.random() * count);

    const question = await Question.findOne({
      topic,
      difficulty,
    }).skip(random);

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// HR/Behavioral Question Route  ==============================

app.get("/api/interview-questions", requireAuth(), async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ error: "Interview type required" });
    }

    const questions = await InterviewQuestion.aggregate([
      { $match: { type } },
      { $sample: { size: 6 } }
    ]);

    res.json({
      questions: questions.map(q => q.question)
    });

  } catch (err) {
    console.error("Interview question error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/interview-questions/adaptive", requireAuth(), async (req, res) => {
  try {

    const { type, difficulty } = req.query;

    if (!type) {
      return res.status(400).json({ error: "Interview type required" });
    }

    const level = difficulty || "easy";

    const question = await InterviewQuestion.aggregate([
      { $match: { type, difficulty: level } },
      { $sample: { size: 1 } }
    ]);

    res.json({
      question: question[0]?.question
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ==============================
// Chatbot Route
// ==============================

app.post("/api/chatbot", requireAuth(), async (req, res) => {
  try {

   const { userId } = getAuth(req);

if (!userId) {
  return res.status(401).json({ error: "Unauthorized" });
}
    const allowed = await deductBits(userId, 1);

if (!allowed) {
  return res.status(403).json({
    error: "Not enough Bits"
  });
}
    

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `
You are Mocksy, an interview preparation assistant.

Formatting Rules:
- Use short paragraphs
- Use bullet points where appropriate
- Separate sections with line breaks
- Never return one long paragraph
- Keep answers structured and easy to read

User Question:
${message}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data = await response.json();

    let reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI could not generate response.";

    // Clean formatting artifacts
    reply = reply.replace(/```/g, "").trim();

    res.json({ reply });

  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Chatbot failed" });
  }
});

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


  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}






startServer();