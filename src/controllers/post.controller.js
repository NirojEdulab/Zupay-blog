import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 6;
    const skip = (page - 1) * itemsPerPage;

    const posts = await Post.find({})
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(itemsPerPage);

    res.json({
      status: 200,
      message: "All posts",
      data: posts,
    });
  } catch (error) {
    console.log("Error while getAllPosts: ", error);
  }
};

const getSinglePost = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid post ID",
    });
  }

  try {
    const postId = req.params.id;
    const postData = await Post.findOne({
      _id: postId,
    });

    if (!postData) {
      res.json({
        status: 404,
        message: "Post not found",
        data: [],
      });
      return;
    }

    postData.views += 1;
    await postData.save();

    await res.json({
      status: 200,
      message: "Post fetched successfully",
      data: postData,
    });
  } catch (error) {
    console.log("Error while getSinglePost: ", error);
  }
};

const createPost = async (req, res) => {
  try {
    const { title, shortDescription, content, userId } = req.body;
    if (
      [title, shortDescription, content, userId].some(
        (field) => field?.trim() === ""
      )
    ) {
      res.json({
        status: 400,
        message: "All fields are required.",
      });
      return;
    }

    const autherData = await User.findById({
      _id: userId,
    });

    if (!autherData) {
      res.json({
        status: 400,
        message: "Something went wrong...",
      });
      return;
    }

    const postImageLocalPath = req.file?.path;
    const postImage = await uploadOnCloudinary(postImageLocalPath);

    const post = await Post.create({
      title,
      shortDescription,
      content,
      author: autherData,
      image: postImage?.url || "",
    });

    const createdPost = await Post.findById(post._id);

    if (!createdPost) {
      res.json({
        status: 400,
        message: "Something Went Wrong while creating post!!! Please try later",
      });
      return;
    }

    res.json({
      status: 200,
      message: "Post successfully created.",
      data: createdPost,
    });
  } catch (error) {
    console.log("Error while createPost: ", error);
  }
};

const updatePost = async (req, res) => {
  try {
    console.log("update post called", req.body);

    const postId = req.params.id;
    const { title, shortDescription, content } = req.body;
    const image = req.file;

    if (!title && !content && !image && !shortDescription) {
      res.json({
        status: 200,
        message: "No changes made.",
      });
      return;
    }

    const post = await Post.findById({
      _id: postId,
    });

    if (!post) {
      res.json({
        status: 404,
        message: "Post not found",
        data: [],
      });
      return;
    }

    if (!req.user._id.equals(post.author._id)) {
      res.json({
        status: 403,
        message: "Sorry! You can't change the post.",
        data: [],
      });
      return;
    }

    if (image?.path) {
      const imageLocalPath = image?.path;
      const updatedImage = await uploadOnCloudinary(imageLocalPath);
      if (updatedImage.url) {
        post.image = updatedImage.url;
      }
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (shortDescription) post.shortDescription = shortDescription;

    const updatedPost = await post.save();

    res.json({
      status: 200,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.log("Error while updatePost: ", error);
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById({
      _id: postId,
    });

    if (!post) {
      res.json({
        status: 404,
        message: "Post not found",
      });
      return;
    }

    // Extract the public ID from the Cloudinary URL
    const imageUrl = post.image;
    const imagePublicId = imageUrl
      ? imageUrl.split("/").slice(-1)[0].split(".")[0]
      : null;

    await Post.deleteOne({
      _id: postId,
    });

    // Delete the image from Cloudinary
    if (imagePublicId) {
      await cloudinary.uploader.destroy(imagePublicId, (error, result) => {
        if (error) {
          console.log("Error while deleting image from Cloudinary: ", error);
        } else {
          console.log("Image deleted from Cloudinary: ", result);
        }
      });
    }

    res.json({
      status: 200,
      message: "Post deleted successfully...",
    });
  } catch (error) {
    console.log("Error while deletePost: ", error);
  }
};

export { getAllPosts, getSinglePost, createPost, updatePost, deletePost };
