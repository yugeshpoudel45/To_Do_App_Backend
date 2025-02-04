import { Router } from "express";
import {
  createTodo,
  getTodos,
  getTodosById,
  updateTodo,
  deleteTodo,
} from "../controllers/todo.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const todoRouter = Router();

todoRouter.get("/", (req, res) => {
  res.send("<h1>Welcome to the Todo API wala Route</h1>");
});

todoRouter.route("/create").post(verifyJWT, createTodo);
todoRouter.route("/getAllTodos").get(verifyJWT, getTodos);
todoRouter.route("/getTodoById/:id").get(verifyJWT, getTodosById);
todoRouter.route("/updateTodoById/:id").put(verifyJWT, updateTodo);
todoRouter.route("/deleteTodoById/:id").delete(verifyJWT, deleteTodo);

export default todoRouter;
