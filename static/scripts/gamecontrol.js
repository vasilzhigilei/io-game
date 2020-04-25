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
var counter = 0;
var attack = false;
var attackoffset = 0;
var attackoffset2 = 0;
var which = 0;
var startattack = 0;
canvas.addEventListener('mousedown', async() => {
    keypressed = true;
    attack = true;
    startattack = counter;
}, false);
canvas.addEventListener('mouseup', async() => {
    attack = false;
    attackoffset = 0;
    attackoffset2 = 0;
    which = 0;
}, false);

var keys = [0, 0];
var eat = false;

var treeImage = new Image();
treeImage.src = "static/resources/palmtree.png";

var coconutImage = new Image();
coconutImage.src = "static/resources/coconuts.png";

var woodImage = new Image();
woodImage.src = "static/resources/wood.png";

var foodImage = new Image();
foodImage.src = "static/resources/mango.png";

var mangoImage = new Image();
mangoImage.src = "static/resources/onemango.png";

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

    if(keyState[50]){
        eat = true;
        keypressed = true;
    }
    if(keyState[49]){
        eat = false;
        keypressed = true;
    }

    if(keys[0] != 0 || keys[1] != 0){
        keypressed = true;
    }

   if(counter % 5 == 0){ // only send update of position if keypressed is true
        socket.emit('playerinfo', {'keys':keys, 'angle': angle, 'attack': attack, 'eat': eat});
        if(attack == false){
            keypressed = false;
        }
    }

    if(attack == true && counter % 20 == startattack % 20){
        if(which == 0){
            attackoffset = 11;
            attackoffset2 = -2;
            which = 1;
        }else if(which == 1){
            attackoffset = 1;
            attackoffset2 = 1;
            which = 2;
        }else if(which == 2){
            attackoffset = -2;
            attackoffset2 = 11;
            which = 3;
        }else if(which == 3){
            attackoffset = 1;
            attackoffset2 = 1;
            which = 0;
        }
    }

    counter++;
    // redraw all objects here
    clear();
    drawWater();
    drawPlayers();
    drawUser(); // draw circle must go second to last to overlay on top of other objects
    drawTrees(); // drawn last to let leaves overlay on top of players
    drawBorder();
    drawLayout(); // ui layout
    counter++;
    // reset before next loop
    keys = [0, 0];
    setTimeout(gameLoop, 20);
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
    world['trees'].forEach(function (tree) {
        context.drawImage(treeImage, tree.x-100, tree.y-100, 200, 200);
    });
    world['coconuts'].forEach(function (coconut) {
        context.drawImage(coconutImage, coconut.x-100, coconut.y-100, 200, 200);
    });
}

async function drawPlayers() {
    players.forEach(function (player) {
        if(player['id'] != socket.io.engine.id){
            // hand drawing
            context.beginPath();
            context.arc(player.x + 45 * Math.cos(player.angle-.75), player.y + 45 * Math.sin(player.angle-.75), 20, 0, 2* Math.PI, false);
            context.fillStyle = 'rgba(170, 128, 85, 1)'; // original pink: rgba(255, 138, 128, 1)
            context.fill();
            context.lineWidth = 4;
            context.strokeStyle = 'rgba(136, 102, 68, 1)'; // original pink: rgba(255, 111, 97, 1)
            context.stroke();
            context.beginPath();
            context.arc(player.x + 45 * Math.cos(player.angle+.75), player.y + 45 * Math.sin(player.angle+.75), 20, 0, 2* Math.PI, false);
            context.fill();
            context.stroke();

            context.beginPath();
            context.arc(player.x, player.y, 45, 0, 2 * Math.PI, false);
            context.fillStyle = 'rgba(170, 128, 85, 1)'; // original pink: rgba(255, 138, 128, 1)
            context.fill();
            context.stroke();
            context.beginPath();
            context.moveTo(player.x, player.y);
            context.arc(player.x, player.y, 45, 0, player.health/50 * Math.PI, false);
            context.closePath();
            context.fillStyle = 'rgba(136, 102, 68, 1)'; // original pink: rgba(255, 111, 97, 1)
            context.fill();

            context.textBaseline = "middle";
            context.textAlign = "center";
            context.font = "bold 30px sans-serif";
            context.fillStyle = 'rgba(255, 255, 255, 1)';
            context.fillText(player.name, player.x, player.y);
        };
    });
}

async function drawUser() {
    // everything else in game will be moved by deltaX and deltaY
    players.forEach(function (player) {
        if(player['id'] == socket.io.engine.id){
            // hand drawing
            context.beginPath();
            context.arc(x_client + 45 * Math.cos(angle-.75+attackoffset/40), y_client + 45 * Math.sin(angle-.75 + attackoffset/40), 20, 0, 2* Math.PI, false);
            context.fillStyle = 'rgba(170, 128, 85, 1)'; // original blue: rgba(59, 104, 225, 1)
            context.fill();
            context.lineWidth = 4;
            context.strokeStyle = 'rgba(136, 102, 68, 1)'; // original blue: rgba(42, 75, 225, 1)
            context.stroke();
            context.beginPath();
            context.arc(x_client + 45 * Math.cos(angle+.75-attackoffset2/40), y_client + 45 * Math.sin(angle+.75-attackoffset2/40), 20, 0, 2* Math.PI, false);
            context.fill();
            context.stroke();

            //context.filter = "opacity(.5)"; // REALLY BAD PERFORMANCE, was just playing around with filters
            context.beginPath();
            context.arc(x_client, y_client, 45, 0, 2* Math.PI, false);
            context.fillStyle = 'rgba(170, 128, 85, 1)'; // original blue: rgba(59, 104, 225, 1)
            context.fill();
            context.stroke();
            context.beginPath();
            context.moveTo(x_client, y_client);
            context.arc(x_client, y_client, 45, 0, player.health/50 * Math.PI, false);
            context.closePath();
            context.fillStyle = 'rgba(136, 102, 68, 1)'; // original blue: rgba(42, 75, 225, 1)
            context.fill();

            context.textBaseline = "middle";
            context.textAlign = "center";
            context.font = "bold 30px sans-serif";
            context.fillStyle = 'rgba(255, 255, 255, 1)';
            context.fillText(player.name, player.x, player.y);
            return;
        };
    });
}

async function drawLayout() {
    // everything else in game will be moved by deltaX and deltaY
    players.forEach(function (player) {
        if(player['id'] == socket.io.engine.id){
            context.fillStyle = 'rgba(123,123,123,0.6)';
            context.fillRect( player.x + canvas.width/2 - 130, player.y + canvas.height/2 - 90, 100, 60);
            context.strokeStyle = "#935f00";
            context.strokeRect( player.x + canvas.width/2 - 130, player.y + canvas.height/2 - 90, 100, 60);
            context.drawImage(woodImage, player.x + canvas.width/2 - 120, player.y + canvas.height/2 - 100, 80, 80);
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.font = "bold 20px sans-serif";
            context.fillStyle = 'rgb(255,255,255)';
            context.fillText(player.wood, player.x + canvas.width/2 - 80, player.y + canvas.height/2 - 57);

            context.fillStyle = 'rgba(123,123,123,0.6)';
            context.fillRect( player.x + canvas.width/2 - 130, player.y + canvas.height/2 - 180, 100, 60);
            context.strokeStyle = "#dbc712";
            context.strokeRect( player.x + canvas.width/2 - 130, player.y + canvas.height/2 - 180, 100, 60);
            context.drawImage(foodImage, player.x + canvas.width/2 - 112, player.y + canvas.height/2 - 180, 60, 60);
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.font = "bold 20px sans-serif";
            context.fillStyle = 'rgb(255,255,255)';
            context.fillText(player.food, player.x + canvas.width/2 - 82, player.y + canvas.height/2 - 147);
            return;
        };
    });
}

async function drawWater() {
    // everything else in game will be moved by deltaX and deltaY
    world['water'].forEach(function (water) {
        context.fillStyle = 'rgba(238,185,142,0.9)';
        context.fillRect(-canvas.width/2, water.y-30, water.width+canvas.width, water.height+60);
        context.fillStyle = 'rgba(15,56,255,0.75)';
        context.fillRect(-canvas.width/2, water.y + 4*Math.sin((counter%250)/250 * 2*Math.PI), water.width+canvas.width, water.height);
        return;
    });
}

async function drawBorder(){
    context.fillStyle = 'rgba(66,66,66,0.38)';

    // up rectangle (SHORT)
    context.fillRect(0, -canvas.height/2, world.size, canvas.height/2);

    // down rectangle (SHORT)
    context.fillRect(0, world.size, world.size, canvas.height/2);

    // left rectangle (LONG)
    context.fillRect(-canvas.width/2, -canvas.height/2, canvas.width/2, world.size + canvas.height);

    // right rectangle (LONG)
    context.fillRect(world.size, -canvas.height/2, canvas.width/2, world.size + canvas.height);
    return;
}