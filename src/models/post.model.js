import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
    },
    shortDescription: {
      type: String,
      required: true,
      minlength: 20,
    },
    content: {
      type: String,
      required: true,
      minlength: 50,
    },
    author: {
      type: {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: String,
        fullName: String,
        email: String,
        profilePic: String,
      },
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
