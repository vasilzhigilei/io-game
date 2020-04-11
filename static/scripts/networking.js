// NETWORKING AND SOCKETIO CODE
var socket = io();
socket.on('confirm', function(data) {
    // confirms events such as client connection to the server
    console.log(data);
});

var players = [];
var world = [];
var worldsize = 1000; // initial value, will be reset instantly, in pixels
var x_client = 0;
var y_client = 0;
socket.on('receiveUpdate', async(data) => {
    // receive player position update
    players = data['players'];
    players.forEach(function (player) {
        if(player['id'] == socket.io.engine.id){
            x_client = player.x;
            y_client = player.y;
        }
    });
});

socket.on('world', function(data) {
    world = data['world'];
    worldsize = world.length*50;
    console.log(world);
});