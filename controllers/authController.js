//NOTE
// + Cấu trúc chung 1 methob controller
// + Nhân ban bao nhiều route bấy nhiêu methob
// + Logic

import User from "../models/userModel.js";
import { compareString, createToken, hashString } from "../util/authUtil.js";
import { sendVerificationEmail } from "../util/sendEmailUtil.js";

export const register = async (req, res, next) => {
  try {
    // Validation req:body , image
    const { firstName, lastName, email, image, password, accountType } =
      req.body;

    if (!firstName || !lastName || !email || !password) {
      return next("Provide required field");
    }

    if (accountType === "Writer" && !image) {
      return next("Please Provide profile picture");
    }
    // Check exist : unique schema?
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return next("User existed");
    }

    // Hash password
    const hashPassword = await hashString(password);
    const newUser = await User.create({
      name: firstName + " " + lastName,
      email: email,
      password: hashPassword,
      image: image,
      accountType:accountType
    });
    newUser.password = undefined;

    // Gen token
    const token = await createToken(newUser._doc);

    // Send mail/res
    if (accountType === "Writer") {
      sendVerificationEmail(newUser, res, token);
    } else {
      res.status(201).json({
        success: true,
        message: "Account created successfully",
        user: newUser,
        token: token,
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

export const googleSignup = async (req, res, next) => {
  try {
    //req
    const { firstName, lastName, email, image, emailVerified } = req.body;
    //validation

    //Check existed
    const isUserExisted = await User.findOne({ email });
    if (isUserExisted) {
      return next("Email existed");
    }

    //create user
    const newUser = await User.create({
      name: firstName + " " + lastName,
      email: email,
      image: image,
      provider: "Google",
      emailVerified
    })
    // newUser.password = undefined;
    //Token,res
    const token = await createToken(newUser?._doc);
    res.status(201).send({
      success: true,
      message: "Successfully",
      user: newUser,
      token: token,
    });
  } catch (error) {
    console.log('error',error);
    res.status(500).send(error);
  }
};

export const login = async (req, res, next) => {
  try {
    //req
    const { email, password } = req.body;
    //Validation
    if (!email) {
      return next("Provide required field");
    }
    //Check email exist
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next("Email not exist");
    }
    //check tk gg
    if(user.provider === 'Google'){
      const token = await createToken(user?._doc);
      res.status(200).send({
        status: true,
        message: "success",
        user: user._doc,
        token: token,
      });
    }

    //Compare password
    const isMatch = await compareString(password, user?._doc?.password);
    if (!isMatch) {
      return next("Wrong password");
    }
    //Check verify with Writer account
    if (user?._doc?.accountType === "Writer" && !user?._doc?.emailVerified) {
      return next({
        message: "Email not confirmed",
      });
    }
    //Token/res
    user._doc.password = undefined;
    const token = await createToken(user?._doc);
    res.status(200).send({
      status: true,
      message: "success",
      user: user._doc,
      token: token,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
