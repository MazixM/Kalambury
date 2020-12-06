var io;
const utils = require("./utils");
const chatName = "chat message";
//const errorName = "error";

function sendUserMessageToAllInRoom(socket, message) {
  if (isSocketCorrect(socket)) {
    if (isMessageCorrect(message)) {
      io.to(socket.roomId).emit(
        chatName,
        utils.getCurrentTime() + " | " + socket.user.nick + " - " + message
      );
    }
  }
}
function sendSystemMessageToAllInRoom(socket, message) {
  io.to(socket.roomId).emit(
    chatName,
    "SYSTEM: " + utils.getCurrentTime() + " | " + message
  );
}
function sendSystemMessageToSender(socket, message) {
  socket.emit(chatName, "SYSTEM: " + utils.getCurrentTime() + " | " + message);
}
function sendSystemMessageToOthersInRoom(socket, message) {
  socket
    .to(socket.roomId)
    .emit(chatName, "SYSTEM: " + utils.getCurrentTime() + " | " + message);
}
function isMessageCorrect(message) {
  return message != null && message.length > 1;
}
function isSocketCorrect(socket) {
  if (
    socket != undefined &&
    socket.user != undefined &&
    socket.roomId != undefined
  ) {
    return true;
  } else {
    socket.disconnect();
    return false;
  }
}

module.exports = {
  start: function (socketIO) {
    io = socketIO;
  },
  sendUserMessageToAllInRoom,
  roomIsFull: function (socket) {
    sendSystemMessageToSender(socket, "Wybrany pokój jest pełen");
  },
  winMessage: function (socket) {
    sendSystemMessageToAllInRoom(
      socket,
      socket.user.nick + " wygrywa. Gratulacje!!!"
    );
  },
  newDrwingPersonMessage: function (socket, password) {
    if (isSocketCorrect(socket)) {
      sendSystemMessageToAllInRoom(socket, socket.user.nick + " teraz rysuje.");
      sendSystemMessageToSender(socket, "Hasło brzmi: " + password);
    }
  },
  gotPointMessage: function (socket) {
    if (isSocketCorrect(socket)) {
      sendSystemMessageToAllInRoom(
        socket,
        socket.user.nick +
          " zdobywa 1 punkt. Łącznie ma ich " +
          socket.user.points +
          "."
      );
    }
  },
  newPasswordMessage: function (socket, newPassword) {
    if (isSocketCorrect(socket)) {
      sendSystemMessageToSender(socket, "Nowe hasło brzmi: " + newPassword);
    }
  },
  joinMessage: function (socket) {
    if (isSocketCorrect(socket)) {
      sendSystemMessageToSender(
        socket,
        "Pomyślnie dołączono do pokoju o id: " + socket.roomId
      );
      sendSystemMessageToSender(
        socket,
        "Witaj " + socket.user.nick + "! Twoje id, to: " + socket.id
      );
      sendSystemMessageToOthersInRoom(
        socket,
        socket.user.nick + "  dołącza do pokoju."
      );
    }
  },
  leftMessage: function (socket) {
    if (isSocketCorrect(socket)) {
      sendSystemMessageToOthersInRoom(
        socket,
        socket.user.nick + " opuszcza pokój."
      );
    }
  },
};
