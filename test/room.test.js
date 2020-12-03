const Room = require("../models/room");
const User = require("../models/user");

var user = new User("userid_1", "Simple user");
var user2 = new User("userid_2", "Simple user");
test("Creating room with default settings", () => {
  //Create room
  let id = "someID1";
  let room = new Room(id, user);
  expect(room.id).toBe(id);
  expect(room.connectedUsers()).toBe(1);
  //Add new user

  expect(room.addUser(user2)).toBe(true);
  expect(room.connectedUsers()).toBe(2);
});

test("Creating room with passwords (good and wrong)", () => {
  //Create room
  let room = new Room("id", user, "daib%85", 5);
  expect(room.connectedUsers()).toBe(1);
  //Add new user
  expect(room.addUser(user2, "daib%85")).toBe(true);
  //Wrong passwords test
  expect(room.addUser(user, "dai5")).toBe(false);
  expect(room.addUser(user, "")).toBe(false);
  expect(room.addUser(user)).toBe(false);
  expect(room.connectedUsers()).toBe(2);
});

test("Test max users per room", () => {
  //Create room
  let room = new Room("id", user, null, 5);
  expect(room.connectedUsers()).toBe(1);
  //Create simple users
  let user3 = new User("userid_3", "Simple user");
  let user4 = new User("userid_4", "Simple user");
  let user5 = new User("userid_5", "Simple user");
  let user6 = new User("userid_6", "Simple user");
  //Add new user x5
  expect(room.addUser(user2)).toBe(true);
  expect(room.addUser(user3)).toBe(true);
  expect(room.addUser(user4)).toBe(true);
  expect(room.addUser(user5)).toBe(true);
  expect(room.addUser(user6)).toBe(false);
  expect(room.connectedUsers()).toBe(5);
});
test("Test removeing users", () => {
  //Create room
  let room = new Room("id", user);
  expect(room.connectedUsers()).toBe(1);
  expect(room.addUser(user2)).toBe(true);
  expect(room.connectedUsers()).toBe(2);
  expect(room.removeUserBy(user.id)).toBe(true);
  expect(room.connectedUsers()).toBe(1);
  expect(room.removeUserBy(user2.id)).toBe(true);
  expect(room.connectedUsers()).toBe(0);
});
