const { isAuth, isOwner } = require('../../middleware/auth.middleware');
const {
    createPostComment,
    updateComment,
    getAll,
    deleteComment,
  }= require('../controllers/Comment.controller')

  
const CommentRoutes = require("express").Router();


CommentRoutes.post("/createPostComment/:idPost", [isAuth], createPostComment)
CommentRoutes.post("/updateComment/:idComment", [isOwner("comment")], updateComment)

CommentRoutes.get("/getAll", getAll)
CommentRoutes.delete("/delete/:iComment", [isOwner("comment")], deleteComment)



module.exports = CommentRoutes