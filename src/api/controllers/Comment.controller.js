//<!--IMP                                             MODELS                                                     ->

const Comment = require("../models/Comment.model");
const Post = require("../models/Post.model");
const User = require("../models/User.model");

//<!--SEC                                        CREATE COMMENT                                              ->

const createPostComment = async (req, res) => {
  try {
    const { idPost } = req.params;
    const post = await Post.findById(idPost);
    const { _id } = req.user;

    try {
      await Comment.syncIndexes();

      const commentBody = {
        textComment: req.body.textComment,
        type: "public",
        creator: _id,
      };

      const newComment = new Comment(commentBody);
      const savedComment = await newComment.save();

      if (savedComment) {
        try {
          await Post.findByIdAndUpdate(idPost, {
            $push: { comments: savedComment },
          });

          try {
            await User.findByIdAndUpdate(_id, {
              $push: { sentComments: savedComment },
            });

            try {
              await Comment.findByIdAndUpdate(savedComment._id, {
                $push: { commentedPost: post },
              });

              try {
                return res.status(200).json({
                  commentCreated: await Comment.findById(
                    savedComment._id
                  ).populate("creator commentedPost"),
                });
              } catch (error) {
                return res.status(404).json({
                  error: "Error giving response",
                  message: error.message,
                });
              }
            } catch (error) {
              return res.status(404).json({
                error: "Post and User not saved into Comment",
                message: error.message,
              });
            }
          } catch (error) {
            return res.status(404).json({
              error: "Comment not saved into User",
              message: error.message,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: "Comment not saved into Post",
            message: error.message,
          });
        }
      }
    } catch (error) {
      return res.status(404).json({
        error: "Error en el catch",
        message: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

//<!--SEC                                        GET ALL                                                     ->

const getAll = async (req, res, next) => {
  const { id } = req.params;
  try {
    const allComments = await Comment.find({
      $and: [
        { type: "public" },
        {
          $or: [{ commentedPost: id }],
        },
      ],
    }).populate("creator");
    if (allComments) {
      return res.status(200).json(allComments);
    } else {
      return res.status(404).json({
        error: "Comment not found",
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

//<!--SEC                                    UPDATE COMMENT                                              ->

const updateComment = async (req, res) => {
  try {
    await Comment.syncIndexes();
    const { idComment } = req.params;
    try {
      const commentById = await Comment.findById(idComment);

      if (commentById) {
        const customBody = {
          textComment: req.body?.textComment
            ? req.body.textComment
            : commentById.textComment,
          type: commentById.type,
          creator: commentById.creator,
          commentedPost: commentById.commentedPost,
          likes: commentById.likes,
        };
        console.log("customBody", customBody);

        try {
          await Comment.findByIdAndUpdate(idComment, customBody).populate(
            "creator textComment commentedPost likes type"
          );

          //!-------- TESTING

          const commentByIdUpdated = await Comment.findById(idComment);

          const elementUpdate = Object.keys(req.body);
          let test = {};

          elementUpdate.forEach((item) => {
            if (customBody[item] === commentByIdUpdated[item]) {
              if (customBody[item] !== commentById[item]) {
                test[item] = true;
              } else {
                test[item] = "same old info";
              }
            } else {
              test[item] = false;
            }
          });

          const acc = Object.values(test).filter(
            (value) => value === false
          ).length;

          if (acc > 0) {
            return res.status(404).json({
              commentByIdUpdated,
              update: false,
              dataTest: test,
            });
          } else {
            return res.status(200).json({
              commentByIdUpdated,
              update: true,
              dataTest: test,
            });
          }
        } catch (error) {
          return res.status(409).json({
            error: "Error updating",
            message: error.message,
          });
        }
      }
    } catch (error) {
      return res.status(404).json({
        error: "Comment not found",
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

//<!--SEC                                        DELETE COMMENT                                              ->

const deleteComment = async (req, res, next) => {
  console.log("entro");
  try {
    const { idComment } = req.params;
    const comment = await Comment.findByIdAndDelete(idComment);

    if (comment) {
      try {
        await User.updateMany(
          {
            sentComments: idComment,
            receivedComments: idComment,
            likedComments: idComment,
          },
          {
            $pull: {
              sentComments: idComment,
              receivedComments: idComment,
              likedComments: idComment,
            },
          }
        );

        try {
          await Post.updateMany(
            { comments: idComment },
            { $pull: { comments: idComment } }
          );

          const findByIdComment = await Comment.findById(idComment);

          return res.status(findByIdComment ? 404 : 200).json({
            deleteTest: findByIdComment ? false : true,
          });
        } catch (error) {
          return res.status(409).json({
            error: "Error deleting",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(409).json({
          error: "Error deleting",
          message: error.message,
        });
      }
    } else {
      return res.status(404).json({
        error: "Not found",
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

module.exports = {
  createPostComment,
  updateComment,
  getAll,
  deleteComment,
};
