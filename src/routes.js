const express = require("express");
const {
  registerUser,
  login,
  detailUser,
  updateUser,
} = require("./controllers/user");
const { getCategories } = require("./controllers/category");
const auth = require("./middleware/auth");
const {
  getUserTransactions,
  detailTransaction,
  registerTransaction,
  updateTransaction,
  deleteTransaction,
  getAccountStatement,
} = require("./controllers/transactions");
const routes = express();

routes.post("/usuario", registerUser);
routes.post("/login", login);
routes.get("/usuario", auth, detailUser);
routes.put("/usuario", auth, updateUser);

routes.get("/categoria", auth, getCategories);

routes.get("/transacao", auth, getUserTransactions);
routes.get("/transacao/extrato", auth, getAccountStatement);
routes.get("/transacao/:id", auth, detailTransaction);
routes.post("/transacao", auth, registerTransaction);
routes.put("/transacao/:id", auth, updateTransaction);
routes.delete("/transacao/:id", auth, deleteTransaction);

module.exports = routes;
