// GAME CONTROL

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
$("body").mousemove(async(e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    angle = Math.atan2(mouseY - canvas.height/2, mouseX - canvas.width/2); // in radians!
    keypressed = true;
});

var attack = false;
var attackoffset = 0;
var attackoffset2 = 0;
var which = 0;
canvas.addEventListener('mousedown', async() => {
    keypressed = true;
    attack = true;
    if(which == 0){
        attackoffset = 8;
        which = 1;
    }else{
        attackoffset2 = 8;
        which = 0;
    }
}, false);
canvas.addEventListener('mouseup', async() => {
    attack = false;
    attackoffset = 0;
    attackoffset2 = 0;
}, false);

var keys = [0, 0];

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

   if(keypressed){ // only send update of position if keypressed is true
        socket.emit('playerinfo', {'keys':keys, 'angle': angle, 'attack': attack});
        if(attack == false){
            keypressed = false;
        }
   }

    counter++;
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
    context.translate(-x_client + canvas.width/2, -y_client + canvas.height/2);

    // also update the background
    document.getElementsByTagName('canvas')[0].style.backgroundPositionX = -x_client + "px";
    document.getElementsByTagName('canvas')[0].style.backgroundPositionY = -y_client + "px";
}

async function drawTrees() {
    context.fillStyle = 'green';
    world.forEach(function (block_x, i) {
        block_x.forEach(function (block_y, j) {
            if(block_y == 2){
                context.fillRect(i*50, j*50, 75, 75);
            };
        });
    });
}

async function drawPlayers() {
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
            context.arc(player.x, player.y, 45, 0, player.health/50 * Math.PI, false);
            context.closePath();
            context.fillStyle = 'rgba(255, 111, 97, 1)';
            context.fill();
        };
    });
}

async function drawUser() {
    // everything else in game will be moved by deltaX and deltaY
    players.forEach(function (player) {
        if(player['id'] == socket.io.engine.id){
            // hand drawing
            context.beginPath();
            context.arc(x_client + 45 * Math.cos(angle-.75+attackoffset/80), y_client + 45 * Math.sin(angle-.75) - attackoffset, 20, 0, 2* Math.PI, false);
            context.fillStyle = 'rgba(59, 104, 225, 1)';
            context.fill();
            context.lineWidth = 4;
            context.strokeStyle = 'rgba(42, 75, 225, 1)';
            context.stroke();
            context.beginPath();
            context.arc(x_client + 45 * Math.cos(angle+.75-attackoffset2/80), y_client + 45 * Math.sin(angle+.75) - attackoffset2, 20, 0, 2* Math.PI, false);
            context.fill();
            context.stroke();

            //context.filter = "opacity(.5)"; // REALLY BAD PERFORMANCE, was just playing around with filters
            context.beginPath();
            context.arc(x_client, y_client, 45, 0, 2* Math.PI, false);
            context.fillStyle = 'rgba(59, 104, 225, 1)';
            context.fill();
            context.stroke();
            context.beginPath();
            context.moveTo(x_client, y_client);
            context.arc(x_client, y_client, 45, 0, player.health/50 * Math.PI, false);
            context.closePath();
            context.fillStyle = 'rgba(42, 75, 225, 1)';
            context.fill();
            //context.filter = "opacity(1)";
            return;
        };
    });
}