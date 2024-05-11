const express = require("express");
const { registerUser } = require("./controllers/user");
const routes = express();

routes.post("/usuario", registerUser);

module.exports = routes;
