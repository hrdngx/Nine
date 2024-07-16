const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const music = new Audio('sounds/gameover.mp3'); // SE

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
let color;

function getQueryParam() {
    var urlParams = new URLSearchParams(window.location.search);
    myname = urlParams.get('name');
    console.log(myname);
    return myname
}

// 名前をサーバーに送信
// socket.emit('newPlayerName', getQueryParam());
socket.emit('newPlayerName', getQueryParam());

socket.on('init', data => {
    players = data.players;
    foods = data.foods;
    poisons = data.poisons;
    render();
});

socket.on('you', data => {
    currentPlayer.x = data.x;
    currentPlayer.y = data.y;
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

socket.on('newPoison', poison => {
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

    // SEを再生
    music.load(); // 読込
    music.currentTime = 0; // 再生位置
    music.play(); // 再生

    // 死亡（gameover.htmlに遷移）
    var score = players.size;
    gameOver(score);
});

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = Math.max(Math.min(canvas.width / 2 - currentPlayer.x,0),canvas.width - 1600)
    const offsetY = Math.max(Math.min(canvas.height / 2 - currentPlayer.y,0),canvas.height- 1200)

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
    
    if(player.size > 0){
        ctx.arc(player.x + offsetX, player.y + offsetY, player.size, 0, 2 * Math.PI);
    }

    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = hColor(player.color);
    if (id) {
        // ctx.fillText(`${id.substring(0, 5)}`, player.x + offsetX - 20, player.y + offsetY + 3);
        ctx.fillText(player.name, player.x + offsetX - 20, player.y + offsetY + 3);
        color = player.color;
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
    ctx.fillStyle = poison.color;
    ctx.fill();
}

const keyState = {
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false,
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
/*
function dropPoison() {
    // Poison Model
    const poison = {
        x: currentPlayer.x,
        y: currentPlayer.y,
        size: 25,
        color: color
    }
    console.log('Dropping poison');
    socket.emit('dropPoison', {x: currentPlayer.x, y: currentPlayer.y, size: poison.size, color: currentPlayer.color});
}
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        console.log('dropPoison');
        dropPoison();
    }
});
*/
//========================================================================

function gameLoop() {

    let moved = false;

    if (true) {

        if(Math.max(0, Math.min(currentPlayer.y, 1600 - currentPlayer.size))){
            
            if (keyState['ArrowUp']) {
                currentPlayer.y -= currentPlayer.speed;
                moved = true;
            }

        }

        check=(x)=>{
            if(x>=1600)  return false;
            
            return true;
        }
        
        //if(Math.min(currentPlayer.y, 1600 - currentPlayer.size)){
        if(Math.max(1600- currentPlayer.size, currentPlayer.y)){
        //if(check(Math.max(1600, currentPlayer.y))){
            if (keyState['ArrowDown']) {
                currentPlayer.y += currentPlayer.speed;
                moved = true;
            }
        }
        
        if(Math.max(0, Math.min(currentPlayer.x, 1600 - currentPlayer.size))){
            if (keyState['ArrowLeft']) {
                currentPlayer.x -= currentPlayer.speed;
                moved = true;
             }
        }
        

        if(Math.max(0, Math.min(currentPlayer.x, 1600 - currentPlayer.size))==1600- currentPlayer.size){
            if (keyState['ArrowRight']) {
                currentPlayer.x += currentPlayer.speed;
                moved = true;
            }
        }
        

        if (moved) {
            socket.emit('move', { x: currentPlayer.x, y: currentPlayer.y });
        }

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
function gameOver() {
    window.location.href = `GameOver.html?score=${players[socket.id].size}`;
}