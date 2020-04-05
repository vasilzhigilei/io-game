from twilio.twiml.messaging_response import MessagingResponse
from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit, send

app = Flask(__name__)
socketio = SocketIO(app)

# game_size = [1000, 500] # playable area is x, y

@app.route("/")
@app.route("/index")
def home():
    return render_template("index.html")

players = [] # dictionary format ---> {'id':id, 'x':x, 'y':y}
@socketio.on('playerinfo')
def playerinfo(data):
    # called by client to update player data for everyone
    id = request.sid
    print(players)
    player = next(item for item in players if item['id'] == id) # (..., None) for default & error management
    player['x'] = data['x'];
    player['y'] = data['y'];

@socketio.on('updateme')
def updateme():
    # updates client with player data, only called by client, not force sent
    emit('receiveUpdate', {'players': players}) # improve naming system for emits and receives, as well as data objects

@socketio.on('newplayer')
def newplayer(data):
    id = request.sid
    players.append({'id': id, 'x': data['x'], 'y': data['y']})
    emit('confirm', {'data': 'new player, ' + id})
    print('new player: ' + id)

@socketio.on('connect')
def connect():
    id = request.sid
    emit('confirm', {'data': 'Connected, ' + id})
    print('CONNECT:    ' + id)


@socketio.on('disconnect')
def disconnect():
    id = request.sid
    players.remove(id) # wrong, have to find dict that has id first, then remove it
    print('DISCONNECT: ' + id)

if __name__ == "__main__":
    socketio.run(app)