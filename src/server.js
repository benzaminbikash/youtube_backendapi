const express = require("express");
const server = express();
const cors = require("cors");
const cookieparser = require("cookie-parser");

server.use(cors());
server.use(express.json({ limit: "16kb" }));
server.use(express.static("public"));
server.use(cookieparser());

module.exports = { server };
