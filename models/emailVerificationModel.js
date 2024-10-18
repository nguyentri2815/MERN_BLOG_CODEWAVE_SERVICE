import mongoose from "mongoose";

const emailVerificationSchema = mongoose.Schema({
  userId: String,
  token: String,
  createdAt: Date,
  expiresAt: Date,
});
const EmailVerification = mongoose.model(
  "EmailVerifications",
  emailVerificationSchema
);
export default EmailVerification;
