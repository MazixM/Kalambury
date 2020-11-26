var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

//Strona główna
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/sites/index.html');
});

//Lista haseł do zgadnięcia
var passwords = JSON.parse(fs.readFileSync('passwords.json', 'utf8'));
//Aktualne hasło do zgadnięcia
var actualPassword;
//Aktualna ilość graczy
var currentPlayersCount = 0;
//Gracz, który aktualnie rysuje
var actualMainPlayerId;
//Aktualna tabela wyników
var points = {};

io.on('connection', function (socket) {
  socket.on('chat message', function (jsonString) {
    var message = JSON.parse(jsonString);
    if (message.msg.length > 1 && message.nick.length > 3) {
      io.emit('chat message', getCurrentTime() + " " + message.nick + " - " + message.msg);
      //Sprawdzenie, czy wiadomość jest taka jak aktualne hasło
      if (message.msg.toLowerCase() == actualPassword.toLowerCase() && (actualMainPlayerId != socket.id)) {
        //Hasło zostało odgadnięte
        createNewRandomPassword();
        //Wybranie nowej osoby rysującej
        findNewDrawingPerson();
        //Aktualnie gra toczy się do 5 wygranych
        points[socket.id]++;
        if (points[socket.id] < 5) {
          io.emit('chat message', message.nick + " zgaduje hasło i zdobywa 1 punkt! Łącznie posiada ich : " + points[socket.id]);
        } else {
          //Informacja o wygranej
          io.emit('chat message', message.nick + " zgaduje hasło i wygrywa! Gratulacje! ");
          //Reset wyników
          points = {};
        }
        //Wyślij informację o nowym haśle
        socket.broadcast.to(actualMainPlayerId).emit('chat message', 'Nowe hasło, to : ' + actualPassword);
      }
      //Generowanie nowego hasła przez osobę rysującą
      if ((actualMainPlayerId == socket.id) && (message.msg == '/nowe')) {
        createNewRandomPassword();
        io.emit('chat message', "Gracz " + message.nick + " wylosował nowe hasło.");
        socket.emit('chat message', 'Wylosowano nowe hasło : ' + actualPassword);
      }
    }
  });
  socket.on('drawLine', function (lineFromTo) {
    //Zapobieganie oszukiwaniu przy wyborze lini
    if (lineFromTo.lineWidth > 10 || lineFromTo.lineWidth < 1) {
      return;
    }
    socket.broadcast.emit('drawLine', lineFromTo);
  });
  socket.on('clear', function () {
    socket.broadcast.emit('clear');
  });
});

//Event podczas połączenia nowej osoby
io.sockets.on('connection', newConnection);
function newConnection(socket) {
  socket.emit('chat message', getCurrentTime() + " " + "Witaj! Twoje id, to: " + socket.id);
  points[socket.id] = 0;
  if (actualMainPlayerId == null) {
    actualMainPlayerId = socket.id;
    createNewRandomPassword();
    socket.emit('chat message', getCurrentTime() + " " + "Jesteś teraz osobą rysującą. Hasło, to : " + actualPassword);
    socket.emit('chat message', getCurrentTime() + " " + "Wpisz /nowe aby wylosować nowe hasło.");
  }

  currentPlayersCount += 1;
  io.emit('currentPlayersCount', currentPlayersCount);
  console.log('We have new client: ' + socket.id);
  socket.broadcast.emit('chat message', getCurrentTime() + " " + "Ktoś nowy właśnie się połączył...");

  //Event podczas rozłączenia osoby
  socket.on('disconnect', function () {
    if (actualMainPlayerId == socket.id) {
      actualMainPlayerId = null;
      socket.broadcast.emit('chat message', getCurrentTime() + " " + "Osoba rysującą właśnie się rozłączyła.");
      findNewDrawingPerson();
    }
    delete points[socket.id];
    currentPlayersCount -= 1;
    io.emit('currentPlayersCount', currentPlayersCount);
    console.log('Disconnect ' + socket.id);
    socket.broadcast.emit('chat message', getCurrentTime() + " " + "Ktoś właśnie się rozłączył...");
  });
}

function getCurrentTime() {
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
}

function createNewRandomPassword() {
  actualPassword = randomProperty(passwords);
};

function findNewDrawingPerson() {
  // if (currentPlayersCount > 1) {
  //   var keys = Object.keys(points);
  //   do {
  //     var newDrawPersonId = keys[keys.length * Math.random() << 0];
  //   }
  //   while (actualMainPlayerId == newDrawPersonId);
  //   actualMainPlayerId = newDrawPersonId;
  //   console.log("New drawing client " + actualMainPlayerId);
  //   io.emit('chat message', 'Wybrano nową osobę rysującą');
  // } else {
  //   io.emit('chat message', 'Brak wystarczającej ilości graczy by wybrać osobę rysującą.');
  // }
}

function randomProperty(obj) {
  var keys = Object.keys(obj);
  return obj[keys[keys.length * Math.random() << 0]];
};

http.listen(port, function () {
  console.log('listening on *:' + port);
});
