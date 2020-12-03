class User {
  static id;
  static nick;
  static points;
  static isDraving;
  static drawingStartTime;
  static drawingTimes;

  constructor(id, nick) {
    this.id = id;
    this.nick = nick;
    this.points = 0;
    this.isDraving = false;
    this.drawingTimeInCurrentGame = 0;
  }
  addPoint() {
    this.points++;
  }
  changeNick(nick) {
    this.nick = nick;
  }
  startDrawing() {
    this.isDraving = true;
    this.drawingStartTime = new Date();
  }
  endDrawing() {
    this.isDraving = false;
    this.drawingStartTime = null;
  }
}
module.exports = User;
