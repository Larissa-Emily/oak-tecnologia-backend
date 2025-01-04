const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = 5000;

// Configuração do pool de conexão com o PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

pool.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conexão bem-sucedida com o banco de dados!');
  }
});


// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rota para cadastro de produto (POST)
app.post("/products", async (req, res) => {
  const { name, description, price, available } = req.body;

  if (!name || !description || !price) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO produtos (name, description, price, available) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, price, available]
    );

    res.status(201).json({ message: "Produto cadastrado com sucesso!", product: result.rows[0] });
  } catch (error) {
    console.error("Erro ao salvar no banco de dados:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// Rota para buscar todos os produtos (GET)
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
