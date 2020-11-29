var rooms = {};
// module.exports = function (io) {
//   io.on("connection", function (socket) {
//     socket.on("message", function (message) {
//       logger.log("info", message.value);
//       socket.emit("ditConsumer", message.value);
//       console.log("from console", message.value);
//     });
//   });
//   function joinOrCreate(roomId) {
//     if (rooms[roomId] == undefined) {
//       rooms[roomId] = roomId;
//     }
//     console.log("Room Created " + rooms[roomId]);
//   }
//   module.exports.joinOrCreate = joinOrCreate;
// };
function myConstructor(io) {
  io.on("connection", function (socket) {
    socket.on("message", function (message) {
      logger.log("info", message.value);
      socket.emit("ditConsumer", message.value);
      console.log("from console", message.value);
    });
  });
  function joinOrCreate(roomId) {
    if (rooms[roomId] == undefined) {
      rooms[roomId] = roomId;
    }
    console.log("Room Created " + rooms[roomId]);
  }
  module.exports.joinOrCreate = joinOrCreate;
}

module.exports = myConstructor;
