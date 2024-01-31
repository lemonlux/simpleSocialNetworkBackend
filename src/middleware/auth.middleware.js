const Post = require("../api/models/Post.model");
const User = require("../api/models/User.model");
const Comment = require("../api/models/Comment.model")
const { verifyToken } = require("../utils/token");

const dotenv = require("dotenv");
dotenv.config();

const isAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    console.log(decoded);

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(error);
  }
};
//!------PARA ADMINS-------------------------

const isAuthAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (req.user.role !== "admin") {
      return next(new Error("Unauthorized, not admin"));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

//!------PARA OWNERS-------------------------

const isOwner = async (req, res, next) =>{
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return next(new Error("Unauthorized"));
  }
  try {
    const { id } = req.params;
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const tokenUser = await User.findById(decoded.id);
    try {
      switch (type) {
        case "post":
          const postById = await Post.findById(id);
          const postAuthor = await User.findById(postById.creator);
          if (postAuthor.email == tokenUser.email) {
            next();
          } else {
            return next(new Error("Not Owner"));
          }
        case "comment":
          const commentById = await Comment.findById(id);
          const commentAuthor = await User.findById(commentById.creator);

      if (commentAuthor.email == tokenUser.email) {
        next();
      } else {
        return next(new Error("Not Owner"));
      }
      
        default:
          break;
      }

    } catch (error) {
      return next(error);
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error is not owner",
      message: error.message,
    });
  }

}





module.exports = {
  isAuth,
  isAuthAdmin,
  isOwner
};
