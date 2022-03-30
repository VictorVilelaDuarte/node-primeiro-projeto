const express = require('express');

const app = express();

//rota para dizer que o server está online
app.get('/', (request, response) => {
  response.json({ message: 'server is on' })
})

//localhost na porta 3333
app.listen(3333);

