const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

//localhost na porta 3333
app.listen(3333);

//permite o express a receber body JSON
app.use(express.json());

//rota para dizer que o server está online
app.get('/', (request, response) => {
  response.json({ message: 'server is on' })
})

const costumers = [];


app.post('/account', (request, response) => {
  const { cpf, name } = request.body;
  const id = uuidv4();
  costumers.push({
    cpf,
    name,
    id,
    statement: []
  });

  response.status(201).send();
})