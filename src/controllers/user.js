const pool = require("../connections/data-source");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const password = require("../jwtPassword");
const { register } = require("module");

const registerUser = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    if (!email || !senha) {
      return res
        .status(400)
        .json({ message: "Campos obrigatorios não fornecidos." });
    }
    const emailExists = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );

    if (emailExists.rowCount > 0) {
      return res.status(400).json({
        message: "Já existe usuário cadastrado com o e-mail informado.",
      });
    }
    const encryptedPassword = await bcrypt.hash(senha, 10);

    const { rows } = await pool.query(
      "insert into usuarios (nome,email,senha) values ($1, $2, $3) returning *",
      [nome, email, encryptedPassword]
    );

    const { senha: _, ...user } = rows[0];

    res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  registerUser,
};
