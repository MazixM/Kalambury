const utils = require("./utils");
const chatName = "chat message";

function sendUserMessageToAllInRoom(socket, roomId, nick, message) {
  if (isMessageCorrect(message)) {
    socket
      .to(roomId)
      .emit(utils.getCurrentTime() + " | " + nick + " - " + message);
  }
}
function sendSystemMessageToAllInRoom(socket, roomId, message) {
  if (isMessageCorrect(message)) {
    socket.broadcast
      .to(roomId)
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
function sendSystemMessageToOthersInRoom(socket, roomId, message) {
  if (isMessageCorrect(message)) {
    socket
      .to(roomId)
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
  winMessage: function (socket, roomId, nick) {
    sendSystemMessageToAllInRoom(
      socket,
      roomId,
      nick + " wygrywa. Gratulacje!!!"
    );
  },
  newDrwingPersonMessage: function (socket, roomId, nick) {
    sendSystemMessageToAllInRoom(socket, roomId, nick + "teraz rysuje.");
  },
  gotPointMessage: function (socket, roomId, nick) {
    sendSystemMessageToAllInRoom(socket, roomId, nick + "Zdobywa 1 punkt.");
  },
  newPasswordMessage: function (socket, password) {
    sendSystemMessageToSender(socket, "nowe hasło brzmi: " + password);
  },
  joinMessage: function (socket, roomId, nick) {
    sendSystemMessageToAllInRoom(
      socket,
      roomId,
      nick + " właśnie dołączył do pokoju."
    );
  },
  leftMessage: function (socket, roomId, nick) {
    sendSystemMessageToAllInRoom(socket, roomId, nick + "właśnie wyszedł.");
  },
};
