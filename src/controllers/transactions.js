const pool = require("../connections/data-source");

const getCategory = async (categoria_id) => {
  const query = "select descricao from categorias where id = $1";
  const categoryResult = await pool.query(query, [categoria_id]);
  return categoryResult.rows[0];
};

const getTransaction = async (id, usuario_id) => {
  const query = "select from transacoes where id = $1 and usuario_id = $2";
  const transaction = await pool.query(query, [id, usuario_id]);
  return transaction.rows[0];
};

const getUserTransactions = async (req, res) => {
  const usuario_id = req.user.id;
  try {
    const query = `select t.*, c.descricao as categoria_nome from transacoes t  
      inner join categorias c on t.categoria_id = c.id where usuario_id = $1`;

    const transactions = await pool.query(query, [usuario_id]);

    return res.status(200).json(transactions.rows);
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const detailTransaction = async (req, res) => {
  const usuario_id = req.user.id;
  const transacao_id = req.params.id;

  try {
    const query = `select t.*, c.descricao as categoria_nome from transacoes t  
      inner join categorias c on t.categoria_id = c.id where t.id = $1 AND t.usuario_id = $2`;

    const transaction = await pool.query(query, [transacao_id, usuario_id]);

    if (transaction.rowCount < 1) {
      return res.status(404).json({ message: "Transação não encontrada." });
    }

    return res.status(200).json(transaction.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const registerTransaction = async (req, res) => {
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const usuario_id = req.user.id;

  try {
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res.status(400).json({
        message: "Todos os campos obrigatórios devem ser informados.",
      });
    }

    const category = await getCategory(categoria_id);

    if (!category) {
      return res.status(404).json({ mensagem: "Categoria não encontrada." });
    }

    if (tipo !== "entrada" && tipo !== "saida") {
      return res.status(400).json({
        mensagem: "O tipo da transação é inválido.",
      });
    }

    const { descricao: categoria_nome } = category;

    const newTransaction = await pool.query(
      `insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) values   
     ($1, $2, $3, $4, $5, $6) returning *, $7 as categoria_nome`,
      [descricao, valor, data, categoria_id, usuario_id, tipo, categoria_nome]
    );

    res.status(201).json(newTransaction.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const usuario_id = req.user.id;

  try {
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res.status(400).json({
        mensagem: "Todos os campos obrigatórios devem ser informados",
      });
    }

    const transaction = getTransaction(id, usuario_id);

    if (!transaction) {
      return res.status(404).json({ mensagem: "Transação não encontrada" });
    }

    const category = await getCategory(categoria_id);

    if (!category) {
      return res.status(404).json({ mensagem: "Categoria não encontrada" });
    }

    if (tipo !== "entrada" && tipo !== "saida") {
      return res
        .status(400)
        .json({ mensagem: "O tipo da transação é inválido" });
    }

    await pool.query(
      "update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 where id = $6",
      [descricao, valor, data, categoria_id, tipo, id]
    );
    return res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

module.exports = {
  getUserTransactions,
  detailTransaction,
  registerTransaction,
  updateTransaction,
};
