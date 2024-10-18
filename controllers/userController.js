import EmailVerification from "../models/emailVerificationModel.js";
import Follower from "../models/followerModel.js";
import User from "../models/userModel.js";
import { compareString } from "../util/authUtil.js";
import { sendVerificationEmail } from "../util/sendEmailUtil.js";

export const followerWriter = async (req, res, next) => {
  try {
    //id user get Auth
    const followerId = req?.user?._id;
    //id writer param
    const { writerId } = req.params;
    //Check đã follow ?
    const hasFollowed = await Follower.findOne({
      followerId,
      writerId,
    });
    if (hasFollowed) {
      return res.status(201).json({
        success: false,
        message: "you are already following this writer",
      });
    }
    //Create follower
    await Follower.create({
      writerId,
      followerId,
    });
    //Update field followerID User
    // (Có cần thiết ? )
    const writer = await User.findById(writerId);
    writer?.followers?.push(followerId);
    await User.findByIdAndUpdate(writerId, writer, {
      new: true,
    });
    //res
    res.status(201).json({
      success: true,
      message: "Successfully",
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
export const getWriter = async (req, res, next) => {
  try {
    //param
    const { writerId } = req.params;
    // //Writer info
    // const writer = await User.findOneById(idWriter).select('-password');
    // //Get follower
    // const viewer = await Follower.find({writerId:idWriter});
    // //Get Posts
    // const posts = await Post.find({user:idWriter});
    // // res
    // res.status(200).json({
    //     success:true,
    //     message:"Successfully",
    //     writer,
    //     viewer,
    //     posts
    // })

    // Get User + populate follower
    if (writerId) {
      const writer = await User.findById(writerId);
      // length + info user đã follower writer này?
      // + model user có field followsID có thể check length nhưng ko populate đc
      // + Thiết kế data ko cần thiết field này -> có thể dựa vào bảng follower

      //Res
      if (writer) {
        writer.password = undefined;
        res.status(200).send({
          success: true,
          message: "Successfully",
          data: writer,
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
export const updateUser = async (req, res, next) => {
  try {
    //req
    const {_id, firstName, lastName, email}= req.body;
    //Validation
    if (!firstName || !lastName || !email) {
      return next("Provide required field");
    }

    if (accountType === "Writer" && !image) {
      return next("Please Provide profile picture");
    }
    // Put
    const userUpdated = await User.findByIdAndUpdate(_id,{...req.body},{new: true});
    //res
    res.status(200).json({
      success:true,
      message:"Update user successfully",
      data:userUpdated
    })
  } catch (error) {
    res.status(500).send(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    //req/param
    // id param
    const { userId, otp } = req.params;
    // find emailVerification
    const emailVerification = await EmailVerification.findOne({ userId });
    //compare hashOTP
    if (emailVerification) {
      //update User-emailVerified
      //res
      const { token, expiresAt } = emailVerification;
      const isMatched = await compareString(otp.toString(), token);
      console.log(isMatched);
      console.log(expiresAt > Date.now());
      
      if (isMatched && expiresAt > Date.now()) {
        await User.findByIdAndUpdate(userId, { emailVerified: true });
        await EmailVerification.findOneAndDelete({userId});

        res.status(200).json({
          success: true,
          message: "Email verified successfully",
        });
      } else {
        // xóa verified
        await EmailVerification.findOneAndDelete({userId});
        //res
        res.status(404).json({
          success: false,
          message: "Verification failed or OPT is invalid",
        });
      }
    }else{
      res.status(500).send('không tìm thấy emailVerification');
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
export const resendOTP = async (req, res, next) => {
  try {
    //userId params
    const { userId } = req.params;
      //Gen OTP
      //HashOTP
      //Create Verification
      //res
    //->Lặp logic sendEmail
    // update lại thông tin verifi hay tìm xóa đi và tạo cái mới?
    // -> tác giả chọn tìm xóa đi và tạo mới
    //xóa recored đã hết hạn 
    await EmailVerification.findOneAndDelete({userId});
    
    const user = await User.findById(userId);
    if (user && !user?.emailVerified) {
      sendVerificationEmail(user._doc, res);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
