const { deleteImgCloudinary } = require("../../middleware/files.middleware");

//<!--IMP                                        UTILS / HELPERS                                                 ->
const enumCheck = require("../../utils/enumCheck");
const { generateToken } = require("../../utils/token");

//<!--IMP                                           LIBRARIES                                                    ->
const validator = require("validator");
const bcrypt = require("bcrypt");

//<!--IMP                                             MODELS                                                     ->
const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");

//<!--SEC                                   REDIRECT  REGISTRATION                                                   ->
//  WORKS CORRECTLY

const register = async (req, res, next) => {
  console.log("entroooooo");
  let catchImage = req.file?.path;
  console.log(req.body);
  try {
    await User.syncIndexes();
    const doesUserExist = await User.findOne({ email: req.body.email });
    if (!doesUserExist) {
      try {
        const doesUserNameExist = await User.findOne({
          username: req.body.username,
        });

        if (!doesUserNameExist) {
          const newUser = new User(req.body);
          if (req.file) {
            newUser.image = req.file.path;
          } else {
            newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
          }
          try {
            const savedUser = await newUser.save();
            if (savedUser) {
              return res.status(200).json({
                user: savedUser,
              });
            }
          } catch (error) {
            req.file && deleteImgCloudinary(catchImage);
            return res.status(409).json({
              error: "Error in save catch",
              message: error.message,
            });
          }
        } else {
          if (req.file) deleteImgCloudinary(catchImage);
          return res.status(409).json("This username already exists");
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImage);
        return res.status(409).json({
          error: "Error in save catch",
          message: error.message,
        });
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImage);
      return res.status(409).json("This user already exists");
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImage);
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

//<!--SEC                                             LOGIN                                                     ->
//  WORKS CORRECTLY

const userLogin = async (req, res, next) => {
  try {
    const { password, email } = req.body;
    const userFromDB = await User.findOne({ email });

    if (userFromDB) {
      if (bcrypt.compareSync(password, userFromDB.password)) {
        const token = generateToken(userFromDB._id, email); //token
        return res.status(200).json({
          user: userFromDB,
          token: token,
          state: "You are logged in.",
        });
      } else {
        return res.status(409).json({
          error: "Passwords don't match",
          message: error.message,
        });
      }
    } else {
      return res.status(404).json({
        error: "This user doesn't exist",
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

//<!--SEC                                           AUTO  LOGIN                                                  ->
//  WORKS CORRECTLY

const autoLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const userFromDB = await User.findOne({ email });
    if (userFromDB) {
      if (password === userFromDB.password) {
        const token = generateToken(userFromDB._id, email);
        return res.status(200).json({ user: userFromDB, token: token });
      } else {
        return res.status(409).json({
          error: "Passwords don't match",
          message: error.message,
        });
      }
    } else {
      return res.status(404).json({
        error: "This user doesn't exist",
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

//<!--SEC                                          UPDATE USER                                                   ->

const updateUser = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await User.syncIndexes();
    const patchedUser = new User(req.body);
    req.file && (patchedUser.image = catchImg);

    //---- info que el usuario no puede cambiar
    patchedUser._id = req.user._id;
    patchedUser.password = req.user.password;
    patchedUser.role = req?.body?.role ? req?.body?.role : req.user.role;
    patchedUser.description = req?.body?.description ? req?.body?.description : req.user.description
    patchedUser.email = req.user.email;
    patchedUser.gender = req.user.gender;
    patchedUser.username = req.user.username;
    patchedUser.sentComments = req.user.sentComments;
    patchedUser.receivedComments = req.user.receivedComments;
    patchedUser.likedComments = req.user.likedComments;
    patchedUser.likedPosts = req.user.likedPosts;
    patchedUser.myPosts = req.user.myPosts;
    patchedUser.likedPosts = req.user.likedPosts;
    patchedUser.followers = req.user.followers;
    patchedUser.following = req.user.following;

    console.log("PATCHED USERRRRRRRR", patchedUser);

    //para los enums----

    if (req.body?.privacy) {
      const { privacy } = req.body;
      let enumOk = enumCheck("privacy", privacy);
      patchedUser.privacy = enumOk.check ? privacy : patchedUser.privacy;
    }

    if (req.body?.gender) {
      const { gender } = req.body;
      let enumOk = enumCheck("gender", gender);
      patchedUser.gender = enumOk.check ? gender : patchedUser.gender;
    }

    try {
      await User.findByIdAndUpdate(req.user._id, updating);
      if (req.file) deleteImgCloudinary(req.user.image);

      //!-------- TESTING

      const updatedUser = await User.findById(req.user._id);
      const updatedKeys = Object.keys(req.body);

      const test = [];

      updatedKeys.forEach((key) => {
        if (updatedUser[key] === req.body[key]) {
          if (updatedUser[key] != req.user[key]) {
            test.push({ [key]: true });
          } else {
            test.push({ [key]: "same old info" });
          }
        } else {
          test.push({ [key]: false });
        }
        if (req.file) {
          updatedUser.image === catchImg
            ? test.push({ [key]: true })
            : test.push({ [key]: false });
        }
        //una vez hecho el testing enviamos la res con el usuario actualizado y el test
      });

      return res.status(200).json({
        updatedUser,
        test,
      });
    } catch (error) {
      return res.status(409).json({
        error: "error en el catch del update",
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

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userById = await User.findById(id);
    if (userById) {
      return res.status(200).json(userById);
    } else {
      return res.status(404).json({
        error: "This user doesn't exist",
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

const getUserByIdPopulated = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userById = await User.findById(id).populate(
      "likedComments sentComments receivedComments myPosts likedPosts likedPosts chats followers followed"
    );
    if (userById) {
      return res.status(200).json(userById);
    } else {
      return res.status(404).json({
        error: "This user doesn't exist",
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

//<!--SEC                                        GET BY USERNAME                                                  ->
//  WORKS CORRECTLY

const getByUsername = async (req, res, next) => {
  try {
    console.log(req.body);
    let { username } = req.params;

    console.log(username);
    const UsersByUsername = await User.find({
      username: { $regex: username, $options: "i" },
    }).sort({ createdAt: -1 });
    console.log(UsersByUsername);

      return res.status(200).json(UsersByUsername);

  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

const getByUsernamfgffde = async (req, res, next) => {
  try {
    const { search } = req.params;
    const usernameSearch = await User.find({
      username: { $in: search },
    })
      .sort({ createdAt: -1 })
      .populate("myPosts");

    console.log("entro");
    return res.status(200).json(
      usernameSearch
    );
  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};



//<!--SEC                                        GET ALL                                                     ->
//WORKS CORRECTLY

const getAll = async (req, res, next) => {
  try {
    const allUsers = await User.find();
    if (allUsers.length > 0) {
      return res.status(200).json(allUsers);
    } else {
      return res.status(404).json("No users in the database.");
    }
  } catch (error) {
    return (
      res.status(500).json({
        error: "Catch error",
        message: error.message,
      })
    );
  }
};


//<!--SEC                                        TOGGLE LIKE                                                     ->

const toggleLikedPost = async (req, res, next) => {
  console.log("entro");
  try {
    const { idPost } = req.params;
    const { _id, likedPosts } = req.user;
    if (likedPosts?.includes(idPost)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { likedPosts: idPost },
        });
        try {
          await Post.findByIdAndUpdate(idPost, {
            $pull: { likes: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            postUnfavorited: await Post.findById(idPost),
          });
        } catch (error) {
          return res.status(409).json({
            error: "Error pulling",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(409).json({
          error: "Error pulling",
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { likedPosts: idPost },
        });
        try {
          await Post.findByIdAndUpdate(idPost, {
            $push: { likes: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            addedLikedPosts: await Post.findById(idPost),
          });
        } catch (error) {
          return res.status(409).json({
            error: "Error pushing",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(409).json({
          error: "Error pushing",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

//<!--SEC                                        TOGGLE LIKED COMMENTS                                                     ->
const toggleLikedComment = async (req, res, next) => {
  try {
    console.log("body y user", req.body, req.user);
    const { idComment } = req.params;
    const { _id, likedComments } = req.user;
    if (likedComments.includes(idComment)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { likedComments: idComment },
        });
        try {
          await Comment.findByIdAndUpdate(idComment, {
            $pull: { likes: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            commentUnfavorited: await Comment.findById(idComment),
          });
        } catch (error) {
          return res.status(404).json({
            error: "Error pulling",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: "Error pulling",
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { likedComments: idComment },
        });
        try {
          await Comment.findByIdAndUpdate(idComment, {
            $push: { likes: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            addedLikedComment: await Comment.findById(idComment),
          });
        } catch (error) {
          return res.status(409).json({
            error: error.message,
            message: "Error pushing",
          });
        }
      } catch (error) {
        return res.status(409).json({
          error: "Error pushing",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

//<!--SEC                                        TOGGLE SAVED POST                                                  ->
const toggleSavedPost = async (req, res, next) => {
  console.log("entro");
  try {
    console.log("body y user", req.body, req.user);
    const { idPost } = req.params;
    const { _id, savedPosts } = req.user;
    if (savedPosts?.includes(idPost)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { savedPosts: idPost },
        });
        try {
          await Post.findByIdAndUpdate(idPost, {
            $pull: { saves: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            postUnfavorited: await Post.findById(idPost),
          });
        } catch (error) {
          return res.status(409).json({
            error: "Error pulling",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(409).json({
          error: "Error pulling",
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { savedPosts: idPost },
        });
        try {
          await Post.findByIdAndUpdate(idPost, {
            $push: { saves: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            addedLikedPosts: await Post.findById(idPost),
          });
        } catch (error) {
          return res.status(409).json({
            error: error.message,
            message: "Error in pushing our id to saves in post.",
          });
        }
      } catch (error) {
        return res.status(409).json({
          error: "Error pushing",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

//<!--SEC                                        TOGGLE FOLLOWING                                                  ->

const toggleFollowUser = async (req, res, next) => {
  try {
    const { idUser } = req.params; // otherUser
    const { _id, following } = req.user;
    if (following.includes(idUser)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { following: idUser }
        });
        try {
          await User.findByIdAndUpdate(idUser, {
            $pull: { followers: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            otherUser: await User.findById(idUser),
          });
        } catch (error) {
          return res.status(409).json({
            error: "Error pulling",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(409).json({
          error: "Error pulling",
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { following: idUser }
        });
        try {
          await User.findByIdAndUpdate(idUser, {
            $push: { followers: _id },
          });
          return res.status(200).json({
            user: await User.findById(_id),
            otherUser: await User.findById(idUser),
          });
        } catch (error) {
          return res.status(409).json({
            error: error.message,
            message: "Error in pushing our id to saves in post.",
          });
        }
      } catch (error) {
        return res.status(409).json({
          error: "Error pushing",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "Catch error",
      message: error.message,
    });
  }
};

module.exports = {
  register,
  autoLogin,
  userLogin,
  updateUser,
  getByUsername,
  getUserById,
  getUserByIdPopulated,
  getAll,
  toggleLikedComment,
  toggleLikedPost,
  toggleSavedPost,
  toggleFollowUser
};
