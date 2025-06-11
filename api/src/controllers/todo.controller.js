import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Todo } from "../models/todo.models.js";

export const createTodo = asyncHandler(async (req, res) => {
  try {
    // console.dir(req.body, { depth: null });

    // Extract data from the request body
    const { title, description } = req.body;

    // Validate required fields
    if (!title || !description) {
      throw new ApiError(400, "Title and description are required");
    }
    // Create a new Todo document using the mongoose model created earlier in todo.models.js
    const todo = await Todo.create({
      title: title,
      description: description,
      userId: req.user._id,
    });

    res
      .status(201)
      .json(new ApiResponse(201, todo, "Todo created successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export const getTodos = asyncHandler(async (req, res) => {
  // console.dir(req.user._id.toString(), { depth: null });
  const todos = await Todo.find({ userId: req.user._id });

  res
    .status(200)
    .json(new ApiResponse(200, todos, "Todos retrieved successfully"));
});

export const getTodosById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const todo = await Todo.findOne({ _id: id, userId: req.user._id });

  if (!todo) {
    throw new ApiError(404, "Todo not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, todo, "Todo retrieved successfully"));
});

export const updateTodo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const todo = await Todo.findByIdAndUpdate(
    { _id: id, userId: req.user._id }, // Ensure the todo belongs to the user
    { title, description },
    { new: true } // Return the updated document rather than the original document by default
  );

  if (!todo) {
    throw new ApiError(404, "Todo not found");
  }

  res.status(200).json(new ApiResponse(200, todo, "Todo updated successfully"));
});

export const deleteTodo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const todo = await Todo.findByIdAndDelete(id);

  if (!todo) {
    throw new ApiError(404, "Todo not found");
  }

  res.status(200).json(new ApiResponse(200, todo, "Todo deleted successfully"));
});
