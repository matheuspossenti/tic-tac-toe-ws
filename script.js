// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let gameData = {
    board: Array(9).fill(''),
    currentPlayer: 'X',
};

function broadcastGameData() {
    wss.clients.forEach(client => {
        client.send(JSON.stringify(gameData));
    });
}

wss.on('connection', ws => {
    ws.send(JSON.stringify(gameData));

    ws.on('message', message => {
        const data = JSON.parse(message);
        if (data.reset) {
            gameData.board = Array(9).fill('');
            gameData.currentPlayer = 'X';
            broadcastGameData();
        } else {
            const { index } = data;
            if (gameData.board[index] === '' && gameData.currentPlayer === 'X') {
                gameData.board[index] = 'X';
                gameData.currentPlayer = 'O';
                broadcastGameData();
            } else if (gameData.board[index] === '' && gameData.currentPlayer === 'O') {
                gameData.board[index] = 'O';
                gameData.currentPlayer = 'X';
                broadcastGameData();
            }
        }
    });
});

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
