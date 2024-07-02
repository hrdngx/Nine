const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const music = new Audio('sounds/gameover.mp3');//SE

let currentPlayer = {
    x: Math.floor(Math.random() * (1000 - 200 + 1) + 200),
    y: Math.floor(Math.random() * (1000 - 200 + 1) + 200),
    size: 10,
    speed: 2,
    color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
};

let players = {};
let foods = [];
let poisons = [];
let myname;

function getQueryParam() {
    var urlParams = new URLSearchParams(window.location.search);
    myname = urlParams.get('name');

    console.log(myname);

    return myname
}

//getQueryParam();

// 名前をサーバーに送信
//socket.emit('newPlayerName', getQueryParam());
socket.emit('newPlayerName', getQueryParam());

socket.on('init', data => {
    players = data.players;
    foods = data.foods;
    poisons = data.poisons;
    render();
});

socket.on('update', data => {
    players = data.players;
    foods = data.foods;
    poisons = data.poisons;
    render();
});

socket.on('newFood', food => {
    foods.push(food);
    render();
});

socket.on('newPoison',poison =>{
    poisons.push(poison);
    render();
});

socket.on('newPlayer', data => {
    players[data.id] = data.player;
    render();
});

socket.on('removePlayer', id => {
    delete players[id];
    render();
});

socket.on('respawn', () => {
    alert('あんた食べられたよ');

     
    //死亡（GameOver.htmlに遷移）
    var point = 1000;
    gameoverpoint(point);

    currentPlayer.size = 10;
    currentPlayer.x = Math.floor(Math.random() * 1600);
    currentPlayer.y = Math.floor(Math.random() * 1200);
    socket.emit('move', { x: currentPlayer.x, y: currentPlayer.y }); // リスポーン後の位置をサーバーに送信

    //音
    music.load();
    music.currentTime = 0;//音リセット
    music.play(); //再生

});

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = canvas.width / 2 - currentPlayer.x;
    const offsetY = canvas.height / 2 - currentPlayer.y;

    foods.forEach(food => {
        renderFood(food, offsetX, offsetY);
    });

    poisons.forEach(poison => {
        renderPoison(poison, offsetX, offsetY);
    });
    
    //renderPlayer(currentPlayer,offsetX,offsetY,myname);
    //renderPlayer(currentPlayer, offsetX, offsetY, null);

    Object.keys(players).forEach(id => {
        let player = players[id];
        renderPlayer(player, offsetX, offsetY, id);
    });
}

function renderPlayer(player, offsetX, offsetY, id) {
    ctx.beginPath();
    ctx.arc(player.x + offsetX, player.y + offsetY, player.size, 0, 2 * Math.PI);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = hColor(player.color);
    if (id) {
        // ctx.fillText(`${id.substring(0, 5)}`, player.x + offsetX - 20, player.y + offsetY + 3);
        ctx.fillText(player.name, player.x + offsetX - 20, player.y + offsetY + 3);
    }
}

function renderFood(food, offsetX = 0, offsetY = 0) {
    ctx.beginPath();
    ctx.arc(food.x + offsetX, food.y + offsetY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = food.color;
    ctx.fill();
}

function renderPoison(poison, offsetX = 0, offsetY = 0) {
    ctx.beginPath();
    ctx.arc(poison.x + offsetX, poison.y + offsetY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = `rgb(0, 0, 0)`;
    ctx.fill();
}

const keyState = {
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false
};

document.addEventListener('keydown', (event) => {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = false;
    }
});

// Space =================================================================
// document.addEventListener('keypress', (event) => {
//     if(event.key === 'Space'){
//         dropPoison(); // 毒を配置
//     }
// });

// function dropPoison() {
//     const poison = {
//         x: currentPlayer.x,
//         y: currentPlayer.y,
//         color: currentPlayer.color,
//         size: currentPlayer.size,
//     };
//     currentPlayer.size -= poison.size;
//     poisons.push(poison);
//     socket.emit('newPoison', poison);
// }

//========================================================================

function gameLoop() {

    let moved = false;

    if (keyState['ArrowUp']) {
        currentPlayer.y -= currentPlayer.speed;
        moved = true;
    }

    if (keyState['ArrowDown']) {
        currentPlayer.y += currentPlayer.speed;
        moved = true;
    }

    if (keyState['ArrowLeft']) {
        currentPlayer.x -= currentPlayer.speed;
        moved = true;
    }

    if (keyState['ArrowRight']) {
        currentPlayer.x += currentPlayer.speed;
        moved = true;
    }

    if (moved) {
        socket.emit('move', { x: currentPlayer.x, y: currentPlayer.y });
    }

    render();

    requestAnimationFrame(gameLoop);
}

// window size 変更時
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
}

gameLoop();

// Color Create
function hColor(color) {
    var rgbVal = color.slice(4, -1);
    var [R, G, B] = rgbVal.split(',').map(Number);

    if (!isNaN(R + G + B) && 0 <= R && R <= 255 && 0 <= G && G <= 255 && 0 <= B && B <= 255) {
        var max = Math.max(R, Math.max(G, B));
        var min = Math.min(R, Math.min(G, B));
        var sum = max + min;
        var newR = sum - R;
        var newG = sum - G;
        var newB = sum - B;
        var hColor = `rgb(${newR}, ${newG}, ${newB})`;
        return hColor;
    } else {
        return `rgb(0,0,0)`;
    }
}

// Game Over
function gameoverpoint(point){
    var gameSetPoint = point;
    window.location.href = `GameOver.html?score=${score}`;

}