const express = require("express");
const mysql = require("mysql");
const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const util = require("util");

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
        .on("data", async (row) => {
          const productCode = row.product_code;
          const newPrice = parseFloat(row.new_price);

          const packQuery = `
            SELECT pack_id, qty
            FROM shopper.packs
            WHERE product_id = ?
          `;

          const queryAsync = util.promisify(db.query).bind(db);

          try {
            // Consulta o produto atual para validar sales_price
            const getProductQuery = `
              SELECT code, sales_price, cost_price
              FROM products
              WHERE code = ?
            `;
            const [productResult] = await queryAsync(getProductQuery, [
              productCode,
            ]);

            if (!productResult) {
              console.error(`Produto com código ${productCode} não encontrado.`);
              return;
            }

            const currentPrice = parseFloat(productResult.sales_price);
            const costPrice = parseFloat(productResult.cost_price);

            // Verifica se o novo preço é menor que cost_price
            if (newPrice < costPrice) {
              console.error(
                `O novo preço ${newPrice} é menor que o cost_price ${costPrice} para o produto com código ${productCode}.`
              );
              return;
            }

            // Verifica se a diferença entre o novo preço e o atual é maior que 10%
            const priceDifference = Math.abs(currentPrice - newPrice);
            const maxPriceDifference = currentPrice * 0.1;

            if (priceDifference > maxPriceDifference) {
              console.error(
                `A diferença entre o novo preço ${newPrice} e o preço atual ${currentPrice} excede 10% para o produto com código ${productCode}.`
              );
              return;
            }

            const updateProductQuery = `
              UPDATE products
              SET sales_price = ?
              WHERE code = ?
            `;

            await db.query(updateProductQuery, [newPrice, productCode]);
          } catch (err) {
            console.error(`Erro ao consultar o produto com código ${productCode}:`, err);
          }

          const packResults = await queryAsync(packQuery, [productCode]);

          if (packResults && packResults.length > 0) {
            for (const packResult of packResults) {
              const packId = packResult.pack_id;
              const qty = packResult.qty;

              const packPriceQuery = `
                SELECT SUM(p.sales_price) AS new_pack_price
                FROM packs AS pk
                INNER JOIN products AS p ON pk.product_id = p.code
                WHERE pk.pack_id = ?
              `;
              const packPriceResult = await queryAsync(packPriceQuery, [
                packId,
              ]);

              if (packPriceResult && packPriceResult.length > 0) {
                const newPackPrice = parseFloat(
                  packPriceResult[0].new_pack_price
                );
                const updatedPackPrice = newPackPrice * qty;

                const updatePackProductQuery = `
                  UPDATE products
                  SET sales_price = ?
                  WHERE code = ?
                `;
                await db.query(updatePackProductQuery, [
                  updatedPackPrice,
                  packId,
                ]);
              }
            }
          }
        })
        .on("end", async () => {
          const uploadDirectory = path.join(__dirname, "uploads");
          deleteFilesInDirectory(uploadDirectory);

          console.log(
            `Preços dos produtos e pacotes atualizados com sucesso para o arquivo ${csvFile}.`
          );
        })
        .on("error", (error) => {
          console.error(`Erro ao ler o arquivo CSV ${csvFile}:`, error);
        });
    }

    res
      .status(200)
      .send("Preços dos produtos e pacotes atualizados com sucesso.");
  } catch (error) {
    console.error("Erro ao processar os arquivos CSV e atualizar os preços:", error);
    res
      .status(500)
      .send("Erro ao processar os arquivos CSV e atualizar os preços.");
  }
});


const deleteFilesInDirectory = (directory) => {
  fs.readdirSync(directory).forEach((file) => {
    const filePath = path.join(directory, file);
    fs.unlinkSync(filePath);
  });
};

app.listen(port, () => {
  console.log(`Servidor Node.js rodando na porta ${port}`);
});
