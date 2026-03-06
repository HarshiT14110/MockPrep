import mongoose from "mongoose";
import "dotenv/config";
import Question from "./Question.model.js";

const topics = [
  "Arrays",
  "Strings",
  "Hash Table",
  "Dynamic Programming",
  "Graphs",
  "Trees",
  "Binary Search",
  "Two Pointers",
  "Stack",
  "Heap"
];

const difficulties = ["Easy", "Medium", "Hard"];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    await Question.deleteMany({});
    console.log("🗑 Cleared old questions");

    const questions = [];

    for (let i = 1; i <= 300; i++) {
      const topic = topics[i % topics.length];
      const difficulty = difficulties[i % difficulties.length];

      questions.push({
        title: `${topic} Problem ${i}`,
        description: `Solve this ${difficulty} ${topic} problem.`,
        topic,
        difficulty,
        starter_code: {
          javascript: `function solve() {\n  // Your code here\n}`,
          python: `def solve():\n    pass`,
          java: `class Solution {\n  public void solve() {}\n}`,
          cpp: `void solve() {\n}`,
          c: `void solve() {\n}`
        },
        test_cases: [
          {
            input: "Example Input",
            expected: "Example Output"
          }
        ]
      });
    }

    await Question.insertMany(questions);

    console.log("🔥 300 Questions Inserted Successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seed();