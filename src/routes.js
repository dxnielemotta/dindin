const express = require("express");
const {
  registerUser,
  login,
  detailUser,
  updateUser,
} = require("./controllers/user");
const auth = require("./middleware/auth");
const routes = express();

routes.post("/usuario", registerUser);
routes.post("/login", login);
routes.get("/usuario", auth, detailUser);
routes.put("/usuario", auth, updateUser);

module.exports = routes;
