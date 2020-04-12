// All of this runs first (after networking.js)

var canvas = document.getElementById("myCanvas"); // Canvas
var context = canvas.getContext("2d"); // 2d context
context.canvas.width  = window.innerWidth;
context.canvas.height = window.innerHeight;
context.textBaseline = "middle";
context.textAlign = "center";

window.onresize = function(){
    canvas.width = window.innerWidth;
    canvas.style.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.height = window.innerHeight;
}

function joinGame(){
    var name = document.getElementById("name").value;
    socket.emit('joingame', {'name':name});
    var element = document.getElementById("overlay");
    element.parentNode.removeChild(element);
}