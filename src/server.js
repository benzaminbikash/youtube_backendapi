const express = require("express");
const server = express();
const cors = require("cors");
const cookieparser = require("cookie-parser");
const router = require("./routes/user.routes");
const { HandlingError, notFound } = require("./middlewares/errorMiddleware");

server.use(cors());
server.use(express.json());
server.use(express.static("public"));
server.use(cookieparser());

//routes
server.use("/api/v1/users", router);

server.use(notFound);
server.use(HandlingError);

module.exports = { server };
