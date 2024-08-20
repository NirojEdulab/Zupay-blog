import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnent from "./db/index.js";
import userRoute from './routes/user.route.js';
import postRoute from './routes/post.route.js';
import commentRoute from './routes/comment.route.js';

const app = express();
app.use(cors());
app.use(express.json({
    limit: "16kb",
}));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb",
}));
app.use(express.static("public"));
app.use(cookieParser());

// Routers
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comment", commentRoute);

// MONGO DB Connection
dbConnent()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      try {
        console.log(`Server started at PORT: ${process.env.PORT || 3000} `);
      } catch (error) {
        console.log(error);
      }
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection FAILED :", error);
  });
