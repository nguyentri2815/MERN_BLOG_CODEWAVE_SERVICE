// NOtE

import express from "express";

import { register, googleSignup, login } from "../controllers/authController.js";

const router = express.Router();

// register
router.post("/register", register);

// googleSignUp
router.post('/google-signup', googleSignup)

// login
router.post("/login", login);

export default router;
