import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";

const addComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { comment } = req.body;
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

    const commentData = await Comment.create({
      comment,
      postId,
      commentedBy: req.user._id,
    });

    const createdComment = await Comment.findById(commentData._id);

    if (!createdComment) {
      res.json({
        status: 400,
        message:
          "Something Went Wrong while adding comment post!!! Please try later",
      });
      return;
    }

    res.json({
      status: 200,
      message: "Comment successfully added.",
      data: createdComment,
    });
  } catch (error) {
    console.log("Error on AddComment: ", error);
    return res.json({
      status: 500,
      message: "Internal server error. Please try again later.",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const comment = await Comment.findById({
      _id: commentId,
    });

    if (!comment) {
      res.json({
        status: 404,
        message: "Comment not found",
      });
      return;
    }

    await Comment.deleteOne({
      _id: commentId,
    });

    res.json({
      status: 200,
      message: "Comment deleted successfully...",
    });
  } catch (error) {
    console.log("Error on deleteComment: ", error);
    return res.json({
      status: 500,
      message: "Internal server error. Please try again later.",
    });
  }
};

export { addComment, deleteComment };
