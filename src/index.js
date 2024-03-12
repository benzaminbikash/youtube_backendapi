require("dotenv").config();
const connectDB = require("./db");
const { server } = require("./server");

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server listening on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
