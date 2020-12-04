var fs = require("fs");
//var utils = require("./utils");
var chatManager = require("./chat.manager");
const Room = require("./models/room");
const User = require("./models/user");
const utils = require("./utils");
//Lista haseł do zgadnięcia
var passwords = JSON.parse(fs.readFileSync("passwords.json", "utf8"));

var rooms = {};

module.exports = {
  start: function (io) {
    chatManager.start(io);
    io.on("connection", function (socket) {
      //New user joined
      socket.on("new user", function (user) {
        socket.roomId = user.roomId;
        joinOrCreateRoom(socket, new User(socket.id, user.nick));
      });
      //Wysyłanie/obieranie wiadomości
      socket.on("chat message", function (message) {
        onChatMessageRecived(message);
      });
      //Rysowanie lini
      socket.on("drawLine", function (lineFromTo) {
        //Zapobieganie oszukiwaniu przy wyborze lini
        if (lineFromTo.lineWidth > 10 || lineFromTo.lineWidth < 1) {
          return;
        }
        //Tylko osoba rysująca może rysować u innych
        if (
          rooms[socket.roomId] != undefined &&
          socket.id == rooms[socket.roomId].currentDrawingUserId
        ) {
          io.to(socket.roomId).emit("drawLine", lineFromTo);
        }
      });
      //Czyszczenie canvas
      socket.on("clear", function () {
        if (
          rooms[socket.roomId] != undefined &&
          socket.id == rooms[socket.roomId].currentDrawingUserId
        ) {
          //Tylko osoba rysująca może wyczyścić innym canvas
          io.to(socket.roomId).emit("clear");
        }
      });
      socket.on("disconnect", function () {
        if (rooms[socket.roomId] != undefined) {
          //Usunięcie użytkownika z pokoju
          rooms[socket.roomId].removeUserBy(socket.id);
          if (rooms[socket.roomId].connectedUsers() <= 0) {
            //Usunięcie pokoju, gdy nie ma w nim nikogo
            delete rooms[socket.roomId];
          } else {
            chatManager.leftMessage(socket);
          }
        }
      });
    });
    function onChatMessageRecived(message) {
      chatManager.sendUserMessageToAllInRoom(socket, message);
      // if (
      //   message.toLowerCase().trim() == actualPassword.toLowerCase().trim() &&
      //   actualDrawingPlayerId != socket.id
      // ) {
      //   if (++points[socket.id] < 5) {
      //     io.emit(
      //       "chat message",
      //       message.nick +
      //         " zgaduje hasło i zdobywa 1 punkt! Łącznie posiada ich : " +
      //         points[socket.id]
      //     );
      //   } else {
      //     //Informacja o wygranej
      //     chatManager.winMessage(socket);
      //     //Reset wyników
      //   }
      //   //Znajdź nowe hasło
      //   createNewRandomPassword();
      //   //Wybranie nowej osoby rysującej
      //   findNewDrawingPerson();
      //   //Czyszczenie tablicy
      //   io.emit("clear");
      // }
      //commands
      // if (actualDrawingPlayerId != socket.id && message == "/losuj") {
      //   //Znajdź nowe hasło
      //   createNewRandomPassword();
      //   //Wybranie nowej osoby rysującej
      //   findNewDrawingPerson();
      // }
      // if (actualDrawingPlayerId == socket.id && message == "/nowe") {
      //   //Generowanie nowego hasła przez osobę rysującą
      //   createNewRandomPassword();
      //   chatManager.newPasswordMessage(socket, actualPassword);
      // }
    }
    //Event podczas połączenia nowej osoby
    // io.sockets.on("connection", newConnection);
    // function newConnection(socket) {
    //   myClientList[socket.id] = socket;
    //   //   socket.emit(
    //   //     "chat message",
    //   //     utils.getCurrentTime() + " " + "Witaj! Twoje id, to: " + socket.id
    //   //   );
    //   //Todo pobranie wartości z currentPlayersId
    //   currentPlayersCount += 1;
    //   io.emit("currentPlayersCount", currentPlayersCount);
    //   //Dodanie ID do listy połączonych graczy
    //   currentPlayersId.push(socket.id);
    //   //Sprawdzenie, czy obecnie jest wybrana osoba rysująca
    //   if (actualDrawingPlayerId == null) {
    //     actualDrawingPlayerId = socket.id;
    //     createNewRandomPassword();
    //     socket.emit(
    //       "chat message",
    //       utils.getCurrentTime() +
    //         " " +
    //         "Jesteś teraz osobą rysującą. Hasło, to : " +
    //         actualPassword
    //     );
    //     socket.emit(
    //       "chat message",
    //       utils.getCurrentTime() + " " + "Wpisz /nowe aby wylosować nowe hasło."
    //     );
    //   }
    //   console.log("We have new client: " + socket.id);
    //   socket.broadcast.emit(
    //     "chat message",
    //     utils.getCurrentTime() + " " + "Ktoś nowy właśnie się połączył..."
    //   );

    //   //Event podczas rozłączenia osoby
    //   socket.on("disconnect", function () {
    //     delete myClientList[socket.id];
    //     //Usunięcie punktów
    //     delete points[socket.id];
    //     //Zmniejszenie ilości graczy
    //     currentPlayersCount -= 1;
    //     //Wysłanie informacji o aktualnej ilości graczy

    //     //Zmniejszenie usunięcie ID z listy aktywnych graczy
    //     currentPlayersId = currentPlayersId.filter(function (e) {
    //       return e !== socket.id;
    //     });
    //     //Sprawdzenie, czy rozłączyła się osoba rysująca
    //     if (actualDrawingPlayerId == socket.id) {
    //       actualDrawingPlayerId = null;
    //       //TODO do dodania funkcja dla rozłączenia osoby rysującej
    //       //chatManager.leftMessage("TODO NICK");
    //       socket.broadcast.emit(
    //         "chat message",
    //         utils.getCurrentTime() +
    //           " " +
    //           "Osoba rysującą właśnie się rozłączyła."
    //       );
    //       console.log("Disconnect " + socket.id);
    //       findNewDrawingPerson();
    //     } else {
    //       chatManager.leftMessage("TODO NICK");
    //       console.log("Disconnect " + socket.id);
    //     }
    //   });
    // }
    function joinOrCreateRoom(socket, user) {
      socket.user = user;
      if (rooms[socket.roomId] == null) {
        //Create new room
        socket.join(socket.roomId);
        rooms[socket.roomId] = new Room(socket.roomId, socket.user);
        chatManager.joinMessage(socket);
        socket.user.startDrawing();
      } else {
        //Try join to exist room
        if (rooms[socket.roomId].addUser(socket.user)) {
          socket.join(socket.roomId);
          chatManager.joinMessage(socket);
        } else {
          chatManager.roomIsFull(socket);
        }
      }
    }

    function getRandomPasswordFromJson() {
      return utils.randomProperty(passwords);
    }

    function setNewPasswordToGuessInRoom(socket) {
      let passwordToGuess = getRandomPasswordFromJson();
      rooms[socket.roomId].setPasswordToGuess(passwordToGuess);
      chatManager.newPasswordMessage(socket, passwordToGuess);
    }

    function findNewDrawingPersonInRoom(socket) {
      let passwordToGuess = getRandomPasswordFromJson();
      rooms[socket.roomId].setPasswordToGuess(passwordToGuess);
      chatManager.newDrwingPersonMessage(socket);
      // io.emit(
      //   "chat message",
      //   "Brak wystarczającej ilości graczy by wybrać nową osobę rysującą."
      // );
    }
  },
};
