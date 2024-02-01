const { isAuth, isCommentOwner } = require('../../middleware/auth.middleware');
const {
    createPostComment,
    updateComment,
    getAll,
    deleteComment,
  }= require('../controllers/Comment.controller')

  
const CommentRoutes = require("express").Router();


CommentRoutes.post("/createPostComment/:idPost", [isAuth], createPostComment)
CommentRoutes.post("/updateComment/:idComment", [isAuth], updateComment)

CommentRoutes.get("/getAll", getAll)
CommentRoutes.delete("/delete/:iComment", [isCommentOwner], deleteComment)



module.exports = CommentRoutes