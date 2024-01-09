import mongoose from "mongoose";

const { Schema, model, connect } = mongoose

interface IQuestion {
  title: string;
  explanation: string;
  tags: string[]
}

const questionSchema = new Schema<IQuestion>({
  title: String,
  explanation: String,
  tags: [String]
})

export const Question = model<IQuestion>('Question', questionSchema)