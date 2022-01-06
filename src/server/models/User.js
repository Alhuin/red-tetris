const { v4 } = require('uuid');

const init = (socket) => ({
  id: v4().toString(),
  name: '',
  socket,
  room: '',
  isAdmin: false,
  pieceIndex: 0,
  pieceState: 0,
  shadow: [],
});

module.exports = {
  init,
};
