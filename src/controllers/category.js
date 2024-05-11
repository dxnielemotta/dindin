const pool = require("../connections/data-source");

const getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query("select * from categorias");
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

module.exports = { getCategories };
