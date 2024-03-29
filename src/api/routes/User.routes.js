const { isAuth } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");

const {
    register,
    autoLogin,
    userLogin,
    updateUser,
    getByUsername,
    getUserByUsernamePopulated,
    getUserById,
    getUserByIdPopulated,
    getAll,
    toggleLikedComment,
    toggleLikedPost,
    toggleSavedPost,
    toggleFollowUser
  } = require("../controllers/User.controller");

//!--------ROUTES----------------------------------------------

const UserRoutes = require("express").Router();

UserRoutes.post("/register", upload.single("image"), register);
UserRoutes.post("/login", userLogin);
UserRoutes.post("/login/autologin", autoLogin);


//!---------AUTH-----------------
UserRoutes.patch(
  "/update",
  [isAuth],
  upload.single("image"),
  updateUser
);
UserRoutes.get("/getById/:id", [isAuth], getUserById)
UserRoutes.get("/getByIdP/:id", [isAuth], getUserByIdPopulated)
UserRoutes.get("/getAll", [isAuth], getAll)
UserRoutes.get("/getByUsername/:username", [isAuth], getByUsername)
UserRoutes.get("/getByUsernameP/:username", [isAuth], getUserByUsernamePopulated)

UserRoutes.patch("/likeComment/:idComment", [isAuth], toggleLikedComment)
UserRoutes.patch("/likePost/:idPost", [isAuth], toggleLikedPost)
UserRoutes.patch("/savePost/:idPost", [isAuth], toggleSavedPost)
UserRoutes.patch("/followUser/:idUser", [isAuth], toggleFollowUser)


module.exports = UserRoutes;

