const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/tmp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const Upload = multer({
  storage: storage,
});

module.exports = Upload;
