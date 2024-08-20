import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    content: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 5000
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: {
        type: String,
    }
}, {timestamps: true});

export const Post = mongoose.model("Post", postSchema);