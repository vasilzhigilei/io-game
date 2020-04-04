from twilio.twiml.messaging_response import MessagingResponse
from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit, send

app = Flask(__name__)
socketio = SocketIO(app)

game_size = [1000, 500] # playable area is x, y
players = [] # test structure: name

@app.route("/")
@app.route("/index")
def home():
    return render_template("index.html")

@socketio.on('connect')
def connect():
    id = request.sid
    players.append(id)
    emit('confirm', {'data': 'Connected, ' + request.sid})
    print('CONNECT:    ' + id)


@socketio.on('disconnect')
def disconnect():
    id = request.sid
    players.remove(id)
    print('DISCONNECT: ' + id)

if __name__ == "__main__":
    socketio.run(app)