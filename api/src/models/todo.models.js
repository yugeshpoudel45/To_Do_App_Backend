import mongoose, { Schema } from "mongoose";
import { Counter } from "./counter.model.js";

const todoSchema = new Schema(
  {
    todoId: { type: Number, unique: true },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [50, "Title must not be more than 100 characters long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.userId;
        delete ret.__v;
        delete ret.id;
      },
    },
  }
);

todoSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await mongoose
      .model("Counter")
      .findByIdAndUpdate(
        { _id: "todoId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
    this.todoId = counter.seq;
  }
  next();
});

export const Todo = mongoose.model("Todo", todoSchema);
