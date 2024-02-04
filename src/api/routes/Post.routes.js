const { isAuth, isOwner } = require("../../middleware/auth.middleware");

const {
  createPost,
  getPostById,
  getPostByIdPopulated,
  getPostsByFollowing,
  getAllPostsPopulated,
  deletePost,
  updatePost,
  searchPost,
} = require("../controllers/Post.controller");

const PostRoutes = require("express").Router();

PostRoutes.post("/create", [isAuth], createPost);

PostRoutes.get("/getById/:id", getPostByIdPopulated);
PostRoutes.get("/getAll", getAllPostsPopulated);
PostRoutes.get("/search/:search", searchPost);
PostRoutes.get("/getAllFollowing", [isAuth], getPostsByFollowing);

PostRoutes.patch("/update/:id",  updatePost);

PostRoutes.delete("/delete/:id",  deletePost);

module.exports = PostRoutes;
