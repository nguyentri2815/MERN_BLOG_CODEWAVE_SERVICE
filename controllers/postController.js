// NOTE
// tên file có s ko?

import mongoose from "mongoose";
import Follower from "../models/followerModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Views from "../models/viewModel.js";

export const getPosts = async (req, res, next) => {
  try {
    //filter : ?
    //pagination : ?
    const { page = 1, limit = 2 } = req.query;
    const skip = (page - 1) * limit;
    //find
    const posts = await Post.find({}).skip(skip).limit(limit);
    const totalItems = await Post.countDocuments();
    //res
    res.status(200).json({
      success: true,
      message: "Get posts successfully",
      data: posts,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
export const createPost = async (req, res, next) => {
  try {
    //Data req
    const { title, slug, category, image, desc } = req.body;
    //Validation
    if (!title || !slug || !category || !image || !desc) {
      return next("Chưa đủ thông tin required");
    }
    //model create
    const newPost = Post.create({
      title,
      slug,
      category,
      image,
      desc,
      user: req.user._id,
    });
    //res
    res.status(201).json({
      success: true,
      message: "Create post successfully",
      data: newPost,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
export const activePost = async (req, res, next) => {
  try {
    //Data req
    const { status, postID } = req.body;
    //Validation
    //model create
    const newPost = await Post.findByIdAndUpdate(postID, { status });
    //res
    res.status(201).json({
      success: true,
      message: "Active post successfully",
      data: newPost,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
export const deActivePost = async (req, res, next) => {
  try {
    //Data req
    const { status, postID } = req.body;
    //Validation
    if (!postID) {
      return next("chưa nhận được req postID");
    }
    //model create
    const newPost = await Post.findByIdAndUpdate(postID, { status });

    //res
    res.status(201).json({
      success: true,
      message: "DeActive post successfully",
      data: newPost,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
export const deletePost = async (req, res, next) => {
  try {
    //Data req
    const { postID } = req.params;
    console.log("postID", postID);

    //Validation
    if (!postID) {
      return next("chưa nhận được req postID");
    }
    //model create
    const newPost = await Post.findByIdAndDelete(postID);

    //res
    res.status(201).json({
      success: true,
      message: "delete post successfully",
      data: newPost,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
export const analyticsPosts = async (req, res, next) => {
  try {
    //Data req
    const { userID } = req.params;

    //Validation
    if (!userID) {
      return next("chưa nhận được req postID");
    }
    //FILTER DATA 28 NGÀY GẦN NHẤT
    // Tính toán ngày 28 ngày trước
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

    //total posts
    const totalPosts = await Post.find({
      user: userID,
      createdAt: { $gte: twentyEightDaysAgo },//gte tìm kiếm từ ngày > ngay hôm nay - 28 ngày
    }).countDocuments();

    //total flowers
    const totalFlowers = await Follower.find({
      writerId: userID,
      createdAt: { $gte: twentyEightDaysAgo },//gte tìm kiếm từ ngày > ngay hôm nay - 28 ngày
    }).countDocuments();

    //total Views : writer hiện tại xem bao nhiêu bài post
    const totalViews = await Views.find({
      userId: userID,
      createdAt: { $gte: twentyEightDaysAgo },//gte tìm kiếm từ ngày > ngay hôm nay - 28 ngày
    }).countDocuments();

    //total Writers : writer hiện tại tạo bao nhiêu bài post
    const totalWriters = await User.find({
        accountType: 'Writer',
        createdAt: { $gte: twentyEightDaysAgo },//gte tìm kiếm từ ngày > ngay hôm nay - 28 ngày
    }).countDocuments();
    //???
    const viewStats = await Views.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userID),
            createdAt: { $gte: twentyEightDaysAgo},
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            Total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    // 5 most recent followers
    const MostRecentFollowers = await Follower.find({writerId:userID}).populate({
        path: 'User',
        select: '-password', // Lấy tất cả các trường trừ password
        options: { sort: { createdAt: -1 }, limit: 5 } // Sắp xếp và giới hạn
      });
    // 5 most recent posts
    const MostRecentPosts = await Post.find({user:userID}).sort({ createdAt: -1 }).limit(5);
    //res
    res.status(201).json({
      success: true,
      message: "delete post successfully",
      data: {
        totalPosts,
        totalFlowers,
        totalViews,
        totalWriters,

        viewStats,

        MostRecentFollowers,
        MostRecentPosts
      },
    });
  } catch (error) {
    console.log('error',error);
    
    res.status(500).send(error);
  }
};
