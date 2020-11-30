const app = require("express")();
const http = require("http").Server(app);
const httpPort = process.env.PORT || 3000;
const io = require("socket.io")(http);
var roomManager = require("./room.manager");
roomManager.start(io);
//Strona główna
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/sites/index.html");
});

http.listen(httpPort, function () {
  console.log("listening on *:" + httpPort);
});
