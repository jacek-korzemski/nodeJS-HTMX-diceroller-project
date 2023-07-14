const express = require('express');
const cors = require('cors')
const path = require('path');
const WebSocket = require('ws');
const { WebSocketServer } = require('ws')
require('dotenv').config();
require('ejs');

const port = process.env.PORT || 3001;

const server = express();
server.use(cors());

server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'htmx'));

server.use(express.static(path.join(__dirname, 'htmx')));

server.get('/', (req, res) => {
  const environmentVariables = {
    APP_URL: process.env.APP_URL,
  };

  res.render('index', { env: environmentVariables });
});

const webserver = server.listen(port, () => console.log(`Listening on ${port}`));

const sockserver = new WebSocketServer({ server: webserver });

sockserver.on('connection', ws => {
  console.log('New client connected!')
  ws.send('connection established')
  ws.on('close', () => console.log('Client has disconnected!'))
  ws.on('message', data => {
    console.log(`Received message: ${data}`);

    const { player_name, dice } = JSON.parse(data);
    const roll_result = rollDice(dice);
    const response = JSON.stringify({player_name, roll_result, dice});

    console.log(response);

    sockserver.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(response);
      }
    });
  });
  ws.onerror = function () {
    console.log('websocket error')
  }
})

function rollDice(dice) {
  const diceRange = dice.substring(1);
  const max = parseInt(diceRange);
  return Math.floor(Math.random() * max) + 1;
}