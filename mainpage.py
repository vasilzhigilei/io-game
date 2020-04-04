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
    emit('my response', {'data': 'Connected'})

@socketio.on('disconnect')
def disconnect(data):
    print('Client disconnected')
    players.remove(data['name'])
    print('removed ' + data['name'])

@socketio.on('name event')
def receive_name(json):
    print('received json: ' + str(json))
    emit('toclient', json)

if __name__ == "__main__":
    socketio.run(app)