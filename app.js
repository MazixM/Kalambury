var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(jsonString){
    var message = JSON.parse(jsonString);
    if(message.msg.length > 3)
    {
      io.emit('chat message', getCurrentTime() + " " + message.nick + " - " + message.msg);
    }
  });
});

function getCurrentTime()
{
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
}

http.listen(port, function(){
  console.log('listening on *:' + port);
});
