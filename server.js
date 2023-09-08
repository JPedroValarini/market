const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = 3001;

require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado ao banco de dados MySQL');
});

app.use(express.json());

app.post('/upload', (req, res) => {
  const filePath = '/arquivo.csv';

  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {

      results.push(row);
    })
    .on('end', () => {
      console.log(results);

      results.forEach((row) => {
        const productCode = row.product_code;
        const newPrice = parseFloat(row.new_price);

      });

      res.status(200).send('Arquivo CSV processado com sucesso');
    });
});

app.listen(port, () => {
  console.log(`Servidor Node.js rodando na porta ${port}`);
});
