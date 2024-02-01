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

PostRoutes.get("/getById/:id", getPostById);
PostRoutes.get("/getAll/populated/", getAllPostsPopulated);
PostRoutes.get("/search/:search", searchPost);
PostRoutes.get("/getAllFollowing", getPostsByFollowing);

PostRoutes.patch("/update/:id", [isOwner("post")], updatePost);
PostRoutes.delete("/:id", [isOwner("post")], deletePost);

module.exports = PostRoutes;
