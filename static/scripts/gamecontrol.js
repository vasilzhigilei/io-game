// GAME CONTROL

var canvas = document.getElementById("myCanvas"); // Canvas
var context = canvas.getContext("2d"); // 2d context
context.canvas.width  = window.innerWidth;
context.canvas.height = window.innerHeight;

window.onresize = function(){
    canvas.width = window.innerWidth;
    canvas.style.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.height = window.innerHeight;
}

var keyState = {};
var keypressed = false;
window.addEventListener('keydown',function(e){
    keyState[e.keyCode || e.which] = true;
},true);
window.addEventListener('keyup',function(e){
    keyState[e.keyCode || e.which] = false;
},true);
var mouseX = canvas.width/2;
var mouseY = canvas.height/2 - 1; // default is face up in y direction
var angle = 0; // in radians
$("body").mousemove(function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    angle = Math.atan2(mouseY - canvas.height/2, mouseX - canvas.width/2); // in radians!
    keypressed = true;
});

var attack = false;
var attackoffset = 0;
var attackoffset2 = 0;
var which = 0;
canvas.addEventListener('mousedown', function() {
    attack = true;
    if(which == 0){
        attackoffset = 8;
        which = 1;
    }else{
        attackoffset2 = 8;
        which = 0;
    }
}, false);
canvas.addEventListener('mouseup', function() {
    attack = false;
    attackoffset = 0;
    attackoffset2 = 0;
}, false);

var keys = [0, 0];
var name = "testname";
socket.emit('joingame', {'name':name});
var counter = 0;
var multiplier = 1;
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

    if(keys[0] != 0 || keys[1] != 0){
        keypressed = true;
    }

    if(keypressed && counter % 4 == 0){ // only send update of position if keypressed is true
        socket.emit('playerinfo', {'x': deltaX, 'y': deltaY, 'angle': angle, 'attack': attack, 'health': health});
        keypressed = false;
    }
    if((counter + 2) % 4 == 0){
        socket.emit('updateme');
    }

    // redraw all objects here
    clear();
    drawTrees();
    drawPlayers();
    drawUser(); // draw circle must go last to overlay on top of other objects
    counter++;
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
            context.stroke();
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
    players.forEach(function (player) {
        if(player['id'] == socket.io.engine.id){
            // hand drawing
            context.beginPath();
            context.arc(deltaX + 45 * Math.cos(angle-.75+attackoffset/80), deltaY + 45 * Math.sin(angle-.75) - attackoffset, 20, 0, 2* Math.PI, false);
            context.fillStyle = 'rgba(59, 104, 225, 1)';
            context.fill();
            context.lineWidth = 4;
            context.strokeStyle = 'rgba(42, 75, 225, 1)';
            context.stroke();
            context.beginPath();
            context.arc(deltaX + 45 * Math.cos(angle+.75-attackoffset2/80), deltaY + 45 * Math.sin(angle+.75) - attackoffset2, 20, 0, 2* Math.PI, false);
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
            return;
        };
    });
}