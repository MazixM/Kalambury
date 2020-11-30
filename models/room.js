class Room {
  static Id;
  static Users;
  static MaxUsers;
  static Password;
  static CreationTime;

  constructor(id, user, password = "", maxUsers = 5) {
    this.Id = id;
    this.CreationTime = new Date();
    this.Users = {};
    this.Users[user.id] = user;
    this.Password = password;
    this.MaxUsers = maxUsers;
  }

  addUser(user, password = "") {
    if (this.connectedUsers() >= this.MaxUsers || this.Password != password) {
      return false;
    } else {
      this.Users[this.connectedUsers() + 1] = user;
      return true;
    }
  }
  removeUserBy(userId) {
    if (this.Users[userId] != null) {
      delete this.Users[userId];
      return true;
    } else {
      return false;
    }
  }
  connectedUsers() {
    var size = 0,
      key;
    for (key in this.Users) {
      if (this.Users.hasOwnProperty(key)) size++;
    }
    return size;
  }
}
module.exports = Room;
