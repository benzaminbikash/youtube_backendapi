const express = require("express");
const server = express();
const cors = require("cors");
const cookieparser = require("cookie-parser");
const router = require("./routes/user.routes");

server.use(cors());
server.use(express.json({ limit: "16kb" }));
server.use(express.static("public"));
server.use(cookieparser());

//routes
server.use("/api/v1/users", router);

module.exports = { server };
