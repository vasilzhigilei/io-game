from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit, send
import eventlet
from eventlet import wsgi
import gamegen

eventlet.monkey_patch()
app = Flask(__name__)
socketio = SocketIO(app, async_mode="eventlet") # async_mode="threading" is a backup idea, this line needs testing

game_size = 4000 # square size of playable area
world = gamegen.generateWorld(size=game_size, seed="hello world")

@app.route("/")
@app.route("/index")
def home():
    return render_template("index.html")

players = [] # dictionary format ---> {'id':id, 'x':x, 'y':y, 'angle':angle, health':health}
@socketio.on('playerinfo')
def playerinfo(data):
    # called by client to update player data for everyone
    id = request.sid
    player = None
    for item in players:
        if item['id'] == id:
            player = item
            break
    if player != None: # temp workaround, will have to investigate errors
        player['x'] = data['x'];
        player['y'] = data['y'];
        player['angle'] = data['angle'];
        player['attack'] = data['attack'];
        player['health'] = data['health'];

@socketio.on('updateme')
def updateme():
    # updates client with player data, only called by client, not force sent
    id = request.sid
    # this logic may be offset to client in later update to improve server performance
    #excludeSelf = [player for player in players if player.get('id') != id] # excludes self for other players
    emit('receiveUpdate', {'players': players})
    # improve naming system for emits and receives, as well as data objects <--- note to self

@socketio.on('newplayer')
def newplayer(data):
    id = request.sid
    players.append({'id': id, 'x': data['x'], 'y': data['y']})
    emit('confirm', {'data': 'new player, ' + id})
    emit('world', {'world': world})
    print('new player: ' + id)

@socketio.on('connect')
def connect():
    id = request.sid
    emit('confirm', {'data': 'Connected, ' + id})
    print('CONNECT:    ' + id)


@socketio.on('disconnect')
def disconnect():
    id = request.sid
    # find and remove player from list of players
    for player in players:
        if player['id'] == id:
            players.remove(player)
            break
    print('DISCONNECT: ' + id)

if __name__ == "__main__":
    socketio.run(app)