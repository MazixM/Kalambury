var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

//Strona główna
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/sites/index.html');
});

io.on('connection', function (socket) {
  socket.on('chat message', function (jsonString) {
    var message = JSON.parse(jsonString);
    if (message.msg.length > 1 && message.nick.length > 3) {
      io.emit('chat message', getCurrentTime() + " " + message.nick + " - " + message.msg);
    }
  });
  socket.on('point', function (point) {
    io.emit('point', point);
  });
  socket.on('clear', function () {
    io.emit('clear');
  });
});

//Event podczas połączenia nowej osoby
io.sockets.on('connection', newConnection);
function newConnection(socket) {
  console.log('We have new client: ' + socket.id);
  io.emit('chat message', getCurrentTime() + " " + "Ktoś nowy właśnie się połączył...")

  //Event podczas rozłączenia osoby
  socket.on('disconnect', function () {
    console.log('Disconnect ' + socket.id);
    io.emit('chat message', getCurrentTime() + " " + "Ktoś właśnie się rozłączył...");
  });
}

function getCurrentTime() {
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
}

http.listen(port, function () {
  console.log('listening on *:' + port);
});
