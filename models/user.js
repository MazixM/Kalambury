class User {
  static Id;
  static Name;
  static Points;
  static IsDraving;
  static DrawingStartTime;
  static DrawingTimes;

  constructor(id, name) {
    this.Id = id;
    this.Name = name;
    this.Points = 0;
    this.IsDraving = false;
    this.DrawingTimeInCurrentGame = 0;
  }
  addPoint() {
    this.Points++;
  }
  changeName(name) {
    this.Name = name;
  }
  startDrawing() {
    isDraving = true;
    DrawingStartTime = new Date();
  }
  endDrawing() {
    isDraving = false;
    DrawingStartTime = null;
  }
}
module.exports = User;
