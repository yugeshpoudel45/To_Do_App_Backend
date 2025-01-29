import { Router } from "express";
import {
  createTodo,
  getTodos,
  getTodosById,
  updateTodo,
  deleteTodo,
} from "../controllers/todo.controller.js";

const todoRouter = Router();

todoRouter.get("/", (req, res) => {
  res.send("Hello World");
});

todoRouter.post("/create", createTodo);
todoRouter.get("/getAllTodos", getTodos);
todoRouter.get("/getTodoById/:id", getTodosById);
todoRouter.put("/updateTodoById/:id", updateTodo);
todoRouter.delete("/deleteTodoById/:id", deleteTodo);

export default todoRouter;
