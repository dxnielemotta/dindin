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

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    if (!email || !senha) {
      return res
        .status(400)
        .json({ message: "Campos obrigatorios não fornecidos." });
    }
    const user = await pool.query("select * from usuarios where email = $1", [
      email,
    ]);

    if (user.rowCount < 1) {
      return res
        .status(404)
        .json({ message: "Usuário e/ou senha inválido(s)." });
    }

    const validPassword = await bcrypt.compare(senha, user.rows[0].senha);

    if (!validPassword) {
      return res
        .status(400)
        .json({ message: "Usuário e/ou senha inválido(s)." });
    }

    const token = jwt.sign({ id: user.rows[0].id }, password, {
      expiresIn: "8h",
    });

    const { senha: _, ...userLogged } = user.rows[0];

    return res.status(200).json({ usuario: userLogged, token });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const detailUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    const { rows } = await pool.query("select * from usuarios where id = $1", [
      req.user.id,
    ]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const updateUser = async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!req.user) {
    return res.status(401).json({ message: "Não autorizado" });
  }

  try {
    if (!nome || !email || !senha) {
      return res.status(400).json({
        message: "Todos os campos (nome, email, senha) são obrigatórios.",
      });
    }

    const emailExists = await pool.query(
      "select * from usuarios where email = $1 and id != $2",
      [email, req.user.id]
    );
    if (emailExists.rowCount > 0) {
      return res.status(400).json({
        message:
          "O e-mail informado já está sendo utilizado por outro usuário.",
      });
    }

    const encryptedPassword = await bcrypt.hash(senha, 10);

    await pool.query(
      "update usuarios set nome = $1, email = $2, senha = $3 where id = $4",
      [nome, email, encryptedPassword, req.user.id]
    );

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

module.exports = {
  registerUser,
  login,
  detailUser,
  updateUser,
};
