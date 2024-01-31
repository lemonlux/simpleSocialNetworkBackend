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

const register = async (req, res, next) => {
  let catchImage = req.file?.path;
  console.log(req.body);
  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const doesUserExist = await User.findOne({ email: req.body.email });
    if (!doesUserExist) {
      try {
        const doesUserNameExist = await User.findOne({
          username: req.body.username,
        });

        if (!doesUserNameExist) {
          const newUser = new User({ ...req.body, confirmationCode });
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
            return res.status(404).json({
              error: "Error in save catch",
              message: error.message,
            });
          }
        } else {
          if (req.file) deleteImgCloudinary(catchImage);
          return res.status(409).json("This username already exists.");
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImage);
        return res.status(404).json({
          error: "Error in save catch",
          message: error.message,
        });
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImage);
      return res.status(409).json("This user already exists.");
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImage);
    return (
      res.status(500).json({
        error: "Error en el catch",
        message: error.message,
      }) && next(error)
    );
  }
};


//<!--SEC                                             LOGIN                                                     ->


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
          return res.status(404).json("Password is incorrect.");
        }
      } else {
        return res.status(404).json("User not found.");
      }
    } catch (error) {
      return (
        res.status(500).json({
          error: "Error en el catch",
          message: error.message,
        }) && next(error)
      );
    }
  };
  
  //<!--SEC                                           AUTO  LOGIN                                                  ->
  
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
          return res
            .status(404)
            .json("Password does not match. Please try again.");
        }
      } else {
        return res.status(404).json("User does not exist.");
      }
    } catch (error) {
      return (
        res.status(500).json({
          error: "Error en el catch",
          message: error.message,
        }) && next(error)
      );
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
        const { privacy } = req.body
        let enumOk = enumCheck("privacy", privacy)
        patchedUser.privacy = enumOk.check ? privacy : patchedUser.privacy
      }

      if (req.body?.gender) {     
        const { gender } = req.body
        let enumOk = enumCheck("gender", gender)
        patchedUser.gender = enumOk.check ? gender : patchedUser.gender
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
              test.push({ [key]: 'same old info' }); 
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
        return res.status(404).json({
          error: 'error en el catch del update',
          message: error.message,
        });
      }
    } catch (error) {
      return next(setError(500, error.message || 'Error general updateUser'));
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
        return res.status(404).json("That user doesn't exist.");
      }
    } catch (error) {
      return (
        res.status(500).json({
          error: "Error en el catch",
          message: error.message,
        }) && next(error)
      );
    }
  };
  
  //<!--SEC                                        GET BY ID POPULATED                                                   ->
 
  const getUserByIdPopulated = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userById = await User.findById(id).populate(
        "likedComments sentComments receivedComments myPosts likedPosts likedPosts chats followers followed"
      );
      if (userById) {
        return res.status(200).json(userById);
      } else {
        return res.status(404).json("That user doesn't exist.");
      }
    } catch (error) {
      return (
        res.status(500).json({
          error: "Error en el catch",
          message: error.message,
        }) && next(error)
      );
    }
  };
  

  //<!--SEC                                        GET BY NAME                                                     ->


const getByUsername = async (req, res, next) => {
    try {
      console.log(req.body);
      let { username } = req.params;
  
      console.log(username);
      const UsersByUsername = await User.find({
           username: { $regex: username, $options: "i" } 
      }).sort({ createdAt: -1 });
      console.log(UsersByUsername);
      if (UsersByUsername.length > 0) {
        return res.status(200).json(UsersByUsername);
      } else {
        return res
          .status(404)
          .json("That username doesn't show up in our database.");
      }
    } catch (error) {
      return (
        res.status(500).json({
          error: "Error en el catch",
          message: error.message,
        }) && next(error)
      );
    }
  };


  //<!--SEC                                        TOGGLE LIKE                                                     ->

const toggleLikedPost = async (req, res, next) => {
    console.log("entro");
    try {
      const { id } = req.params;
      const { _id, likedPosts } = req.user;
      if (likedPosts?.includes(id)) {
        try {
          await User.findByIdAndUpdate(_id, {
            $pull: { likedPosts: id },
          });
          try {
            await Post.findByIdAndUpdate(id, {
              $pull: { likes: _id },
            });
            return res.status(200).json({
              user: await User.findById(_id),
              postUnfavorited: await Post.findById(id),
            });
          } catch (error) {
            return res.status(404).json("Error in pulling user from likes.");
          }
        } catch (error) {
          return res.status(404).json("Error in pulling post from LikedPosts.");
        }
      } else {
        try {
          await User.findByIdAndUpdate(_id, {
            $push: { likedPosts: id },
          });
          try {
            await Post.findByIdAndUpdate(id, {
              $push: { likes: _id },
            });
            return res.status(200).json({
              user: await User.findById(_id),
              addedLikedPosts: await Post.findById(id),
            });
          } catch (error) {
            return res.status(404).json({
              error: error.message,
              message: "Error in pushing our id to likes in post.",
            });
          }
        } catch (error) {
          return res.status(404).json("Error in pushing post to likedPosts.");
        }
      }
    } catch (error) {
      return (
        res.status(500).json({
          error: "Error en el catch",
          message: error.message,
        }) && next(error)
      );
    }
  };
  
  //<!--SEC                                        TOGGLE LIKED COMMENTS                                                     ->
  const toggleLikedComment = async (req, res, next) => {
    try {
      console.log("body y user", req.body, req.user);
      const { id } = req.params;
      const { _id, likedComments } = req.user;
      if (likedComments.includes(id)) {
        try {
          await User.findByIdAndUpdate(_id, {
            $pull: { likedComments: id },
          });
          try {
            await Comment.findByIdAndUpdate(id, {
              $pull: { likes: _id },
            });
            return res.status(200).json({
              user: await User.findById(_id),
              commentUnfavorited: await Comment.findById(id),
            });
          } catch (error) {
            return res.status(404).json("Error in pulling user from likes.");
          }
        } catch (error) {
          return res
            .status(404)
            .json("Error in pulling comment from likedComments.");
        }
      } else {
        try {
          await User.findByIdAndUpdate(_id, {
            $push: { likedComments: id },
          });
          try {
            await Comment.findByIdAndUpdate(id, {
              $push: { likes: _id },
            });
            return res.status(200).json({
              user: await User.findById(_id),
              addedLikedComment: await Comment.findById(id),
            });
          } catch (error) {
            return res.status(404).json({
              error: error.message,
              message: "Error in pushing our id to likes in comment.",
            });
          }
        } catch (error) {
          return res.status(404).json("Error in pushing post to likedComments.");
        }
      }
    } catch (error) {
      return (
        res.status(500).json({
          error: "Error en el catch",
          message: error.message,
        }) && next(error)
      );
    }
  };


  //<!--SEC                                        TOGGLE SAVED POST                                                  ->
const toggleSavedPost = async (req, res, next) => {
    console.log("entro");
    try {
      console.log("body y user", req.body, req.user);
      const { id } = req.params;
      const { _id, savedPosts } = req.user;
      if (savedPosts?.includes(id)) {
        try {
          await User.findByIdAndUpdate(_id, {
            $pull: { savedPosts: id },
          });
          try {
            await Post.findByIdAndUpdate(id, {
              $pull: { saves: _id },
            });
            return res.status(200).json({
              user: await User.findById(_id),
              postUnfavorited: await Post.findById(id),
            });
          } catch (error) {
            return res.status(404).json("Error in pulling user from saved.");
          }
        } catch (error) {
          return res.status(404).json("Error in pulling post from saved.");
        }
      } else {
        try {
          await User.findByIdAndUpdate(_id, {
            $push: { savedPosts: id },
          });
          try {
            await Post.findByIdAndUpdate(id, {
              $push: { saves: _id },
            });
            return res.status(200).json({
              user: await User.findById(_id),
              addedLikedPosts: await Post.findById(id),
            });
          } catch (error) {
            return res.status(404).json({
              error: error.message,
              message: "Error in pushing our id to saves in post.",
            });
          }
        } catch (error) {
          return res.status(404).json("Error in pushing post to savedPosts.");
        }
      }
    } catch (error) {
      return (
        res.status(500).json({
          error: "Error en el catch",
          message: error.message,
        }) && next(error)
      );
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
    toggleLikedComment,
    toggleLikedPost,
    toggleSavedPost
  };
  