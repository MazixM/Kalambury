var fs = require("fs");
//var utils = require("./utils");
var chatManager = require("./chat.manager");
const Room = require("./models/room");
const User = require("./models/user");
const utils = require("./utils");

//Ilość punktów by wygrać
const POINTS_TO_WIN = 1;
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
        onChatMessageRecived(socket, message);
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
        onDisconnect(socket);
      });
    });
    function onChatMessageRecived(socket, message) {
      chatManager.sendUserMessageToAllInRoom(socket, message);
      //Funkcje w pokoju
      if (
        rooms[socket.roomId].currentDrawingUserId == socket.id &&
        message == "/nowe"
      ) {
        setNewPasswordToGuess(socket);
      }
      //Sprawdzenie, czy hasło zostało odgadnięte
      if (
        rooms[socket.roomId].currentDrawingUserId != socket.id &&
        checkPasswordToGuess(socket, message)
      ) {
        //Odgadnięte hasło
        afterGuessingThePassword(socket);
      }
    }
    function joinOrCreateRoom(socket, user) {
      socket.user = user;
      if (rooms[socket.roomId] == null) {
        createRoom(socket);
      } else {
        joinToRoom(socket);
      }
    }
    function createRoom(socket) {
      socket.join(socket.roomId);
      rooms[socket.roomId] = new Room(socket.roomId, socket.user);
      chatManager.joinMessage(socket);
      //socket.user.startDrawing();
      emitConnectedUsersCount(socket);
      findNewDrawingUser(socket);
    }
    function joinToRoom(socket) {
      if (rooms[socket.roomId].addUser(socket.user)) {
        socket.join(socket.roomId);
        chatManager.joinMessage(socket);
        emitConnectedUsersCount(socket);
      } else {
        chatManager.roomIsFull(socket);
      }
    }
    function checkPasswordToGuess(socket, message) {
      if (rooms[socket.roomId].currentPasswordToGuess == message) {
        return true;
      } else {
        return false;
      }
    }
    function afterGuessingThePassword(socket) {
      rooms[socket.roomId].users[socket.id].addPoint();
      if (rooms[socket.roomId].users[socket.id].points >= POINTS_TO_WIN) {
        //Wygrana
        chatManager.winMessage(socket);
        rooms[socket.roomId].resetUserPoints();
      } else {
        //Zdopyto punkt
        chatManager.gotPointMessage(socket);
      }
      //Znajdz nową osobę rysującą
      findNewDrawingUser(socket);
    }
    function getRandomPasswordFromJson() {
      return utils.randomProperty(passwords);
    }

    function setNewPasswordToGuess(socket) {
      let passwordToGuess = getRandomPasswordFromJson();
      rooms[socket.roomId].setPasswordToGuess(passwordToGuess);
      chatManager.newPasswordMessage(socket, passwordToGuess);
    }

    function findNewDrawingUser(socket) {
      let passwordToGuess = getRandomPasswordFromJson();
      rooms[socket.roomId].setPasswordToGuess(passwordToGuess);
      if (rooms[socket.roomId].findNewDrawingUser()) {
        chatManager.newDrwingPersonMessage(socket, passwordToGuess);
      } else {
        chatManager.newDrwingPersonMessage(socket, passwordToGuess);
        //   "Brak wystarczającej ilości graczy by wybrać nową osobę rysującą."
      }
    }
    function emitConnectedUsersCount(socket) {
      io.to(socket.roomId).emit(
        "currentPlayersCount",
        rooms[socket.roomId].connectedUsers()
      );
    }
    function onDisconnect(socket) {
      if (rooms[socket.roomId] != undefined) {
        //Usunięcie użytkownika z pokoju
        rooms[socket.roomId].removeUserBy(socket.id);
        if (rooms[socket.roomId].connectedUsers() <= 0) {
          //Usunięcie pokoju, gdy nie ma w nim nikogo
          delete rooms[socket.roomId];
        } else {
          chatManager.leftMessage(socket);
          emitConnectedUsersCount(socket);
          if (rooms[socket.roomId].currentDrawingUserId == socket.id) {
            //Osoba rysująca się rozłączyła
            findNewDrawingUser(socket);
          }
        }
      }
    }
  },
};
