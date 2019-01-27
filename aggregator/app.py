import os
import time
import logging
import json
import redis
import math
import gevent
from flask import Flask, render_template
from flask_sockets import Sockets

REDIS_URL = os.environ['REDIS_URL']
REDIS_CHAN = 'chat'
REDIS_COMMAND_CHAN = 'command'

CHUNKING_DIVISOR = 2
QUEUE_TIMESTEPS = .2

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
                yield data

    def register(self, client):
        """Register a WebSocket connection for Redis updates."""
        # TODO: Make sure we can only have a single game client connected at a time here
        print("REGISTER!")
        self.clients.append(client)
        print(self.clients)

    def send(self, client, data):
        """Send given data to the registered client.
        Automatically discards invalid connections."""
        try:
            client.send(data.decode('utf-8'))
        except Exception:
            self.clients.remove(client)

    def run(self):
        for data in self.__iter_data():
            for client in self.clients:
                gevent.spawn(self.send, client, data)

    def send_average(self, data):
        """Send given data to the registered client.
        Automatically discards invalid connections."""
        for client in self.clients:
            try:
                client.send(json.dumps(data))
            except Exception:
                self.clients.remove(client)

    def run_average(self):
        """Listens for new messages in Redis, and sends them to clients."""
        while True:
            queue = []
            message = self.pubsub.get_message()
            while message:
                if message['type'] == 'message':
                    queue.append(json.loads(message['data']))
                message = self.pubsub.get_message()
            # length_of_queue = len(queue)
            # if length_of_queue < 20:
            #     num_to_process = length_of_queue
            # else:
            #     num_to_process = math.ceil(length_of_queue/CHUNKING_DIVISOR)

            # if num_to_process != 0:
            try:
                inputs_to_process = queue[-20:]
            except AttributeError:
                inputs_to_process = queue
            directions = {
                'up': 0,
                'down': 0,
                'left': 0,
                'right': 0
            }
            if len(inputs_to_process) > 0:
                for message in inputs_to_process:
                    if not message.get('direction'):
                        continue
                    if message['direction'] == 'up':
                        directions['up'] += 1
                    elif message['direction'] == 'down':
                        directions['down'] += 1
                    elif message['direction'] == 'left':
                        directions['left'] += 1
                    elif message['direction'] == 'right':
                        directions['right'] += 1

                print(directions)
                gevent.spawn(self.send_average, directions)
            gevent.sleep(QUEUE_TIMESTEPS)

    def start(self):
        """Maintains Redis subscription in the background."""
        gevent.spawn(self.run_average)

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
