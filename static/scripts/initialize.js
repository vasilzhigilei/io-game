// All of this runs first (after networking.js)

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

// join game
var name = "testname";
socket.emit('joingame', {'name':name});