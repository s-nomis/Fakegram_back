const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

const authRouter = require("./routers/auth.router");
const userRouter = require("./routers/user.router");
const postRouter = require("./routers/post.router");
const commentRouter = require("./routers/comment.router");

const app = express();
dotenv.config();

app.use(cors());

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/posts", commentRouter);

module.exports = app;
