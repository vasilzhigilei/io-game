// NETWORKING AND SOCKETIO CODE
var socket = io();
socket.on('confirm', function(data) {
    // confirms events such as client connection to the server
    console.log(data);
});

var players = [];
var world = [];
var worldsize = 1000; // initial value, will be reset instantly, in pixels
socket.on('receiveUpdate', function(data) {
    // receive player position update
    players = data['players'];
});

socket.on('world', function(data) {
    world = data['world'];
    worldsize = world.length*50;
    console.log(world);
});