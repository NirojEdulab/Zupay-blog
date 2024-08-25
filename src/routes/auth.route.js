import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  verifyToken,
  updateUser,
  getUserInfo,
  getAllUsers,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user/:id", getUserInfo);

// Secured Routes
router.get("/verify", verifyJWT, verifyToken);
router.get("/", verifyJWT, getAllUsers);
router.post("/logout", verifyJWT, logoutUser);
router.put(
  "/update/:userId",
  verifyJWT,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateUser
);

export default router;
