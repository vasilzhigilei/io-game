// GAME CONTROL

var canvas = document.getElementById("myCanvas"); // Canvas
var context = canvas.getContext("2d"); // 2d context
context.canvas.width  = window.innerWidth;
context.canvas.height = window.innerHeight;

var keyState = {};
window.addEventListener('keydown',function(e){
    keyState[e.keyCode || e.which] = true;
},true);
window.addEventListener('keyup',function(e){
    keyState[e.keyCode || e.which] = false;
},true);

var keys = [0, 0];
var speed = 2; // 2 pixels per movement
var deltaX = canvas.width/2, deltaY = canvas.height/2; // set initial positions to center of screen
function gameLoop() {
    if (keyState[37] || keyState[65]){
        // LEFT or A
        keys[0] = -1;
    }
    if (keyState[39] || keyState[68]){
        // RIGHT or D
        if(keys[0] == -1){
            keys[0] = 0;
        }else{
            keys[0] = 1;
        }
    }
    if (keyState[40] || keyState[83]){
        // UP or W
        keys[1] = 1;
    }
    if (keyState[38] || keyState[87]){
        // DOWN or S
        if(keys[1] == 1){
            keys[1] = 0;
        }else{
            keys[1] = -1;
        }
    }

    multiplier = 1; // diagonal multiplier
    if(keys[0] != 0 && keys[1] != 0){
        multiplier = 0.707;
    }
    deltaX += keys[0] * speed * multiplier; // DIRECTION * SPEED * MULTIPLIER
    deltaY += keys[1] * speed * multiplier; // DIRECTION * SPEED * MULTIPLIER

    // redraw all objects here
    clear();
    drawTrees();
    drawPlayers();
    drawUser(); // draw circle must go last to overlay on top of other objects

    socket.emit('playerinfo', {'x': deltaX, 'y': deltaY});
    // reset before next loop
    keys = [0, 0]
    setTimeout(gameLoop, 5);
}
gameLoop();

function clear() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.translate(-deltaX + canvas.width/2, -deltaY + canvas.height/2);

    // also update the background
    document.getElementsByTagName('canvas')[0].style.backgroundPositionX = -deltaX + "px";
    document.getElementsByTagName('canvas')[0].style.backgroundPositionY = -deltaY + "px";
}

function drawTrees() {
    context.fillStyle = 'green';
    context.fillRect(200, 200, 50, 50);
    context.fillRect(500, 200, 50, 50);
    context.fillRect(2000, 400, 50, 50);
}

function drawPlayers() {
    players.forEach(function (player) {
        context.beginPath();
        context.arc(player.x, player.y, 50, 0, 2 * Math.PI, false);
        context.fillStyle = 'orange';
        context.fill();
    });
}

function drawUser() {
    // everything else in game will be moved by deltaX and deltaY
    context.beginPath();
    context.arc(deltaX, deltaY, 50, 0, 2 * Math.PI, false);
    context.fillStyle = 'blue';
    context.fill();
}