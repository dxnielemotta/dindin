const pool = require("../connections/data-source");

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

module.exports = {
  getUserTransactions,
};
