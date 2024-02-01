const { isAuth, isOwner } = require('../../middleware/auth.middleware');
const {
    createPostComment,
    updateComment,
    getAll,
    deleteComment,
  }= require('../controllers/Comment.controller')

  
const CommentRoutes = require("express").Router();


CommentRoutes.post("/createPostComment/:idPost", [isAuth], createPostComment)
CommentRoutes.post("/updateComment/:idComment", updateComment)

CommentRoutes.get("/getAll/:id", getAll)
CommentRoutes.delete("/delete/:idComment", deleteComment)



module.exports = CommentRoutes