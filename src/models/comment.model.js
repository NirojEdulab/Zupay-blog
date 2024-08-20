import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    comment: {
        type: String,
        required: true,
    },
    commentedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    }
}, {timestamps: true});

export const Comment = mongoose.model("Comment", commentSchema);
