import express from "express";
import {
  getPosts,
  createPost,
  activePost,
  deActivePost,
  deletePost,
  analyticsPosts,
} from "../controllers/postController.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

//ADMIN
//Create
router.post("/create", authenticateJWT, createPost);
//Active
router.post("/active", activePost);
//DeActive
router.post("/deactive", deActivePost);
//Delete
router.delete("/delete/:postID", deletePost);
//Update

//Analytics
router.get("/analytics/:userID", analyticsPosts);

//Client
//Get posts
router.get("/", getPosts);
//Update views
//Update comments

export default router;
