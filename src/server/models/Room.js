const { v4 } = require('uuid');

const init = (roomName) => ({
  id: v4().toString(),
  name: roomName,
  users: [],
  launched: false,
});

module.exports = {
  init,
};
