import os
import logging
import redis
import gevent
from flask import Flask, render_template
from flask_sockets import Sockets

REDIS_URL = os.environ['REDIS_URL']
REDIS_CHAN = 'chat'
REDIS_COMMAND_CHAN = 'command'

app = Flask(__name__)
app.debug = 'DEBUG' in os.environ

sockets = Sockets(app)
redis = redis.from_url(REDIS_URL)

class GameBackend(object):
    """Interface for registering and updating WebSocket clients."""

    def __init__(self):
        self.clients = list()
        self.pubsub = redis.pubsub()
        self.pubsub.subscribe(REDIS_COMMAND_CHAN)

    def __iter_data(self):
        for message in self.pubsub.listen():
            data = message.get('data')
            if message['type'] == 'message':
                app.logger.info(u'Sending message: {}'.format(data))
                yield data

    def register(self, client):
        """Register a WebSocket connection for Redis updates."""
        # TODO: Make sure we can only have a single game client connected at a time here
        self.clients.append(client)

    def send(self, client, data):
        """Send given data to the registered client.
        Automatically discards invalid connections."""
        try:
            client.send(data.decode('utf-8'))
        except Exception:
            self.clients.remove(client)

    def run(self):
        """Listens for new messages in Redis, and sends them to clients."""
        for data in self.__iter_data():
            for client in self.clients:
                gevent.spawn(self.send, client, data)

    def start(self):
        """Maintains Redis subscription in the background."""
        gevent.spawn(self.run)

game_backend = GameBackend()
game_backend.start()



@app.route('/')
def hello():
    return render_template('index.html')

@app.route('/play')
def play():
    return render_template('player_client.html')


@app.route('/game')
def game():
    return render_template('game_client.html')


@sockets.route('/echo')
def echo(ws):
    message = ws.receive()
    ws.send(message)


@sockets.route('/player_submit')
def player_client(ws):
    while not ws.closed:
        gevent.sleep(0.1)
        message = ws.receive()

        # TODO: Validate message is legit
        if message:
            app.logger.info(u'Received command message: {}'.format(message))
            redis.publish(REDIS_COMMAND_CHAN, message)


@sockets.route('/game_receive')
def game_client(ws):
    """Sends outgoing chat messages, via `ChatBackend`."""
    game_backend.register(ws)

    while not ws.closed:
        # Context switch while `ChatBackend.start` is running in the background.
        gevent.sleep(0.1)


@sockets.route('/submit')
def inbox(ws):
    """Receives incoming chat messages, inserts them into Redis."""
    while not ws.closed:
        # Sleep to prevent *constant* context-switches.
        gevent.sleep(0.1)
        message = ws.receive()

        if message:
            app.logger.info(u'Inserting message: {}'.format(message))
            redis.publish(REDIS_CHAN, message)


@sockets.route('/receive')
def outbox(ws):
    """Sends outgoing chat messages, via `ChatBackend`."""
    chats.register(ws)

    while not ws.closed:
        # Context switch while `ChatBackend.start` is running in the background.
        gevent.sleep(0.1)
