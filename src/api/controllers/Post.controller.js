//<!--IMP                                             MODELS                                                     ->
const Post = require("../models/Post.model");
const User = require("../models/User.model");
const Comment = require("../models/Comment.model");

//<!--SEC                                      CREATE POST                                                    ->

const createPost = async (req, res) => {
  try {
    await Post.syncIndexes();
    const { _id } = req.user;

    const postBody = {
      creator: _id,
      text: req?.body.text,
    };

    const newPost = new Post(postBody);
    const savedPost = await newPost.save();

    const datedPosts = await Post.updateMany(
      {},
      { $convert: { input: "$createdAt", to: "date" } }
    );

    try {
      await User.findByIdAndUpdate(_id, { $push: { myPosts: savedPost._id } });

      if (savedPost) {
        return res.status(200).json({
          savedPost,
          datedPosts,
        });
      } else {
        return res.status(409).json("Error saving post");
      }
    } catch (error) {
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

//<!--SEC                                      UPDATE POST                                                    ->

const updatePost = async (req, res) => {
  try {
    await Post.syncIndexes();
    const { id } = req.params;
    try {
      const postById = await Post.findById(id);

      if (postById) {
        const customBody = {
          text: req.body?.text ? req.body.text : postById.text,
          saves: postById.saves,
          creator: postById.creator,
          likes: postById.likes,
          comments: postById.comments,
        };

        try {
          await Post.findByIdAndUpdate(id, customBody).populate(
            "creator likes comments"
          );

          //!-------- TESTING

          const postByIdUpdated = await Post.findById(id);

          const elementUpdate = Object.keys(req.body);
          let test = {};

          elementUpdate.forEach((item) => {
            if (customBody[item] === postByIdUpdated[item]) {
              if (customBody[item] !== postById[item]) {
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
              postByIdUpdated,
              update: false,
              dataTest: test,
            });
          } else {
            return res.status(200).json({
              postByIdUpdated,
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
        error: "Post not found",
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

//<!--SEC                                        GET BY ID NORMAL                                                  ->

const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const postById = await Post.findById(id);
    if (postById) {
      return res.status(200).json(postById);
    } else {
      return res.status(404).json({
        error: "This post doesn't exist",
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

//<!--SEC                                        GET BY ID POPULATED                                               ->

const getPostByIdPopulated = async (req, res, next) => {
  try {
    const { id } = req.params;
    const postById = await Post.findById(id).populate(
      "text creator likes saves comments"
    );
    if (postById) {
      return res.status(200).json(postById);
    } else {
      return res.status(404).json({
        error: "This post doesn't exist",
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

//<!--SEC                                     GET ALL POPULATED                                           ->

const getAllPostsPopulated = async (req, res, next) => {
  try {
    const allPosts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("text creator likes saves comments");

    if (allPosts.length > 0) {
      return res.status(200).json({
        allPosts,
      });
    } else {
      return res.status(404).json({
        error: "Posts not found",
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
//<!--SEC                                     GET POSTS BY FOLLOWING                                           ->

const getPostsByFollowing = async (req, res, next) => {
  try {
    const { followed } = req.user;
    console.log(followed);
    const postSearch = await Post.find({
      creator: { $regex: followed, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .populate("creator likes saves comments");
    console.log("entro");
    return res.status(200).json({
      followed,
      postSearch,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

//   const getAllPostByType = async (req, res, next) => {
//     console.log(req.params);
//     const { type } = req.params;
//     try {
//       const postsByType = await Post.find({
//         type: { $in: type },
//       })
//         .sort({ createdAt: -1 })
//         .populate("creator likes comments");

//       console.log(postsByType);
//       return res.status(200).json(postsByType);
//     } catch (error) {
//       return res.status(500).json({
//         error: "Error en el catch",
//         message: error.message,
//       });
//     }
//   };

//<!--SEC                                   SEARCH POSTS                                           ->

const searchPost = async (req, res, next) => {
  try {
    const { search } = req.params;
    const postSearch = await Post.find({
      text: { $regex: search, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .populate("creator likes saves comments");

    console.log("entro");
    return res.status(200).json({
      search,
      postSearch,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

//<!--SEC                                     DELETE POSTS                                            ->

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);

    if (post) {
      try {
        await User.updateMany(
          { myPosts: id, likedPosts: id, savedPosts: id },
          {
            $pull: {
              myPosts: id,
              likedPosts: id,
              savedPosts: id,
            },
          }
        );
        try {
          await Comment.updateMany(
            { commentedPost: id },
            { $pull: { commentedPost: id } }
          );
          const postById = await Post.findById(id);
          return res.status(postById ? 404 : 200).json({
            deleteTest: postById ? false : true,
          });
        } catch (error) {
          return res.status(409).json({
            error: "Error updating comments once deleted",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(409).json({
          error: "Error updating users once deleted",
          message: error.message,
        });
      }
    } else {
      return res.status(404).json({
        error: "This post doesn't exist",
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
  createPost,
  getPostById,
  getPostByIdPopulated,
  getPostsByFollowing,
  getAllPostsPopulated,
  deletePost,
  updatePost,
  searchPost,
};
