from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit, send
import eventlet
from eventlet import wsgi
import random
from threading import Lock

import gamegen

eventlet.monkey_patch()

app = Flask(__name__)
socketio = SocketIO(app, async_mode=None) # async_mode="threading" is a backup idea, this line needs testing

thread = None
thread_lock = Lock() # thread starts at bottom of file

game_size = 4000 # square size of playable area
world = gamegen.generateWorld(size=game_size, seed="hello world")

random.seed() # for use of random on server aside from world generation

@app.route("/")
@app.route("/index")
def home():
    return render_template("index.html")

# dict format: {'id':str, 'name':str, 'x':int, 'y':int, 'angle':int, 'attack':bool, 'keys':list, health':int}
players = []
speed = 3.0 # universal speed set to 3 pixels
@socketio.on('playerinfo')
def playerinfo(data):
    # called by client to update player data for everyone
    id = request.sid
    socketio.start_background_task(background_playerupdate, id, data)


def background_playerupdate(id, data):
    player = None
    for item in players:
        if item['id'] == id:
            player = item
            break
    if player != None:  # temp workaround, will have to investigate errors, but, 'if player exists'
        player['keys'] = data['keys']
        player['angle'] = data['angle']
        player['attack'] = data['attack']

        if(player['x'] <= 0):
            player['x'] += 1
        elif(player['x'] >= game_size):
            player['x'] -= 1
        elif(player['y'] <= 0):
            player['y'] += 1;
        elif(player['y'] >= game_size):
            player['y'] -= 1
        else:
            # check if diagonal movement or not to keep speed consistent
            multiplier = 1
            if (player['keys'][0] != 0 and player['keys'][1] != 0):
                multiplier = .707

            # update x, y positions of player
            player['x'] += float(player['keys'][0]) * speed * multiplier  # direction * speed * multiplier
            player['y'] += float(player['keys'][1]) * speed * multiplier  # direction * speed * multiplier
    socketio.sleep()

def background_UPDATEALL():
    while True:
        socketio.sleep(.01)
        socketio.emit('receiveUpdate', {'players': players})

@socketio.on('joingame')
def joingame(data):
    id = request.sid
    x = random.randrange(game_size)
    y = random.randrange(game_size)
    players.append({'id': id, 'name': data['name'], 'x': x, 'y': y, 'angle': 0, 'attack':False, 'keys':[0, 0], 'health':100})
    emit('confirm', {'data': 'new player, ' + id})
    emit('world', {'world': world})
    print('new player: ' + id)

@socketio.on('connect')
def connect():
    id = request.sid
    emit('confirm', {'data': 'Connected, ' + id})
    print('CONNECT:    ' + id)
    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(target=background_UPDATEALL)


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