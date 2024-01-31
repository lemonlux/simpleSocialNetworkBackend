const { isAuth } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");

const {
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
UserRoutes.get("/getByUsername/:username", [isAuth], getByUsername)
UserRoutes.patch("/likeComment/:id", [isAuth], toggleLikedComment)
UserRoutes.patch("/likePost/:id", [isAuth], toggleLikedPost)
UserRoutes.patch("/savePost/:id", [isAuth], toggleSavedPost)


module.exports = UserRoutes;

