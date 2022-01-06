import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  selectReady,
  selectRoomName,
  selectSocket,
  selectUsername,
} from '../../store/selectors';

import Login from './Login';
import Loader from '../Loader';

function Home() {
  const roomName = useSelector(selectRoomName);
  const username = useSelector(selectUsername);
  const ready = useSelector(selectReady);
  const socket = useSelector(selectSocket);
  const isMounted = useRef(true);
  const [serverStatus, setServerStatus] = useState(true);

  useEffect(() => {
    if (isMounted.current) {
      socket.on('connect', () => setServerStatus(true));
      socket.on('connect_error', () => setServerStatus(false));
    }
    return (() => {
      isMounted.current = false;
    });
  }, [socket]);

  if (!serverStatus) {
    console.log('server down');
    return <Loader />;
  }
  console.log('ready  = ', ready);
  // if user is ready (true on JOIN_ROOM_SUCCESS) go to Tetris component, else go to Login
  return (ready
    ? <Navigate to={{ pathname: `${roomName}[${username}]` }} />
    : (
      <Login ready={ready} />
    )
  );
}

export default Home;
