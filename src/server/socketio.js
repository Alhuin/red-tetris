const debug = require('debug');
const User = require('./models/User');
const Room = require('./models/Room');
const { events } = require('./constants');

// const logerror = debug('tetris:error');
const loginfo = debug('tetris:info');
const rooms = {};

const createUsersList = (room) => room.users.map(
  (user) => ({
    name: user.name,
    id: user.id,
    isAdmin: user.isAdmin,
  }),
);

const joinRoom = (io, socket, room, user, cb) => {
  loginfo('joinRoom(socket:%o, room:%o)', user.name, room.name);

  // Join socket.io room
  loginfo('joining socketio room...');
  socket.join(room.name);
  loginfo('user:%o joined room %o !', user.name, room.name);

  // Save roomId in socket
  loginfo('user.room = room.name (%o)', room.name);
  user.room = room.name;

  // Add socket in db room
  room.users.push(user);

  if (room.users.length === 1) {
    loginfo('user %o is admin', user.name);
    user.isAdmin = true;
  }
  cb();
  io.in(room.name).emit(events.JOIN_ROOM_SUCCESS, {
    users: createUsersList(room),
  });
  return true;
};

const leaveRooms = (socket, user) => {
  const roomsToDelete = [];

  for (const id in rooms) {
    const room = rooms[id];

    if (room.users.includes(user)) {
      socket.leave(id);
      room.users = room.users.filter((item) => item !== user);
    }
    if (room.users.length === 0) {
      roomsToDelete.push(room.id);
    }
  }

  for (const id in roomsToDelete) {
    delete rooms[id];
  }
};

function handleSocket(socket, io) {
  loginfo('New client connected with id %o', socket.id);

  const user = User.init(socket);

  socket.on(events.JOIN_ROOM, ({ roomName, username }, callback) => {
    loginfo('Recieved joinRoom %o from %o', roomName, username);

    let room = rooms[roomName];
    user.name = username;

    if (room === undefined) { // create room
      console.log('socket create room');
      room = Room.init(roomName);
      user.room = room.name;
      rooms[room.name] = room;
    }
    if (room.launched) {
      socket.emit(events.JOIN_ROOM_ERROR, 'An epic battle is already happening here !');
    } else if (room.users.length >= 2) {
      socket.emit(events.JOIN_ROOM_ERROR, 'This room is full !');
    } else {
      joinRoom(io, socket, room, user, callback);
    }
  });

  socket.on(events.CHECK_ROOM_USER, (roomName, username, cb) => {
    const room = rooms[roomName];
    let status = false;
    let data = null;

    if (room === undefined) {
      data = 'room not in db';
    } else {
      for (const client in room.users) {
        if (room.users[client].name === username) {
          status = true;
        }
      }
      if (!status) {
        data = 'user not in room';
      }
    }
    cb({ status, data });
  });

  socket.on(events.SEND_SHADOW, (roomName, username, data, cb) => {
    const room = rooms[roomName];
    let status = false;
    let msg = null;

    if (room === undefined) {
      msg = 'room not in db';
    } else {
      for (const client in room.users) {
        if (room.users[client].name === username) {
          room.users[client].shadow = data.shadow;
          status = true;
        }
      }
      if (!status) {
        msg = 'user not in room';
      }
    }
    socket.to(roomName).emit(events.SET_SHADOW, data.shadow);
    // cb({ status, msg });
  });

  socket.on(events.START_GAME, () => {
    const room = rooms[user.room];
    // const r = initGame(room);
    // loginfo('user %o launched %o game in room %o', user.name, room.name);
    io.in(room.name).emit('start');
    // room.launched = true;
  });

  socket.on(events.DISCONNECT, () => {
    loginfo('Client disconnected');
    leaveRooms(socket, user);
  });
}

module.exports = handleSocket;
