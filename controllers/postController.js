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
      createdAt: { $gte: twentyEightDaysAgo }, //gte tìm kiếm từ ngày > ngay hôm nay - 28 ngày
    }).countDocuments();

    //total flowers
    const totalFlowers = await Follower.find({
      writerId: userID,
      createdAt: { $gte: twentyEightDaysAgo }, //gte tìm kiếm từ ngày > ngay hôm nay - 28 ngày
    }).countDocuments();

    //total Views : writer hiện tại xem bao nhiêu bài post
    const totalViews = await Views.find({
      userId: userID,
      createdAt: { $gte: twentyEightDaysAgo }, //gte tìm kiếm từ ngày > ngay hôm nay - 28 ngày
    }).countDocuments();

    //total Writers : writer hiện tại tạo bao nhiêu bài post
    const totalWriters = await User.find({
      accountType: "Writer",
      createdAt: { $gte: twentyEightDaysAgo }, //gte tìm kiếm từ ngày > ngay hôm nay - 28 ngày
    }).countDocuments();
    //???
    const viewStats = await Views.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userID),
          createdAt: { $gte: twentyEightDaysAgo },
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
    const MostRecentFollowers = await Follower.find({
      writerId: userID,
    }).populate({
      path: "User",
      select: "-password", // Lấy tất cả các trường trừ password
      options: { sort: { createdAt: -1 }, limit: 5 }, // Sắp xếp và giới hạn
    });
    // 5 most recent posts
    const MostRecentPosts = await Post.find({ user: userID })
      .sort({ createdAt: -1 })
      .limit(5);
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
        MostRecentPosts,
      },
    });
  } catch (error) {
    console.log("error", error);

    res.status(500).send(error);
  }
};
//Theo tác giả
// Post có field arr là views filter theo trường này

export const getPopularContents = async (req, res, next) => {
  try {
    const popularPosts = await Post.aggregate([
      {
        $match: {
          status: true,
        },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          category: 1,
          image: 1,
          desc: 1,
          totalViews: { $size: "$views" }, // Tính tổng số lượng views
        },
      },
      {
        $sort: { totalViews: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    const popularWriter = await User.aggregate([
      {
        $match: {
          accountType: "Writer",
          emailVerified: true,
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          image: 1,
          totalFollowers: { $size: "$followers" },
        },
      },
      {
        $sort: { totalFollowers: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    res.status(200).json({
      success: true,
      message: "Get popular successfully",
      data: {
        popularPosts,
        popularWriter,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "err service",
    });
  }
};

// Nên GG - theo quan hệ - gom bảng - rồi mới lấy field trả về
// export const getPopularContent = async (req, res, next) => {
//   // update recored vào bảng view ở khúc nào?
//   // user ko đăng nhập upđate kiểu gì?
//   try {
//     const trendingPosts = await Views.aggregate([
//       {
//         $group: {
//           _id: "$postId",
//           viewCount: { $sum: 1 }, // Đếm số lượt xem
//         },
//       },
//       {
//         $sort: { viewCount: -1 }, // Sắp xếp theo số lượt xem giảm dần
//       },
//       {
//         $limit: 5, // Giới hạn số lượng bài post
//       },
//       {
//         $lookup: {
//           from: "Post", // Tên collection trong MongoDB
//           localField: "_id", //khai báo field ref
//           foreignField: "_id", //khai báo field ref
//           as: "postDetails", //tên trường mới
//         },
//       },
//       {
//         $unwind: "$postDetails", // Chuyển đổi từ mảng sang đối tượng : từ 1 1 obj có postDetails là arr thì chuyển thành 1 arr 2 obj
//       },
//       {
//         // giữ / loại, thêm field mới
//         $project: {
//           _id: 0, // Không bao gồm trường _id trong kết quả
//           postId: "$_id", // Đổi tên trường _id thành postId
//           title: "$postDetails.title", // Lấy giá trị trường title từ postDetails
//           viewCount: 1, // Giữ lại trường viewCount
//         },
//       },
//     ]);

//     res.json({ trendingPosts });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };
