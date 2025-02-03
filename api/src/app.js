import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true }));

import todoRouter from "./routes/todo.routes.js";

app.get("/", (req, res) => {
  res.send("<h2>Welcome to the Jungle</h2>");
});

app.use("/api/v1/users", todoRouter);

export { app };
