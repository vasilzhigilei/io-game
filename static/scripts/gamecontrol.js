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
var mouseX = canvas.width/2;
var mouseY = canvas.height/2 - 1; // default is face in up in y direction
var angle = 0;
$("body").mousemove(function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    angle = Math.atan2(mouseY - canvas.height/2, mouseX - canvas.width/2); // in radians!
});

var health = .7;

var keys = [0, 0];
var speed = 3; // 2 pixels per movement
var deltaX = canvas.width/2, deltaY = canvas.height/2; // set initial positions to center of screen
socket.emit('newplayer', {'x': deltaX, 'y': deltaY, 'health': health});
var counter = 0;
var multiplier = 1;
var keypressed = false;
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

    if(deltaX <= 0){
        deltaX += 1;
    }else if(deltaX >= worldsize){
        deltaX -= 1;
    }else if(deltaY <= 0){
        deltaY += 1;
    }else if(deltaY >= worldsize){
        deltaY -= 1;
    }else{
        multiplier = 1; // diagonal multiplier
        if(keys[0] != 0 && keys[1] != 0){
            multiplier = 0.707;
        }
        if(keys[0] != 0 || keys[1] != 0){ // may be more efficiently done
            keypressed = true;
        }
        deltaX += keys[0] * speed * multiplier; // DIRECTION * SPEED * MULTIPLIER
        deltaY += keys[1] * speed * multiplier; // DIRECTION * SPEED * MULTIPLIER
    }

    // redraw all objects here
    clear();
    drawTrees();
    drawPlayers();
    drawUser(); // draw circle must go last to overlay on top of other objects
    counter++;
    if(keypressed && counter % 6 == 0){ // only send update of position if keypressed is true
        socket.emit('playerinfo', {'x': deltaX, 'y': deltaY, 'health': health});
        keypressed = false;
    }
    if((counter + 2) % 6 == 0){
        socket.emit('updateme');
    }
    if((counter + 4) % 6 == 0){
        socket.emit('playerinfo_angle', {'angle': angle});
    }
    // reset before next loop
    keys = [0, 0];
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
    world.forEach(function (block_x, i) {
        block_x.forEach(function (block_y, j) {
            if(block_y == 2){
                context.fillRect(i*50, j*50, 75, 75);
            };
        });
    });
}

function drawPlayers() {
    players.forEach(function (player) {
        if(player['id'] != socket.io.engine.id){
            // hand drawing
            context.beginPath();
            context.arc(player.x + 45 * Math.cos(player.angle-.75), player.y + 45 * Math.sin(player.angle-.75), 20, 0, 2* Math.PI, false);
            context.fillStyle = 'rgba(255, 138, 128, 1)';
            context.fill();
            context.lineWidth = 4;
            context.strokeStyle = 'rgba(255, 111, 97, 1)';
            context.stroke();
            context.beginPath();
            context.arc(player.x + 45 * Math.cos(player.angle+.75), player.y + 45 * Math.sin(player.angle+.75), 20, 0, 2* Math.PI, false);
            context.fill();
            context.stroke();

            context.beginPath();
            context.arc(player.x, player.y, 45, 0, 2 * Math.PI, false);
            context.fillStyle = 'rgb(255, 138, 128, 1)';
            context.fill();
            context.beginPath();
            context.moveTo(player.x, player.y);
            context.arc(player.x, player.y, 45, 0, player.health * 2 *Math.PI, false);
            context.closePath();
            context.fillStyle = 'rgba(255, 111, 97, 1)';
            context.fill();
        };
    });
}

function drawUser() {
    // everything else in game will be moved by deltaX and deltaY
    // hand drawing
    context.beginPath();
    context.arc(deltaX + 45 * Math.cos(angle-.75), deltaY + 45 * Math.sin(angle-.75), 20, 0, 2* Math.PI, false);
    context.fillStyle = 'rgba(59, 104, 225, 1)';
    context.fill();
    context.lineWidth = 4;
    context.strokeStyle = 'rgba(42, 75, 225, 1)';
    context.stroke();
    context.beginPath();
    context.arc(deltaX + 45 * Math.cos(angle+.75), deltaY + 45 * Math.sin(angle+.75), 20, 0, 2* Math.PI, false);
    context.fill();
    context.stroke();

    context.beginPath();
    context.arc(deltaX, deltaY, 45, 0, 2* Math.PI, false);
    context.fillStyle = 'rgba(59, 104, 225, 1)';
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(deltaX, deltaY);
    context.arc(deltaX, deltaY, 45, 0, health * 2 * Math.PI, false);
    context.closePath();
    context.fillStyle = 'rgba(42, 75, 225, 1)';
    context.fill();
}