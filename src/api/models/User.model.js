const bcrypt = require("bcrypt"); //? encriptamos información
const validator = require("validator"); //? validamos información
const mongoose = require("mongoose"); //? hacemos modelo

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Set a valid email address."],
    },
    description:{
      type: String,
      trim: true,
      maxLength: 140,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      // required: true,
      trim: true,
      validate: [validator.isStrongPassword], //minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    },
    gender: {
      type: String,
      enum: ["male", "female", "nonbinary"],
      // required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
    },
    privacy: {
      type: String,
      enum: ["private", "public"],
    },
    image: {
      type: String,
    },
    sentComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    receivedComments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    ],
    likedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    myPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next("Password hasn't been hashed; security breach.");
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
