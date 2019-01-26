// static/js/application.js

// Support TLS-specific URLs, when appropriate.
if (window.location.protocol == "https:") {
  var ws_scheme = "wss://";
} else {
  var ws_scheme = "ws://"
};


var outbox = new ReconnectingWebSocket(ws_scheme + location.host + "/submit");

$(".direction-btn").on("click", function(event) {
  event.preventDefault();
  console.log(event);
  var handle = $("#input-handle")[0].value;
  var direction = event.target.name
  console.log(JSON.stringify({ handle: handle, direction: direction }));
  outbox.send(JSON.stringify({ handle: handle, direction: direction }));
});

