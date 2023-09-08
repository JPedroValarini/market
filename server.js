const express = require("express");
const mysql = require("mysql");
const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3001;

require("dotenv").config();

app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados MySQL:", err);
  } else {
    console.log("Conectado ao banco de dados MySQL");
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("Nenhum arquivo enviado");
    }

    const uploadDirectory = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory);
    }

    const fileName = path.join(uploadDirectory, req.file.originalname);
    fs.writeFileSync(fileName, req.file.buffer);

    console.log("Arquivo salvo em:", fileName);
    res.status(200).send("Arquivo CSV enviado e salvo com sucesso");
  } catch (error) {
    console.error("Erro ao enviar o arquivo:", error);
    res.status(500).send("Erro ao enviar o arquivo");
  }
});

app.post("/process-file", async (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      "uploads",
      "atualizacao_preco_exemplo.csv"
    );
    const results = [];

    const fileStream = fs.createReadStream(filePath);

    fileStream
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", async () => {
        for (const row of results) {
          const productCode = row.product_code;
          const newPrice = parseFloat(row.new_price);

          const updateQuery = `
            UPDATE products
            SET sales_price = ?
            WHERE code = ?
          `;

          await db.query(updateQuery, [newPrice, productCode]);
        }
        console.log("Preços dos produtos atualizados com sucesso.");
        res.status(200).send("Preços dos produtos atualizados com sucesso");
      })
      .on("error", (error) => {
        console.error("Erro ao ler o arquivo CSV:", error);
      });
  } catch (error) {
    console.error("Erro ao processar o arquivo e atualizar os preços:", error);
    res.status(500).send("Erro ao processar o arquivo e atualizar os preços");
  }
});

app.listen(port, () => {
  console.log(`Servidor Node.js rodando na porta ${port}`);
});
