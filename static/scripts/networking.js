// NETWORKING AND SOCKETIO CODE
var socket = io();
socket.on('confirm', function(data) {
    // confirms events such as client connection to the server
    console.log(data);
});

var players = [];
var world = [];
socket.on('receiveUpdate', function(data) {
    // receive player position update
    players = data['players'];
});

socket.on('world', function(data) {
    world = data['world'];
    console.log(world);
});