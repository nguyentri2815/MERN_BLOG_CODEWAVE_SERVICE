import express from "express";

import { followerWriter, getWriter, resendOTP, updateUser, verifyOTP } from "../controllers/userController.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

router.get('/follower/:writerId',authenticateJWT, followerWriter);
router.get('/get-writer/:writerId', getWriter)
router.put('/update-user', updateUser);
// router.delete('/delete-user:id', deleteUser);


router.post('/verify/:userId/:otp', verifyOTP);
router.post('/resend-otp/:userId', resendOTP);

export default router;