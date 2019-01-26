// static/js/application.js

// Support TLS-specific URLs, when appropriate.
if (window.location.protocol == "https:") {
  var ws_scheme = "wss://";
} else {
  var ws_scheme = "ws://"
};


var inbox = new ReconnectingWebSocket(ws_scheme + location.host + "/game_receive");

inbox.onmessage = function(message) {
  console.log(message.data)
  var data = JSON.parse(message.data);
  $("#inputs-text").append("<div class='panel panel-default'><div class='panel-heading'>" + $('<span/>').text(data.handle).html() + "</div><div class='panel-body'>" + $('<span/>').text(data.direction).html() + "</div></div>");
  $("#chat-text").stop().animate({
    scrollTop: $('#chat-text')[0].scrollHeight
  }, 800);
};

