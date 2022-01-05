const selectUsername = (state) => state.reducer.username;
const selectRoomName = (state) => state.reducer.roomName;
const selectError = (state) => state.reducer.error;
const selectDarkmode = (state) => state.reducer.darkmode;
const selectGameStatus = (state) => state.reducer.gameStatus;
const selectReady = (state) => state.reducer.ready;
const selectUsers = (state) => state.reducer.users;
const selectSocket = (state) => state.reducer.socket;
const selectShadow = (state) => state.reducer.shadow;

export {
  selectUsername,
  selectRoomName,
  selectError,
  selectDarkmode,
  selectGameStatus,
  selectReady,
  selectSocket,
  selectUsers,
  selectShadow,
};
