const express = require('express');
const path = require('path');

const webserver = express();

webserver.use(express.static(path.join(__dirname, 'htmx')));

webserver.listen(3000, () => console.log(`Listening on ${3000}`));

const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({ port: 8080 })

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