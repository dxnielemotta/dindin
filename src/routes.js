const express = require("express");
const { registerUser, login } = require("./controllers/user");
const routes = express();

routes.post("/usuario", registerUser);
routes.post("/login", login);

module.exports = routes;
