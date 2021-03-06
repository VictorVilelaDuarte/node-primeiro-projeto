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

//middleware
function verifyIfCPFExistis(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: 'Costumer does not exist' })
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

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

// app.use(verifyIfCPFExistis);
app.get('/statement', verifyIfCPFExistis, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement)
})

app.get('/statement/date', verifyIfCPFExistis, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  return response.json(statement);
})

app.post('/deposit', verifyIfCPFExistis, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
})

app.post('/withdraw', verifyIfCPFExistis, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: 'Insuficient funds.' });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
})

app.put('/account', verifyIfCPFExistis, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
})

app.get('/account', verifyIfCPFExistis, (request, response) => {
  const { customer } = request;

  return response.json(customer);
})

app.delete('/account', verifyIfCPFExistis, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(200).json(customers);
})

app.get('/balance', verifyIfCPFExistis, (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.json(balance)
})