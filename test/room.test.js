const Room = require("../models/room");
const User = require("../models/user");

var user = new User("userid_1", "Simple user");
test("Creating room with default settings", () => {
  //Create room
  let id = "someID1";
  let room = new Room(id, user);
  expect(room.Id).toBe(id);
  expect(room.connectedUsers()).toBe(1);
  //Add new user
  expect(room.addUser(user)).toBe(true);
  expect(room.connectedUsers()).toBe(2);
});

test("Creating room with passwords good and wrong", () => {
  //Create room
  let room = new Room("id", user, "daib%85", 5);
  expect(room.connectedUsers()).toBe(1);
  //Add new user
  expect(room.addUser(user, "daib%85")).toBe(true);
  //Wrong passwords test
  expect(room.addUser(user, "dai5")).toBe(false);
  expect(room.addUser(user, "")).toBe(false);
  expect(room.addUser(user)).toBe(false);
  expect(room.connectedUsers()).toBe(2);
});

test("Test max users per room", () => {
  //Create room
  let room = new Room("id", user);
  expect(room.connectedUsers()).toBe(1);
  //Add new user x5
  expect(room.addUser(user)).toBe(true);
  expect(room.addUser(user)).toBe(true);
  expect(room.addUser(user)).toBe(true);
  expect(room.addUser(user)).toBe(true);
  expect(room.addUser(user)).toBe(false);
  expect(room.connectedUsers()).toBe(5);
});
test("Test removeing users", () => {
  //Create room
  let room = new Room("id", user);
  expect(room.connectedUsers()).toBe(1);
  //Add new user x5
  expect(room.addUser(user)).toBe(true);
  expect(room.connectedUsers()).toBe(2);
  expect(room.removeUserBy(user.id)).toBe(true);
  expect(room.connectedUsers()).toBe(1);
});
