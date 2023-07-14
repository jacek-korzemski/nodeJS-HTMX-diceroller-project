const express = require('express');
const cors = require('cors')
const path = require('path');

const port = process.env.PORT || 3001;
const ws_port = process.env.WSPORT || 443;

const webserver = express();
webserver.use(cors());

webserver.use(express.static(path.join(__dirname, 'htmx')));

webserver.listen(port, () => console.log(`Listening on ${port}`));

const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({ port: ws_port })

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

    ws.send(response);
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