const { asyncHandler } = require("../utils/asyncHandler");

const registrationUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "Okay",
  });
});

module.exports = { registrationUser };
