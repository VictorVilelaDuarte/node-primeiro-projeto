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

const customers = [];


app.post('/account', (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some((custumer) => custumer.cpf === cpf);

  if (customerAlreadyExists) {
    return response.status(400).json({ error: "Customer already exists." })
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  });

  response.status(201).send();
})

app.get('/statement/:cpf', (request, response) => {
  const { cpf } = request.params;

  const customer = customers.find(customer => customer.cpf === cpf);

  return response.json(customer.statement)
})