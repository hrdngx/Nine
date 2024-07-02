const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const path = require('path');
const { count } = require('console');

const PORT = 3000;


// ゲームの状態
let players = {};
let foods = [];
let poisons = [];
let name = '';

// クライアント側のファイルを提供するための設定
app.use(express.static(path.join(__dirname, 'public')));

// 餌を生成する関数
function generateFood() {
    return {
        x: Math.floor(Math.random() * 1600),
        y: Math.floor(Math.random() * 1200),
        id: Math.floor(Math.random() * 100000),
        size: 10,
        color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
    };
}

//毒を生成する処理
function generatePoison() {
    return {
        x: Math.floor(Math.random() * 1600),
        y: Math.floor(Math.random() * 1200),
        id: Math.floor(Math.random() * 100000),
        size: 25,
        color: `rgb(0, 0, 0)`
    };
}

// 初期餌を生成
for (let i = 0; i < 100; i++) {
    foods.push(generateFood());
}

// 初期毒を生成
for (let i = 0; i < 30; i++) {
    poisons.push(generatePoison());
}

// クライアントからの接続を待ち受ける
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 新しいプレイヤーを追加
    players[socket.id] = {
        x: Math.floor(Math.random() * (1000 - 200 + 1) + 200),
        y: Math.floor(Math.random() * (1000 - 200 + 1) + 200),
        size: 10,
        color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
        name: name
    };

    // 新しいプレイヤーに現在のゲーム状態を送信
    socket.emit('init', { players, foods, poisons });

    // 他のプレイヤーに新しいプレイヤーを通知
    socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

    socket.on('move', (data) => {
        const player = players[socket.id];
        if (player) {
            player.x = Math.max(0, Math.min(data.x, 1600 - player.size));
            player.y = Math.max(0, Math.min(data.y, 1200 - player.size));

            // 餌を食べる処理
            foods = foods.filter(food => {
                const distance = Math.hypot(food.x - player.x, food.y - player.y);
                if (distance < player.size && player.size < 80) {
                    player.size += 1;
                    return false; // 餌を削除
                }
                return true;
            });

            // 毒を食べる処理
            poisons = poisons.filter(poison => {
                const distance = Math.hypot(poison.x - player.x, poison.y - player.y);
                if (distance < player.size && poison.size < player.size) {
                    player.size /= 1.5;
                    return false; // 毒を削除
                }
                return true;
            });

            // 他のプレイヤーを食べる処理
            for (let id in players) {
                if (id !== socket.id) {
                    const other = players[id];
                    const distance = Math.hypot(other.x - player.x, other.y - player.y);
                    if (distance + 5 < player.size && player.size > other.size + 5 && player.size < 200) {
                        player.size += other.size / 5;
                        delete players[id];
                        io.to(id).emit('respawn');
                    }
                }
            }

            // 全プレイヤーに状態を同期
            io.emit('update', { players, foods, poisons });
        }
    });

    /*
    socket.on('newPlayerName', (data) => {
        players[socket.id].name = data.name;
    });
    */

    // 切断時の処理
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('removePlayer', socket.id);
        console.log('User disconnected:', socket.id);
    });
});

// 餌を周期的に追加(500ms)
setInterval(() => {
    if (foods.length < 100) {
        const newFood = generateFood();
        foods.push(newFood);
        io.emit('newFood', newFood);
    }
}, 500);

// 毒を周期的に追加(1000ms)
setInterval(() => {
    if (poisons.length < 30) {
        const newPoison = generatePoison();
        poisons.push(newPoison);
        io.emit('newPoison', newPoison);
    }
}, 1000);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});