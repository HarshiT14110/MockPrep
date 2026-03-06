import mongoose, { Schema, Document } from "mongoose";

export interface IInterviewQuestion extends Document {
  type: "hr" | "behavioral";
  difficulty: "easy" | "medium" | "hard";
  question: string;
}

const InterviewQuestionSchema = new Schema<IInterviewQuestion>({
  type: {
    type: String,
    enum: ["hr", "behavioral"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
});

const InterviewQuestion = mongoose.model<IInterviewQuestion>(
  "InterviewQuestion",
  InterviewQuestionSchema
);

export default InterviewQuestion;