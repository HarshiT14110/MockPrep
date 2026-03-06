import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  starter_code: Record<string, string>;
  test_cases: {
    input: string;
    expected: string;
  }[];
}

const QuestionSchema = new Schema<IQuestion>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  topic: { type: String, required: true },
  starter_code: { type: Object, required: true },
  test_cases: [
    {
      input: { type: String, required: true },
      expected: { type: String, required: true },
    },
  ],
});

const Question = mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;