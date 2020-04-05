// NETWORKING AND SOCKETIO CODE
var socket = io();
socket.on('confirm', function(data) {
    // confirms events such as client connection to the server
    console.log(data);
});