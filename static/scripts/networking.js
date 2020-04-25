// NETWORKING AND SOCKETIO CODE
var socket = io({'transports': ['websocket']});
socket.on('confirm', function(data) {
    // confirms events such as client connection to the server
    console.log(data);
});

var players = [];
// 2000x2000 pixel default world for main menu screen. Yeah. Really long line. Needs to get updated if new object implemented
var world = {'size': 2000, 'water':[], 'trees':[], 'coconuts':[]};

var x_client = 1000;
var y_client = 1000;
var x_delta = 0;
var y_delta = 0;
socket.on('receiveUpdate', async(data) => {
    // receive player position update
    players = data['players'];
    players.forEach(function (player) {
        if(player['id'] == socket.io.engine.id){
            //x_delta = player.x - x_client;
            //y_delta = player.y - y_client;
            x_client = player.x;
            y_client = player.y;
        }
    });
});

socket.on('world', function(data) {
    world = data['world'];
    console.log(world);
});

socket.on('die', function(data) {
    $.get("static/menu.html", function (data) {
        $("#container").append(data);
    });
    console.log(data);
});