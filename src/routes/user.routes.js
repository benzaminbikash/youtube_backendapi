const express = require("express");
const router = express.Router();

const { registrationUser } = require("../controllers/user.controller");

router.route("/registration").get(registrationUser);

module.exports = router;
