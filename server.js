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
    const uploadFolder = path.join(__dirname, "uploads");
    const files = fs.readdirSync(uploadFolder);

    const csvFiles = files.filter((file) => file.endsWith(".csv"));

    if (csvFiles.length === 0) {
      console.error("Nenhum arquivo CSV encontrado na pasta 'uploads'.");
      res.status(404).send("Nenhum arquivo CSV encontrado.");
      return;
    }

    for (const csvFile of csvFiles) {
      const filePath = path.join(uploadFolder, csvFile);
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

            const packQuery = `
              SELECT pack_id, qty
              FROM packs
              WHERE product_id = ?
            `;
            const packResults = await db.query(packQuery, [productCode]);

            for (const packRow of packResults) {
              const packId = packRow.pack_id;
              const qty = packRow.qty;

              const packPriceQuery = `
                SELECT SUM(p.sales_price * ?) AS new_pack_price
                FROM products p
                WHERE p.code = ?
              `;
              const packPriceResult = await db.query(packPriceQuery, [qty, productCode]);
              const newPackPrice = parseFloat(packPriceResult[0].new_pack_price);

              const updatePackQuery = `
                UPDATE products
                SET sales_price = ?
                WHERE code = ?
              `;
              await db.query(updatePackQuery, [newPackPrice, packId]);
            }
          }
          console.log(`Preços dos produtos atualizados com sucesso para o arquivo ${csvFile}.`);
        })
        .on("error", (error) => {
          console.error(`Erro ao ler o arquivo CSV ${csvFile}:`, error);
        });
    }

    res.status(200).send("Preços dos produtos e pacotes atualizados com sucesso.");
  } catch (error) {
    console.error("Erro ao processar os arquivos CSV e atualizar os preços:", error);
    res.status(500).send("Erro ao processar os arquivos CSV e atualizar os preços.");
  }
});


app.listen(port, () => {
  console.log(`Servidor Node.js rodando na porta ${port}`);
});
