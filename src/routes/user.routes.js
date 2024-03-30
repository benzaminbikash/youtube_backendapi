const express = require("express");
const router = express.Router();

const Upload = require("../middlewares/multer.middleware");
const { registrationUser } = require("../controllers/user.controller");

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

module.exports = router;
