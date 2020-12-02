const utils = require("./utils");
const chatName = "chat message";

function sendUserMessageToAllInRoom(socket, message) {
  if (isMessageCorrect(message)) {
    socket
      .to(socket.roomId)
      .emit(utils.getCurrentTime() + " | " + socket.nick + " - " + message);
  }
}
function sendSystemMessageToAllInRoom(socket, message) {
  if (isMessageCorrect(message)) {
    socket.broadcast
      .to(socket.roomId)
      .emit(chatName, "SYSTEM: " + utils.getCurrentTime() + " | " + message);
  }
}
function sendSystemMessageToSender(socket, message) {
  if (isMessageCorrect(message)) {
    socket.emit(
      chatName,
      "SYSTEM: " + utils.getCurrentTime() + " | " + message
    );
  }
}
function sendSystemMessageToOthersInRoom(socket, message) {
  if (isMessageCorrect(message)) {
    socket
      .to(socket.roomId)
      .emit(chatName, "SYSTEM: " + utils.getCurrentTime() + " | " + message);
  }
}
function isMessageCorrect(message) {
  return message != null && message.length > 1;
}

module.exports = {
  sendUserMessageToAllInRoom: sendUserMessageToAllInRoom,
  sendSystemMessageToSender: sendSystemMessageToSender,
  sendSystemMessageToOthersInRoom: sendSystemMessageToOthersInRoom,
  sendSystemMessageToAllInRoom: sendSystemMessageToAllInRoom,
  winMessage: function (socket, roomId, nick) {
    sendSystemMessageToAllInRoom(
      socket,
      socket.nick + " wygrywa. Gratulacje!!!"
    );
  },
  newDrwingPersonMessage: function (socket) {
    sendSystemMessageToAllInRoom(socket, socket.nick + "teraz rysuje.");
  },
  gotPointMessage: function (socket) {
    sendSystemMessageToAllInRoom(socket, socket.nick + "Zdobywa 1 punkt.");
  },
  newPasswordMessage: function (socket, password) {
    sendSystemMessageToSender(socket, "nowe hasło brzmi: " + password);
  },
  joinMessage: function (socket) {
    sendSystemMessageToAllInRoom(
      socket,
      socket.nick + " właśnie dołączył do pokoju."
    );
  },
  leftMessage: function (socket) {
    sendSystemMessageToAllInRoom(socket, socket.nick + " właśnie wyszedł.");
  },
};
