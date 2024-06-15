const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const app = express();
const port = 8000;

const { specs, swaggerUi } = require('./swagger');

dotenv.config({ path: './config/.env' });

// Configuração do Pool do PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

app.use(bodyParser.urlencoded({ extended: true }));

// Suas rotas e outros middlewares podem ir aqui
require('./app/routes')(app, pool);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Inicia o servidor Express
app.listen(port, () => {
  console.log('Server running on port ' + port);
});

// Tenta conectar ao banco de dados PostgreSQL
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database:', err));
