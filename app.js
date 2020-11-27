var app = require("express")();
var http = require("http").Server(app);
var fs = require("fs");
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;

//Strona główna
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/sites/index.html");
});

//Lista haseł do zgadnięcia
var passwords = JSON.parse(fs.readFileSync("passwords.json", "utf8"));
//Aktualne hasło do zgadnięcia
var actualPassword;
//Aktualna ilość graczy
var currentPlayersCount = 0;
//Aktualnie podłączeni gracze
var currentPlayersId = [];
var myClientList = {};
//Gracz, który aktualnie rysuje
var actualDrawingPlayerId;
//Aktualna tabela wyników
var points = {};

io.on("connection", function (socket) {
  socket.on("chat message", function (message) {
    if (message.msg.length > 1 && message.nick.length > 3) {
      io.emit(
        "chat message",
        getCurrentTime() + " " + message.nick + " - " + message.msg
      );
      //Sprawdzenie, czy wiadomość jest taka jak aktualne hasło
      if (
        message.msg.toLowerCase().trim() ==
          actualPassword.toLowerCase().trim() &&
        actualDrawingPlayerId != socket.id
      ) {
        //Aktualnie gra toczy się do 5 wygranych
        if (points[socket.id] == undefined) {
          points[socket.id] = 0;
        }
        if (++points[socket.id] < 5) {
          io.emit(
            "chat message",
            message.nick +
              " zgaduje hasło i zdobywa 1 punkt! Łącznie posiada ich : " +
              points[socket.id]
          );
        } else {
          //Informacja o wygranej
          io.emit(
            "chat message",
            message.nick + " zgaduje hasło i wygrywa! Gratulacje! "
          );
          //Reset wyników
          delete points;
          points = {};
        }
        //Znajdź nowe hasło
        createNewRandomPassword();
        //Wybranie nowej osoby rysującej
        findNewDrawingPerson();
      }
      if (actualDrawingPlayerId != socket.id && message.msg == "/losuj") {
        //Znajdź nowe hasło
        createNewRandomPassword();
        //Wybranie nowej osoby rysującej
        findNewDrawingPerson();
      }
      if (actualDrawingPlayerId == socket.id && message.msg == "/nowe") {
        //Generowanie nowego hasła przez osobę rysującą
        createNewRandomPassword();
        io.emit(
          "chat message",
          "Gracz " + message.nick + " wylosował nowe hasło."
        );
        socket.emit(
          "chat message",
          "Wylosowano nowe hasło : " + actualPassword
        );
      }
    }
  });
  socket.on("drawLine", function (lineFromTo) {
    //Zapobieganie oszukiwaniu przy wyborze lini
    if (lineFromTo.lineWidth > 10 || lineFromTo.lineWidth < 1) {
      return;
    }
    if (socket.id == actualDrawingPlayerId) {
      socket.broadcast.emit("drawLine", lineFromTo);
    }
  });
  socket.on("clear", function () {
    if (socket.id == actualDrawingPlayerId) {
      socket.broadcast.emit("clear");
    }
  });
});

//Event podczas połączenia nowej osoby
io.sockets.on("connection", newConnection);
function newConnection(socket) {
  myClientList[socket.id] = socket;
  socket.emit(
    "chat message",
    getCurrentTime() + " " + "Witaj! Twoje id, to: " + socket.id
  );
  //Todo pobranie wartości z currentPlayersId
  currentPlayersCount += 1;
  io.emit("currentPlayersCount", currentPlayersCount);
  //Dodanie ID do listy połączonych graczy
  currentPlayersId.push(socket.id);
  //Sprawdzenie, czy obecnie jest wybrana osoba rysująca
  if (actualDrawingPlayerId == null) {
    actualDrawingPlayerId = socket.id;
    createNewRandomPassword();
    socket.emit(
      "chat message",
      getCurrentTime() +
        " " +
        "Jesteś teraz osobą rysującą. Hasło, to : " +
        actualPassword
    );
    socket.emit(
      "chat message",
      getCurrentTime() + " " + "Wpisz /nowe aby wylosować nowe hasło."
    );
  }
  console.log("We have new client: " + socket.id);
  socket.broadcast.emit(
    "chat message",
    getCurrentTime() + " " + "Ktoś nowy właśnie się połączył..."
  );

  //Event podczas rozłączenia osoby
  socket.on("disconnect", function () {
    delete myClientList[socket.id];
    //Usunięcie punktów
    delete points[socket.id];
    //Zmniejszenie ilości graczy
    currentPlayersCount -= 1;
    //Wysłanie informacji o aktualnej ilości graczy
    io.emit("currentPlayersCount", currentPlayersCount);
    //Zmniejszenie usunięcie ID z listy aktywnych graczy
    currentPlayersId = currentPlayersId.filter(function (e) {
      return e !== socket.id;
    });
    //Sprawdzenie, czy rozłączyła się osoba rysująca
    if (actualDrawingPlayerId == socket.id) {
      actualDrawingPlayerId = null;
      socket.broadcast.emit(
        "chat message",
        getCurrentTime() + " " + "Osoba rysującą właśnie się rozłączyła."
      );
      console.log("Disconnect " + socket.id);
      findNewDrawingPerson();
    } else {
      socket.broadcast.emit(
        "chat message",
        getCurrentTime() + " " + "Ktoś właśnie się rozłączył..."
      );
      console.log("Disconnect " + socket.id);
    }
  });
}

function getCurrentTime() {
  var d = new Date();
  return (
    d.getFullYear() +
    "-" +
    (d.getMonth() + 1) +
    "-" +
    d.getDate() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes()
  );
}

function createNewRandomPassword() {
  actualPassword = randomProperty(passwords);
}

function findNewDrawingPerson() {
  //todo pobranie wszystkich graczy i wylosowanie nowego
  if (currentPlayersCount > 1) {
    do {
      var newDrawPersonId =
        currentPlayersId[(currentPlayersId.length * Math.random()) << 0];
    } while (actualDrawingPlayerId == newDrawPersonId);
    actualDrawingPlayerId = newDrawPersonId;
    console.log("New drawing client " + actualDrawingPlayerId);
    io.emit("chat message", "Wybrano nową osobę rysującą");
    createNewRandomPassword();
    myClientList[actualDrawingPlayerId].emit(
      "chat message",
      "Jesteś teraz osobą rysującą. Hasło, to : " + actualPassword
    );
  } else {
    io.emit(
      "chat message",
      "Brak wystarczającej ilości graczy by wybrać nową osobę rysującą."
    );
  }
}

function randomProperty(obj) {
  var keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]];
}

http.listen(port, function () {
  console.log("listening on *:" + port);
});
