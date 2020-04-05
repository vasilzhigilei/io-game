// NETWORKING AND SOCKETIO CODE
var socket = io();
socket.on('confirm', function(data) {
    // confirms events such as client connection to the server
    console.log(data);
});

var players = [];
socket.on('receiveUpdate', function(data) {
    // receive player position update
    players = data['players'];
});

socket.emit('newplayer', {'x': 500, 'y': 500});