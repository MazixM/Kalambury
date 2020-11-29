const app = require("express")();
const http = require("http").Server(app);
const httpPort = process.env.PORT || 3000;
const io = require("socket.io")(http);
//const game = require("./game")(io);
const roomManager = require("./room.manager")(io);
//Strona główna
app.get("/", function (req, res) {
  var roomId = req.query.roomId;
  if (roomId == undefined || roomId.length > 20) {
    roomId = "default";
  }
  //Dołączanie do pokoju
  roomManager.joinOrCreate(roomId);
  res.sendFile(__dirname + "/sites/index.html");
});

http.listen(httpPort, function () {
  console.log("listening on *:" + httpPort);
});
