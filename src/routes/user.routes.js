const express = require("express");
const router = express.Router();

const Upload = require("../middlewares/multer.middleware");
const {
  registrationUser,
  loginUser,
  LogoutUser,
  refreshTokenHandler,
  changePassword,
} = require("../controllers/user.controller");
const authMiddlware = require("../middlewares/auth.middleware");

router.route("/registration").post(
  Upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverimage",
      maxCount: 1,
    },
  ]),
  registrationUser
);
router.route("/login").post(loginUser);
router.route("/logout").get(authMiddlware, LogoutUser);
router.route("/refreshtoken").get(refreshTokenHandler);
router.route("/currentpasswordchange").put(authMiddlware, changePassword);

module.exports = router;
