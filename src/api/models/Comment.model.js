const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CommentSchema = new Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    commentedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    type: { 
        type: String, 
        enum: ["public", "private"] 
    },
    textComment: { 
        type: String, 
        unique: false, 
        required: true 
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);
const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
