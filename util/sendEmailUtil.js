import nodemailer from "nodemailer";
import dotenv from "dotenv";

import EmailVerification from "../models/emailVerificationModel.js";
import { hashString } from "./authUtil.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

export const sendVerificationEmail = async (user, res, token) => {
  try {
    const { _id, name, email } = user;

    //Gen OTP : tokenOTP lưu bảng verification, gửi mã OPT , xác thực so sánh mã OPT với tokenOTP -> update user - emailVerified
    const OPT = Math.floor(100000 + Math.random() * 900000);
    console.log('OPT',OPT);
    
    //CreateToken từ OPT
    const hashOTP = await hashString(OPT.toString());

    // Create verification
    const newVerification = await EmailVerification.create({
      userId: _id,
      token: hashOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 120000,
    });

    if (newVerification) {
      //Send mail verify
      const mailOption = {
        from: process.env.AUTH_EMAIL, // sender address
        to: email, // list of receivers
        subject: "Email Verification", // Subject line
        text: "Hello world?", // plain text body
        html: `<div
                style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;'>
                <h3 style="color: rgb(8, 56, 188)">Please verify your email address</h3>
                <hr>
                <h4>Hi, ${name},</h4>
                <p>
                    Please verify your email address with the OTP.
                    <br>
                    <h1 styles='font-size: 20px; color: rgb(8, 56, 188);'>${OPT}</h1>
                <p>This OTP <b>expires in 2 mins</b></p>
                </p>
                <div style="margin-top: 20px;">
                    <h5>Regards</h5>
                    <h5>Nguyen Van Tri</h5>
                </div>
            </div>`, // html body
      };

      const info = await transporter.sendMail(mailOption);

      if (info) {
        res.status(201).send({
          success: true,
          message: "OTP has been sent to your account. Check your email and verify your email.",
          user,
          token,
        });
      }
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Something err verificationEmail");
  }
};
