const pool = require("../connections/data-source");
const jwt = require("jsonwebtoken");
const password = require("../jwtPassword");

const auth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      message:
        "Para acessar este recurso um token de autenticação válido deve ser enviado.",
    });
  }

  const token = authorization.split(" ")[1];

  const jwtPass = password;

  const { id } = jwt.verify(token, jwtPass);

  const userQuery = await pool.query("select * from usuarios where id = $1", [
    id,
  ]);

  const user = userQuery.rows[0];

  if (!user) {
    return res.status(401).json({ message: "Não autorizado" });
  }

  req.user = user;

  next();
};

module.exports = auth;
