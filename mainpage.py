from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit, send
import eventlet
from eventlet import wsgi
import random
import datetime
from threading import Lock
from threading import Timer
import math

from helper import distance_objectobject
import gamegen

eventlet.monkey_patch()

app = Flask(__name__)
socketio = SocketIO(app, transport='websocket' , async_mode=None) # async_mode="threading" is a backup idea, this line needs testing

thread = None
thread_lock = Lock() # thread starts at bottom of file

counter = 0

random.seed() # for use of random on server aside from world generation

game_size = 2500 # square size of playable area
world = gamegen.generateWorld(size=game_size, seed=datetime.datetime.now())
@app.route("/")
@app.route("/index")
def home():
    return render_template("index.html")

# dict format:
# {'id':str, 'name':str, 'x':int, 'y':int, 'angle':float, 'attack':bool, 'attacktime':int, 'keys':list, health':int,
# 'wood':int}
players = []
speed = 6.0 # universal speed set to 3 pixels
@socketio.on('playerinfo')
def playerinfo(data):
    # called by client to update player data for everyone
    id = request.sid
    player = None
    for item in players:
        if item['id'] == id:
            player = item
            break
    if player != None:
        player['keys'] = data['keys']
        player['angle'] = data['angle']
        player['attack'] = data['attack']

def background_playerupdate(player):
    # check if diagonal movement or not to keep speed consistent
    multiplier = 1
    if (player['keys'][0] != 0 and player['keys'][1] != 0):
        multiplier = .707

    # update x, y positions of player
    player['x'] += float(player['keys'][0]) * speed * multiplier  # direction * speed * multiplier
    player['y'] += float(player['keys'][1]) * speed * multiplier  # direction * speed * multiplier

    if (player['x'] < 0):
        player['x'] -= player['x']
    elif (player['x'] > game_size):
        player['x'] -= (player['x'] - game_size)
    elif (player['y'] < 0):
        player['y'] -= player['y']
    elif (player['y'] > game_size):
        player['y'] -= (player['y'] - game_size)

    socketio.sleep()

def background_checkattack(player):
    for enemy in players:
        if(enemy['id'] != player['id']):
            if(distance_objectobject(enemy, player) < 130):
                radians = math.atan2(enemy['y'] - player['y'], enemy['x'] - player['x'])
                anglefromfacing = math.fabs(player['angle'] - radians)
                if(anglefromfacing > math.pi):
                    anglefromfacing = (anglefromfacing - 2*math.pi)
                if(anglefromfacing < .4):
                    if(enemy['health'] > 10):
                        enemy['health'] -= 10;
                    else:
                        enemy['health'] = 0;
                        die(enemy);
    for tree in world['trees']:
        if (distance_objectobject(tree, player) < 130):
            radians = math.atan2(tree['y'] - player['y'], tree['x'] - player['x'])
            anglefromfacing = math.fabs(player['angle'] - radians)
            if (anglefromfacing > math.pi):
                anglefromfacing = (anglefromfacing - 2 * math.pi)
            if (anglefromfacing < .4):
                player['wood'] += 1

    player['attacktime'] = counter + 50;
    socketio.sleep()

def die(player):
    socketio.emit('die', 'You died!', room=player['id'])
    players.remove(player)

def background_UPDATEALL():
    global counter
    socketio.start_background_task(target=background_UPDATEPOSITIONS)
    while True:
        counter += 1 # may as well put this here, not accurate to time necessarily
        socketio.emit('receiveUpdate', {'players': players})
        socketio.sleep(.01)

def background_UPDATEPOSITIONS():
    while(True):
        for player in players:
            socketio.start_background_task(background_playerupdate, player)
            socketio.start_background_task(collisionTree, player)
            socketio.start_background_task(collisionPlayer, player)
            if (player['attack'] == True and player['attacktime'] <= counter):
                socketio.start_background_task(background_checkattack, player)
        socketio.sleep(.015) # ... this should work? may need to implement some sort of setTimeout system to avoid
                            # slowdown if many players. Have to research more into how socketio.sleep works

def collisionTree(player):
    for tree in world['trees']:
        distance = distance_objectobject(player, tree)
        depth = 45 + 50 - distance # sum of radii - distance
        if(depth > 0): #if intersecting
            radians = math.atan2(player['y'] - tree['y'], player['x'] - tree['x'])
            player['x'] += math.cos(radians) * depth
            player['y'] += math.sin(radians) * depth

def collisionPlayer(player):
    for otherplayer in players:
        if (otherplayer['id'] != player['id']):
            distance = distance_objectobject(player, otherplayer)
            depth = 45 + 45 - distance  # sum of radii - distance
            if (depth > 0):  # if intersecting
                radians = math.atan2(player['y'] - otherplayer['y'], player['x'] - otherplayer['x'])
                otherradians = math.atan2(otherplayer['y'] - player['y'], otherplayer['x'] - player['x'])
                player['x'] += math.cos(radians) * depth
                player['y'] += math.sin(radians) * depth
                otherplayer['x'] += math.cos(otherradians) * depth
                otherplayer['y'] += math.sin(otherradians) * depth

@socketio.on('joingame')
def joingame(data):
    id = request.sid
    x = random.randrange(game_size)
    y = random.randrange(game_size)
    players.append({'id': id, 'name': data['name'], 'x': x, 'y': y, 'angle': 0, 'attack': False, 'attacktime': 0,
                    'keys': [0, 0], 'health':100, 'wood':0})
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