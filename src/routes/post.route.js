import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getSinglePost,
  updatePost,
} from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", getAllPosts);
router.get("/:id", getSinglePost);
router.post(
  "/",
  verifyJWT,
  upload.fields([{ name: "image", maxCount: 1 }]),
  createPost
);
router.put(
  "/:id",
  verifyJWT,
  upload.fields([{ name: "image", maxCount: 1 }]),
  updatePost
);
router.delete("/:id", verifyJWT, deletePost);

export default router;
